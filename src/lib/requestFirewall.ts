/**
 * Request Firewall Module
 * Feature: security-hardening
 * 
 * Intercepts all fetch and XMLHttpRequest calls to restrict outbound
 * network requests to an allowlist of approved domains, preventing
 * injected scripts from exfiltrating data to external servers.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 9.3
 */

import { logBlockedRequest } from './securityLogger';

/**
 * Configuration interface for the request firewall
 */
export interface FirewallConfig {
    /** List of allowed domain patterns (supports wildcards like *.supabase.co) */
    allowedDomains: string[];
    /** Callback when a request is blocked */
    onBlocked?: (url: string, method: string) => void;
    /** Whether the firewall is enabled */
    enabled: boolean;
}

/**
 * Default allowed domains for CatCoder application
 * Requirements 6.3: Include Supabase domains, CDN domains for Pyodide, and app domain
 */
const DEFAULT_ALLOWED_DOMAINS: string[] = [
    // Supabase domains
    '*.supabase.co',
    '*.supabase.in',
    // Pyodide CDN
    'cdn.jsdelivr.net',
    '*.jsdelivr.net',
    'pyodide.org',
    '*.pyodide.org',
    // Local development
    'localhost',
    '127.0.0.1',
];

// Store original implementations
let originalFetch: typeof fetch | null = null;
let originalXHROpen: typeof XMLHttpRequest.prototype.open | null = null;

// Current firewall configuration
let firewallConfig: FirewallConfig = {
    allowedDomains: DEFAULT_ALLOWED_DOMAINS,
    enabled: false,
};

// Track if firewall is initialized
let isInitialized = false;

/**
 * Check if a domain matches an allowed pattern
 * Supports wildcard patterns like *.supabase.co
 */
export function matchesDomain(hostname: string, pattern: string): boolean {
    // Normalize both to lowercase
    const normalizedHostname = hostname.toLowerCase();
    const normalizedPattern = pattern.toLowerCase();
    
    // Exact match
    if (normalizedHostname === normalizedPattern) {
        return true;
    }
    
    // Wildcard pattern (*.domain.com)
    if (normalizedPattern.startsWith('*.')) {
        const baseDomain = normalizedPattern.slice(2);
        // Match the base domain itself or any subdomain
        return normalizedHostname === baseDomain || 
               normalizedHostname.endsWith('.' + baseDomain);
    }
    
    return false;
}

/**
 * Check if a URL is allowed by the firewall
 * Requirements 6.2: Check destination against allowlist
 */
export function isUrlAllowed(url: string): boolean {
    try {
        // Handle relative URLs - they're always allowed (same origin)
        if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
            return true;
        }
        
        // Handle blob: and data: URLs - allowed for Web Workers and inline resources
        if (url.startsWith('blob:') || url.startsWith('data:')) {
            return true;
        }
        
        const parsedUrl = new URL(url, window.location.origin);
        const hostname = parsedUrl.hostname;
        
        // Same origin is always allowed
        if (hostname === window.location.hostname) {
            return true;
        }
        
        // Check against allowed domains
        for (const pattern of firewallConfig.allowedDomains) {
            if (matchesDomain(hostname, pattern)) {
                return true;
            }
        }
        
        return false;
    } catch {
        // If URL parsing fails, block the request for safety
        return false;
    }
}

/**
 * Create a blocked response for fetch requests
 */
function createBlockedResponse(url: string): Response {
    return new Response(
        JSON.stringify({ 
            error: 'Request blocked by firewall', 
            url 
        }),
        {
            status: 403,
            statusText: 'Forbidden',
            headers: { 'Content-Type': 'application/json' }
        }
    );
}

/**
 * Intercepted fetch function
 * Requirements 6.1: Intercept all fetch calls
 * Requirements 6.4: Block non-allowlisted domains
 * Requirements 9.3: Log blocked requests as security events
 */
function interceptedFetch(
    input: RequestInfo | URL,
    init?: RequestInit
): Promise<Response> {
    const url = typeof input === 'string' 
        ? input 
        : input instanceof URL 
            ? input.href 
            : input.url;
    
    if (!isUrlAllowed(url)) {
        // Requirements 6.4: Block and log
        const method = init?.method || 'GET';
        firewallConfig.onBlocked?.(url, method);
        console.warn(`[RequestFirewall] Blocked request to: ${url}`);
        
        // Requirements 9.3: Log blocked request as security event
        logBlockedRequest(url, 'Domain not in allowlist', { method, type: 'fetch' });
        
        return Promise.resolve(createBlockedResponse(url));
    }
    
    // Requirements 6.5: Allow requests to allowlisted domains
    return originalFetch!(input, init);
}

