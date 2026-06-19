/**
 * Code Runner Hook
 * Feature: security-hardening
 * Requirements: 1.1
 * 
 * This hook provides code execution with sandboxed JavaScript execution via Web Worker.
 * Maintains backward compatibility with existing API while using secure sandbox.
 */

import { useState, useCallback, useRef } from 'react';
import { ensurePyodide, type PyodideInterface } from '../lib/pyodideLoader';
import { runJsInSandbox } from '../lib/sandboxRunner';

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

// Timeout constant for sandboxed execution - 3 seconds
const EXECUTION_TIMEOUT_MS = 3000;
const MAX_CODE_LENGTH = 10000; // Limit code length to prevent abuse (Requirement 4.3)

export const useCodeRunner = (props?: UseCodeRunnerProps) => {
    const [terminalLogs, setTerminalLogs] = useState<LogEntry[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isValidated, setIsValidated] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    // Pyodide ref for Python execution. The runtime is fetched lazily on first use.
    const pyodideRef = useRef<PyodideInterface | null>(null);
    const lastRunTime = useRef<number>(0); // Rate limiting ref

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
     * Execute JavaScript code in an opaque-origin sandboxed iframe.
     * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
     *
     * Uses sandboxRunner.ts which creates a fresh <iframe sandbox="allow-scripts">
     * (no allow-same-origin) per execution, providing a true realm boundary.
     * This replaces the old Web Worker approach which was escapable via
     * constructor chain attacks on `new Function`.
     */
    const executeJsSandboxed = async (codeStr: string): Promise<string> => {
        try {
            const result = await runJsInSandbox(codeStr, { timeoutMs: EXECUTION_TIMEOUT_MS });
            if (result.timedOut) {
                return 'Error: Execution timed out after 3 seconds';
            }
            if (result.errors.length > 0) {
                return `Error: ${result.errors.join('\n')}`;
            }
            return result.output.join('\n');
        } catch (err) {
            return `Error: ${err instanceof Error ? err.message : 'Sandbox failed to start'}`;
        }
    };

    const executePython = async (codeStr: string): Promise<string> => {
        if (!pyodideRef.current) {
            try {
                pyodideRef.current = await ensurePyodide();
            } catch (e) {
                return `Error: Python engine could not be loaded. ${(e as Error).message ?? ''}`.trim();
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
