/**
 * Server-side RPC equivalents of the Supabase functions the app calls.
 * XP/level/rank are computed here so clients can't forge them.
 */

import { getClient, queryOne, run } from './db';
import { getUserFromRequest } from './auth';
import { newId } from './crypto';
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
    if (dup) {
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

    const xp = XP_BY_TYPE[contentType] ?? 25;
    const now = new Date().toISOString();
    await run(
        client,
        'INSERT INTO user_progress (id, user_id, content_type, content_id, status, score, duration_seconds, completed_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [newId(), user.id, contentType, contentId, 'completed', xp, durationSeconds, now, now]
    );

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
