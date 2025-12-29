/**
 * DOM Monitor Property-Based Tests
 * Feature: security-hardening
 * 
 * Property 8: DOM Injection Removal
 * 
 * Validates: Requirements 7.2
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import {
    initializeDOMMonitor,
    stopDOMMonitor,
    isDOMMonitorActive,
    shouldBlockElement,
    isLegitimateScript,
    isLegitimateIframe,
    getBlockedTags,
    addBlockedTag,
    removeBlockedTag,
    scanExistingDOM,
} from './domMonitor';

// Helper to create script elements
function createScriptElement(options: { src?: string; inline?: string; id?: string } = {}): HTMLScriptElement {
    const script = document.createElement('script');
    if (options.src) {
        script.src = options.src;
    }
    if (options.inline) {
        script.textContent = options.inline;
    }
    if (options.id) {
        script.id = options.id;
    }
    return script;
}

// Helper to create iframe elements
function createIframeElement(options: { src?: string; sandbox?: boolean; id?: string } = {}): HTMLIFrameElement {
    const iframe = document.createElement('iframe');
    if (options.src) {
        iframe.src = options.src;
    }
    if (options.sandbox) {
        iframe.setAttribute('sandbox', 'allow-scripts');
    }
    if (options.id) {
        iframe.id = options.id;
    }
    return iframe;
}

// Helper to wait for MutationObserver to process
function waitForMutationObserver(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
}

// Type for violation callback
type ViolationCallback = (element: Element, type: string) => void;

describe('DOM Monitor - Property-Based Tests', () => {
    let testContainer: HTMLDivElement;
    let observer: MutationObserver | null = null;
    let violationCallback: ViolationCallback;

    beforeEach(() => {
        // Create a test container
        testContainer = document.createElement('div');
        testContainer.id = 'test-container';
        document.body.appendChild(testContainer);
        
        // Reset monitor state
        stopDOMMonitor();
        violationCallback = vi.fn() as unknown as ViolationCallback;
    });

    afterEach(() => {
        // Clean up
        if (observer) {
            stopDOMMonitor(observer);
            observer = null;
        }
        stopDOMMonitor();
        testContainer.remove();
    });

    /**
     * Feature: security-hardening, Property 8: DOM Injection Removal
     * 
     * For any script or iframe element injected into the DOM after the monitor
     * is initialized, the DOM Monitor SHALL detect and remove the element
     * within one mutation observer callback cycle.
     * 
     * Validates: Requirements 7.2
     */
    describe('Property 8: DOM Injection Removal', () => {
        it('should detect and remove injected script elements with external sources', async () => {
            await fc.assert(
                fc.asyncProperty(
                    // Generate random malicious script URLs
                    fc.constantFrom(
                        'https://evil.com/malware.js',
                        'https://attacker.io/steal.js',
                        'https://malicious-cdn.net/inject.js',
                        'https://hacker.xyz/payload.js',
                        'https://data-exfil.org/collect.js'
                    ),
                    async (maliciousUrl) => {
                        // Initialize monitor
                        observer = initializeDOMMonitor({
                            enabled: true,
                            onViolation: vi.fn() as unknown as ViolationCallback,
                        });

                        // Create and inject malicious script
                        const script = createScriptElement({ src: maliciousUrl });
                        testContainer.appendChild(script);

                        // Wait for MutationObserver to process
                        await waitForMutationObserver();

                        // Verify the script was removed
                        const scriptsInContainer = testContainer.querySelectorAll('script');
                        const scriptStillExists = Array.from(scriptsInContainer).some(
                            s => (s as HTMLScriptElement).src === maliciousUrl
                        );

                        // Clean up for next iteration
                        stopDOMMonitor(observer);
                        observer = null;

                        return !scriptStillExists;
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });

        it('should detect and remove injected iframe elements with external sources', async () => {
            await fc.assert(
                fc.asyncProperty(
                    // Generate random malicious iframe URLs
                    fc.constantFrom(
                        'https://evil.com/phishing.html',
                        'https://attacker.io/clickjack.html',
                        'https://malicious-site.net/overlay.html',
                        'https://hacker.xyz/fake-login.html',
                        'https://data-exfil.org/hidden.html'
                    ),
                    async (maliciousUrl) => {
                        // Initialize monitor
                        observer = initializeDOMMonitor({
                            enabled: true,
                            onViolation: violationCallback,
                        });

                        // Create and inject malicious iframe
                        const iframe = createIframeElement({ src: maliciousUrl });
                        testContainer.appendChild(iframe);

                        // Wait for MutationObserver to process
                        await waitForMutationObserver();

                        // Verify the iframe was removed
                        const iframesInContainer = testContainer.querySelectorAll('iframe');
                        const iframeStillExists = Array.from(iframesInContainer).some(
                            f => (f as HTMLIFrameElement).src === maliciousUrl
                        );

                        // Clean up for next iteration
                        stopDOMMonitor(observer);
                        observer = null;

                        return !iframeStillExists;
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });

        it('should detect and remove inline script injections', async () => {
            await fc.assert(
                fc.asyncProperty(
                    // Generate random safe inline script identifiers (not actual executable code)
                    // We use comments to avoid jsdom trying to execute the content
                    fc.constantFrom(
                        '/* malicious-script-1 */',
                        '/* malicious-script-2 */',
                        '/* malicious-script-3 */',
                        '/* malicious-script-4 */',
                        '/* malicious-script-5 */'
                    ),
                    async (maliciousCode) => {
                        // Initialize monitor
                        observer = initializeDOMMonitor({
                            enabled: true,
                            onViolation: violationCallback,
                        });

                        // Create and inject malicious inline script
                        const script = createScriptElement({ inline: maliciousCode });
                        testContainer.appendChild(script);

                        // Wait for MutationObserver to process
                        await waitForMutationObserver();

                        // Verify the script was removed
                        const scriptsInContainer = testContainer.querySelectorAll('script');
                        const scriptStillExists = Array.from(scriptsInContainer).some(
                            s => s.textContent === maliciousCode
                        );

                        // Clean up for next iteration
                        stopDOMMonitor(observer);
                        observer = null;

                        return !scriptStillExists;
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });

        it('should call violation callback for each detected injection', async () => {
            await fc.assert(
                fc.asyncProperty(
                    fc.constantFrom('script', 'iframe'),
                    fc.constantFrom(
                        'https://evil.com/malware.js',
                        'https://attacker.io/steal.js'
                    ),
                    async (tagType, url) => {
                        const localViolationCallback = vi.fn();
                        
                        // Initialize monitor
                        observer = initializeDOMMonitor({
                            enabled: true,
                            onViolation: localViolationCallback,
                        });

                        // Create and inject element
                        const element = tagType === 'script' 
                            ? createScriptElement({ src: url })
                            : createIframeElement({ src: url });
                        testContainer.appendChild(element);

                        // Wait for MutationObserver to process
                        await waitForMutationObserver();

                        // Verify callback was called
                        const callbackWasCalled = localViolationCallback.mock.calls.length > 0;

                        // Clean up for next iteration
                        stopDOMMonitor(observer);
                        observer = null;

                        return callbackWasCalled;
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });
    });
});

describe('DOM Monitor - Unit Tests', () => {
    let testContainer: HTMLDivElement;
    let observer: MutationObserver | null = null;

    beforeEach(() => {
        testContainer = document.createElement('div');
        testContainer.id = 'test-container';
        document.body.appendChild(testContainer);
        stopDOMMonitor();
    });

    afterEach(() => {
        if (observer) {
            stopDOMMonitor(observer);
            observer = null;
        }
        stopDOMMonitor();
        testContainer.remove();
    });

    describe('isLegitimateScript', () => {
        it('should allow scripts from same origin', () => {
            const script = createScriptElement({ src: `${window.location.origin}/assets/app.js` });
            expect(isLegitimateScript(script)).toBe(true);
        });

        it('should allow Vite dev scripts', () => {
            const script = createScriptElement({ src: '/@vite/client' });
            expect(isLegitimateScript(script)).toBe(true);
        });

        it('should allow scripts from /src/', () => {
            const script = createScriptElement({ src: '/src/main.tsx' });
            expect(isLegitimateScript(script)).toBe(true);
        });

        it('should allow scripts from /assets/', () => {
            const script = createScriptElement({ src: '/assets/index-abc123.js' });
            expect(isLegitimateScript(script)).toBe(true);
        });

        it('should block scripts from external domains', () => {
            const script = createScriptElement({ src: 'https://evil.com/malware.js' });
            expect(isLegitimateScript(script)).toBe(false);
        });

        it('should allow Vite inline scripts', () => {
            const script = createScriptElement({ inline: 'window.__vite__ = true;' });
            expect(isLegitimateScript(script)).toBe(true);
        });

        it('should block suspicious inline scripts', () => {
            const script = createScriptElement({ inline: 'fetch("https://evil.com")' });
            expect(isLegitimateScript(script)).toBe(false);
        });
    });

    describe('isLegitimateIframe', () => {
        it('should allow sandboxed iframes without src', () => {
            const iframe = createIframeElement({ sandbox: true });
            expect(isLegitimateIframe(iframe)).toBe(true);
        });

        it('should allow same-origin iframes', () => {
            const iframe = createIframeElement({ src: `${window.location.origin}/embed.html` });
            expect(isLegitimateIframe(iframe)).toBe(true);
        });

        it('should block external iframes', () => {
            const iframe = createIframeElement({ src: 'https://evil.com/phishing.html' });
            expect(isLegitimateIframe(iframe)).toBe(false);
        });

        it('should block iframes without src or sandbox', () => {
            const iframe = createIframeElement({});
            expect(isLegitimateIframe(iframe)).toBe(false);
        });
    });

    describe('shouldBlockElement', () => {
        it('should block external scripts', () => {
            const script = createScriptElement({ src: 'https://evil.com/malware.js' });
            expect(shouldBlockElement(script)).toBe(true);
        });

        it('should not block legitimate scripts', () => {
            const script = createScriptElement({ src: '/assets/app.js' });
            expect(shouldBlockElement(script)).toBe(false);
        });

        it('should block external iframes', () => {
            const iframe = createIframeElement({ src: 'https://evil.com/phishing.html' });
            expect(shouldBlockElement(iframe)).toBe(true);
        });

        it('should not block sandboxed iframes', () => {
            const iframe = createIframeElement({ sandbox: true });
            expect(shouldBlockElement(iframe)).toBe(false);
        });

        it('should not block non-monitored elements', () => {
            const div = document.createElement('div');
            expect(shouldBlockElement(div)).toBe(false);
        });
    });

    describe('Monitor Lifecycle', () => {
        it('should not be active before initialization', () => {
            expect(isDOMMonitorActive()).toBe(false);
        });

        it('should be active after initialization with enabled=true', () => {
            observer = initializeDOMMonitor({ enabled: true });
            expect(isDOMMonitorActive()).toBe(true);
        });

        it('should not be active if initialized with enabled=false', () => {
            observer = initializeDOMMonitor({ enabled: false });
            expect(isDOMMonitorActive()).toBe(false);
        });

        it('should be inactive after stopping', () => {
            observer = initializeDOMMonitor({ enabled: true });
            stopDOMMonitor(observer);
            expect(isDOMMonitorActive()).toBe(false);
        });

        it('should return null when disabled', () => {
            const result = initializeDOMMonitor({ enabled: false });
            expect(result).toBeNull();
        });
    });

    describe('Tag Management', () => {
        it('should return blocked tags', () => {
            const tags = getBlockedTags();
            expect(tags).toContain('script');
            expect(tags).toContain('iframe');
        });

        it('should add new blocked tag', () => {
            addBlockedTag('object');
            expect(getBlockedTags()).toContain('object');
            // Clean up
            removeBlockedTag('object');
        });

        it('should remove blocked tag', () => {
            addBlockedTag('embed');
            expect(getBlockedTags()).toContain('embed');
            
            removeBlockedTag('embed');
            expect(getBlockedTags()).not.toContain('embed');
        });

        it('should normalize tag names to lowercase', () => {
            addBlockedTag('OBJECT');
            expect(getBlockedTags()).toContain('object');
            removeBlockedTag('object');
        });
    });

    describe('DOM Scanning', () => {
        it('should detect existing malicious scripts', () => {
            const script = createScriptElement({ src: 'https://evil.com/malware.js' });
            testContainer.appendChild(script);

            const violations = scanExistingDOM();
            expect(violations.length).toBeGreaterThan(0);
            expect(violations.some(el => el === script)).toBe(true);

            script.remove();
        });

        it('should not flag legitimate scripts', () => {
            const script = createScriptElement({ src: '/assets/app.js' });
            testContainer.appendChild(script);

            const violations = scanExistingDOM();
            expect(violations.some(el => el === script)).toBe(false);

            script.remove();
        });
    });

    describe('Real-time Detection', () => {
        it('should remove injected script in real-time', async () => {
            const violationCallback = vi.fn();
            observer = initializeDOMMonitor({
                enabled: true,
                onViolation: violationCallback,
            });

            const script = createScriptElement({ src: 'https://evil.com/malware.js' });
            testContainer.appendChild(script);

            await waitForMutationObserver();

            expect(testContainer.querySelector('script[src="https://evil.com/malware.js"]')).toBeNull();
            expect(violationCallback).toHaveBeenCalled();
        });

        it('should remove injected iframe in real-time', async () => {
            const violationCallback = vi.fn();
            observer = initializeDOMMonitor({
                enabled: true,
                onViolation: violationCallback,
            });

            const iframe = createIframeElement({ src: 'https://evil.com/phishing.html' });
            testContainer.appendChild(iframe);

            await waitForMutationObserver();

            expect(testContainer.querySelector('iframe[src="https://evil.com/phishing.html"]')).toBeNull();
            expect(violationCallback).toHaveBeenCalled();
        });

        it('should detect nested injections', async () => {
            const violationCallback = vi.fn();
            observer = initializeDOMMonitor({
                enabled: true,
                onViolation: violationCallback,
            });

            // Create a div with a nested malicious script
            const wrapper = document.createElement('div');
            const script = createScriptElement({ src: 'https://evil.com/malware.js' });
            wrapper.appendChild(script);
            testContainer.appendChild(wrapper);

            await waitForMutationObserver();

            expect(wrapper.querySelector('script')).toBeNull();
            expect(violationCallback).toHaveBeenCalled();
        });
    });
});
