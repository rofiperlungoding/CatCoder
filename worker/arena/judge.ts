import { getClient, queryOne } from '../db';
import { getUserFromRequest } from '../auth';
import { applyVerificationResult } from '../rpc';
import { corsHeaders, handleOptions, parseOrigins } from '../shared/cors';
import { checkRateLimit, clientIp } from '../shared/rateLimit';
import { verifyTurnstile } from '../shared/turnstile';
import { judgeWithMistral, DEFAULT_JUDGE_MODEL } from '../shared/mistral';
import { json, type Env } from '../types';
import type { TestCase } from '../../db/schema';

interface JudgeBody {
    variantId: string;
    hypothesis: string;
    tests: TestCase[];
    turnstileToken: string;
}

/** Cost-control caps: the judge bills per token, so bound what clients send. */
const MAX_HYPOTHESIS_LENGTH = 2000;
const MIN_HYPOTHESIS_LENGTH = 10;
const MAX_TESTS = 20;
const MAX_TEST_FIELD_LENGTH = 200;

function parseTests(value: unknown): TestCase[] | null {
    if (!Array.isArray(value)) return null;
    if (value.length > MAX_TESTS) return null;
    const out: TestCase[] = [];
    for (const t of value) {
        if (
            !t ||
            typeof t !== 'object' ||
            typeof (t as TestCase).input !== 'string' ||
            typeof (t as TestCase).expected !== 'string' ||
            (t as TestCase).input.length > MAX_TEST_FIELD_LENGTH ||
            (t as TestCase).expected.length > MAX_TEST_FIELD_LENGTH
        ) {
            return null;
        }
        out.push(t as TestCase);
    }
    return out;
}

export async function handleJudge(request: Request, env: Env): Promise<Response> {
    const allowed = parseOrigins(env.ALLOWED_ORIGINS);
    const requestOrigin = request.headers.get('Origin');
    const headers = corsHeaders(allowed, requestOrigin);

    if (request.method === 'OPTIONS') return handleOptions(allowed, requestOrigin);
    if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405, headers);

    const ip = clientIp(request);

    const rateAllowed = await checkRateLimit(env, `judge:${ip}`, 20, 60);
    if (!rateAllowed) return json({ error: 'Rate limit exceeded' }, 429, headers);

    let body: Partial<JudgeBody>;
    try {
        body = (await request.json()) as Partial<JudgeBody>;
    } catch {
        body = {};
    }
    const variantId = typeof body.variantId === 'string' ? body.variantId : '';
    const hypothesis =
        typeof body.hypothesis === 'string' ? body.hypothesis.slice(0, MAX_HYPOTHESIS_LENGTH) : '';
    const turnstileToken = typeof body.turnstileToken === 'string' ? body.turnstileToken : '';
    const tests = parseTests(body.tests);

    if (!variantId || tests === null || hypothesis.trim().length < MIN_HYPOTHESIS_LENGTH) {
        return json(
            {
                error: `Invalid submission: variantId is required, hypothesis must be at least ${MIN_HYPOTHESIS_LENGTH} characters, tests must be at most ${MAX_TESTS} pairs of ${MAX_TEST_FIELD_LENGTH} characters.`,
            },
            400,
            headers
        );
    }

    const human = await verifyTurnstile(env.TURNSTILE_SECRET, turnstileToken, ip);
    if (!human) return json({ error: 'Turnstile verification failed' }, 403, headers);

    const client = getClient(env);
    const user = await getUserFromRequest(client, request);

    const variant = await queryOne(
        client,
        'SELECT id, code, bug_explanation, misconception, bug_type, difficulty FROM buggy_variants WHERE id = ?',
        [variantId]
    );
    if (!variant) return json({ error: 'Variant not found' }, 404, headers);

    const result = await judgeWithMistral(
        env.MISTRAL_API_KEY,
        {
            code: String(variant.code),
            groundTruth: String(variant.bug_explanation),
            misconception: String(variant.misconception),
            hypothesis,
            tests,
        },
        env.MISTRAL_MODEL || DEFAULT_JUDGE_MODEL
    );

    // Judge infrastructure failure: no verdict exists. Never record an attempt
    // and never penalize the player's rating for our own outage.
    if (!result.ok) {
        return json(
            { error: 'The judge is temporarily unavailable. Please try again in a moment.' },
            503,
            headers
        );
    }
    const raw = result.output;

    const correctness = Math.max(0, Math.min(1, Number(raw.correctness) || 0));
    const won = raw.correct === true && correctness >= 0.6;

    let verificationRating: number | null = null;
    let delta = 0;
    if (user) {
        const applied = await applyVerificationResult(env, {
            userId: user.id,
            variantId: String(variant.id),
            difficulty: Number(variant.difficulty),
            won,
            concept: String(variant.bug_type),
            misconception: raw.misconceptionTag,
            hypothesis,
            tests,
        });
        verificationRating = applied.verificationRating;
        delta = applied.delta;
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
