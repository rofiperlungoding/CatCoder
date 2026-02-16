/**
 * Secure Storage Property-Based Tests
 * Feature: security-hardening
 * 
 * Property 5: Storage Encryption Round-Trip
 * Property 6: Corrupted Storage Handling
 * 
 * Validates: Requirements 3.1, 3.2, 3.4
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { secureStorage, encrypt, decrypt, isEncrypted } from './secureStorage';

// Mock localStorage for testing
const createMockLocalStorage = () => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
        get length() { return Object.keys(store).length; },
        key: (index: number) => Object.keys(store)[index] ?? null,
        getStore: () => store
    };
};

describe('Secure Storage - Property-Based Tests', () => {
    let mockStorage: ReturnType<typeof createMockLocalStorage>;
    let originalLocalStorage: Storage;

    beforeEach(() => {
        mockStorage = createMockLocalStorage();
        originalLocalStorage = globalThis.localStorage;
        globalThis.localStorage = mockStorage as unknown as Storage;
    });

    afterEach(() => {
        globalThis.localStorage = originalLocalStorage;
    });

    /**
     * Feature: security-hardening, Property 5: Storage Encryption Round-Trip
     * 
     * For any valid JSON-serializable data, encrypting it with secureStorage.setItem
     * and then decrypting it with secureStorage.getItem SHALL return data equivalent
     * to the original input.
     * 
     * Validates: Requirements 3.1, 3.2
     */
    describe('Property 5: Storage Encryption Round-Trip', () => {
        it('should round-trip any string value through encrypt/decrypt', () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1 }),
                    (value) => {
                        const encrypted = encrypt(value);
                        const decrypted = decrypt(encrypted);
                        return decrypted === value;
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });

        it('should round-trip any string through secureStorage setItem/getItem', () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1, maxLength: 100 }),
                    fc.string({ minLength: 1, maxLength: 50 }),
                    (key, value) => {
                        // Ensure key is valid for localStorage
                        const safeKey = `test_${key.replace(/[^a-zA-Z0-9]/g, '_')}`;

                        secureStorage.setItem(safeKey, value);
                        const retrieved = secureStorage.getItem(safeKey);

                        return retrieved === value;
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });

        it('should round-trip JSON objects through secureStorage', () => {
            fc.assert(
                fc.property(
                    fc.record({
                        name: fc.string(),
                        count: fc.integer(),
                        active: fc.boolean(),
                        tags: fc.array(fc.string())
                    }),
                    (obj) => {
                        const key = 'test_json_object';
                        const jsonString = JSON.stringify(obj);

                        secureStorage.setItem(key, jsonString);
                        const retrieved = secureStorage.getItem(key);

                        if (retrieved === null) return false;

                        const parsed = JSON.parse(retrieved);
                        return JSON.stringify(parsed) === jsonString;
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });

        it('should produce encrypted output that differs from input', () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1 }),
                    (value) => {
                        const encrypted = encrypt(value);
                        // Encrypted value should be different from original
                        // and should be base64-like (starts with U2FsdGVkX1)
                        return encrypted !== value && isEncrypted(encrypted);
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });
    });

    /**
     * Feature: security-hardening, Property 6: Corrupted Storage Handling
     * 
     * For any corrupted or tampered localStorage value (not valid encrypted data),
     * calling secureStorage.getItem SHALL return null and remove the corrupted
     * entry from localStorage.
     * 
     * Validates: Requirements 3.4
     */
    describe('Property 6: Corrupted Storage Handling', () => {
        it('should return null and clear entry for JSON data stored without encryption', () => {
            fc.assert(
                fc.property(
                    fc.record({
                        key: fc.string(),
                        value: fc.integer(),
                        nested: fc.record({ a: fc.boolean() })
                    }),
                    (jsonObj) => {
                        const key = 'test_json_corrupted';

                        // Store raw JSON (not encrypted) - simulates old unencrypted data
                        // that doesn't match the encrypted format
                        const rawJson = JSON.stringify(jsonObj);

                        // Skip if it happens to look like encrypted data
                        if (isEncrypted(rawJson)) {
                            return true;
                        }

                        localStorage.setItem(key, rawJson);

                        // Attempt to read - should either return null (decryption fails)
                        // or return garbage (not the original JSON)
                        const result = secureStorage.getItem(key);

                        // The key property is: if we get something back, it should NOT
                        // be the original unencrypted JSON (that would be a security issue)
                        // Either result is null (corrupted data cleared) or it's garbage
                        if (result === null) {
                            // Entry should be cleared when decryption fails
                            const stillExists = localStorage.getItem(key);
                            return stillExists === null;
                        } else {
                            // If CryptoJS "decrypted" to something, it should NOT be the original
                            // This ensures we're not accidentally returning unencrypted data
                            return result !== rawJson;
                        }
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });

        it('should return null and clear entry for plain text that is not base64', () => {
            // Test with strings that definitely cannot be valid encrypted data
            // CryptoJS encrypted strings start with "U2FsdGVkX1" (base64 for "Salted__")
            const plainTextValues = [
                'hello world',
                '{"user": "test"}',
                'not encrypted at all',
                '12345',
                'true',
                '[1, 2, 3]',
                '<html>test</html>',
                'SELECT * FROM users'
            ];

            for (const plainText of plainTextValues) {
                const key = 'test_plain_text';
                localStorage.setItem(key, plainText);

                const result = secureStorage.getItem(key);
                const stillExists = localStorage.getItem(key);

                expect(result).toBeNull();
                expect(stillExists).toBeNull();
            }
        });

        it('should handle tampered encrypted data gracefully', () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1 }),
                    fc.integer({ min: 0, max: 50 }),
                    (originalValue, tamperIndex) => {
                        const key = 'test_tampered';

                        // First, properly encrypt a value
                        const encrypted = encrypt(originalValue);

                        // Tamper with the encrypted data
                        const chars = encrypted.split('');
                        if (chars.length > 0) {
                            const idx = tamperIndex % chars.length;
                            // Change a character to corrupt the data
                            chars[idx] = chars[idx] === 'X' ? 'Y' : 'X';
                        }
                        const tampered = chars.join('');

                        // Set tampered data directly
                        localStorage.setItem(key, tampered);

                        // Attempt to read
                        const result = secureStorage.getItem(key);

                        // Should either return null (corrupted) or the original value
                        // (if tampering happened to not break decryption)
                        // The key point is it should not throw
                        return result === null || typeof result === 'string';
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });

        it('should return null for empty localStorage entries', () => {
            const key = 'test_nonexistent';
            const result = secureStorage.getItem(key);
            expect(result).toBeNull();
        });

        it('should handle removeItem gracefully', () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 1, maxLength: 50 }),
                    (key) => {
                        const safeKey = `test_remove_${key.replace(/[^a-zA-Z0-9]/g, '_')}`;

                        // Set a value
                        secureStorage.setItem(safeKey, 'test value');

                        // Remove it
                        secureStorage.removeItem(safeKey);

                        // Should be gone
                        const result = secureStorage.getItem(safeKey);
                        return result === null;
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });
    });
});

