/**
 * Pyodide loader tests
 *
 * These tests bypass the workspace-wide mock from `src/test/setup.ts` by
 * importing the implementation from a sibling module marker. The actual
 * Pyodide WASM cannot run inside jsdom, so the assertions cover only the
 * loader's bookkeeping: script injection, memoization, and cleanup after
 * a failed load.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Re-import the module under test bypassing the global mock by spawning a
// fresh module graph each test.
async function loadFresh() {
    vi.doUnmock('./pyodideLoader');
    vi.resetModules();
    return await import('./pyodideLoader');
}

beforeEach(() => {
    document.head.innerHTML = '';
    delete (window as unknown as { loadPyodide?: unknown }).loadPyodide;
});

afterEach(() => {
    vi.restoreAllMocks();
    document.head.innerHTML = '';
    delete (window as unknown as { loadPyodide?: unknown }).loadPyodide;
    // Re-establish the global setup mock so other test files keep their
    // expected behaviour.
    vi.doMock('./pyodideLoader', () => ({
        ensurePyodide: vi.fn(async () => {
            throw new Error('Pyodide is not available in the test environment.');
        }),
        __resetPyodideLoaderForTests: vi.fn(),
    }));
});

describe('pyodideLoader', () => {
    it('injects the bootstrap script exactly once when window.loadPyodide is missing', async () => {
        const fakeInstance = { runPython: vi.fn(), runPythonAsync: vi.fn(), globals: { get: vi.fn(), set: vi.fn() } };

        const observer = new MutationObserver((mutations) => {
            for (const m of mutations) {
                m.addedNodes.forEach((n) => {
                    if (n instanceof HTMLScriptElement && n.dataset.pyodideLoader === 'true') {
                        (window as unknown as { loadPyodide?: unknown }).loadPyodide = vi
                            .fn()
                            .mockResolvedValue(fakeInstance);
                        n.dispatchEvent(new Event('load'));
                    }
                });
            }
        });
        observer.observe(document.head, { childList: true });

        const { ensurePyodide, __resetPyodideLoaderForTests } = await loadFresh();
        __resetPyodideLoaderForTests();

        const first = await ensurePyodide();
        const second = await ensurePyodide();
        observer.disconnect();

        expect(first).toBe(fakeInstance);
        expect(second).toBe(fakeInstance);

        const tags = document.head.querySelectorAll('script[data-pyodide-loader="true"]');
        expect(tags.length).toBe(1);
    });

    it('skips script injection when window.loadPyodide is already present', async () => {
        const fakeInstance = { runPython: vi.fn(), runPythonAsync: vi.fn(), globals: { get: vi.fn(), set: vi.fn() } };
        (window as unknown as { loadPyodide: unknown }).loadPyodide = vi
            .fn()
            .mockResolvedValue(fakeInstance);

        const { ensurePyodide, __resetPyodideLoaderForTests } = await loadFresh();
        __resetPyodideLoaderForTests();

        const result = await ensurePyodide();
        expect(result).toBe(fakeInstance);
        expect(document.head.querySelectorAll('script[data-pyodide-loader="true"]').length).toBe(0);
    });

    it('clears its cached state so a follow-up call can retry after a script load failure', async () => {
        const failingObserver = new MutationObserver((mutations) => {
            for (const m of mutations) {
                m.addedNodes.forEach((n) => {
                    if (n instanceof HTMLScriptElement && n.dataset.pyodideLoader === 'true') {
                        n.dispatchEvent(new Event('error'));
                    }
                });
            }
        });
        failingObserver.observe(document.head, { childList: true });

        const { ensurePyodide, __resetPyodideLoaderForTests } = await loadFresh();
        __resetPyodideLoaderForTests();

        await expect(ensurePyodide()).rejects.toThrow(/Failed to load Pyodide/);
        failingObserver.disconnect();

        const fakeInstance = {
            runPython: vi.fn(),
            runPythonAsync: vi.fn(),
            globals: { get: vi.fn(), set: vi.fn() },
        };
        const successObserver = new MutationObserver((mutations) => {
            for (const m of mutations) {
                m.addedNodes.forEach((n) => {
                    if (n instanceof HTMLScriptElement && n.dataset.pyodideLoader === 'true') {
                        (window as unknown as { loadPyodide?: unknown }).loadPyodide = vi
                            .fn()
                            .mockResolvedValue(fakeInstance);
                        n.dispatchEvent(new Event('load'));
                    }
                });
            }
        });
        successObserver.observe(document.head, { childList: true });

        const recovered = await ensurePyodide();
        successObserver.disconnect();

        expect(recovered).toBe(fakeInstance);
    });
});
