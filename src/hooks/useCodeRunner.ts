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

declare global {
    interface Window {
        loadPyodide: any;
    }
}

export const useCodeRunner = (props?: UseCodeRunnerProps) => {
    const [terminalLogs, setTerminalLogs] = useState<LogEntry[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isValidated, setIsValidated] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    // Pyodide ref
    const pyodideRef = useRef<any>(null);
    const [isPyodideLoading, setIsPyodideLoading] = useState(false);

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

    const executeJs = (codeStr: string): string => {
        try {
            const logs: string[] = [];
            const consoleMock = {
                log: (...args: any[]) => {
                    logs.push(args.map(arg =>
                        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                    ).join(' '));
                },
                error: (...args: any[]) => {
                    logs.push('Error: ' + args.map(arg => String(arg)).join(' '));
                },
                warn: (...args: any[]) => {
                    logs.push('Warning: ' + args.map(arg => String(arg)).join(' '));
                }
            };
            new Function('console', codeStr)(consoleMock);
            return logs.join('\n');
        } catch (e: any) {
            return `Error: ${e.message}`;
        }
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
            return stdout;
        } catch (e: any) {
            return `Error: ${e.message}`;
        }
    };

    const runCode = async (code: string, language: string, expectedOutput?: string): Promise<boolean> => {
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

        // 3. Execution (Real JS or Pyodide or Mock C++)
        let output = '';
        if (language === 'javascript') {
            output = executeJs(code);
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
