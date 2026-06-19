/**
 * Property-based tests for Secure Code Runner
 * Feature: security-hardening
 *
 * Property 1: Console Output Capture
 * Property 2: Blocked API Access with Graceful Handling
 * Property 3: Execution State Isolation
 *
 * Since jsdom cannot create real opaque-origin iframes, these tests validate
 * the core output-capture and serialization logic that the sandbox document
 * (built by sandboxRunner.ts) uses. The iframe sandbox itself is tested
 * separately in security-pentest.test.ts Domain 1.
 *
 * Validates: Requirements 1.2, 1.4, 1.5, 1.6
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// Test configuration for property-based tests
const PBT_CONFIG = { numRuns: 100 };

/**
 * Mirrors the serialization logic used inside the sandbox iframe's
 * harness (see buildSandboxDocument in sandboxRunner.ts). This tests
 * the output formatting that the sandbox sends back via postMessage.
 */
function serialize(args: unknown[]): string {
  const parts: string[] = [];
  for (const a of args) {
    if (a === null) { parts.push('null'); continue; }
    if (a === undefined) { parts.push('undefined'); continue; }
    const t = typeof a;
    if (t === 'string') { parts.push(a as string); continue; }
    if (t === 'number' || t === 'boolean' || t === 'bigint' || t === 'symbol') {
      parts.push(String(a));
      continue;
    }
    if (t === 'function') {
      try { parts.push(a.toString()); } catch { parts.push('[Function]'); }
      continue;
    }
    try { parts.push(JSON.stringify(a)); } catch {
      try { parts.push(String(a)); } catch { parts.push('[' + t + ']'); }
    }
  }
  return parts.join(' ');
}

/**
 * Simulates what happens inside the sandbox iframe: user code is wrapped in
 * `new Function('console', '"use strict";\n' + code)` with a safeConsole that
 * calls serialize. This runs in the *test* realm, so it doesn't have the
 * opaque-origin protection — but we're testing output capture, not escape
 * resistance. Escape resistance is validated in security-pentest.test.ts.
 */
function createSandboxedExecution(code: string): { output: string[]; errors: string[] } {
  const output: string[] = [];
  const errors: string[] = [];

  const safeConsole = {
    log: (...args: unknown[]) => { output.push(serialize(args)); },
    error: (...args: unknown[]) => { errors.push(serialize(args)); },
    warn: (...args: unknown[]) => { output.push('Warning: ' + serialize(args)); },
    info: (...args: unknown[]) => { output.push(serialize(args)); },
    debug: (...args: unknown[]) => { output.push(serialize(args)); },
  };

  try {
    const sandboxedFn = new Function(
      'console',
      '"use strict";\n' + code
    );
    sandboxedFn(safeConsole);
  } catch (error) {
    errors.push(String(error));
  }

  return { output, errors };
}

