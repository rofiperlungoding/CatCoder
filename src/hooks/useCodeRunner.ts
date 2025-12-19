import { useState, useCallback } from 'react';

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

export const useCodeRunner = (props?: UseCodeRunnerProps) => {
    const [terminalLogs, setTerminalLogs] = useState<LogEntry[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isValidated, setIsValidated] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

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

    const simulateCodeExecution = (codeStr: string, lang: string): string => {
        try {
            if (lang === 'python') {
                const printMatch = codeStr.match(/print\s*\(['"](.*?)['"]\)/g);
                if (printMatch) {
                    return printMatch.map(p => p.replace(/print\s*\(['"]|['"]\)/g, '')).join('\n');
                }
                const numberMatch = codeStr.match(/print\s*\(([\d\s+\-*/]+)\)/g);
                if (numberMatch) {
                    return numberMatch.map(p => {
                        const expression = p.replace(/print\s*\(|\)/g, '');
                        try { return String(new Function(`return ${expression}`)()); } catch { return ''; }
                    }).join('\n');
                }
            } else if (lang === 'javascript') {
                const logMatch = codeStr.match(/console\.log\(['"](.*?)['"]\)/g);
                if (logMatch) {
                    return logMatch.map(l => l.replace(/console\.log\(['"]|['"]\)/g, '')).join('\n');
                }
                const numberMatch = codeStr.match(/console\.log\(([\d\s+\-*/]+)\)/g);
                if (numberMatch) {
                    return numberMatch.map(p => {
                        const expression = p.replace(/console\.log\(|\)/g, '');
                        try { return String(new Function(`return ${expression}`)()); } catch { return ''; }
                    }).join('\n');
                }

            } else if (lang === 'cpp') {
                const coutMatch = codeStr.match(/cout\s*<<\s*['"](.*?)['"]/g);
                if (coutMatch) {
                    return coutMatch.map(c => c.replace(/cout\s*<<\s*['"]/g, '').replace(/['"]$/g, '')).join('\n');
                }
            }

            // Fallback for "execution" without output
            if ((codeStr.includes('print(') || codeStr.includes('console.log') || codeStr.includes('cout')) && codeStr.length > 10) {
                // Simple semantic check passed but no regex match
                return ""; // Empty output is valid if code runs
            }

            // Return empty if no output commands found, possibly just logic
            return '';
        } catch {
            return 'Error executing code.';
        }
    };

    const runCode = async (code: string, language: string, expectedOutput?: string) => {
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

        // 3. Execution (Simulated)
        const simulatedOutput = simulateCodeExecution(code, language);

        // 4. Output Logs
        if (simulatedOutput === 'Error executing code.') {
            await addLog({ type: 'stderr', message: 'SyntaxError: Unexpected token' }, 500);
        } else {
            const lines = simulatedOutput.split('\n');
            for (const line of lines) {
                if (line.trim()) await addLog({ type: 'stdout', message: line }, 200);
            }
        }

        // 5. Validation
        setTimeout(() => {
            setIsRunning(false);
            let isValid = false;

            if (expectedOutput) {
                const normalizedExpected = expectedOutput.trim().toLowerCase();
                const normalizedActual = simulatedOutput.trim().toLowerCase();
                if (normalizedActual.includes(normalizedExpected) || normalizedExpected.includes(normalizedActual)) {
                    isValid = true;
                } else {
                    const errorMsg = `Expected output: "${expectedOutput}"`;
                    setValidationError(errorMsg);
                    if (props?.onError) props.onError(errorMsg);
                }
            } else {
                // Generic check: Pass if no "Error" in output
                isValid = !simulatedOutput.includes('Error');
            }

            if (isValid) {
                setTerminalLogs(prev => [...prev, { type: 'success', message: 'Process exited with code 0' }]);
                setIsValidated(true);
                if (props?.onSuccess) props.onSuccess();
            } else {
                setTerminalLogs(prev => [...prev, { type: 'system', message: 'Process exited with code 1' }]);
                setIsValidated(false);
            }
        }, 500);
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
