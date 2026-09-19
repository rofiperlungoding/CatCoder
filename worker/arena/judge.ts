import { getClient, queryOne } from '../db';
import { getUserFromRequest } from '../auth';
import { applyVerificationResult } from '../rpc';
import { corsHeaders, handleOptions } from '../shared/cors';
import { checkRateLimit } from '../shared/rateLimit';
import { verifyTurnstile } from '../shared/turnstile';
import { judgeWithMistral } from '../shared/mistral';
import { json, type Env } from '../types';
import type { TestCase } from '../../db/schema';

interface JudgeBody {
    variantId: string;
    hypothesis: string;
    tests: TestCase[];
    turnstileToken: string;
}

function parseTests(value: unknown): TestCase[] {
    if (!Array.isArray(value)) return [];
    return value.filter(
        (t): t is TestCase =>
            !!t &&
            typeof t === 'object' &&
            typeof (t as TestCase).input === 'string' &&
            typeof (t as TestCase).expected === 'string'
    );
}

export async function handleJudge(request: Request, env: Env): Promise<Response> {
    const origin = env.ALLOWED_ORIGIN;
    const headers = corsHeaders(origin);

    if (request.method === 'OPTIONS') return handleOptions(origin);
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, headers);

    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';

    const allowed = await checkRateLimit(env.RATE_LIMIT, ip, 20, 60);
    if (!allowed) return json({ error: 'Rate limit exceeded' }, 429, headers);

    const client = getClient(env);
    const user = await getUserFromRequest(client, request);

    let body: Partial<JudgeBody>;
    try {
        body = (await request.json()) as Partial<JudgeBody>;
    } catch {
        body = {};
    }
    const variantId = typeof body.variantId === 'string' ? body.variantId : '';
    const hypothesis = typeof body.hypothesis === 'string' ? body.hypothesis : '';
    const turnstileToken = typeof body.turnstileToken === 'string' ? body.turnstileToken : '';
    const tests = parseTests(body.tests);

    const human = await verifyTurnstile(env.TURNSTILE_SECRET, turnstileToken, ip);
    if (!human) return json({ error: 'Turnstile verification failed' }, 403, headers);

    const variant = await queryOne(
        client,
        'SELECT id, code, bug_explanation, misconception, bug_type, difficulty FROM buggy_variants WHERE id = ?',
        [variantId]
    );
    if (!variant) return json({ error: 'Variant not found' }, 404, headers);

    const raw = await judgeWithMistral(env.MISTRAL_API_KEY, {
        code: String(variant.code),
        groundTruth: String(variant.bug_explanation),
        misconception: String(variant.misconception),
        hypothesis,
        tests,
    });

    const correctness = Math.max(0, Math.min(1, Number(raw.correctness) || 0));
    const won = raw.correct === true && correctness >= 0.6;

    let verificationRating: number | null = null;
    let delta = 0;
    if (user) {
        const result = await applyVerificationResult(env, {
            userId: user.id,
            variantId: String(variant.id),
            difficulty: Number(variant.difficulty),
            won,
            concept: String(variant.bug_type),
            misconception: raw.misconceptionTag,
            hypothesis,
            tests,
        });
        verificationRating = result.verificationRating;
        delta = result.delta;
    }

    const responseBody: Record<string, unknown> = {
        correct: won,
        correctness,
        feedback: raw.feedback,
        verificationRating,
        delta,
    };
    if (!won) responseBody.misconceptionTag = raw.misconceptionTag;

    return json(responseBody, 200, headers);
}