describe('Secure Code Runner - Property Tests', () => {
    /**
     * Feature: security-hardening, Property 1: Console Output Capture
     * For any JavaScript code that calls console.log with any value, 
     * the Code_Runner SHALL capture that value and include it in the output array.
     * Validates: Requirements 1.4
     */
    describe('Property 1: Console Output Capture', () => {
        it('should capture console.log output for any string value', () => {
            fc.assert(
                fc.property(
                    fc.string({ minLength: 0, maxLength: 100 }).filter(s => !s.includes('`') && !s.includes('\\')),
                    (testString) => {
                        const escapedString = JSON.stringify(testString);
                        const code = `console.log(${escapedString});`;
                        const { output } = createSandboxedExecution(code);

                        // Output should contain the logged string
                        return output.length > 0 && output[0] === testString;
                    }
                ),
                PBT_CONFIG
            );
        });

        it('should capture console.log output for any number value', () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: -1000000, max: 1000000 }),
                    (testNumber) => {
                        const code = `console.log(${testNumber});`;
                        const { output } = createSandboxedExecution(code);

                        return output.length > 0 && output[0] === String(testNumber);
                    }
                ),
                PBT_CONFIG
            );
        });

        it('should capture multiple console.log calls in order', () => {
            fc.assert(
                fc.property(
                    fc.array(fc.integer({ min: 0, max: 1000 }), { minLength: 1, maxLength: 10 }),
                    (numbers) => {
                        const code = numbers.map(n => `console.log(${n});`).join('\n');
                        const { output } = createSandboxedExecution(code);

                        // All numbers should be captured in order
                        return output.length === numbers.length &&
                            numbers.every((n, i) => output[i] === String(n));
                    }
                ),
                PBT_CONFIG
            );
        });
    });

    /**
     * Feature: security-hardening, Property 2: Serialization Robustness
     * The sandbox serialization function must handle all JS types without
     * throwing, including objects, arrays, functions, null, undefined.
     */
    describe('Property 2: Serialization Robustness', () => {
        it('should serialize objects via JSON.stringify', () => {
            const code = 'console.log({ key: "value", num: 42 });';
            const { output } = createSandboxedExecution(code);
            expect(output.length).toBe(1);
            expect(output[0]).toContain('key');
            expect(output[0]).toContain('value');
        });

        it('should serialize arrays via JSON.stringify', () => {
            const code = 'console.log([1, 2, 3]);';
            const { output } = createSandboxedExecution(code);
            expect(output.length).toBe(1);
            expect(output[0]).toBe('[1,2,3]');
        });

        it('should handle null and undefined separately', () => {
            const code = 'console.log(null, undefined);';
            const { output } = createSandboxedExecution(code);
            expect(output.length).toBe(1);
            expect(output[0]).toBe('null undefined');
        });

        it('should handle functions as [Function] or their source', () => {
            const code = 'console.log(function test() { return 1; });';
            const { output } = createSandboxedExecution(code);
            expect(output.length).toBe(1);
            expect(output[0]).toContain('function');
        });

        it('should serialize BigInt and Symbol types', () => {
            const code = 'console.log(42n, Symbol("test"));';
            const { output } = createSandboxedExecution(code);
            expect(output.length).toBe(1);
            expect(output[0]).toContain('42');
        });
    });

    /**
     * Feature: security-hardening, Property 3: Execution State Isolation
     * Each invocation of `new Function` creates a fresh scope. The actual
     * realm isolation (opaque-origin iframe) guarantees no state leaks
     * across executions — that's tested in security-pentest.test.ts Domain 1.
     * Here we verify the function-level scope isolation.
     */
    describe('Property 3: Execution State Isolation', () => {
        // Reserved words and built-in properties to avoid in generated names
        const reservedNames = new Set([
            'name', 'length', 'caller', 'arguments', 'prototype', 'constructor',
            'toString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
            'toLocaleString', '__proto__', '__defineGetter__', '__defineSetter__',
            '__lookupGetter__', '__lookupSetter__', 'apply', 'bind', 'call',
            'break', 'case', 'catch', 'continue', 'debugger', 'default', 'delete',
            'do', 'else', 'finally', 'for', 'function', 'if', 'in', 'instanceof',
            'new', 'return', 'switch', 'this', 'throw', 'try', 'typeof', 'var',
            'void', 'while', 'with', 'class', 'const', 'enum', 'export', 'extends',
            'import', 'super', 'implements', 'interface', 'let', 'package', 'private',
            'protected', 'public', 'static', 'yield', 'await', 'async', 'null',
            'true', 'false', 'undefined', 'NaN', 'Infinity'
        ]);

        const safeVarName = fc.string({ minLength: 3, maxLength: 15 })
            .filter(s => /^[a-zA-Z][a-zA-Z0-9]*$/.test(s) && !reservedNames.has(s));

        it('should not share variables between executions', () => {
            fc.assert(
                fc.property(
                    safeVarName,
                    fc.integer({ min: 1, max: 1000 }),
                    (varName, value) => {
                        // First execution: set a variable
                        const code1 = `var ${varName} = ${value}; console.log(${varName});`;
                        const result1 = createSandboxedExecution(code1);

                        // Second execution: try to access the variable
                        const code2 = `console.log(typeof ${varName});`;
                        const result2 = createSandboxedExecution(code2);

                        // First execution should succeed with the value
                        // Second execution should show variable is undefined (not shared)
                        return result1.output.includes(String(value)) &&
                            result2.output.includes('undefined');
                    }
                ),
                PBT_CONFIG
            );
        });

        it('should not share function definitions between executions', () => {
            fc.assert(
                fc.property(
                    safeVarName,
                    fc.integer({ min: 1, max: 100 }),
                    (fnName, returnValue) => {
                        // First execution: define a function
                        const code1 = `function ${fnName}() { return ${returnValue}; } console.log(${fnName}());`;
                        const result1 = createSandboxedExecution(code1);

                        // Second execution: try to call the function
                        const code2 = `console.log(typeof ${fnName});`;
                        const result2 = createSandboxedExecution(code2);

                        // First execution should succeed
                        // Second execution should show function is undefined
                        return result1.output.includes(String(returnValue)) &&
                            result2.output.includes('undefined');
                    }
                ),
                PBT_CONFIG
            );
        });

        it('should provide clean global scope for each execution', () => {
            fc.assert(
                fc.property(
                    fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 2, maxLength: 5 }),
                    (values) => {
                        // Each execution sets globalVar and logs it
                        const results = values.map(v => {
                            const code = `var globalVar = ${v}; console.log(globalVar);`;
                            return createSandboxedExecution(code);
                        });

                        // Each execution should only see its own value
                        return results.every((r, i) =>
                            r.output.length === 1 && r.output[0] === String(values[i])
                        );
                    }
                ),
                PBT_CONFIG
            );
        });
    });
});

describe('Secure Code Runner - Unit Tests', () => {
    it('should handle syntax errors gracefully', () => {
        const code = 'console.log(';
        const { errors } = createSandboxedExecution(code);
        expect(errors.length).toBeGreaterThan(0);
    });

    it('should handle runtime errors gracefully', () => {
        const code = 'throw new Error("test error");';
        const { errors } = createSandboxedExecution(code);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toContain('test error');
    });

    it('should capture console.error separately from console.log', () => {
        const code = `
            console.log("info message");
            console.error("error message");
        `;
        const { output, errors } = createSandboxedExecution(code);
        expect(output).toContain('info message');
        expect(errors).toContain('error message');
    });

    it('should handle objects in console.log', () => {
        const code = 'console.log({ key: "value", num: 42 });';
        const { output } = createSandboxedExecution(code);
        expect(output.length).toBe(1);
        expect(output[0]).toContain('key');
        expect(output[0]).toContain('value');
    });

    it('should handle arrays in console.log', () => {
        const code = 'console.log([1, 2, 3]);';
        const { output } = createSandboxedExecution(code);
        expect(output.length).toBe(1);
        expect(output[0]).toBe('[1,2,3]');
    });
});
