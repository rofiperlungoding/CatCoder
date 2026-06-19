/**
 * DEPRECATED: This file is no longer used.
 *
 * Sandboxed JavaScript execution has been moved to src/lib/sandboxRunner.ts,
 * which runs untrusted code in an opaque-origin <iframe sandbox="allow-scripts">
 * (no allow-same-origin). This provides a true realm boundary that is
 * impossible to escape via constructor-chain attacks on `new Function`.
 *
 * The old Web Worker approach was fundamentally flawed: shadowing dangerous
 * globals as parameters of `new Function(...)` is escapable through
 * `({}).constructor.constructor("return fetch")()` and similar patterns.
 *
 * See: src/lib/sandboxRunner.ts, src/hooks/useSecureCodeRunner.ts,
 *      src/hooks/useCodeRunner.ts
 */

self.onmessage = function () {
    self.postMessage({
        type: 'error',
        data: 'This sandbox worker is deprecated. JS execution now uses the iframe sandbox (src/lib/sandboxRunner.ts).',
    });
    self.postMessage({ type: 'complete' });
};
