import { supabase } from './supabase';
import { loadAllLessons } from '../data/lessons';
import { problems } from '../data/problems';
import { calculateLevel } from './utils';
import { useUserStore } from '../stores';
import { logger } from './logger';

export const syncUserXP = async (userId: string) => {
    logger.debug('[Sync] Starting XP synchronization for user:', userId);

    try {
        // 1. Fetch all completed progress
        const { data: progressData, error } = await supabase
            .from('user_progress')
            .select('content_id, content_type')
            .eq('user_id', userId)
            .eq('status', 'completed');

        if (error) {
            console.error('[Sync] Failed to fetch user progress:', error);
            throw error;
        }

        if (!progressData || progressData.length === 0) {
            logger.debug('[Sync] No progress found. Total XP: 0');
            return 0;
        }

        // 2. Calculate Total XP
        let totalXP = 0;

        // Create lookups for faster access (lessons are loaded lazily so the
        // initial bundle is not blocked on the full catalog).
        const lessons = await loadAllLessons();
        const lessonMap = new Map(lessons.map(l => [l.id, l]));
        const problemMap = new Map(problems.map(p => [p.id, p]));

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

        // 4. Update Local Store (display only — server truth wins on next fetch)
        const user = useUserStore.getState().user;
        if (user) {
            useUserStore.getState().setUser({
                ...user,
                xp: totalXP,
                level: level
            });
        }

        return totalXP;

    } catch (err) {
        console.error('[Sync] Error during XP sync:', err);
        return null;
    }
};
