import type { Env } from '../types';
import {
    type RateLimitRequest,
    type RateLimitResponse,
} from './rateLimiterDo';

/**
 * Best-effort client identity for rate limiting. Cloudflare injects
 * CF-Connecting-IP; the fallback keeps local/non-proxied testing working.
 */
export function clientIp(request: Request): string {
    return request.headers.get('CF-Connecting-IP') ?? 'unknown';
}

/**
 * Authoritative rate limiter backed by a Durable Object.
 *
 * The previous KV implementation was best-effort: KV is eventually
 * consistent and get+put is not atomic, so concurrent requests across
 * isolates could all read the same count and slip past the limit. The DO
 * serializes every check per identity, so the counter is exact everywhere.
 *
 * The legacy RATE_LIMIT KV binding stays wired in wrangler.toml for one
 * release as a rollback path but is no longer read or written here.
 */
export async function checkRateLimit(
    env: Env,
    identity: string,
    limit: number,
    windowSeconds: number
): Promise<boolean> {
    return withLimiter(env, identity, limit, windowSeconds, false);
}

/**
 * Fail-open variant for public READ-only endpoints (problem, leaderboard).
 * The protected resource there is cheap, so a missing binding or a limiter
 * hiccup must not take the feature down — only an explicit "over limit"
 * verdict from the DO denies.
 */
export async function checkReadRateLimit(
    env: Env,
    identity: string,
    limit: number,
    windowSeconds: number
): Promise<boolean> {
    return withLimiter(env, identity, limit, windowSeconds, true);
}

async function withLimiter(
    env: Env,
    identity: string,
    limit: number,
    windowSeconds: number,
    failOpen: boolean
): Promise<boolean> {
    const namespace = env.RATE_LIMITER_DO;
    if (!namespace) {
        // Fail-closed by default: a missing DO binding is a deploy
        // misconfiguration. Reads may opt out (see checkReadRateLimit).
        if (!failOpen) {
            console.error('[rateLimit] RATE_LIMITER_DO binding missing — denying request');
        }
        return failOpen;
    }

    // One DO instance per identity = one serialized counter per identity.
    const doId = namespace.idFromName(identity);
    const stub = namespace.get(doId);

    const body: RateLimitRequest = { limit, windowSeconds };
    let res: Response;
    try {
        res = await stub.fetch('https://rate-limiter.internal/check', {
            method: 'POST',
            body: JSON.stringify(body),
        });
    } catch (err) {
        console.error('[rateLimit] DO fetch failed —', failOpen ? 'allowing' : 'denying', err);
        return failOpen;
    }

    if (!res.ok) {
        // Fail-closed on writes/auth; reads stay up through limiter hiccups.
        console.error('[rateLimit] DO responded', res.status, '—', failOpen ? 'allowing' : 'denying');
        return failOpen;
    }

    const data = (await res.json()) as RateLimitResponse;
    return data.allowed;
}
