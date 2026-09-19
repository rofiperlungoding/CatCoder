import { ensurePyodide } from './pyodideLoader';
import { runJsInSandbox } from './sandboxRunner';
import type { TestCase } from './api';

export interface TestRunResult {
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
}

const PY_TIMEOUT_MS = 8000;
const JS_TIMEOUT_MS = 4000;

function deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        return a.every((v, i) => deepEqual(v, b[i]));
    }
    if (a && b && typeof a === 'object') {
        const ka = Object.keys(a as Record<string, unknown>).sort();
        const kb = Object.keys(b as Record<string, unknown>).sort();
        if (ka.length !== kb.length || !ka.every((k, i) => k === kb[i])) return false;
        return ka.every((k) =>
            deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])
        );
    }
    return false;
}

function matches(actualRaw: string, expectedRaw: string): boolean {
    try {
        return deepEqual(JSON.parse(actualRaw), JSON.parse(expectedRaw));
    } catch {
        return actualRaw.trim() === expectedRaw.trim();
    }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Execution timed out')), ms);
        promise.then(
            (value) => {
                clearTimeout(timer);
                resolve(value);
            },
            (err) => {
                clearTimeout(timer);
                reject(err);
            }
        );
    });
}

function pythonScript(code: string): string {
    return [
        'import json',
        code,
        '',
        'json.dumps(solve(*json.loads(cc_input)))',
    ].join('\n');
}

// Pyodide reuses one __main__ namespace for every run, so globals defined by
// one submission's code (or a previous test's leftovers) leak into the next
// test. Purge all non-dunder module-level names before each test to keep runs
// independent. 'json' is re-imported by the wrapper script each run.
const PY_NAMESPACE_RESET = [
    'for _k in [k for k in dir() if not k.startswith("_") and k != "json"]:',
    '    del globals()[_k]',
].join('\n');

function resetPyodideNamespace(pyodide: { runPython: (code: string) => unknown }): void {
    try {
        pyodide.runPython(PY_NAMESPACE_RESET);
    } catch {
        // A failed reset must not block the run — worst case we fall back to
        // the previous (shared-namespace) behavior.
    }
}

function javascriptScript(code: string, input: string): string {
    return [
        code,
        '',
        `const __args = JSON.parse(${JSON.stringify(input)});`,
        'const __r = solve(...__args);',
        'console.log(JSON.stringify(__r === undefined ? null : __r));',
    ].join('\n');
}

async function runPython(code: string, tests: TestCase[]): Promise<TestRunResult[]> {
    const results: TestRunResult[] = [];
    let pyodide;
    try {
        pyodide = await ensurePyodide();
    } catch {
        return tests.map((t) => ({
            input: t.input,
            expected: t.expected,
            actual: 'Python runtime failed to load',
            passed: false,
        }));
    }

    const script = pythonScript(code);
    for (const test of tests) {
        try {
            resetPyodideNamespace(pyodide);
            pyodide.globals.set('cc_input', test.input);
            const value = await withTimeout(pyodide.runPythonAsync(script), PY_TIMEOUT_MS);
            const actual = typeof value === 'string' ? value : String(value);
            results.push({
                input: test.input,
                expected: test.expected,
                actual,
                passed: matches(actual, test.expected),
            });
        } catch (err) {
            results.push({
                input: test.input,
                expected: test.expected,
                actual: (err as Error).message || 'Runtime error',
                passed: false,
            });
        }
    }
    return results;
}

async function runJavascript(code: string, tests: TestCase[]): Promise<TestRunResult[]> {
    const results: TestRunResult[] = [];
    for (const test of tests) {
        try {
            const sandbox = await runJsInSandbox(javascriptScript(code, test.input), {
                timeoutMs: JS_TIMEOUT_MS,
            });
            if (sandbox.timedOut) {
                results.push({ input: test.input, expected: test.expected, actual: 'Execution timed out', passed: false });
                continue;
            }
            if (sandbox.errors.length > 0) {
                results.push({ input: test.input, expected: test.expected, actual: sandbox.errors[0], passed: false });
                continue;
            }
            const actual = sandbox.output.length > 0 ? sandbox.output[sandbox.output.length - 1] : '';
            results.push({
                input: test.input,
                expected: test.expected,
                actual,
                passed: matches(actual, test.expected),
            });
        } catch (err) {
            results.push({
                input: test.input,
                expected: test.expected,
                actual: (err as Error).message || 'Runtime error',
                passed: false,
            });
        }
    }
    return results;
}

export async function runPlayerTests(
    language: string,
    code: string,
    tests: TestCase[]
): Promise<TestRunResult[]> {
    if (tests.length === 0) return [];
    if (language === 'python') return runPython(code, tests);
    return runJavascript(code, tests);
}
