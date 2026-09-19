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
                const [xp, level, rank, id] = args as [number, number, string, string];
                const p = state.profiles.find((r) => r.id === id);
                if (p) {
                    p.xp = xp;
                    p.level = level;
                    p.rank = rank;
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
            const [xp, level, rank, id] = args as [number, number, string, string];
            const p = state.profiles.find((r) => r.id === id);
            if (p) {
                p.xp = xp;
                p.level = level;
                p.rank = rank;
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
