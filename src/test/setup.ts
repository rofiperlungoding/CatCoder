/**
 * Test Setup File
 * 
 * Configures the test environment with proper mocks for browser APIs
 * that are not fully available in jsdom.
 */

import { vi } from 'vitest';

// Mock localStorage with proper Storage interface
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    
    return {
        getItem: vi.fn((key: string): string | null => {
            return store[key] || null;
        }),
        setItem: vi.fn((key: string, value: string): void => {
            store[key] = value;
        }),
        removeItem: vi.fn((key: string): void => {
            delete store[key];
        }),
        clear: vi.fn((): void => {
            store = {};
        }),
        get length(): number {
            return Object.keys(store).length;
        },
        key: vi.fn((index: number): string | null => {
            const keys = Object.keys(store);
            return keys[index] || null;
        }),
    };
})();

// Apply localStorage mock to global
Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    writable: true,
});

// Also mock sessionStorage
Object.defineProperty(globalThis, 'sessionStorage', {
    value: localStorageMock,
    writable: true,
});

// Reset mocks before each test
beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
});
