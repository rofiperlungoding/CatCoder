/**
 * Encrypted session storage shared by the Turso backend adapter and the
 * Arena API client. The session bearer token is stored via secureStorage
 * (AES + HMAC) instead of raw localStorage, and any legacy plaintext value
 * is migrated transparently on first read.
 */

import { secureStorage, isEncrypted } from './secureStorage';

export interface SessionUser {
    id: string;
    email: string;
    created_at: string;
    user_metadata: Record<string, unknown>;
}

export interface StoredSession {
    access_token: string;
    user?: SessionUser;
}

const SESSION_KEY = 'cc_turso_session';

export function readSession(): StoredSession | null {
    try {
        const raw = secureStorage.getItem(SESSION_KEY);
        if (raw) return JSON.parse(raw) as StoredSession;

        // secureStorage shares the raw localStorage key, so anything left there
        // is either a legacy plaintext session (JSON, starts with '{') or an
        // undecryptable ciphertext blob (corrupted / key rotated) — never both.
        const legacy = localStorage.getItem(SESSION_KEY);
        if (!legacy) return null;
        if (isEncrypted(legacy)) {
            // Ciphertext we cannot read: clear it, do not migrate.
            localStorage.removeItem(SESSION_KEY);
            return null;
        }
        try {
            const parsed = JSON.parse(legacy) as StoredSession;
            if (parsed?.access_token) {
                secureStorage.setItem(SESSION_KEY, legacy);
                return parsed;
            }
        } catch {
            /* fall through to removal */
        }
        localStorage.removeItem(SESSION_KEY);
        return null;
    } catch {
        return null;
    }
}

export function writeSession(session: StoredSession | null): void {
    try {
        // secureStorage writes to the same raw localStorage key (encrypted),
        // so there is no separate plaintext copy to scrub here — legacy
        // plaintext is migrated on read (see readSession).
        if (session) {
            secureStorage.setItem(SESSION_KEY, JSON.stringify(session));
        } else {
            secureStorage.removeItem(SESSION_KEY);
        }
    } catch {
        /* ignore */
    }
}

// Re-exported so tests (and future callers) can detect stale plaintext
// without importing secureStorage directly.
export { isEncrypted };
