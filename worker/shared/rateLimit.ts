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
    const namespace = env.RATE_LIMITER_DO;
    if (!namespace) {
        // Fail-closed: a missing DO binding is a deploy misconfiguration.
        console.error('[rateLimit] RATE_LIMITER_DO binding missing — denying request');
        return false;
    }

    // One DO instance per identity = one serialized counter per identity.
    const doId = namespace.idFromName(identity);
    const stub = namespace.get(doId);

    const body: RateLimitRequest = { limit, windowSeconds };
    const res = await stub.fetch('https://rate-limiter.internal/check', {
        method: 'POST',
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        // Fail-closed: limiter outage must not become an open door.
        console.error('[rateLimit] DO responded', res.status, '— denying request');
        return false;
    }

    const data = (await res.json()) as RateLimitResponse;
    return data.allowed;
}
