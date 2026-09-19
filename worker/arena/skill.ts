import { getClient, queryAll, queryOne } from '../db';
import { getUserFromRequest } from '../auth';
import { corsHeaders, handleOptions, parseOrigins } from '../shared/cors';
import { json, type Env } from '../types';

export async function handleSkill(request: Request, env: Env): Promise<Response> {
    const allowed = parseOrigins(env.ALLOWED_ORIGINS);
    const requestOrigin = request.headers.get('Origin');
    const headers = corsHeaders(allowed, requestOrigin);

    if (request.method === 'OPTIONS') return handleOptions(allowed, requestOrigin);
    if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405, headers);

    const client = getClient(env);
    const user = await getUserFromRequest(client, request);
    if (!user) return json({ error: 'Not authenticated' }, 401, headers);

    const profile = await queryOne(client, 'SELECT verification_rating FROM profiles WHERE id = ?', [
        user.id,
    ]);
    const rating =
        profile && profile.verification_rating != null ? Number(profile.verification_rating) : 1200;

    const conceptRows = await queryAll(
        client,
        'SELECT concept, COUNT(*) AS total, SUM(CASE WHEN verdict = ? THEN 1 ELSE 0 END) AS correct ' +
            'FROM attempts WHERE user_id = ? AND concept IS NOT NULL GROUP BY concept',
        ['correct', user.id]
    );
    const concepts = conceptRows.map((r) => {
        const total = Number(r.total);
        const correct = Number(r.correct);
        return {
            concept: String(r.concept),
            total,
            correct,
            accuracy: total > 0 ? correct / total : 0,
        };
    });

    const miscRows = await queryAll(
        client,
        'SELECT misconception, COUNT(*) AS count FROM attempts ' +
            'WHERE user_id = ? AND verdict = ? AND misconception IS NOT NULL ' +
            'GROUP BY misconception ORDER BY count DESC LIMIT 5',
        [user.id, 'incorrect']
    );
    const misconceptions = miscRows.map((r) => ({
        misconception: String(r.misconception),
        count: Number(r.count),
    }));

    const attempts = concepts.reduce((sum, c) => sum + c.total, 0);

    return json({ rating, attempts, concepts, misconceptions }, 200, headers);
}
