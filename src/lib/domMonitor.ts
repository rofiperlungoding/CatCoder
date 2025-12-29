/**
 * DOM Integrity Monitor Module
 * Feature: security-hardening
 * 
 * Monitors the DOM for unauthorized script and iframe injections using
 * MutationObserver. Detects and removes injected elements to prevent
 * browser extensions or malicious scripts from manipulating the application.
 * 
 * Requirements: 7.1, 7.2, 7.4, 7.5, 9.3
 */

import { logDOMViolation } from './securityLogger';

/**
 * Configuration interface for the DOM monitor
 */
export interface DOMMonitorConfig {
    /** Callback when a violation is detected */
    onViolation?: (element: Element, type: string) => void;
    /** List of tag names to block (lowercase) */
    blockedTags: string[];
    /** Whether the monitor is enabled */
    enabled: boolean;
    /** Allowed script sources (for legitimate scripts) */
    allowedScriptSources?: string[];
}

/**
 * Default blocked tags for DOM injection detection
 * Requirements 7.1: Monitor for script and iframe injections
 */
const DEFAULT_BLOCKED_TAGS: string[] = [
    'script',
    'iframe',
];

/**
 * Default allowed script sources (legitimate application scripts)
 */
const DEFAULT_ALLOWED_SOURCES: string[] = [
    // Vite dev server scripts
    '/@vite/',
    '/@react-refresh',
    '/src/',
    '/node_modules/',
    // Production build scripts
    '/assets/',
];

// Current monitor configuration
let monitorConfig: DOMMonitorConfig = {
    blockedTags: DEFAULT_BLOCKED_TAGS,
    enabled: false,
    allowedScriptSources: DEFAULT_ALLOWED_SOURCES,
};

// Active MutationObserver instance
let activeObserver: MutationObserver | null = null;

// Track if monitor is initialized
let isInitialized = false;

/**
 * Check if a script element is legitimate (part of the application)
 */
export function isLegitimateScript(element: Element): boolean {
    if (element.tagName.toLowerCase() !== 'script') {
        return false;
    }

    const scriptElement = element as HTMLScriptElement;
    const src = scriptElement.src;

    // Inline scripts without src are suspicious unless they have specific attributes
    if (!src) {
        // Check for Vite/React specific inline scripts
        const content = scriptElement.textContent || '';
        if (content.includes('__vite__') || content.includes('__REACT_DEVTOOLS_GLOBAL_HOOK__')) {
            return true;
        }
        // Block other inline scripts
        return false;
    }

    // Check against allowed sources
    const allowedSources = monitorConfig.allowedScriptSources || DEFAULT_ALLOWED_SOURCES;
    for (const allowedSource of allowedSources) {
        if (src.includes(allowedSource)) {
            return true;
        }
    }

    // Check if same origin
    try {
        const scriptUrl = new URL(src, window.location.origin);
        if (scriptUrl.origin === window.location.origin) {
            return true;
        }
    } catch {
        // Invalid URL, treat as suspicious
        return false;
    }

    return false;
}

/**
 * Check if an iframe element is legitimate
 */
export function isLegitimateIframe(element: Element): boolean {
    if (element.tagName.toLowerCase() !== 'iframe') {
        return false;
    }

    const iframeElement = element as HTMLIFrameElement;
    const src = iframeElement.src;

    // Iframes without src or with about:blank are often used for sandboxing
    if (!src || src === 'about:blank') {
        // Check for sandbox attribute which indicates intentional sandboxing
        if (iframeElement.hasAttribute('sandbox')) {
            return true;
        }
        return false;
    }

    // Check if same origin
    try {
        const iframeUrl = new URL(src, window.location.origin);
        if (iframeUrl.origin === window.location.origin) {
            return true;
        }
    } catch {
        return false;
    }

    return false;
}

/**
 * Check if an element should be blocked
 * Requirements 7.1: Detect unauthorized script and iframe injections
 */
export function shouldBlockElement(element: Element): boolean {
    const tagName = element.tagName.toLowerCase();

    if (!monitorConfig.blockedTags.includes(tagName)) {
        return false;
    }

    // Check if it's a legitimate element
    if (tagName === 'script' && isLegitimateScript(element)) {
        return false;
    }

    if (tagName === 'iframe' && isLegitimateIframe(element)) {
        return false;
    }

    return true;
}

/**
 * Handle detected DOM violations
 * Requirements 7.2: Remove unauthorized elements immediately
 * Requirements 9.3: Log DOM violations as security events
 */
function handleViolation(element: Element): void {
    const tagName = element.tagName.toLowerCase();
    const src = (element as HTMLScriptElement | HTMLIFrameElement).src || 'inline';
    
    // Log the violation
    console.warn(`[DOMMonitor] Detected unauthorized ${tagName} injection:`, {
        tagName,
        src,
        id: element.id,
        className: element.className,
    });

    // Call violation callback
    monitorConfig.onViolation?.(element, tagName);

    // Requirements 9.3: Log DOM violation as security event
    logDOMViolation(tagName, 'removed', {
        src,
        element_id: element.id || undefined,
        element_class: element.className || undefined
    });

    // Requirements 7.2: Remove the element immediately
    try {
        element.remove();
        console.log(`[DOMMonitor] Removed unauthorized ${tagName} element`);
    } catch (error) {
        console.error(`[DOMMonitor] Failed to remove ${tagName} element:`, error);
    }
}

