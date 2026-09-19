import { describe, it, expect } from 'vitest';
import { corsHeaders, handleOptions, parseOrigins } from './cors';

const ALLOWED = ['https://catcoder.online', 'https://www.catcoder.online'];

describe('parseOrigins', () => {
    it('splits a comma-separated list and trims entries', () => {
        expect(parseOrigins('https://a.com , https://b.com,')).toEqual([
            'https://a.com',
            'https://b.com',
        ]);
    });

    it('returns an empty list for undefined/empty input', () => {
        expect(parseOrigins(undefined)).toEqual([]);
        expect(parseOrigins('')).toEqual([]);
    });
});

describe('corsHeaders', () => {
    it('echoes an allowlisted request Origin', () => {
        const headers = corsHeaders(ALLOWED, 'https://www.catcoder.online');
        expect(headers['Access-Control-Allow-Origin']).toBe('https://www.catcoder.online');
    });

    it('falls back to the first allowlisted origin for unknown Origins', () => {
        const headers = corsHeaders(ALLOWED, 'https://evil.example.net');
        expect(headers['Access-Control-Allow-Origin']).toBe('https://catcoder.online');
    });

    it('falls back for missing Origin (same-origin / curl calls)', () => {
        const headers = corsHeaders(ALLOWED, null);
        expect(headers['Access-Control-Allow-Origin']).toBe('https://catcoder.online');
    });

    it('never echoes an Origin when the allowlist is empty', () => {
        const headers = corsHeaders([], 'https://evil.example.net');
        expect(headers['Access-Control-Allow-Origin']).toBe('');
    });
});

describe('handleOptions', () => {
    it('answers 204 with allowlisted CORS headers', () => {
        const res = handleOptions(ALLOWED, 'https://catcoder.online');
        expect(res.status).toBe(204);
        expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://catcoder.online');
        expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    });
});