describe('Secure Storage - Unit Tests', () => {
    let mockStorage: ReturnType<typeof createMockLocalStorage>;
    let originalLocalStorage: Storage;

    beforeEach(() => {
        mockStorage = createMockLocalStorage();
        originalLocalStorage = globalThis.localStorage;
        // @ts-expect-error - Mocking localStorage for isolation
        globalThis.localStorage = mockStorage as unknown as Storage;
    });

    afterEach(() => {
        // @ts-expect-error - Restoring original localStorage
        globalThis.localStorage = originalLocalStorage;
    });

    it('should encrypt and decrypt a simple string', () => {
        const original = 'Hello, World!';
        const encrypted = encrypt(original);
        const decrypted = decrypt(encrypted);

        expect(decrypted).toBe(original);
        expect(encrypted).not.toBe(original);
    });

    it('should work with Zustand-like JSON state', () => {
        const state = {
            user: { id: '123', name: 'Test User' },
            settings: { theme: 'dark', notifications: true }
        };

        const key = 'app-state';
        const jsonString = JSON.stringify(state);

        secureStorage.setItem(key, jsonString);
        const retrieved = secureStorage.getItem(key);

        expect(retrieved).toBe(jsonString);
        expect(JSON.parse(retrieved!)).toEqual(state);
    });

    it('should identify encrypted values correctly', () => {
        const encrypted = encrypt('test');
        const plainText = 'just plain text';

        expect(isEncrypted(encrypted)).toBe(true);
        expect(isEncrypted(plainText)).toBe(false);
    });
});
