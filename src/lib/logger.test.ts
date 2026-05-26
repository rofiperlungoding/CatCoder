/**
 * Logger tests — verify production gating semantics.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('logger', () => {
    let debugSpy: ReturnType<typeof vi.spyOn>;
    let infoSpy: ReturnType<typeof vi.spyOn>;
    let warnSpy: ReturnType<typeof vi.spyOn>;
    let errorSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        debugSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.resetModules();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('logs debug/info/warn/error in development mode', async () => {
        // Vitest defaults to MODE=test which the logger treats as dev.
        const { logger, isDevEnv } = await import('./logger');
        expect(isDevEnv).toBe(true);

        logger.debug('hello');
        logger.info('world');
        logger.warn('careful');
        logger.error('boom');

        expect(debugSpy).toHaveBeenCalledTimes(1);
        expect(infoSpy).toHaveBeenCalledTimes(1);
        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenCalledTimes(1);
    });
});
