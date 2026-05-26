import { supabase, isSupabaseConfigured } from './supabase';
import type { LeaderboardEntry } from '../types';

export interface LeaderboardProfile {
    id: string;
    username: string;
    avatar_url: string | null;
    xp: number;
    rank: string;
}

/**
 * Fetch top users from the profiles table, sorted by XP
 */
export const fetchLeaderboard = async (limit: number = 10): Promise<LeaderboardEntry[]> => {
    if (!isSupabaseConfigured()) {
        throw new Error("Supabase is not configured. Real leaderboard logic requires an active database connection.");
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, xp, rank')
        .order('xp', { ascending: false })
        .order('username', { ascending: true })
        .limit(limit);

    if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }

    // Use a compatible type for the mapping that aligns with Supabase return type
    return (data || []).map((profile: { id: string; username: string; avatar_url: string | null; xp: number | null; rank: string | null }, index: number) => ({
        rank: index + 1,
        user: {
            id: profile.id,
            username: profile.username,
            avatarUrl: profile.avatar_url || undefined,
            rank: (profile.rank as 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond') || 'bronze'
        },
        score: profile.xp || 0,
        problemsSolved: Math.floor((profile.xp || 0) / 50) // Estimate based on XP
    }));
};

/**
 * Subscribe to live profile updates and re-fire the supplied callback with
 * a freshly-sorted leaderboard whenever any row changes. Returns a
 * teardown function the caller MUST invoke on unmount.
 *
 * The strategy is deliberately simple: any UPDATE/INSERT to `profiles`
 * triggers a single re-fetch. Server-side ordering is more authoritative
 * than client-side merging for a small leaderboard (top 5–10 entries).
 */
export const subscribeLeaderboard = (
    limit: number,
    onChange: (entries: LeaderboardEntry[]) => void,
    onError?: (error: unknown) => void
): (() => void) => {
    if (!isSupabaseConfigured()) return () => {};

    const channel = supabase
        .channel('leaderboard:profiles')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'profiles' },
            () => {
                fetchLeaderboard(limit).then(onChange).catch(onError ?? (() => {}));
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
};

/**
 * Fetch user's rank in the leaderboard
 */
export const fetchUserRank = async (userId: string): Promise<number | null> => {
    if (!isSupabaseConfigured()) return null;

    // Get user's XP
    const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('xp')
        .eq('id', userId)
        .single();

    if (userError || !userData) return null;

    // Count how many users have more XP
    const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('xp', userData.xp);

    if (countError) return null;

    return (count || 0) + 1;
};
