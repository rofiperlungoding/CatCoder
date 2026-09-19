/**
 * Concurrency guards in worker/rpc.ts:
 *
 *  - applyVerificationResult must apply the ELO adjustment at most once per
 *    (user, variant): the partial unique index on attempts(user_id,
 *    variant_id) WHERE verdict='correct' is the arbiter, and the profiles
 *    rating write is a compare-and-set so a stale read can never regress a
 *    concurrent winner.
 *
 *  - submit_completion must never 500 on a racing duplicate: the second
 *    submission bounces off the unique index and returns "Already completed"
 *    with zero XP.
 *
 * The fake DB below reproduces those constraints faithfully: INSERTs enforce
 * the unique indexes, and the profiles UPDATE enforces the CAS predicate.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Env } from './types';

const db = vi.hoisted(() => {
    type Row = Record<string, unknown>;
    const ATTEMPTS_UNIQUE =
        'UNIQUE constraint failed: attempts.user_id, attempts.variant_id';
    const PROGRESS_UNIQUE =
        'UNIQUE constraint failed: user_progress.user_id, user_progress.content_type, user_progress.content_id';

    const state = {
        profiles: [] as Row[],
        attempts: [] as Row[],
        progress: [] as Row[],
    };

    const client = {
        execute: async ({ sql, args }: { sql: string; args: unknown[] }) => {
            if (/UPDATE profiles SET verification_rating/.test(sql)) {
                const [next, id, expected] = args as [number, string, number];
                const p = state.profiles.find((r) => r.id === id);
                if (!p || Number(p.verification_rating) !== expected) {
                    return { rowsAffected: 0 };
                }
                p.verification_rating = next;
                return { rowsAffected: 1 };
            }
            if (/UPDATE profiles SET xp/.test(sql)) {
                // Full submit_completion update: xp, level, rank,
                // streak_current, streak_best, last_activity_date, id.
                const [xp, level, rank, streakCurrent, streakBest, lastActivity, id] = args as [
                    number,
                    number,
                    string,
                    number,
                    number,
                    string,
                    string
                ];
                const p = state.profiles.find((r) => r.id === id);
                if (p) {
                    p.xp = xp;
                    p.level = level;
                    p.rank = rank;
                    p.streak_current = streakCurrent;
                    p.streak_best = streakBest;
                    p.last_activity_date = lastActivity;
                }
                return { rowsAffected: p ? 1 : 0 };
            }
            return { rowsAffected: 0 };
        },
    };

    const queryOne = async (_c: unknown, sql: string, args: unknown[] = []) => {
        if (/FROM profiles WHERE id/.test(sql)) {
            const p = state.profiles.find((r) => r.id === args[0]);
            return p ? { ...p } : null;
        }
        if (/FROM user_progress WHERE user_id = \? AND content_type/.test(sql)) {
            const hit = state.progress.find(
                (r) =>
                    r.user_id === args[0] &&
                    r.content_type === args[1] &&
                    r.content_id === args[2] &&
                    r.status === args[3]
            );
            return hit ? { ...hit } : null;
        }
        if (/FROM attempts WHERE user_id/.test(sql)) {
            const hit = state.attempts.find(
                (r) => r.user_id === args[0] && r.variant_id === args[1] && r.verdict === args[2]
            );
            return hit ? { ...hit } : null;
        }
        return null;
    };

    const run = async (_c: unknown, sql: string, args: unknown[] = []) => {
        if (/UPDATE profiles SET xp/.test(sql)) {
            // Full submit_completion update: xp, level, rank, streak_current,
            // streak_best, last_activity_date, id (mirrors client.execute).
            const [xp, level, rank, streakCurrent, streakBest, lastActivity, id] = args as [
                number,
                number,
                string,
                number,
                number,
                string,
                string
            ];
            const p = state.profiles.find((r) => r.id === id);
            if (p) {
                p.xp = xp;
                p.level = level;
                p.rank = rank;
                p.streak_current = streakCurrent;
                p.streak_best = streakBest;
                p.last_activity_date = lastActivity;
            }
            return;
        }
        if (/INSERT INTO attempts/.test(sql)) {
            const [id, userId, variantId, , , verdict] = args as string[];
            if (
                verdict === 'correct' &&
                state.attempts.some(
                    (r) =>
                        r.user_id === userId &&
                        r.variant_id === variantId &&
                        r.verdict === 'correct'
                )
            ) {
                throw new Error(ATTEMPTS_UNIQUE);
            }
            state.attempts.push({ id, user_id: userId, variant_id: variantId, verdict, score: 0 });
            return;
        }
        if (/INSERT INTO user_progress/.test(sql)) {
            const [, userId, contentType, contentId] = args as string[];
            if (
                state.progress.some(
                    (r) =>
                        r.user_id === userId &&
                        r.content_type === contentType &&
                        r.content_id === contentId
                )
            ) {
                throw new Error(PROGRESS_UNIQUE);
            }
            state.progress.push({
                id: args[0],
                user_id: userId,
                content_type: contentType,
                content_id: contentId,
                status: 'completed',
            });
            return;
        }
        if (/UPDATE attempts SET score/.test(sql)) {
            const [score, id] = args as [number, string];
            const a = state.attempts.find((r) => r.id === id);
            if (a) a.score = score;
            return;
        }
    };

    return { state, client, queryOne, run };
});

vi.mock('./shared/rateLimit', () => ({
    // Default: limits pass; individual tests override via rateAllowed.
    checkRateLimit: vi.fn(async () => true),
    checkReadRateLimit: vi.fn(async () => true),
    clientIp: vi.fn(() => '1.2.3.4'),
}));

vi.mock('./db', () => ({
    getClient: () => db.client,
    queryOne: (c: unknown, sql: string, args?: unknown[]) => db.queryOne(c, sql, args),
    run: (c: unknown, sql: string, args?: unknown[]) => db.run(c, sql, args),
}));

vi.mock('./auth', () => ({
    getUserFromRequest: vi.fn(async () => ({ id: 'user-1' })),
}));

vi.mock('./crypto', () => ({
    newId: () => `id_${Math.random().toString(36).slice(2)}`,
}));

import { applyVerificationResult, handleRpc } from './rpc';

const env = {} as Env;

function authedRequest(): Request {
    return new Request('https://worker.test/rpc', {
        method: 'POST',
        headers: { Authorization: 'Bearer tok' },
    });
}

describe('applyVerificationResult concurrency guard', () => {
    beforeEach(() => {
        db.state.profiles = [{ id: 'user-1', verification_rating: 1200 }];
        db.state.attempts = [];
        db.state.progress = [];
    });

    it('applies the ELO adjustment exactly once for two concurrent correct submissions', async () => {
        const input = {
            userId: 'user-1',
            variantId: 'bv_1',
            difficulty: 1200,
            won: true,
            concept: null,
            misconception: null,
            hypothesis: 'off by one',
            tests: [],
        };

        const [a, b] = await Promise.all([
            applyVerificationResult(env, input),
            applyVerificationResult(env, input),
        ]);

        const winners = [a, b].filter((r) => r.delta !== 0);
        expect(winners).toHaveLength(1);

        const correctAttempts = db.state.attempts.filter((r) => r.verdict === 'correct');
        expect(correctAttempts).toHaveLength(1);
        expect(db.state.profiles[0].verification_rating).toBe(winners[0].verificationRating);
    });

    it('never lets a stale incorrect attempt regress a concurrent winner rating', async () => {
        const won = {
            userId: 'user-1',
            variantId: 'bv_1',
            difficulty: 1200,
            won: true,
            concept: null,
            misconception: null,
            hypothesis: 'h',
            tests: [],
        };
        const lost = { ...won, won: false };

        await Promise.all([applyVerificationResult(env, won), applyVerificationResult(env, lost)]);

        const rating = Number(db.state.profiles[0].verification_rating);
        // A correct win at equal difficulty raises the rating; a stale loss
        // computed from the pre-win read must not overwrite it.
        expect(rating).toBeGreaterThan(1200);
        expect(db.state.attempts).toHaveLength(2);
    });

    it('returns a zero delta without inserting when a correct attempt already exists', async () => {
        db.state.attempts.push({
            id: 'a0',
            user_id: 'user-1',
            variant_id: 'bv_1',
            verdict: 'correct',
            score: 10,
        });

        const result = await applyVerificationResult(env, {
            userId: 'user-1',
            variantId: 'bv_1',
            difficulty: 1200,
            won: true,
            concept: null,
            misconception: null,
            hypothesis: 'h',
            tests: [],
        });

        expect(result.delta).toBe(0);
        expect(result.verificationRating).toBe(1200);
        expect(db.state.attempts).toHaveLength(1);
    });
});

describe('submit_completion duplicate guard', () => {
    beforeEach(() => {
        db.state.profiles = [
            {
                id: 'user-1',
                xp: 100,
                level: 2,
                rank: 'bronze',
                streak_current: 3,
                streak_best: 5,
            },
        ];
        db.state.attempts = [];
        db.state.progress = [];
    });

    it('racing duplicates both return 200 and award XP exactly once', async () => {
        const args = { p_content_type: 'lesson', p_content_id: 'lesson-1' };

        const [r1, r2] = await Promise.all([
            handleRpc(env, authedRequest(), 'submit_completion', args),
            handleRpc(env, authedRequest(), 'submit_completion', args),
        ]);

        expect(r1.status).toBe(200);
        expect(r2.status).toBe(200);

        const b1 = (await r1.json()) as { data: { xp_awarded: number } };
        const b2 = (await r2.json()) as { data: { xp_awarded: number } };
        const awarded = [b1.data.xp_awarded, b2.data.xp_awarded].filter((v) => v > 0);
        expect(awarded).toHaveLength(1);

        // 100 base + 50 lesson XP, applied a single time.
        expect(Number(db.state.profiles[0].xp)).toBe(150);
    });

    it('sequential duplicate returns Already completed with zero XP', async () => {
        const args = { p_content_type: 'problem', p_content_id: 'p-1' };

        const first = await handleRpc(env, authedRequest(), 'submit_completion', args);
        expect(first.status).toBe(200);
        const firstBody = (await first.json()) as { data: { xp_awarded: number } };
        expect(firstBody.data.xp_awarded).toBe(100);

        const second = await handleRpc(env, authedRequest(), 'submit_completion', args);
        expect(second.status).toBe(200);
        const secondBody = (await second.json()) as {
            data: { xp_awarded: number; message: string };
        };
        expect(secondBody.data.xp_awarded).toBe(0);
        expect(secondBody.data.message).toBe('Already completed');

        // No double award: 100 + 100 problem XP, once.
        expect(Number(db.state.profiles[0].xp)).toBe(200);
    });
});

describe('submit_completion server-side streak rules', () => {
    const DAY = 86_400_000;
    const isoDay = (offsetDays: number) => new Date(Date.now() - offsetDays * DAY).toISOString().slice(0, 10);

    function profileWith(streakCurrent: number, streakBest: number, lastActivityDate: string | null) {
        db.state.profiles = [
            {
                id: 'user-1',
                xp: 100,
                level: 2,
                rank: 'bronze',
                streak_current: streakCurrent,
                streak_best: streakBest,
                last_activity_date: lastActivityDate,
            },
        ];
    }

    const complete = () =>
        handleRpc(env, authedRequest(), 'submit_completion', {
            p_content_type: 'lesson',
            p_content_id: `lesson-${Math.random().toString(36).slice(2)}`,
        });

    beforeEach(() => {
        db.state.attempts = [];
        db.state.progress = [];
    });

    it('starts a streak at 1 on the first ever completion', async () => {
        profileWith(0, 0, null);
        const res = await complete();
        const body = (await res.json()) as { data: { new_streak_current: number; new_streak_best: number } };
        expect(body.data.new_streak_current).toBe(1);
        expect(body.data.new_streak_best).toBe(1);
        expect(db.state.profiles[0].streak_current).toBe(1);
    });

    it('advances the streak when the last activity was yesterday', async () => {
        profileWith(4, 6, isoDay(1));
        const res = await complete();
        const body = (await res.json()) as { data: { new_streak_current: number; new_streak_best: number } };
        expect(body.data.new_streak_current).toBe(5);
        expect(body.data.new_streak_best).toBe(6); // ratchet keeps the old best
        expect(db.state.profiles[0].last_activity_date).toBe(isoDay(0));
    });

    it('keeps the streak unchanged for a second completion on the same UTC day', async () => {
        profileWith(7, 9, isoDay(0));
        const res = await complete();
        const body = (await res.json()) as { data: { new_streak_current: number } };
        expect(body.data.new_streak_current).toBe(7);
        expect(Number(db.state.profiles[0].streak_current)).toBe(7);
    });

    it('resets the streak to 1 after a gap but never lowers streak_best', async () => {
        profileWith(12, 12, isoDay(3));
        const res = await complete();
        const body = (await res.json()) as { data: { new_streak_current: number; new_streak_best: number } };
        expect(body.data.new_streak_current).toBe(1);
        expect(body.data.new_streak_best).toBe(12);
        expect(Number(db.state.profiles[0].streak_best)).toBe(12);
    });

    it('raises streak_best when the current streak grows past it', async () => {
        profileWith(4, 4, isoDay(1));
        const res = await complete();
        const body = (await res.json()) as { data: { new_streak_current: number; new_streak_best: number } };
        expect(body.data.new_streak_current).toBe(5);
        expect(body.data.new_streak_best).toBe(5);
    });

    it('rejects an empty content id with 400', async () => {
        const res = await handleRpc(env, authedRequest(), 'submit_completion', {
            p_content_type: 'lesson',
            p_content_id: '',
        });
        expect(res.status).toBe(400);
    });

    it('rejects unknown content types even when unique ids would pass the index', async () => {
        const res = await handleRpc(env, authedRequest(), 'submit_completion', {
            p_content_type: 'fabricated_type',
            p_content_id: 'forge-1',
        });
        expect(res.status).toBe(400);
        expect(db.state.progress).toHaveLength(0);
    });

    it('rejects oversized content ids with 400', async () => {
        const res = await handleRpc(env, authedRequest(), 'submit_completion', {
            p_content_type: 'lesson',
            p_content_id: 'x'.repeat(250),
        });
        expect(res.status).toBe(400);
    });

    it('rate limits completion submissions per user', async () => {
        const { checkRateLimit } = await import('./shared/rateLimit');
        vi.mocked(checkRateLimit).mockResolvedValueOnce(false);

        const res = await handleRpc(env, authedRequest(), 'submit_completion', {
            p_content_type: 'lesson',
            p_content_id: 'lesson-rl',
        });
        expect(res.status).toBe(429);
        expect(db.state.progress).toHaveLength(0);
    });

    it('soft rate limits the log rpc per IP and caps payload size', async () => {
        const { checkRateLimit } = await import('./shared/rateLimit');
        vi.mocked(checkRateLimit).mockResolvedValueOnce(false);

        const res = await handleRpc(env, authedRequest(), 'log_app_error', { big: 'payload' });
        const body = (await res.json()) as { data: { success: boolean } };
        expect(res.status).toBe(200);
        expect(body.data.success).toBe(false);
    });
});
