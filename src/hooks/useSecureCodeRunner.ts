/**
 * Secure Code Runner Hook
 * Feature: security-hardening
 * Requirements: 1.3, 1.6
 * 
 * This hook provides sandboxed code execution using Web Workers with:
 * - 3-second timeout with worker termination
 * - Fresh worker instance for each execution (state isolation)
 * - Error handling and output aggregation
 */

import { useState, useCallback, useRef } from 'react';

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
 * Hook for secure, sandboxed code execution
 * Creates a fresh Web Worker for each execution to ensure state isolation
 */
export const useSecureCodeRunner = (): UseSecureCodeRunnerReturn => {
    const [isRunning, setIsRunning] = useState(false);
    const workerRef = useRef<Worker | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /**
     * Terminates the current worker and clears timeout
     */
    const terminate = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (workerRef.current) {
            workerRef.current.terminate();
            workerRef.current = null;
        }
        setIsRunning(false);
    }, []);

    /**
     * Executes code in a sandboxed Web Worker
     * Creates a fresh worker for each execution to prevent state leakage
     */
    const runCode = useCallback(async (code: string, language: string): Promise<CodeRunnerResult> => {
        // Terminate any existing worker before starting new execution
        terminate();

        return new Promise((resolve) => {
            const output: string[] = [];
            const errors: string[] = [];
            const executionId = Date.now().toString();

            setIsRunning(true);

            try {
                // Create fresh worker instance for each execution (Requirement 1.6)
                const worker = new Worker('/sandbox-worker.js');
                workerRef.current = worker;

                // Set up timeout (Requirement 1.3 - 3 second timeout)
                timeoutRef.current = setTimeout(() => {
                    errors.push('Execution timed out after 3 seconds');
                    terminate();
                    resolve({
                        success: false,
                        output,
                        errors,
                        timedOut: true
                    });
                }, EXECUTION_TIMEOUT_MS);

                // Handle messages from worker
                worker.onmessage = (event) => {
                    const { type, data, executionId: msgExecutionId } = event.data;

                    // Ignore messages from previous executions
                    if (msgExecutionId && msgExecutionId !== executionId) {
                        return;
                    }

                    switch (type) {
                        case 'log':
                            output.push(data);
                            break;
                        case 'warn':
                            output.push(`Warning: ${data}`);
                            break;
                        case 'error':
                            errors.push(data);
                            break;
                        case 'complete':
                            // Clear timeout and terminate worker
                            if (timeoutRef.current) {
                                clearTimeout(timeoutRef.current);
                                timeoutRef.current = null;
                            }
                            worker.terminate();
                            workerRef.current = null;
                            setIsRunning(false);

                            resolve({
                                success: errors.length === 0,
                                output,
                                errors,
                                timedOut: false
                            });
                            break;
                    }
                };

                // Handle worker errors
                worker.onerror = (error) => {
                    if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                        timeoutRef.current = null;
                    }
                    errors.push(`Worker error: ${error.message || 'Unknown error'}`);
                    terminate();
                    resolve({
                        success: false,
                        output,
                        errors,
                        timedOut: false
                    });
                };

                // Send code to worker for execution
                worker.postMessage({ code, language, executionId });

            } catch (error) {
                // Handle worker creation errors
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
                errors.push(`Failed to create worker: ${error instanceof Error ? error.message : 'Unknown error'}`);
                setIsRunning(false);
                resolve({
                    success: false,
                    output,
                    errors,
                    timedOut: false
                });
            }
        });
    }, [terminate]);

    return {
        runCode,
        isRunning,
        terminate
    };
};

export default useSecureCodeRunner;
