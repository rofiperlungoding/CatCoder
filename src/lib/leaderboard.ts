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
        // Return mock data if Supabase is not configured
        return [
            { rank: 1, user: { id: '1', username: 'CodeMaster', avatarUrl: undefined, rank: 'diamond' }, score: 25000, problemsSolved: 150 },
            { rank: 2, user: { id: '2', username: 'ByteWizard', avatarUrl: undefined, rank: 'platinum' }, score: 22500, problemsSolved: 130 },
            { rank: 3, user: { id: '3', username: 'AlgoNinja', avatarUrl: undefined, rank: 'platinum' }, score: 20000, problemsSolved: 120 },
            { rank: 4, user: { id: '4', username: 'DataDragon', avatarUrl: undefined, rank: 'gold' }, score: 18000, problemsSolved: 100 },
            { rank: 5, user: { id: '5', username: 'ScriptSamurai', avatarUrl: undefined, rank: 'gold' }, score: 15000, problemsSolved: 90 },
        ];
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

    return (data || []).map((profile: LeaderboardProfile, index: number) => ({
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
