/**
 * Property-based tests for Secure Code Runner
 * Feature: security-hardening
 * 
 * Property 1: Console Output Capture
 * Property 2: Blocked API Access with Graceful Handling
 * Property 3: Worker State Isolation
 * 
 * Validates: Requirements 1.2, 1.4, 1.5, 1.6
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';

// Test configuration for property-based tests
const PBT_CONFIG = { numRuns: 100 };

/**
 * Since Web Workers don't work in jsdom, we test the sandbox logic directly
 * by simulating what the worker does with the sandboxed function approach
 */

// Helper to create sandboxed execution environment (mirrors sandbox-worker.js logic)
function createSandboxedExecution(code: string): { output: string[]; errors: string[] } {
    const output: string[] = [];
    const errors: string[] = [];

    const safeConsole = {
        log: (...args: unknown[]) => {
            output.push(args.map(a => {
                try {
                    return typeof a === 'object' ? JSON.stringify(a) : String(a);
                } catch {
                    return String(a);
                }
            }).join(' '));
        },
        error: (...args: unknown[]) => {
            errors.push(args.map(a => String(a)).join(' '));
        },
        warn: (...args: unknown[]) => {
            output.push(`Warning: ${args.map(a => String(a)).join(' ')}`);
        },
        info: (...args: unknown[]) => {
            output.push(args.map(a => {
                try {
                    return typeof a === 'object' ? JSON.stringify(a) : String(a);
                } catch {
                    return String(a);
                }
            }).join(' '));
        }
    };

    try {
        // Create sandboxed function with blocked globals (same as sandbox-worker.js)
        const sandboxedFn = new Function(
            'console',
            'window',
            'document',
            'fetch',
            'XMLHttpRequest',
            'localStorage',
            'sessionStorage',
            'indexedDB',
            'navigator',
            'location',
            'self',
            'globalThis',
            'importScripts',
            'WebSocket',
            'EventSource',
            `"use strict";\n${code}`
        );

        // Execute with null references for dangerous APIs
        sandboxedFn(
            safeConsole,
            null, null, null, null, null, null, null, null, null, null, null, null, null, null
        );
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
                        const { output, errors } = createSandboxedExecution(code);
                        
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
     * Feature: security-hardening, Property 2: Blocked API Access with Graceful Handling
     * For any JavaScript code that attempts to access blocked APIs,
     * the Code_Runner SHALL prevent the access and continue execution without crashing.
     * Validates: Requirements 1.2, 1.5
     */
    describe('Property 2: Blocked API Access with Graceful Handling', () => {
        const blockedAPIs = [
            'window',
            'document',
            'fetch',
            'XMLHttpRequest',
            'localStorage',
            'sessionStorage',
            'indexedDB',
            'navigator',
            'location'
        ];

        it('should return null for any blocked API access', () => {
            fc.assert(
                fc.property(
                    fc.constantFrom(...blockedAPIs),
                    (api) => {
                        const code = `console.log(${api} === null);`;
                        const { output, errors } = createSandboxedExecution(code);
                        
                        // Should execute without errors and blocked API should be null
                        return errors.length === 0 && output.length > 0 && output[0] === 'true';
                    }
                ),
                PBT_CONFIG
            );
        });

        it('should continue execution after accessing blocked API', () => {
            fc.assert(
                fc.property(
                    fc.constantFrom(...blockedAPIs),
                    fc.integer({ min: 1, max: 1000 }),
                    (api, marker) => {
                        // Try to access blocked API, then log a marker
                        const code = `
                            const blocked = ${api};
                            console.log(${marker});
                        `;
                        const { output, errors } = createSandboxedExecution(code);
                        
                        // Execution should continue and log the marker
                        return errors.length === 0 && output.includes(String(marker));
                    }
                ),
                PBT_CONFIG
            );
        });

        it('should handle typeof checks on blocked APIs gracefully', () => {
            fc.assert(
                fc.property(
                    fc.constantFrom(...blockedAPIs),
                    (api) => {
                        const code = `console.log(typeof ${api});`;
                        const { output, errors } = createSandboxedExecution(code);
                        
                        // typeof null is 'object', execution should not crash
                        return errors.length === 0 && output.length > 0;
                    }
                ),
                PBT_CONFIG
            );
        });
    });

    /**
     * Feature: security-hardening, Property 3: Worker State Isolation
     * For any two sequential code executions, variables or state set in the first 
     * execution SHALL NOT be accessible in the second execution.
     * Validates: Requirements 1.6
     */
    describe('Property 3: Worker State Isolation', () => {
        // Reserved words and built-in properties to avoid in generated names
        const reservedNames = new Set([
            // Built-in object properties
            'name', 'length', 'caller', 'arguments', 'prototype', 'constructor',
            'toString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
            'toLocaleString', '__proto__', '__defineGetter__', '__defineSetter__',
            '__lookupGetter__', '__lookupSetter__', 'apply', 'bind', 'call',
            // JavaScript reserved words
            'break', 'case', 'catch', 'continue', 'debugger', 'default', 'delete',
            'do', 'else', 'finally', 'for', 'function', 'if', 'in', 'instanceof',
            'new', 'return', 'switch', 'this', 'throw', 'try', 'typeof', 'var',
            'void', 'while', 'with', 'class', 'const', 'enum', 'export', 'extends',
            'import', 'super', 'implements', 'interface', 'let', 'package', 'private',
            'protected', 'public', 'static', 'yield', 'await', 'async', 'null',
            'true', 'false', 'undefined', 'NaN', 'Infinity'
        ]);

        // Generator for safe variable names that won't conflict with built-ins
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
