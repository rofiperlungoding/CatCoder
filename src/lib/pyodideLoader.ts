/**
 * Pyodide Loader
 *
 * Lazily injects the Pyodide JS bootstrap from the CDN and exposes a
 * memoized loader function.  Done here (instead of a static <script> tag in
 * index.html) so the ~300 KB JS + ~10 MB WASM payload is only fetched when a
 * user actually triggers Python execution.
 *
 * Network/CSP requirements:
 *   - script-src must include https://cdn.jsdelivr.net
 *   - connect-src must include https://cdn.jsdelivr.net (WASM/.whl downloads)
 */

interface PyodideInterface {
    runPython: (code: string) => unknown;
    runPythonAsync: (code: string) => Promise<unknown>;
    globals: {
        get: (name: string) => unknown;
        set: (name: string, value: unknown) => void;
    };
}

declare global {
    interface Window {
        loadPyodide?: (options?: { indexURL?: string }) => Promise<PyodideInterface>;
    }
}

// Pin to a known-good version that ships with Python 3.12.
// Bump intentionally; do not float to "latest".
const PYODIDE_VERSION = 'v0.26.4';
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full`;
const PYODIDE_SCRIPT_URL = `${PYODIDE_BASE}/pyodide.js`;

let scriptPromise: Promise<void> | null = null;
let pyodidePromise: Promise<PyodideInterface> | null = null;

function injectScriptOnce(): Promise<void> {
    if (typeof window === 'undefined') {
        return Promise.reject(
            new Error('Pyodide can only be loaded in a browser environment.')
        );
    }

    if (window.loadPyodide) {
        return Promise.resolve();
    }

    if (scriptPromise) return scriptPromise;

    scriptPromise = new Promise<void>((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(
            `script[data-pyodide-loader="true"]`
        );
        if (existing) {
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener(
                'error',
                () => reject(new Error('Failed to load Pyodide script (existing tag).')),
                { once: true }
            );
            return;
        }

        const script = document.createElement('script');
        script.src = PYODIDE_SCRIPT_URL;
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.dataset.pyodideLoader = 'true';
        script.addEventListener('load', () => resolve(), { once: true });
        script.addEventListener(
            'error',
            () => reject(new Error(`Failed to load Pyodide from ${PYODIDE_SCRIPT_URL}`)),
            { once: true }
        );
        document.head.appendChild(script);
    });

    return scriptPromise;
}

/**
 * Lazily ensure Pyodide is available and return a ready-to-use instance.
 * Subsequent calls return the same memoized instance.
 */
export async function ensurePyodide(): Promise<PyodideInterface> {
    if (pyodidePromise) return pyodidePromise;

    pyodidePromise = (async () => {
        await injectScriptOnce();
        if (!window.loadPyodide) {
            throw new Error('Pyodide bootstrap loaded but window.loadPyodide is missing.');
        }
        return window.loadPyodide({ indexURL: `${PYODIDE_BASE}/` });
    })();

    try {
        return await pyodidePromise;
    } catch (err) {
        // Reset so a future call can retry instead of being stuck on a rejected promise.
        pyodidePromise = null;
        throw err;
    }
}

/**
 * Reset the loader (test-only helper).
 */
export function __resetPyodideLoaderForTests(): void {
    scriptPromise = null;
    pyodidePromise = null;
}

export type { PyodideInterface };
