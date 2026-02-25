/**
 * Secure Core Bridge
 * Integrates the Python-based Secure Logic Engine with React.
 */

import { vault } from './vault';

interface PyodideInterface {
  runPython: (code: string) => unknown;
  runPythonAsync: (code: string) => Promise<unknown>;
  globals: {
    get: (name: string) => unknown;
    set: (name: string, value: unknown) => void;
  };
}

let pyodideInstance: PyodideInterface | null = null;
let isInitializing = false;

/**
 * Capture unmodified clock references at file load to prevent Prototype Poisoning later.
 * Blueprint 2.1: Monotonic Disconnect Mitigation
 */
const securePerformanceNow = (typeof performance !== 'undefined' && performance.now)
  ? performance.now.bind(performance)
  : Date.now;

/**
 * Requirement 1.1: Initialize the Secure Core
 * Fetches the python logic and injects it into the WASM environment.
 */
export async function initializeSecureCore(): Promise<void> {
  if (pyodideInstance || isInitializing) return;
  isInitializing = true;

  try {
    // Init Vault First (Requirement 3.3)
    await vault.initialize();

    if (!(window as unknown as { loadPyodide: () => Promise<PyodideInterface> }).loadPyodide) {
      throw new Error("Pyodide not found in window. Ensure script is loaded in index.html");
    }

    try {
      pyodideInstance = await (window as unknown as { loadPyodide: () => Promise<PyodideInterface> }).loadPyodide();
    } catch (e) {
      throw new Error(`Pyodide WASM OOM or Init Failure: ${e}`);
    }

    // Expose vault bridge to Python
    pyodideInstance!.globals.set("vault_pub_key", vault.getPublicKey());

    // Fetch the secure core script
    const response = await fetch('/src/lib/secure_core.py');
    const pythonCode = await response.text();

    // Load the core into Python globals
    await pyodideInstance!.runPythonAsync(pythonCode);

    // Setup Vault Identity in Python (Requirement 3.2)
    const pubKey = vault.getPublicKey();
    await dispatchToCore('IDENTITY_SETUP', { pub_key: pubKey });

    console.log("[SecureCore] Python Logic Engine fully operational with PQC Identity.");
  } catch (error) {
    console.error("[SecureCore] Failed to initialize:", error);
    window.dispatchEvent(new CustomEvent('catcoder:core_error', { detail: { error } }));
    throw error;
  } finally {
    isInitializing = false;
  }
}

/**
 * Requirement 2.2: Dispatch action to Secure Core
 * All state mutations must pass through this bridge.
 * Injects performance.now() for monotonic time tracking (Blueprint 2.1).
 */
export async function dispatchToCore(type: string, payload: Record<string, unknown> = {}): Promise<unknown> {
  if (!pyodideInstance) {
    await initializeSecureCore();
  }

  const actionJson = JSON.stringify({
    type,
    payload: { ...payload, now: securePerformanceNow() }
  });

  // Escape single quotes for Python string injection
  const escapedJson = actionJson.replace(/'/g, "\\'");

  const resultJson = pyodideInstance!.runPython(`dispatch('${escapedJson}')`) as string;
  const result = JSON.parse(resultJson) as { is_locked?: boolean };

  // If core returns a locked state, we need to handle it globally
  if (result.is_locked) {
    window.dispatchEvent(new CustomEvent('catcoder:core_locked'));
  }

  return result;
}

// Requirement 2.1: Heartbeat to enforce idle timeout even if no user activity
setInterval(() => {
  if (pyodideInstance) {
    dispatchToCore('HEARTBEAT');
  }
}, 30000); // 30 seconds heartbeat

export async function getCurrentCoreState(): Promise<unknown> {
  if (!pyodideInstance) return null;
  const resultJson = pyodideInstance!.runPython(`json.dumps(engine.get_state())`) as string;
  return JSON.parse(resultJson);
}
