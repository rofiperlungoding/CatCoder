/**
 * Password hashing + token helpers using the Web Crypto API available in the
 * Cloudflare Workers runtime. No Node `crypto` dependency.
 *
 * Passwords use PBKDF2-SHA256 with a per-user random salt. Stored as
 * `saltB64:hashB64`. This is intentionally simple but real (not plaintext);
 * for a high-security production system consider Argon2 via WASM.
 */

const PBKDF2_ITERATIONS = 100_000;
const KEY_LEN_BYTES = 32;

function toB64(bytes: Uint8Array): string {
    let binary = '';
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary);
}

function fromB64(b64: string): Uint8Array {
    const binary = atob(b64);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
    return out;
}

async function pbkdf2(password: string, salt: Uint8Array): Promise<Uint8Array> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        enc.encode(password) as BufferSource,
        'PBKDF2',
        false,
        ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
        keyMaterial,
        KEY_LEN_BYTES * 8
    );
    return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const hash = await pbkdf2(password, salt);
    return `${toB64(salt)}:${toB64(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
    const [saltB64, hashB64] = stored.split(':');
    if (!saltB64 || !hashB64) return false;
    const salt = fromB64(saltB64);
    const expected = fromB64(hashB64);
    const actual = await pbkdf2(password, salt);
    if (actual.length !== expected.length) return false;
    // Constant-time compare.
    let diff = 0;
    for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
    return diff === 0;
}

export function newToken(): string {
    return toB64(crypto.getRandomValues(new Uint8Array(32))).replace(/[^a-zA-Z0-9]/g, '');
}

export function newId(): string {
    return crypto.randomUUID();
}
