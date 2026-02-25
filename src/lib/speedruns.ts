import { supabase, isSupabaseConfigured } from './supabase';
import { problems } from '../data/problems';

export interface SpeedRunEntry {
    id: string;
    user: {
        id: string;
        username: string;
        avatarUrl?: string;
        league: string;
    };
    problem: {
        id: string;
        title: string;
        difficulty: 'easy' | 'medium' | 'hard';
    };
    durationSeconds: number;
    completedAt: string;
}

// Helper to get problem metadata from actual problems data
const getProblemMeta = (contentId: string): { title: string; difficulty: 'easy' | 'medium' | 'hard' } => {
    const problem = problems.find(p => p.id === contentId);
    if (problem) {
        return { title: problem.title, difficulty: problem.difficulty };
    }
    // Fallback: convert content_id to readable title
    return {
        title: contentId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        difficulty: 'medium'
    };
};

/**
 * Format seconds into human-readable duration (e.g., "12m 30s")
 */
export const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
        return `${seconds}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) {
        return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    }
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
};

/**
 * Format timestamp to relative time (e.g., "2 mins ago")
 */
export const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffSecs = Math.floor(diffMs / 1000);

    if (diffSecs < 60) return 'Just now';
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)} mins ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)} hours ago`;
    return `${Math.floor(diffSecs / 86400)} days ago`;
};

/**
 * Fetch recent speed runs from Supabase
 */
export const fetchSpeedRuns = async (limit: number = 20): Promise<SpeedRunEntry[]> => {
    if (!isSupabaseConfigured()) {
        throw new Error("Supabase is not configured. Speedruns require an active database connection.");
    }

    const { data, error } = await supabase
        .from('user_progress')
        .select(`
            id,
            content_id,
            duration_seconds,
            completed_at,
            profiles!inner (
                id,
                username,
                avatar_url,
                rank
            )
        `)
        .eq('content_type', 'problem')
        .eq('status', 'completed')
        .not('duration_seconds', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching speed runs:', error);
        return [];
    }

    return (data || []).map((row: {
        id: string;
        content_id: string;
        duration_seconds: number | null;
        completed_at: string | null;
        profiles: {
            id: string;
            username: string;
            avatar_url: string | null;
            rank: string | null;
        }
    }) => {
        const problemMeta = getProblemMeta(row.content_id);

        return {
            id: row.id,
            user: {
                id: row.profiles.id,
                username: row.profiles.username,
                avatarUrl: row.profiles.avatar_url || undefined,
                league: row.profiles.rank || 'bronze'
            },
            problem: {
                id: row.content_id,
                title: problemMeta.title,
                difficulty: problemMeta.difficulty
            },
            durationSeconds: row.duration_seconds || 0,
            completedAt: row.completed_at || new Date().toISOString()
        };
    });
};

/**
 * Fetch a single speed run by ID
 */
export const fetchSpeedRunById = async (id: string): Promise<SpeedRunEntry | null> => {
    if (!isSupabaseConfigured()) {
        throw new Error("Supabase is not configured. Speedruns require an active database connection.");
    }

    const { data, error } = await supabase
        .from('user_progress')
        .select(`
            id,
            content_id,
            duration_seconds,
            completed_at,
            profiles!inner (
                id,
                username,
                avatar_url,
                rank
            )
        `)
        .eq('id', id)
        .single();

    if (error || !data) {
        console.error('Error fetching speed run:', error);
        return null;
    }

    const problemMeta = getProblemMeta(data.content_id);
    const profile = data.profiles as unknown as {
        id: string;
        username: string;
        avatar_url: string | null;
        rank: string | null;
    };

    return {
        id: data.id,
        user: {
            id: profile.id,
            username: profile.username,
            avatarUrl: profile.avatar_url || undefined,
            league: profile.rank || 'bronze'
        },
        problem: {
            id: data.content_id,
            title: problemMeta.title,
            difficulty: problemMeta.difficulty
        },
        durationSeconds: data.duration_seconds || 0,
        completedAt: data.completed_at || new Date().toISOString()
    };
};
