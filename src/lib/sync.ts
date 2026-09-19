import { supabase } from './supabase';
import { loadAllLessons } from '../data/lessons';
import { problems } from '../data/problems';
import { calculateLevel } from './utils';
import { useUserStore } from '../stores';
import { logger } from './logger';

/**
 * Identity guard for the sync → setUser → sync feedback loop.
 * syncUserXP writes a NEW user object into the store; Home runs this sync
 * inside useEffect([user]), so a fresh object identity would re-trigger the
 * effect forever. XP/level are display-only mirrors of server truth, so only
 * an actual VALUE change may re-enter the effect.
 */
function updateUserIfChanged(userId: string, xp: number, level: number): boolean {
    const user = useUserStore.getState().user;
    if (!user || user.id !== userId) return false;
    if (user.xp === xp && user.level === level) return false;

    useUserStore.getState().setUser({ ...user, xp, level });
    return true;
}

let inFlightSync: Promise<number | null> | null = null;

export const syncUserXP = async (userId: string): Promise<number | null> => {
    // Dedupe concurrent calls: multiple mount cycles can fire sync at once;
    // they all read the same data, so sharing one in-flight query is correct
    // and prevents the burst of duplicate [Sync] activity on page load.
    if (inFlightSync) return inFlightSync;
    inFlightSync = runSync(userId).finally(() => {
        inFlightSync = null;
    });
    return inFlightSync;
};

const runSync = async (userId: string): Promise<number | null> => {
    logger.debug('[Sync] Starting XP synchronization for user:', userId);

    try {
        // 1. Fetch all completed progress
        const { data: progressData, error } = await supabase
            .from('user_progress')
            .select('content_id, content_type')
            .eq('user_id', userId)
            .eq('status', 'completed');

        if (error) throw error;

        if (!progressData || progressData.length === 0) {
            logger.debug('[Sync] No progress found. Total XP: 0');
            return 0;
        }

        // 2. Calculate Total XP

        // Create lookups for faster access (lessons are loaded lazily so the
        // initial bundle is not blocked on the full catalog).
        const lessons = await loadAllLessons();
        const lessonMap = new Map(lessons.map(l => [l.id, l]));
        const problemMap = new Map(problems.map(p => [p.id, p]));

        let totalXP = 0;
        progressData.forEach(item => {
            if (item.content_type === 'lesson') {
                const lesson = lessonMap.get(item.content_id);
                if (lesson) {
                    totalXP += lesson.xpReward || 50; // Default fallback
                }
            } else if (item.content_type === 'problem') {
                const problem = problemMap.get(item.content_id);
                if (problem) {
                    totalXP += problem.xpReward || 50; // Default fallback
                }
            } else if (item.content_type === 'challenge') {
                // Challenges usually part of lessons, but if stored separately:
                totalXP += 50; // Standard challenge reward
            }
        });

        logger.debug(`[Sync] Calculated Total XP: ${totalXP}`);

        // 3. SECURITY: XP is server-authoritative. The Worker strips xp/level
        // from every client write to `profiles`, so pushing a client-computed
        // total here would either be a silent no-op or an XP-forgery attempt.
        // The server recomputes XP inside the submit_completion RPC.
        const level = calculateLevel(totalXP);

        // 4. Update Local Store (display only — server truth wins on next
        // fetch). Returns true only when XP/level actually changed, so the
        // caller's user-object identity stays stable otherwise.
        updateUserIfChanged(userId, totalXP, level);

        return totalXP;

    } catch (err) {
        // Single log point: the throw path above no longer pre-logs the same
        // failure before it lands here.
        logger.error('[Sync] Error during XP sync:', err);
        return null;
    }
};
