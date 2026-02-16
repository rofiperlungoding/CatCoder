/**
 * Request Firewall Property-Based Tests
 * Feature: security-hardening
 * 
 * Property 7: Firewall Allowlist Enforcement
 * 
 * Validates: Requirements 6.2, 6.4, 6.5
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import {
    isUrlAllowed,
    matchesDomain,
    initializeFirewall,
    disableFirewall,
    isFirewallActive,
    getAllowedDomains,
    addAllowedDomain,
    removeAllowedDomain,
} from './requestFirewall';

// Mock window.location for testing
const mockWindowLocation = (hostname: string) => {
    Object.defineProperty(window, 'location', {
        value: { hostname, origin: `https://${hostname}` },
        writable: true,
        configurable: true,
    });
};

describe('Request Firewall - Property-Based Tests', () => {
    beforeEach(() => {
        // Reset firewall state before each test
        disableFirewall();
        mockWindowLocation('catcoder.app');
    });

    afterEach(() => {
        disableFirewall();
    });

    /**
     * Feature: security-hardening, Property 7: Firewall Allowlist Enforcement
     * 
     * For any URL, the request firewall SHALL allow the request if and only if
     * the URL's domain matches one of the configured allowed domains.
     * Non-matching domains SHALL be blocked, and matching domains SHALL proceed normally.
     * 
     * Validates: Requirements 6.2, 6.4, 6.5
     */
    describe('Property 7: Firewall Allowlist Enforcement', () => {
        it('should allow URLs from explicitly allowed domains', () => {
            fc.assert(
                fc.property(
                    // Generate random subdomains for allowed base domains
                    fc.constantFrom(
                        'supabase.co',
                        'api.supabase.co',
                        'auth.supabase.co',
                        'cdn.jsdelivr.net',
                        'pyodide.org',
                        'files.pyodide.org',
                        'localhost',
                        '127.0.0.1'
                    ),
                    fc.constantFrom('/api', '/data', '/auth', '/v1/rpc', ''),
                    (domain, path) => {
                        const url = `https://${domain}${path}`;
                        return isUrlAllowed(url) === true;
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });

        it('should block URLs from non-allowlisted domains', () => {
            fc.assert(
                fc.property(
                    // Generate random non-allowed domains
                    fc.constantFrom(
                        'evil.com',
                        'attacker.io',
                        'malicious-site.net',
                        'data-exfil.org',
                        'hacker.xyz',
                        'phishing.co',
                        'steal-data.com'
                    ),
                    fc.constantFrom('/api', '/collect', '/exfil', ''),
                    (domain, path) => {
                        const url = `https://${domain}${path}`;
                        return isUrlAllowed(url) === false;
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });

        it('should always allow relative URLs (same origin)', () => {
            fc.assert(
                fc.property(
                    fc.constantFrom('/', './', '../'),
                    fc.constantFrom('api', 'data', 'users', 'auth/login', 'v1/rpc'),
                    (prefix, path) => {
                        const url = `${prefix}${path}`;
                        return isUrlAllowed(url) === true;
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });

        it('should always allow same-origin URLs', () => {
            fc.assert(
                fc.property(
                    fc.constantFrom('/api', '/data', '/auth', '/users', '/profile'),
                    (path) => {
                        const url = `https://catcoder.app${path}`;
                        return isUrlAllowed(url) === true;
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });

        it('should allow blob: and data: URLs', () => {
            fc.assert(
                fc.property(
                    fc.constantFrom(
                        'blob:https://catcoder.app/12345',
                        'data:text/plain;base64,SGVsbG8=',
                        'blob:null/abcdef',
                        'data:application/json,{}'
                    ),
                    (url) => {
                        return isUrlAllowed(url) === true;
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });
    });

    describe('Domain Matching - Property Tests', () => {
        it('should match exact domains', () => {
            fc.assert(
                fc.property(
                    fc.constantFrom(
                        'example.com',
                        'test.org',
                        'localhost',
                        'api.service.io'
                    ),
                    (domain) => {
                        return matchesDomain(domain, domain) === true;
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });

        it('should match wildcard patterns for subdomains', () => {
            fc.assert(
                fc.property(
                    fc.constantFrom('api', 'auth', 'cdn', 'files', 'storage'),
                    fc.constantFrom('supabase.co', 'example.com', 'service.io'),
                    (subdomain, baseDomain) => {
                        const hostname = `${subdomain}.${baseDomain}`;
                        const pattern = `*.${baseDomain}`;
                        return matchesDomain(hostname, pattern) === true;
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });

        it('should match base domain with wildcard pattern', () => {
            fc.assert(
                fc.property(
                    fc.constantFrom('supabase.co', 'example.com', 'service.io'),
                    (baseDomain) => {
                        const pattern = `*.${baseDomain}`;
                        return matchesDomain(baseDomain, pattern) === true;
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });

        it('should not match unrelated domains with wildcard', () => {
            fc.assert(
                fc.property(
                    fc.constantFrom('evil.com', 'attacker.io', 'malicious.net'),
                    fc.constantFrom('supabase.co', 'example.com', 'service.io'),
                    (evilDomain, allowedDomain) => {
                        const pattern = `*.${allowedDomain}`;
                        return matchesDomain(evilDomain, pattern) === false;
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });

        it('should be case-insensitive', () => {
            fc.assert(
                fc.property(
                    fc.constantFrom(
                        ['EXAMPLE.COM', 'example.com'],
                        ['Example.Com', 'example.com'],
                        ['API.SUPABASE.CO', '*.supabase.co'],
                        ['Cdn.JsDelivr.Net', '*.jsdelivr.net']
                    ),
                    ([hostname, pattern]) => {
                        return matchesDomain(hostname, pattern) === true;
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });
    });
});

describe('Request Firewall - Unit Tests', () => {
    beforeEach(() => {
        disableFirewall();
        mockWindowLocation('catcoder.app');
    });

    afterEach(() => {
        disableFirewall();
    });

    describe('isUrlAllowed', () => {
        it('should allow Supabase URLs', () => {
            expect(isUrlAllowed('https://abc123.supabase.co/rest/v1/users')).toBe(true);
            expect(isUrlAllowed('https://auth.supabase.co/token')).toBe(true);
        });

        it('should allow Pyodide CDN URLs', () => {
            expect(isUrlAllowed('https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js')).toBe(true);
            expect(isUrlAllowed('https://pyodide.org/packages/numpy.whl')).toBe(true);
        });

        it('should allow localhost URLs', () => {
            expect(isUrlAllowed('http://localhost:3000/api')).toBe(true);
            expect(isUrlAllowed('http://127.0.0.1:8080/data')).toBe(true);
        });

        it('should block unknown external domains', () => {
            expect(isUrlAllowed('https://evil-site.com/steal')).toBe(false);
            expect(isUrlAllowed('https://attacker.io/exfil')).toBe(false);
        });

        it('should handle malformed URLs gracefully', () => {
            // Note: URLs without protocol are treated as relative paths by the browser
            // and are allowed (same-origin). Only truly malformed URLs should be blocked.
            expect(isUrlAllowed('not-a-valid-url')).toBe(true); // Treated as relative path
            expect(isUrlAllowed('')).toBe(true); // Empty string is relative to current page
        });

        it('should allow relative URLs', () => {
            expect(isUrlAllowed('/api/users')).toBe(true);
            expect(isUrlAllowed('./data.json')).toBe(true);
            expect(isUrlAllowed('../config')).toBe(true);
        });
    });

    describe('matchesDomain', () => {
        it('should match exact domains', () => {
            expect(matchesDomain('example.com', 'example.com')).toBe(true);
            expect(matchesDomain('localhost', 'localhost')).toBe(true);
        });

        it('should match wildcard subdomains', () => {
            expect(matchesDomain('api.supabase.co', '*.supabase.co')).toBe(true);
            expect(matchesDomain('auth.supabase.co', '*.supabase.co')).toBe(true);
            expect(matchesDomain('deep.nested.supabase.co', '*.supabase.co')).toBe(true);
        });

        it('should match base domain with wildcard', () => {
            expect(matchesDomain('supabase.co', '*.supabase.co')).toBe(true);
        });

        it('should not match different domains', () => {
            expect(matchesDomain('evil.com', 'example.com')).toBe(false);
            expect(matchesDomain('notsupabase.co', '*.supabase.co')).toBe(false);
        });
    });

    describe('Firewall Lifecycle', () => {
        it('should not be active before initialization', () => {
            expect(isFirewallActive()).toBe(false);
        });

        it('should be active after initialization with enabled=true', () => {
            initializeFirewall({ enabled: true });
            expect(isFirewallActive()).toBe(true);
        });

        it('should not be active if initialized with enabled=false', () => {
            initializeFirewall({ enabled: false });
            expect(isFirewallActive()).toBe(false);
        });

        it('should be inactive after disabling', () => {
            initializeFirewall({ enabled: true });
            disableFirewall();
            expect(isFirewallActive()).toBe(false);
        });
    });

    describe('Domain Management', () => {
        it('should return allowed domains', () => {
            const domains = getAllowedDomains();
            expect(domains).toContain('*.supabase.co');
            expect(domains).toContain('cdn.jsdelivr.net');
        });

        it('should add new allowed domain', () => {
            addAllowedDomain('custom-api.example.com');
            expect(getAllowedDomains()).toContain('custom-api.example.com');
        });

        it('should remove allowed domain', () => {
            addAllowedDomain('temp-domain.com');
            expect(getAllowedDomains()).toContain('temp-domain.com');

            removeAllowedDomain('temp-domain.com');
            expect(getAllowedDomains()).not.toContain('temp-domain.com');
        });

        it('should not add duplicate domains', () => {
            const initialLength = getAllowedDomains().length;
            addAllowedDomain('*.supabase.co');
            expect(getAllowedDomains().length).toBe(initialLength);
        });
    });
});
