import { getClient, queryAll } from '../db';
import { corsHeaders, handleOptions, parseOrigins } from '../shared/cors';
import { checkReadRateLimit, clientIp } from '../shared/rateLimit';
import { json, type Env } from '../types';

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

    const client = getClient(env);
    const rows = await queryAll(
        client,
        'SELECT id, username, verification_rating, rank, xp FROM profiles ORDER BY verification_rating DESC, xp DESC LIMIT 25'
    );

    const entries = rows.map((r, i) => ({
        rank: i + 1,
        id: String(r.id),
        username: r.username ? String(r.username) : 'Anonymous',
        verificationRating: Number(r.verification_rating ?? 1200),
        xp: Number(r.xp ?? 0),
        tier: String(r.rank ?? 'bronze'),
    }));

    return json({ entries }, 200, headers);
}
