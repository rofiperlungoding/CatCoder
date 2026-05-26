/**
 * Lightweight logger that silences debug output in production builds.
 * Errors and warnings still surface so production issues remain diagnosable.
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.debug('[Auth]', 'login start', email);
 *   logger.warn('[Auth]', 'fallback engaged');
 *   logger.error('[Auth]', err);
 */

const env = (typeof import.meta !== 'undefined'
    ? (import.meta as unknown as { env: Record<string, unknown> }).env
    : undefined) ?? {};

const isDev = env.DEV === true || env.MODE === 'development' || env.MODE === 'test';

type Args = Parameters<typeof console.log>;

export const logger = {
    debug: (...args: Args) => {
        if (isDev) console.log(...args);
    },
    info: (...args: Args) => {
        if (isDev) console.info(...args);
    },
    warn: (...args: Args) => {
        console.warn(...args);
    },
    error: (...args: Args) => {
        console.error(...args);
    },
};

export const isDevEnv = isDev;
