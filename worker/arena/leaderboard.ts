import { getClient, queryAll } from '../db';
import { corsHeaders, handleOptions } from '../shared/cors';
import { json, type Env } from '../types';

export async function handleLeaderboard(request: Request, env: Env): Promise<Response> {
    const origin = env.ALLOWED_ORIGIN;
    const headers = corsHeaders(origin);

    if (request.method === 'OPTIONS') return handleOptions(origin);
    if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405, headers);

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
