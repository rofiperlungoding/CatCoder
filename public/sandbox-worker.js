/**
 * Web Worker for sandboxed code execution
 * Feature: security-hardening
 * Requirements: 1.1, 1.2, 1.4
 * 
 * This worker executes user code in an isolated environment with:
 * - Blocked access to window, document, fetch, XMLHttpRequest, localStorage
 * - Safe console implementation that captures output via postMessage
 * - Strict mode enforcement
 */

// Handle incoming code execution requests
self.onmessage = function(event) {
    const { code, language, executionId } = event.data;
    
    // Only support JavaScript execution in this worker
    if (language !== 'javascript') {
        self.postMessage({ 
            type: 'error', 
            data: `Language "${language}" is not supported in sandbox worker`,
            executionId 
        });
        self.postMessage({ type: 'complete', executionId });
        return;
    }

    // Safe console implementation that captures output via postMessage
    const safeConsole = {
        log: (...args) => self.postMessage({ 
            type: 'log', 
            data: args.map(a => {
                try {
                    return typeof a === 'object' ? JSON.stringify(a) : String(a);
                } catch {
                    return String(a);
                }
            }).join(' '),
            executionId
        }),
        error: (...args) => self.postMessage({ 
            type: 'error', 
            data: args.map(a => String(a)).join(' '),
            executionId
        }),
        warn: (...args) => self.postMessage({ 
            type: 'warn', 
            data: args.map(a => String(a)).join(' '),
            executionId
        }),
        info: (...args) => self.postMessage({ 
            type: 'log', 
            data: args.map(a => {
                try {
                    return typeof a === 'object' ? JSON.stringify(a) : String(a);
                } catch {
                    return String(a);
                }
            }).join(' '),
            executionId
        }),
        debug: (...args) => self.postMessage({ 
            type: 'log', 
            data: args.map(a => {
                try {
                    return typeof a === 'object' ? JSON.stringify(a) : String(a);
                } catch {
                    return String(a);
                }
            }).join(' '),
            executionId
        })
    };

    try {
        // Create sandboxed function with blocked globals
        // All dangerous APIs are passed as null to prevent access
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
        // This prevents code from accessing browser APIs
        sandboxedFn(
            safeConsole,  // console - safe implementation
            null,         // window - blocked
            null,         // document - blocked
            null,         // fetch - blocked
            null,         // XMLHttpRequest - blocked
            null,         // localStorage - blocked
            null,         // sessionStorage - blocked
            null,         // indexedDB - blocked
            null,         // navigator - blocked
            null,         // location - blocked
            null,         // self - blocked
            null,         // globalThis - blocked
            null,         // importScripts - blocked
            null,         // WebSocket - blocked
            null          // EventSource - blocked
        );
        
        self.postMessage({ type: 'complete', executionId });
    } catch (error) {
        self.postMessage({ 
            type: 'error', 
            data: error.toString(),
            executionId 
        });
        self.postMessage({ type: 'complete', executionId });
    }
};

// Handle worker errors
self.onerror = function(error) {
    self.postMessage({ 
        type: 'error', 
        data: `Worker error: ${error.message || 'Unknown error'}`,
        executionId: null
    });
};