/**
 * Intercepted XMLHttpRequest.open function
 * Requirements 6.1: Intercept all XMLHttpRequest calls
 * Requirements 9.3: Log blocked requests as security events
 */
function createInterceptedXHROpen(): typeof XMLHttpRequest.prototype.open {
    return function(
        this: XMLHttpRequest,
        method: string,
        url: string | URL,
        async: boolean = true,
        username?: string | null,
        password?: string | null
    ): void {
        const urlString = typeof url === 'string' ? url : url.href;
        
        if (!isUrlAllowed(urlString)) {
            // Requirements 6.4: Block and log
            firewallConfig.onBlocked?.(urlString, method);
            console.warn(`[RequestFirewall] Blocked XHR request to: ${urlString}`);
            
            // Requirements 9.3: Log blocked request as security event
            logBlockedRequest(urlString, 'Domain not in allowlist', { method, type: 'xhr' });
            
            // Throw an error to prevent the request
            throw new Error(`Request blocked by firewall: ${urlString}`);
        }
        
        // Requirements 6.5: Allow requests to allowlisted domains
        return originalXHROpen!.call(this, method, url, async, username, password);
    };
}

/**
 * Initialize the request firewall
 * Requirements 6.1: Intercept all fetch and XMLHttpRequest calls at startup
 * 
 * @param config - Optional configuration to override defaults
 */
export function initializeFirewall(config?: Partial<FirewallConfig>): void {
    if (isInitialized) {
        console.warn('[RequestFirewall] Firewall already initialized');
        return;
    }
    
    // Merge configuration
    firewallConfig = {
        ...firewallConfig,
        ...config,
        allowedDomains: [
            ...DEFAULT_ALLOWED_DOMAINS,
            ...(config?.allowedDomains || []),
            // Always include current hostname
            window.location.hostname,
        ],
    };
    
    if (!firewallConfig.enabled) {
        return;
    }
    
    // Store original implementations
    originalFetch = window.fetch.bind(window);
    originalXHROpen = XMLHttpRequest.prototype.open;
    
    // Replace with intercepted versions
    window.fetch = interceptedFetch;
    XMLHttpRequest.prototype.open = createInterceptedXHROpen();
    
    isInitialized = true;
    console.log('[RequestFirewall] Initialized with allowed domains:', firewallConfig.allowedDomains);
}

/**
 * Disable the firewall and restore original implementations
 * Useful for testing or development
 */
export function disableFirewall(): void {
    if (!isInitialized) {
        return;
    }
    
    if (originalFetch) {
        window.fetch = originalFetch;
        originalFetch = null;
    }
    
    if (originalXHROpen) {
        XMLHttpRequest.prototype.open = originalXHROpen;
        originalXHROpen = null;
    }
    
    isInitialized = false;
    firewallConfig.enabled = false;
    console.log('[RequestFirewall] Disabled');
}

/**
 * Check if the firewall is currently active
 */
export function isFirewallActive(): boolean {
    return isInitialized && firewallConfig.enabled;
}

/**
 * Get the current list of allowed domains
 */
export function getAllowedDomains(): string[] {
    return [...firewallConfig.allowedDomains];
}

/**
 * Add a domain to the allowlist at runtime
 */
export function addAllowedDomain(domain: string): void {
    if (!firewallConfig.allowedDomains.includes(domain)) {
        firewallConfig.allowedDomains.push(domain);
    }
}

/**
 * Remove a domain from the allowlist at runtime
 */
export function removeAllowedDomain(domain: string): void {
    const index = firewallConfig.allowedDomains.indexOf(domain);
    if (index > -1) {
        firewallConfig.allowedDomains.splice(index, 1);
    }
}

export default {
    initializeFirewall,
    disableFirewall,
    isUrlAllowed,
    isFirewallActive,
    getAllowedDomains,
    addAllowedDomain,
    removeAllowedDomain,
    matchesDomain,
};
