/**
 * Secure Core Bridge
 * Integrates the Python-based Secure Logic Engine with React.
 *
 * The Pyodide runtime is fetched lazily via `pyodideLoader` and the actual
 * Python logic is served as a static asset from `/python/secure_core.py`.
 */

import { vault } from './vault';
import { ensurePyodide, type PyodideInterface } from './pyodideLoader';

let pyodideInstance: PyodideInterface | null = null;
let initPromise: Promise<void> | null = null;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Capture unmodified clock references at file load to prevent Prototype Poisoning later.
 * Blueprint 2.1: Monotonic Disconnect Mitigation
 */
const securePerformanceNow = (typeof performance !== 'undefined' && performance.now)
    ? performance.now.bind(performance)
    : Date.now;

/**
 * Public path to the Python source for the secure core. Lives in `/public`
 * so Vite copies it verbatim into `dist` and the production host serves it
 * with a stable URL.
 */
const SECURE_CORE_URL = '/python/secure_core.py';

/**
 * Requirement 1.1: Initialize the Secure Core
 * Fetches the python logic and injects it into the WASM environment.
 */
export async function initializeSecureCore(): Promise<void> {
    if (pyodideInstance) return;
    if (initPromise) return initPromise;

    initPromise = (async () => {
        try {
            // Init Vault First (Requirement 3.3)
            await vault.initialize();

            let instance: PyodideInterface;
            try {
                instance = await ensurePyodide();
            } catch (e) {
                throw new Error(`Pyodide WASM OOM or Init Failure: ${(e as Error).message ?? e}`);
            }

            // Expose vault bridge to Python
            instance.globals.set('vault_pub_key', vault.getPublicKey());

            // Fetch the secure core script
            const response = await fetch(SECURE_CORE_URL, { cache: 'no-cache' });
            if (!response.ok) {
                throw new Error(
                    `Failed to fetch secure_core.py (${response.status} ${response.statusText})`
                );
            }
            const pythonCode = await response.text();

            // Load the core into Python globals
            await instance.runPythonAsync(pythonCode);

            pyodideInstance = instance;

            // Setup Vault Identity in Python (Requirement 3.2)
            const pubKey = vault.getPublicKey();
            await dispatchToCore('IDENTITY_SETUP', { pub_key: pubKey });

            // Requirement 2.1: Heartbeat to enforce idle timeout even if no user activity.
            // Started here (after init succeeded) instead of at module load so the test
            // environment doesn't spam errors on a non-existent Pyodide.
            if (heartbeatTimer === null && typeof window !== 'undefined') {
                heartbeatTimer = setInterval(() => {
                    if (pyodideInstance) {
                        dispatchToCore('HEARTBEAT').catch(() => {
                            /* silent: heartbeat failures should not bubble */
                        });
                    }
                }, 30000);
            }

            console.log('[SecureCore] Python Logic Engine fully operational with PQC Identity.');
        } catch (error) {
            console.error('[SecureCore] Failed to initialize:', error);
            if (typeof window !== 'undefined') {
                window.dispatchEvent(
                    new CustomEvent('catcoder:core_error', { detail: { error } })
                );
            }
            throw error;
        }
    })();

    try {
        await initPromise;
    } finally {
        // Allow re-attempt if init failed; keep cached promise on success so future
        // callers see the resolved value immediately.
        if (!pyodideInstance) {
            initPromise = null;
        }
    }
}

/**
 * Requirement 2.2: Dispatch action to Secure Core
 * All state mutations must pass through this bridge.
 * Injects performance.now() for monotonic time tracking (Blueprint 2.1).
 */
export async function dispatchToCore(
    type: string,
    payload: Record<string, unknown> = {}
): Promise<unknown> {
    if (!pyodideInstance) {
        await initializeSecureCore();
    }

    const actionJson = JSON.stringify({
        type,
        payload: { ...payload, now: securePerformanceNow() },
    });

    // Escape single quotes for Python string injection
    const escapedJson = actionJson.replace(/'/g, "\\'");

    const resultJson = pyodideInstance!.runPython(
        `dispatch('${escapedJson}')`
    ) as string;
    const result = JSON.parse(resultJson) as { is_locked?: boolean };

    // If core returns a locked state, we need to handle it globally
    if (result.is_locked && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('catcoder:core_locked'));
    }

    return result;
}

export async function getCurrentCoreState(): Promise<unknown> {
    if (!pyodideInstance) return null;
    const resultJson = pyodideInstance.runPython(
        `json.dumps(engine.get_state())`
    ) as string;
    return JSON.parse(resultJson);
}

/**
 * Test-only helper: tear down internal state so unit tests don't leak between runs.
 */
export function __resetSecureCoreForTests(): void {
    pyodideInstance = null;
    initPromise = null;
    if (heartbeatTimer !== null) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
    }
}
