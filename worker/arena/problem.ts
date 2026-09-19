import type { Client } from '@libsql/client/web';
import { getClient, queryOne } from '../db';
import { getUserFromRequest } from '../auth';
import { corsHeaders, handleOptions, parseOrigins } from '../shared/cors';
import { checkReadRateLimit, clientIp } from '../shared/rateLimit';
import { json, type Env } from '../types';

type Row = Record<string, unknown>;

const SAFE_COLUMNS = 'id, prompt, language, code, difficulty';

async function weakestConcept(client: Client, userId: string): Promise<string | null> {
    const row = await queryOne(
        client,
        'SELECT concept, AVG(CASE WHEN verdict = ? THEN 1.0 ELSE 0 END) AS acc, COUNT(*) AS n ' +
            'FROM attempts WHERE user_id = ? AND concept IS NOT NULL ' +
            'GROUP BY concept ORDER BY acc ASC, n DESC LIMIT 1',
        ['correct', userId]
    );
    return row && row.concept != null ? String(row.concept) : null;
}

async function selectProblem(client: Client, userId: string | null): Promise<Row | null> {
    if (userId) {
        const solved =
            '(SELECT variant_id FROM attempts WHERE user_id = ? AND verdict = ?)';

        const concept = await weakestConcept(client, userId);
        if (concept) {
            const biased = await queryOne(
                client,
                `SELECT ${SAFE_COLUMNS} FROM buggy_variants ` +
                    `WHERE bug_type = ? AND id NOT IN ${solved} ORDER BY RANDOM() LIMIT 1`,
                [concept, userId, 'correct']
            );
            if (biased) return biased;
        }

        const unsolved = await queryOne(
            client,
            `SELECT ${SAFE_COLUMNS} FROM buggy_variants ` +
                `WHERE id NOT IN ${solved} ORDER BY RANDOM() LIMIT 1`,
            [userId, 'correct']
        );
        if (unsolved) return unsolved;
    }

    return queryOne(client, `SELECT ${SAFE_COLUMNS} FROM buggy_variants ORDER BY RANDOM() LIMIT 1`);
}

export async function handleProblem(request: Request, env: Env): Promise<Response> {
    const allowed = parseOrigins(env.ALLOWED_ORIGINS);
    const requestOrigin = request.headers.get('Origin');
    const headers = corsHeaders(allowed, requestOrigin);

    if (request.method === 'OPTIONS') return handleOptions(allowed, requestOrigin);
    if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405, headers);

    // Public read, but each hit runs up to three SQL queries (concept bias,
    // solved-set subquery, random pick) — cap per-IP hammering. Fail-open:
    // a limiter outage must not take the Arena down.
    if (!(await checkReadRateLimit(env, `problem:${clientIp(request)}`, 60, 60))) {
        return json({ error: 'Rate limit exceeded' }, 429, headers);
    }

    const client = getClient(env);
    const user = await getUserFromRequest(client, request);
    const row = await selectProblem(client, user ? user.id : null);
    if (!row) return json({ error: 'No problems available' }, 404, headers);

    return json(
        {
            id: String(row.id),
            prompt: String(row.prompt),
            language: String(row.language),
            code: String(row.code),
            difficulty: Number(row.difficulty),
        },
        200,
        headers
    );
}
