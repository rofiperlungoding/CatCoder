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
 * Get the encryption key from environment or use fallback for development
 * Requirements 3.3: Use environment-configured key, fallback only in development
 */
const getEncryptionKey = (): string => {
    // Check for environment-configured key first
    const envKey = typeof import.meta !== 'undefined'
        ? (import.meta as unknown as { env: Record<string, string> }).env?.VITE_STORAGE_ENCRYPTION_KEY
        : undefined;

    if (envKey) {
        return envKey;
    }

    // Fallback key for development only
    // In production, VITE_STORAGE_ENCRYPTION_KEY should be set
    return 'catcoder-dev-fallback-key-2024';
};

const SECRET_KEY = getEncryptionKey();

/**
 * Encrypt a string value using AES encryption
 * Requirements 3.1: Encrypt data before writing to localStorage
 */
export const encrypt = (value: string): string => {
    return CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
};

/**
 * Decrypt an encrypted string value
 * Requirements 3.2: Decrypt data when reading from localStorage
 * Requirements 3.4: Return null and clear entry on decryption failure
 */
export const decrypt = (encrypted: string): string | null => {
    try {
        const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);

        // If decryption produces empty string, data is corrupted/tampered
        if (!decrypted) {
            return null;
        }

        return decrypted;
    } catch {
        // Decryption failed - data is corrupted or tampered
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
    // CryptoJS AES encrypted strings are base64 encoded and typically
    // start with "U2FsdGVkX1" (which is "Salted__" in base64)
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
