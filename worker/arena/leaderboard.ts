import { getClient, queryAll } from '../db';
import { corsHeaders, handleOptions, parseOrigins } from '../shared/cors';
import { checkReadRateLimit, clientIp } from '../shared/rateLimit';
import { json, type Env } from '../types';

/**
 * Leaderboard cache. Every uncached hit runs a full ORDER BY scan over
 * profiles; under traffic that is pure DB load for data that only changes
 * when someone completes something. A 30-second freshness window dampens
 * that: within the window every caller is served from one KV read.
 *
 * Gotcha: Cloudflare KV's minimum expirationTtl is 60 seconds, so the 30s
 * freshness is enforced in-app via `cachedAt` — the 60s KV TTL is only a
 * backstop that keeps orphaned entries from living forever. Failures in the
 * cache layer are fail-open: the DB path always remains the source of truth.
 *
 * The legacy RATE_LIMIT KV namespace is reused (the limiter moved to the
 * RATE_LIMITER_DO); key prefixes don't collide with the old rl:* counters.
 */
const CACHE_KEY = 'leaderboard:top25:v1';
const FRESH_MS = 30_000;
const KV_TTL_SEC = 60;

interface LeaderboardEntry {
    rank: number;
    id: string;
    username: string;
    verificationRating: number;
    xp: number;
    tier: string;
}

interface CachedLeaderboard {
    cachedAt: number;
    entries: LeaderboardEntry[];
}

async function fetchEntries(env: Env): Promise<LeaderboardEntry[]> {
    const client = getClient(env);
    const rows = await queryAll(
        client,
        'SELECT id, username, verification_rating, rank, xp FROM profiles ORDER BY verification_rating DESC, xp DESC LIMIT 25'
    );

    return rows.map((r, i) => ({
        rank: i + 1,
        id: String(r.id),
        username: r.username ? String(r.username) : 'Anonymous',
        verificationRating: Number(r.verification_rating ?? 1200),
        xp: Number(r.xp ?? 0),
        tier: String(r.rank ?? 'bronze'),
    }));
}

export async function handleLeaderboard(request: Request, env: Env): Promise<Response> {
    const allowed = parseOrigins(env.ALLOWED_ORIGINS);
    const requestOrigin = request.headers.get('Origin');
    const headers = corsHeaders(allowed, requestOrigin);

    if (request.method === 'OPTIONS') return handleOptions(allowed, requestOrigin);
    if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405, headers);

    // Public read — same fail-open per-IP cap as the problem endpoint.
    if (!(await checkReadRateLimit(env, `leaderboard:${clientIp(request)}`, 60, 60))) {
        return json({ error: 'Rate limit exceeded' }, 429, headers);
    }

    // 1) Fresh cache hit → serve without touching the DB.
    try {
        const cached = await env.RATE_LIMIT.get<CachedLeaderboard>(CACHE_KEY, 'json');
        if (
            cached &&
            typeof cached.cachedAt === 'number' &&
            Array.isArray(cached.entries) &&
            Date.now() - cached.cachedAt < FRESH_MS
        ) {
            return json({ entries: cached.entries }, 200, headers);
        }
    } catch {
        /* cache read failure → fall through to the DB */
    }

    // 2) Miss (or stale) → query, then refresh the cache for the next callers.
    const entries = await fetchEntries(env);
    try {
        const payload: CachedLeaderboard = { cachedAt: Date.now(), entries };
        await env.RATE_LIMIT.put(CACHE_KEY, JSON.stringify(payload), {
            expirationTtl: KV_TTL_SEC,
        });
    } catch {
        /* cache write failure → the response is unaffected */
    }

    return json({ entries }, 200, headers);
}
