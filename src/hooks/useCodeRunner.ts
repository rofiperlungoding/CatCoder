/**
 * Code Runner Hook
 * Feature: security-hardening
 * Requirements: 1.1
 * 
 * This hook provides code execution with sandboxed JavaScript execution via Web Worker.
 * Maintains backward compatibility with existing API while using secure sandbox.
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export type LogType = 'command' | 'stdout' | 'stderr' | 'system' | 'success';

export interface LogEntry {
    type: LogType;
    message: string;
    delay?: number;
}

interface UseCodeRunnerProps {
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

interface PyodideInterface {
    runPython: (code: string) => unknown;
    runPythonAsync: (code: string) => Promise<unknown>;
}

declare global {
    interface Window {
        loadPyodide: () => Promise<PyodideInterface>;
    }
}

// Timeout constant for sandboxed execution - 3 seconds
const EXECUTION_TIMEOUT_MS = 3000;
const MAX_CODE_LENGTH = 10000; // Limit code length to prevent abuse (Requirement 4.3)

export const useCodeRunner = (props?: UseCodeRunnerProps) => {
    const [terminalLogs, setTerminalLogs] = useState<LogEntry[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isValidated, setIsValidated] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    // Pyodide ref for Python execution
    const pyodideRef = useRef<PyodideInterface | null>(null);
    const [isPyodideLoading, setIsPyodideLoading] = useState(false);

    // Web Worker ref for sandboxed JS execution
    const workerRef = useRef<Worker | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastRunTime = useRef<number>(0); // Rate limiting ref

    useEffect(() => {
        const loadPyodideInstance = async () => {
            if (window.loadPyodide && !pyodideRef.current && !isPyodideLoading) {
                setIsPyodideLoading(true);
                try {
                    pyodideRef.current = await window.loadPyodide();
                    console.log("Pyodide loaded");
                } catch (e) {
                    console.error("Failed to load Pyodide:", e);
                } finally {
                    setIsPyodideLoading(false);
                }
            }
        };
        loadPyodideInstance();
    }, [isPyodideLoading]); // Cleanup worker on unmount

    // Cleanup worker on unmount
    useEffect(() => {
        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Helper to add log with delay
    const addLog = useCallback((log: LogEntry, delay = 300) => {
        return new Promise<void>(resolve => {
            setTimeout(() => {
                setTerminalLogs(prev => [...prev, log]);
                resolve();
            }, delay);
        });
    }, []);

    const clearLogs = useCallback(() => {
        setTerminalLogs([]);
        setIsValidated(false);
        setValidationError(null);
    }, []);

    /**
     * Execute JavaScript code in sandboxed Web Worker
     * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
     */
    const executeJsSandboxed = (codeStr: string): Promise<string> => {
        return new Promise((resolve) => {
            const output: string[] = [];
            const errors: string[] = [];
            const executionId = Date.now().toString();

            // Terminate any existing worker
            if (workerRef.current) {
                workerRef.current.terminate();
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            try {
                // Create fresh worker instance for each execution (Requirement 1.6)
                const worker = new Worker('/sandbox-worker.js');
                workerRef.current = worker;

                // Set up timeout (Requirement 1.3 - 3 second timeout)
                timeoutRef.current = setTimeout(() => {
                    worker.terminate();
                    workerRef.current = null;
                    resolve('Error: Execution timed out after 3 seconds');
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

                            // Format output similar to old implementation
                            if (errors.length > 0) {
                                resolve(`Error: ${errors.join('\n')}`);
                            } else {
                                resolve(output.join('\n'));
                            }
                            break;
                    }
                };

                // Handle worker errors
                worker.onerror = (error) => {
                    if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                        timeoutRef.current = null;
                    }
                    worker.terminate();
                    workerRef.current = null;
                    resolve(`Error: ${error.message || 'Unknown worker error'}`);
                };

                // Send code to worker for execution
                worker.postMessage({ code: codeStr, language: 'javascript', executionId });

            } catch (error) {
                // Handle worker creation errors - fall back to non-sandboxed execution
                console.warn('Web Worker not available, falling back to direct execution', error);
                resolve(executeJsFallback(codeStr));
            }
        });
    };

    /**
     * Fallback JavaScript execution (non-sandboxed)
     * Used only when Web Workers are not available
     * 
     * Requirement 1.1: ALL code must execute in sandbox. 
     * We purposefully fail-closed here instead of falling back to unsafe eval.
     */
    const executeJsFallback = (_codeStr: string): string => {
        return "Error: Secure Sandbox (Web Worker) is required for execution but could not be loaded. Please check your browser settings or refresh the page.";
    };

    const executePython = async (codeStr: string): Promise<string> => {
        if (!pyodideRef.current) {
            // Try load again if missing
            if (window.loadPyodide) {
                try {
                    pyodideRef.current = await window.loadPyodide();
                } catch {
                    return "Error: Python engine not loaded. Please refresh.";
                }
            } else {
                return "Error: Python engine not found.";
            }
        }

        try {
            // Redirect stdout to capture output
            pyodideRef.current.runPython(`
import sys
import io
sys.stdout = io.StringIO()
`);
            await pyodideRef.current.runPythonAsync(codeStr);
            const stdout = pyodideRef.current.runPython("sys.stdout.getvalue()");
            return String(stdout);
        } catch (e: unknown) {
            return `Error: ${(e as Error).message}`;
        }
    };

    const runCode = async (code: string, language: string, expectedOutput?: string): Promise<boolean> => {
        // Requirement 4.2: Rate Limiting (Client-side Throttling)
        const now = Date.now();
        if (now - lastRunTime.current < 2000) { // 2 seconds delay
            setTerminalLogs(prev => [...prev, { type: 'stderr', message: '⚠️ Please wait a moment before running code again.' }]);
            return false;
        }
        lastRunTime.current = now;

        // Requirement 4.3: Input Sanitization (Length Check)
        if (code.length > MAX_CODE_LENGTH) {
            setTerminalLogs([{ type: 'stderr', message: `Error: Code exceeds maximum length of ${MAX_CODE_LENGTH} characters.` }]);
            return false;
        }

        setIsRunning(true);
        clearLogs();

        let runCommand = '';
        let compileCommand = '';

        if (language === 'python') runCommand = 'python3 main.py';
        else if (language === 'javascript') runCommand = 'node main.js';
        else if (language === 'cpp') {
            compileCommand = 'g++ main.cpp -o main';
            runCommand = './main';
        }

        // 1. Compile (if needed)
        if (compileCommand) {
            await addLog({ type: 'command', message: compileCommand }, 300);
            await addLog({ type: 'system', message: 'Compiling...' }, 800);
        }

        // 2. Run
        await addLog({ type: 'command', message: runCommand }, 400);

        // 3. Execution (Sandboxed JS, Pyodide Python, or Mock C++)
        let output = '';
        if (language === 'javascript') {
            // Use sandboxed Web Worker execution (Requirement 1.1)
            output = await executeJsSandboxed(code);
        } else if (language === 'python') {
            await addLog({ type: 'system', message: 'Initializing Python Environment...' }, 100);
            output = await executePython(code);
        } else if (language === 'cpp') {
            // C++ Mock Fallback (Regex)
            const coutMatch = code.match(/cout\s*<<\s*['"](.*?)['"]/g);
            if (coutMatch) {
                output = coutMatch.map(c => c.replace(/cout\s*<<\s*['"]/g, '').replace(/['"]$/g, '')).join('\n');
            }
        }

        // 4. Output Logs
        if (output.startsWith('Error:')) {
            await addLog({ type: 'stderr', message: output }, 500);
        } else {
            const lines = output.split('\n');
            for (const line of lines) {
                if (line !== '') {
                    await addLog({ type: 'stdout', message: line }, 200);
                }
            }
        }

        // 5. Validation - return result immediately
        setIsRunning(false);
        let isValid = false;
        const hasError = output.startsWith('Error:');
        const actualOutput = output.replace(/^Error:.*$/gm, '').trim();

        if (expectedOutput) {
            // Challenge requires specific output
            const normalizedExpected = expectedOutput.trim().toLowerCase();
            const normalizedActual = actualOutput.replace(/\r\n/g, '\n').trim().toLowerCase();

            if (normalizedActual && normalizedActual.includes(normalizedExpected)) {
                isValid = true;
            } else {
                let errorMsg = '';
                if (!normalizedActual) {
                    errorMsg = `No output. Call your function and print!`;
                    setTerminalLogs(prev => [...prev, {
                        type: 'stderr',
                        message: '⚠️ No output. Call your function and print!'
                    }]);
                } else {
                    errorMsg = `Expected: "${expectedOutput}" Got: "${normalizedActual}"`;
                }
                setValidationError(errorMsg);
                if (props?.onError) props.onError(errorMsg);
            }
        } else {
            // No expected output - just check code runs without errors
            isValid = !hasError;
        }

        if (isValid) {
            setTerminalLogs(prev => [...prev, { type: 'success', message: '✓ Passed!' }]);
            setIsValidated(true);
            if (props?.onSuccess) props.onSuccess();
        } else {
            setTerminalLogs(prev => [...prev, { type: 'system', message: 'Process exited with code 1' }]);
            setIsValidated(false);
        }

        return isValid;
    };

    return {
        terminalLogs,
        isRunning,
        isValidated,
        validationError,
        runCode,
        clearLogs
    };
};