/**
 * Process mutations detected by the observer
 */
function processMutations(mutations: MutationRecord[]): void {
    for (const mutation of mutations) {
        if (mutation.type === 'childList') {
            // Check added nodes
            for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node as Element;
                    
                    // Check the element itself
                    if (shouldBlockElement(element)) {
                        handleViolation(element);
                        continue;
                    }

                    // Check descendants for blocked elements
                    for (const blockedTag of monitorConfig.blockedTags) {
                        const descendants = element.getElementsByTagName(blockedTag);
                        for (const descendant of Array.from(descendants)) {
                            if (shouldBlockElement(descendant)) {
                                handleViolation(descendant);
                            }
                        }
                    }
                }
            }
        }
    }
}

/**
 * Create and configure the MutationObserver
 * Requirements 7.4: Observe with childList and subtree options
 */
function createObserver(): MutationObserver {
    return new MutationObserver(processMutations);
}

/**
 * Initialize the DOM integrity monitor
 * Requirements 7.1: Monitor DOM for unauthorized injections
 * Requirements 7.4: Observe entire document body with childList and subtree
 * Requirements 7.5: Only activate in production builds
 * 
 * @param config - Optional configuration to override defaults
 * @returns The MutationObserver instance or null if not enabled
 */
export function initializeDOMMonitor(config?: Partial<DOMMonitorConfig>): MutationObserver | null {
    if (isInitialized) {
        console.warn('[DOMMonitor] Monitor already initialized');
        return activeObserver;
    }

    // Merge configuration
    monitorConfig = {
        ...monitorConfig,
        ...config,
        blockedTags: config?.blockedTags || DEFAULT_BLOCKED_TAGS,
        allowedScriptSources: [
            ...DEFAULT_ALLOWED_SOURCES,
            ...(config?.allowedScriptSources || []),
        ],
    };

    if (!monitorConfig.enabled) {
        return null;
    }

    // Create the observer
    activeObserver = createObserver();

    // Requirements 7.4: Observe entire document body with childList and subtree
    activeObserver.observe(document.body, {
        childList: true,
        subtree: true,
    });

    isInitialized = true;
    console.log('[DOMMonitor] Initialized with blocked tags:', monitorConfig.blockedTags);

    return activeObserver;
}

/**
 * Stop the DOM monitor and disconnect the observer
 * @param observer - Optional specific observer to stop (uses active if not provided)
 */
export function stopDOMMonitor(observer?: MutationObserver | null): void {
    const targetObserver = observer || activeObserver;
    
    if (targetObserver) {
        targetObserver.disconnect();
        console.log('[DOMMonitor] Stopped');
    }

    if (!observer || observer === activeObserver) {
        activeObserver = null;
        isInitialized = false;
        monitorConfig.enabled = false;
    }
}

/**
 * Check if the DOM monitor is currently active
 */
export function isDOMMonitorActive(): boolean {
    return isInitialized && monitorConfig.enabled;
}

/**
 * Get the current list of blocked tags
 */
export function getBlockedTags(): string[] {
    return [...monitorConfig.blockedTags];
}

/**
 * Add a tag to the blocklist at runtime
 */
export function addBlockedTag(tag: string): void {
    const normalizedTag = tag.toLowerCase();
    if (!monitorConfig.blockedTags.includes(normalizedTag)) {
        monitorConfig.blockedTags.push(normalizedTag);
    }
}

/**
 * Remove a tag from the blocklist at runtime
 */
export function removeBlockedTag(tag: string): void {
    const normalizedTag = tag.toLowerCase();
    const index = monitorConfig.blockedTags.indexOf(normalizedTag);
    if (index > -1) {
        monitorConfig.blockedTags.splice(index, 1);
    }
}

/**
 * Scan the current DOM for existing violations
 * Useful for checking the DOM state after initialization
 */
export function scanExistingDOM(): Element[] {
    const violations: Element[] = [];
    
    for (const blockedTag of monitorConfig.blockedTags) {
        const elements = document.getElementsByTagName(blockedTag);
        for (const element of Array.from(elements)) {
            if (shouldBlockElement(element)) {
                violations.push(element);
            }
        }
    }

    return violations;
}

/**
 * Remove all existing violations from the DOM
 */
export function removeExistingViolations(): number {
    const violations = scanExistingDOM();
    
    for (const element of violations) {
        handleViolation(element);
    }

    return violations.length;
}

export default {
    initializeDOMMonitor,
    stopDOMMonitor,
    isDOMMonitorActive,
    getBlockedTags,
    addBlockedTag,
    removeBlockedTag,
    shouldBlockElement,
    isLegitimateScript,
    isLegitimateIframe,
    scanExistingDOM,
    removeExistingViolations,
};
