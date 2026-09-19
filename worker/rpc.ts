/**
 * Server-side RPC equivalents of the Supabase functions the app calls.
 * XP/level/rank are computed here so clients can't forge them.
 */

import { getClient, queryOne, run } from './db';
import { getUserFromRequest } from './auth';
import { newId } from './crypto';
import { updateElo } from './shared/elo';
import { json, type Env } from './types';

const XP_BY_TYPE: Record<string, number> = { lesson: 50, problem: 100, challenge: 25 };

// Mirror of src/lib/utils.ts calculateLevel / getRank so server + client agree.
function calculateLevel(xp: number): number {
    let level = 1;
    let required = 100;
    let total = 0;
    while (total + required <= xp) {
        total += required;
        level++;
        required = Math.floor(required * 1.5);
    }
    return level;
}

function getRank(xp: number): string {
    if (xp >= 30000) return 'diamond';
    if (xp >= 15000) return 'platinum';
    if (xp >= 5000) return 'gold';
    if (xp >= 1000) return 'silver';
    return 'bronze';
}

function alreadyCompleted(profile: Record<string, unknown>): Response {
    return json({
        data: {
            success: true,
            xp_awarded: 0,
            message: 'Already completed',
            new_xp: Number(profile.xp),
            new_level: Number(profile.level),
            new_rank: String(profile.rank),
            new_streak_current: Number(profile.streak_current),
            new_streak_best: Number(profile.streak_best),
        },
        error: null,
    });
}

async function submitCompletion(env: Env, request: Request, args: Record<string, unknown>) {
    const client = getClient(env);
    const user = await getUserFromRequest(client, request);
    if (!user) return json({ error: 'Not authenticated' }, 401);

    const contentType = String(args.p_content_type ?? '');
    const contentId = String(args.p_content_id ?? '');
    const durationSeconds = args.p_duration_seconds == null ? null : Number(args.p_duration_seconds);

    const profile = await queryOne(client, 'SELECT * FROM profiles WHERE id = ?', [user.id]);
    if (!profile) return json({ data: { success: false, error: 'Profile missing' }, error: null });

    const dup = await queryOne(
        client,
        'SELECT id FROM user_progress WHERE user_id = ? AND content_type = ? AND content_id = ? AND status = ?',
        [user.id, contentType, contentId, 'completed']
    );
    if (dup) return alreadyCompleted(profile);

    const xp = XP_BY_TYPE[contentType] ?? 25;
    const now = new Date().toISOString();

    // The unique index (user_id, content_type, content_id) is the real guard
    // against double awards: a concurrent duplicate submission bounces off the
    // constraint here instead of slipping past the check-then-insert window
    // and blowing up as a 500.
    try {
        await run(
            client,
            'INSERT INTO user_progress (id, user_id, content_type, content_id, status, score, duration_seconds, completed_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [newId(), user.id, contentType, contentId, 'completed', xp, durationSeconds, now, now]
        );
    } catch (err) {
        if (!/UNIQUE constraint failed/i.test(String((err as Error)?.message))) throw err;
        return alreadyCompleted(profile);
    }

    const newXp = Number(profile.xp) + xp;
    const newLevel = calculateLevel(newXp);
    const newRank = getRank(newXp);
    await run(client, 'UPDATE profiles SET xp = ?, level = ?, rank = ? WHERE id = ?', [
        newXp, newLevel, newRank, user.id,
    ]);

    return json({
        data: {
            success: true,
            xp_awarded: xp,
            new_xp: newXp,
            new_level: newLevel,
            new_rank: newRank,
            new_streak_current: Number(profile.streak_current),
            new_streak_best: Number(profile.streak_best),
        },
        error: null,
    });
}

interface VerificationInput {
    userId: string;
    variantId: string;
    difficulty: number;
    won: boolean;
    concept: string | null;
    misconception: string | null;
    hypothesis: string;
    tests: { input: string; expected: string }[];
}

export async function applyVerificationResult(
    env: Env,
    input: VerificationInput
): Promise<{ verificationRating: number; delta: number }> {
    const client = getClient(env);

    const profile = await queryOne(client, 'SELECT verification_rating FROM profiles WHERE id = ?', [
        input.userId,
    ]);
    const current =
        profile && profile.verification_rating != null ? Number(profile.verification_rating) : 1200;

    // INSERT-first guard: attempts carries a partial unique index on
    // (user_id, variant_id) WHERE verdict = 'correct' (idx_attempts_correct_unique).
    // Racing submissions for the same variant each compute their own ELO, but
    // only the INSERT that wins the constraint gets to write its rating —
    // the profiles read-modify-write below is conditional on that win.
    const now = new Date().toISOString();
    const correctVerdict = input.won ? 'correct' : 'incorrect';
    const attemptId = newId();
    try {
        await run(
            client,
            "INSERT INTO attempts (id, user_id, variant_id, hypothesis_text, submitted_tests, verdict, score, concept, misconception, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                attemptId,
                input.userId,
                input.variantId,
                input.hypothesis,
                JSON.stringify(input.tests),
                correctVerdict,
                0,
                input.concept,
                input.misconception,
                now,
            ]
        );
    } catch (err) {
        if (!/UNIQUE constraint failed/i.test(String((err as Error)?.message))) throw err;
        // A 'correct' attempt for this (user, variant) already exists.
        return { verificationRating: current, delta: 0 };
    }

    // CAS-safe compare-and-set: recompute from the current row only if it
    // hasn't changed underneath us; a concurrent winner already wrote their
    // rating, so we keep theirs and report a zero delta for this attempt.
    const next = updateElo(current, input.difficulty, input.won);
    const res = await client.execute({
        sql: 'UPDATE profiles SET verification_rating = ? WHERE id = ? AND verification_rating = ?',
        args: [next, input.userId, current] as never[],
    });
    if ((res.rowsAffected ?? 0) === 0) {
        const fresh = await queryOne(client, 'SELECT verification_rating FROM profiles WHERE id = ?', [
            input.userId,
        ]);
        return {
            verificationRating:
                fresh && fresh.verification_rating != null ? Number(fresh.verification_rating) : current,
            delta: 0,
        };
    }

    const delta = next - current;
    await run(client, "UPDATE attempts SET score = ? WHERE id = ?", [delta, attemptId]);
    return { verificationRating: next, delta };
}

export async function handleRpc(
    env: Env,
    request: Request,
    fn: string,
    args: Record<string, unknown>
): Promise<Response> {
    switch (fn) {
        case 'submit_completion':
        case 'validate_and_complete':
            return submitCompletion(env, request, args);
        case 'get_server_time':
            return json({ data: { server_time_ms: Date.now(), server_time_iso: new Date().toISOString() }, error: null });
        case 'register_device_session':
            return json({ data: { success: true, session_id: 'cf-worker' }, error: null });
        case 'verify_device_fingerprint':
            return json({ data: { success: true, valid: true }, error: null });
        case 'invalidate_all_sessions':
            return json({ data: { success: true, sessions_invalidated: 0 }, error: null });
        case 'log_security_event':
        case 'log_app_error': {
            try {
                const client = getClient(env);
                await run(
                    client,
                    'INSERT INTO app_logs (id, kind, user_id, payload, created_at) VALUES (?, ?, ?, ?, ?)',
                    [newId(), fn, null, JSON.stringify(args).slice(0, 8000), new Date().toISOString()]
                );
            } catch {
                /* logging must never break the caller */
            }
            return json({ data: { success: true, log_id: newId() }, error: null });
        }
        default:
            return json({ data: null, error: { message: `Unknown RPC: ${fn}` } }, 400);
    }
}
