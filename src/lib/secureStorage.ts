/**
 * Secure Storage Adapter
 * Feature: security-hardening
 * 
 * Provides AES-encrypted localStorage operations to prevent
 * users from easily editing cached data to unlock features
 * or manipulate progress.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */
import CryptoJS from 'crypto-js';

/**
 * Interface for secure storage operations
 * Compatible with Zustand's persist middleware storage interface
 */
export interface SecureStorage {
    getItem: (name: string) => string | null;
    setItem: (name: string, value: string) => void;
    removeItem: (name: string) => void;
}

/**
 * Get the encryption key from environment or use fallback for development.
 *
 * Production hardening (Requirements 3.3):
 *   - In a production build, the env var MUST be set. We refuse to start
 *     otherwise — falling back to a hard-coded key would make every
 *     "encrypted" entry in localStorage trivially readable since the key
 *     would be present in the public client bundle.
 *   - In dev / test we emit a single console warning and use a clearly
 *     labelled placeholder so unit tests run without setup.
 */
const getEncryptionKey = (): string => {
    const env = (typeof import.meta !== 'undefined'
        ? (import.meta as unknown as { env: Record<string, unknown> }).env
        : undefined) ?? {};

    const envKey = env.VITE_STORAGE_ENCRYPTION_KEY as string | undefined;
    const isProd = env.PROD === true || env.MODE === 'production';

    if (typeof envKey === 'string' && envKey.length > 0) {
        return envKey;
    }

    if (isProd) {
        throw new Error(
            '[SecureStorage] VITE_STORAGE_ENCRYPTION_KEY is not set. ' +
            'Refusing to start with a public fallback key in production.'
        );
    }

    if (typeof console !== 'undefined' && !(globalThis as { __secureStorageWarned?: boolean }).__secureStorageWarned) {
        console.warn(
            '[SecureStorage] Using non-secure dev fallback key. ' +
            'Set VITE_STORAGE_ENCRYPTION_KEY before deploying.'
        );
        (globalThis as { __secureStorageWarned?: boolean }).__secureStorageWarned = true;
    }
    return 'catcoder-dev-fallback-key-do-not-use-in-prod';
};

const SECRET_KEY = getEncryptionKey();

/**
 * Encrypt a string value using AES encryption
 * Requirements 3.1: Encrypt data before writing to localStorage
 */
export const encrypt = (value: string): string => {
    if (!SECRET_KEY) {
        throw new Error('[SecureStorage] Encryption key is not configured.');
    }
    const encrypted = CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
    const hmac = CryptoJS.HmacSHA256(encrypted, SECRET_KEY).toString();
    return `${hmac}.${encrypted}`;
};

/**
 * Decrypt an encrypted string value
 * Requirements 3.2: Decrypt data when reading from localStorage
 * Requirements 3.4: Return null and clear entry on decryption failure
 */
export const decrypt = (value: string): string | null => {
    try {
        if (!value) return null;

        let ciphertext = value;
        let hmac: string | null = null;

        if (value.includes('.')) {
            const parts = value.split('.');
            hmac = parts[0];
            ciphertext = parts[1];
        }

        // Integrity Check: Verify HMAC if present
        if (hmac) {
            const expectedHmac = CryptoJS.HmacSHA256(ciphertext, SECRET_KEY).toString();
            if (hmac !== expectedHmac) {
                console.warn('[SecureStorage] Tampering detected!');
                return null;
            }
        } else if (!isEncrypted(ciphertext)) {
            // Not a legacy encrypted string either
            return null;
        }

        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

        if (!decrypted) {
            return null;
        }

        return decrypted;
    } catch {
        return null;
    }
};

/**
 * Secure storage adapter with AES encryption
 * Implements the storage interface expected by Zustand's persist middleware
 */
export const secureStorage: SecureStorage = {
    /**
     * Get and decrypt an item from localStorage
     * Requirements 3.2, 3.4: Decrypt on read, handle failures gracefully
     */
    getItem: (name: string): string | null => {
        try {
            const encrypted = localStorage.getItem(name);

            if (!encrypted) {
                return null;
            }

            const decrypted = decrypt(encrypted);

            // If decryption failed, clear the corrupted entry
            // Requirements 3.4: Clear corrupted entries
            if (decrypted === null) {
                localStorage.removeItem(name);
                return null;
            }

            return decrypted;
        } catch {
            // Any error during retrieval - clear and return null
            try {
                localStorage.removeItem(name);
            } catch {
                // Ignore removal errors
            }
            return null;
        }
    },

    /**
     * Encrypt and store an item in localStorage
     * Requirements 3.1: Encrypt data before writing
     */
    setItem: (name: string, value: string): void => {
        try {
            const encrypted = encrypt(value);
            localStorage.setItem(name, encrypted);
        } catch {
            // Storage quota exceeded or other error
            // Silently fail - the application will continue without persistence
            console.warn('[SecureStorage] Failed to store item:', name);
        }
    },

    /**
     * Remove an item from localStorage
     */
    removeItem: (name: string): void => {
        try {
            localStorage.removeItem(name);
        } catch {
            // Ignore removal errors
        }
    }
};

/**
 * Check if a localStorage value appears to be encrypted
 * Useful for migration from unencrypted to encrypted storage
 */
export const isEncrypted = (value: string): boolean => {
    // New format: hmac.ciphertext
    if (value.includes('.') && value.split('.').length === 2) {
        return true;
    }
    // Legacy format: Salted__ (U2FsdGVkX1)
    return value.startsWith('U2FsdGVkX1');
};

/**
 * Migrate an unencrypted localStorage value to encrypted format
 * Returns true if migration was performed, false if already encrypted or not found
 */
export const migrateToEncrypted = (name: string): boolean => {
    try {
        const rawValue = localStorage.getItem(name);

        if (!rawValue) {
            return false;
        }

        // Check if already encrypted
        if (isEncrypted(rawValue)) {
            return false;
        }

        // Encrypt and store
        const encrypted = encrypt(rawValue);
        localStorage.setItem(name, encrypted);
        return true;
    } catch {
        return false;
    }
};

export default secureStorage;
