/**
 * Secure Code Runner Hook
 * Feature: security-hardening
 * Requirements: 1.3, 1.6
 *
 * Runs untrusted JavaScript in an opaque-origin sandboxed <iframe> (see
 * `src/lib/sandboxRunner.ts`), NOT in the main realm. Shadowing globals via
 * `new Function` params is escapable through the constructor chain, so a true
 * realm boundary is required: the frame is created with `sandbox="allow-scripts"`
 * and no `allow-same-origin`, so learner code cannot reach this app's cookies,
 * localStorage, session tokens, or DOM.
 *
 * - Per-execution frame (state isolation, Requirement 1.6).
 * - Hard timeout that tears the frame down (Requirement 1.3).
 */

import { useState, useCallback, useRef } from 'react';
import { runJsInSandbox, type SandboxResult } from '../lib/sandboxRunner';

export interface CodeRunnerResult {
    success: boolean;
    output: string[];
    errors: string[];
    timedOut: boolean;
}

export interface UseSecureCodeRunnerReturn {
    runCode: (code: string, language: string) => Promise<CodeRunnerResult>;
    isRunning: boolean;
    terminate: () => void;
}

// Timeout constant - 3 seconds as per requirements
const EXECUTION_TIMEOUT_MS = 3000;


/**
 * Hook for secure, sandboxed code execution.
 * Each call spins up a fresh opaque-origin iframe (state isolation).
 */
export const useSecureCodeRunner = (): UseSecureCodeRunnerReturn => {
    const [isRunning, setIsRunning] = useState(false);
    const abortRef = useRef(false);

    /**
     * Tears down any in-flight execution. The iframe engine cleans itself up
     * on resolve, so this is mainly a guard to ignore late results.
     */
    const terminate = useCallback(() => {
        abortRef.current = true;
        setIsRunning(false);
    }, []);

    const runCode = useCallback(
        async (code: string, language: string): Promise<CodeRunnerResult> => {
            // Only JavaScript goes through the iframe sandbox; other languages
            // are not supported by this hook (Python uses useCodeRunner/Pyodide).
            if (language !== 'javascript') {
                return {
                    success: false,
                    output: [],
                    errors: [`Language "${language}" is not supported`],
                    timedOut: false,
                };
            }

            abortRef.current = false;
            setIsRunning(true);

            let result: SandboxResult;
            try {
                result = await runJsInSandbox(code, { timeoutMs: EXECUTION_TIMEOUT_MS });
            } catch (err) {
                result = {
                    output: [],
                    errors: [err instanceof Error ? err.message : 'Sandbox failed to start'],
                    timedOut: false,
                };
            }

            // If the consumer aborted mid-run, don't flip state back on.
            if (!abortRef.current) setIsRunning(false);

            return {
                success: result.errors.length === 0 && !result.timedOut,
                output: result.output,
                errors: result.errors,
                timedOut: result.timedOut,
            };
        },
        []
    );

    return {
        runCode,
        isRunning,
        terminate,
    };
};

export default useSecureCodeRunner;
