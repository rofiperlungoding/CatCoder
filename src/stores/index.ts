import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import type { User, UserProgress, Language, Activity } from '../types';
import { calculateLevel, getRank, getLocalStorage, setLocalStorage } from '../lib/utils';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { secureStorage, migrateToEncrypted } from '../lib/secureStorage';
import { getTrueTime, getTrueDate, syncServerTime, isClockOutOfSync } from '../lib/serverTime';
import {
    registerDeviceSession,
    verifyDeviceFingerprint,
    handleFingerprintMismatch,
    clearCachedFingerprint
} from '../lib/deviceFingerprint';
import { AuthError, type Session } from '@supabase/supabase-js';

// Database types matching Supabase schema
interface DBProfile {
    id: string;
    username: string | null;
    avatar_url: string | null;
    xp: number;
    level: number;
    rank: string;
    streak_current: number;
    streak_best: number;
    created_at: string;
    last_activity_date?: string | null;
}

interface DBUserProgress {
    id: string;
    user_id: string;
    content_type: 'lesson' | 'problem' | 'challenge';
    content_id: string;
    status: 'completed' | 'started';
    score?: number;
    completed_at?: string;
    duration_seconds?: number;
    created_at?: string;
}

/**
 * Secure storage adapter for Zustand persist middleware
 * Requirements 3.5: Integrate with Zustand's persist middleware transparently
 * 
 * This adapter wraps secureStorage to match Zustand's StateStorage interface
 * and handles migration from unencrypted to encrypted storage.
 */
const secureStateStorage: StateStorage = {
    getItem: (name: string): string | null => {
        // First, attempt migration from unencrypted to encrypted
        // This handles existing users who have unencrypted data
        migrateToEncrypted(name);
        return secureStorage.getItem(name);
    },
    setItem: (name: string, value: string): void => {
        secureStorage.setItem(name, value);
    },
    removeItem: (name: string): void => {
        secureStorage.removeItem(name);
    }
};

/**
 * Create secure JSON storage for Zustand persist middleware
 * Uses AES encryption for all stored data
 */
const createSecureStorage = () => createJSONStorage(() => secureStateStorage);

// Helper function to fetch profile from Supabase with timeout
const fetchProfile = async (userId: string): Promise<User | null> => {
    console.log('[fetchProfile] Called with userId:', userId);

    // Don't attempt to fetch if Supabase isn't configured
    if (!isSupabaseConfigured()) {
        console.log('[fetchProfile] Supabase not configured, returning null');
        return null;
    }

    try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise<null>((resolve) => {
            setTimeout(() => {
                console.warn('[fetchProfile] Timeout after 10 seconds');
                resolve(null);
            }, 10000);
        });

        const fetchPromise = (async () => {
            console.log('[fetchProfile] Querying profiles table...');
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            console.log('[fetchProfile] Query result - data:', !!data, 'error:', error?.message || 'none');

            if (error) {
                if (error.code !== 'PGRST116') {
                    console.error('[fetchProfile] Error:', error);
                }
                return null;
            }

            if (!data) {
                console.log('[fetchProfile] No profile found');
                return null;
            }

            console.log('[fetchProfile] Profile found, username:', data.username);
            return {
                id: data.id,
                email: '',
                username: data.username,
                avatarUrl: data.avatar_url || undefined,
                xp: data.xp || 0,
                level: data.level || 1,
                rank: (data.rank as User['rank']) || 'bronze',
                streakCurrent: data.streak_current || 0,
                streakBest: data.streak_best || 0,
                createdAt: data.created_at || new Date().toISOString()
            };
        })();

        const result = await Promise.race([fetchPromise, timeoutPromise]);
        console.log('[fetchProfile] Returning result:', result ? 'profile found' : 'null');
        return result;
    } catch (err: unknown) {
        console.error('[fetchProfile] Caught error:', err);
        return null;
    }
};

// Helper function to update profile in Supabase
const syncProfileToSupabase = async (userId: string, updates: Partial<{
    xp: number;
    level: number;
    rank: string;
    streak_current: number;
    streak_best: number;
    last_activity_date: string | null;
}>) => {
    if (!isSupabaseConfigured()) return;

    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

    if (error) {
        console.error('Error syncing profile:', error);
    }
};

// User Store
interface UserState {
    user: User | null;
    isAuthenticated: boolean;
    isGuest: boolean;
    isLoading: boolean;
    selectedLanguage: Language;
    recentActivities: Activity[];

    // Actions
    // Actions
    setUser: (user: User | null) => void;
    setGuest: () => void;
    logout: () => void;
    signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
    signInWithGoogle: () => Promise<{ user: null; error: AuthError | null }>;
    signUp: (email: string, password: string, username: string) => Promise<{ user: User | null; error: AuthError | null }>;
    resetPasswordForEmail: (email: string) => Promise<{ error: AuthError | null }>;
    magicLinkLogin: (email: string) => Promise<{ error: AuthError | null }>;
    updateEmail: (newEmail: string) => Promise<{ error: AuthError | null }>;
    initializeSession: () => Promise<void>;
    addXP: (amount: number) => void;
    setSelectedLanguage: (language: Language) => void;
    updateStreak: () => void;
    updateProfile: (updates: Partial<User>) => Promise<void>;
    addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isGuest: false,
            isLoading: true,
            selectedLanguage: 'python',
            recentActivities: [],

            setUser: (user) => set({
                user,
                isAuthenticated: !!user,
                isGuest: false
            }),

            setGuest: () => {
                const guestUser: User = {
                    id: 'guest-' + Date.now(),
                    email: '',
                    username: 'Guest Coder',
                    xp: 0,
                    level: 1,
                    rank: 'bronze',
                    streakCurrent: 0,
                    streakBest: 0,
                    createdAt: new Date().toISOString()
                };
                set({
                    user: guestUser,
                    isAuthenticated: false,
                    isGuest: true
                });
            },

            logout: () => {
                // Clear local state IMMEDIATELY for instant feedback
                set({
                    user: null,
                    isAuthenticated: false,
                    isGuest: false
                });
                useUIStore.getState().addToast('success', 'Signed out successfully');

                // Clear cached fingerprint (Requirements 5.4)
                clearCachedFingerprint();

                // Sign out from Supabase in background (fire-and-forget)
                if (isSupabaseConfigured()) {
                    supabase.auth.signOut().catch(err => {
                        console.error('Error signing out of Supabase:', err);
                    });
                }
            },

            signIn: async (email, password) => {
                console.log('[Auth] signIn called with email:', email);

                if (!isSupabaseConfigured()) {
                    console.log('[Auth] Supabase not configured - using mock login');
                    useUIStore.getState().addToast('warning', 'Supabase not configured. Using mock login.');
                    set({
                        user: {
                            id: 'mock-user-1',
                            username: email.split('@')[0],
                            email: email,
                            xp: 100,
                            level: 2,
                            rank: 'bronze',
                            streakCurrent: 1,
                            streakBest: 1,
                            createdAt: new Date().toISOString()
                        },
                        isAuthenticated: true,
                        isGuest: false
                    });
                    return { user: null, error: null };
                }

                try {
                    const { data, error } = await supabase.auth.signInWithPassword({
                        email,
                        password
                    });

                    if (error) {
                        useUIStore.getState().addToast('error', error.message);
                        return { user: null, error };
                    }

                    if (data.user) {
                        // Set authenticated state IMMEDIATELY with basic user data
                        // This allows navigation to proceed without waiting for profile fetch
                        const basicUser: User = {
                            id: data.user.id,
                            email: data.user.email || '',
                            username: data.user.user_metadata?.username || data.user.email?.split('@')[0] || 'User',
                            xp: 0,
                            level: 1,
                            rank: 'bronze',
                            streakCurrent: 0,
                            streakBest: 0,
                            createdAt: data.user.created_at || new Date().toISOString()
                        };

                        set({
                            user: basicUser,
                            isAuthenticated: true,
                            isGuest: false
                        });
                        useUIStore.getState().addToast('success', 'Welcome back!');

                        // Fetch full profile in background (non-blocking)
                        fetchProfile(data.user.id).then(profile => {
                            if (profile) {
                                profile.email = data.user!.email || '';
                                set({ user: profile });
                                // Fetch user progress from database
                                useProgressStore.getState().fetchProgress(data.user!.id);
                            }
                        }).catch(() => {
                            // Profile fetch failed, but we already have basic user - that's fine
                        });

                        // Register device fingerprint for this session (Requirements 5.1, 5.2)
                        registerDeviceSession().catch(err => {
                            console.warn('[Auth] Failed to register device session:', err);
                        });

                        return { user: basicUser, error: null };
                    }

                    return { user: null, error: null };
                } catch (err) {
                    console.error('[Auth] Unexpected error:', err);
                    useUIStore.getState().addToast('error', 'An unexpected error occurred');
                    return {
                        user: null,
                        error: { message: 'Unexpected error', name: 'Error' } as unknown as AuthError
                    };
                }
            },

            signInWithGoogle: async () => {
                console.log('[Auth] signInWithGoogle called (Supabase OAuth)');

                if (!isSupabaseConfigured()) {
                    useUIStore.getState().addToast('error', 'Supabase not configured');
                    return { user: null, error: { message: 'Supabase not configured', name: 'ConfigError' } as unknown as AuthError };
                }

                try {
                    const { error } = await supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                            redirectTo: `${window.location.origin}/auth/callback`,
                            queryParams: {
                                access_type: 'offline',
                                prompt: 'consent',
                            },
                        },
                    });

                    if (error) {
                        console.error('[Auth] Google OAuth error:', error);
                        useUIStore.getState().addToast('error', error.message);
                        return { user: null, error };
                    }

                    // OAuth will redirect, so we don't need to handle the response here
                    // The initializeSession will pick up the session after redirect
                    console.log('[Auth] Google OAuth initiated, redirecting...');
                    return { user: null, error: null };
                } catch (err: unknown) {
                    console.error('[Auth] Google sign-in error:', err);
                    useUIStore.getState().addToast('error', 'Failed to sign in with Google');
                    return {
                        user: null,
                        error: { message: (err as Error).message || 'Unknown error', name: 'AuthError' } as unknown as AuthError
                    };
                }
            },

            resetPasswordForEmail: async (email) => {
                if (!isSupabaseConfigured()) return { error: { message: 'Supabase not configured', name: 'ConfigError' } as unknown as AuthError };
                try {
                    const { error } = await supabase.auth.resetPasswordForEmail(email, {
                        redirectTo: `${window.location.origin}/reset-password`,
                    });
                    if (error) useUIStore.getState().addToast('error', error.message);
                    else useUIStore.getState().addToast('success', 'Password reset email sent!');
                    return { error };
                } catch (err) {
                    return { error: { message: String(err), name: 'Error' } as unknown as AuthError };
                }
            },

            magicLinkLogin: async (email) => {
                if (!isSupabaseConfigured()) return { error: { message: 'Supabase not configured', name: 'ConfigError' } as unknown as AuthError };
                try {
                    const { error } = await supabase.auth.signInWithOtp({
                        email,
                        options: {
                            emailRedirectTo: `${window.location.origin}/home`,
                        },
                    });
                    if (error) useUIStore.getState().addToast('error', error.message);
                    else useUIStore.getState().addToast('success', 'Magic link sent! Check your email.');
                    return { error };
                } catch (err) {
                    return { error: { message: String(err), name: 'Error' } as unknown as AuthError };
                }
            },

            updateEmail: async (newEmail) => {
                if (!isSupabaseConfigured()) return { error: { message: 'Supabase not configured', name: 'ConfigError' } as unknown as AuthError };
                try {
                    const { error } = await supabase.auth.updateUser({ email: newEmail });
                    if (error) useUIStore.getState().addToast('error', error.message);
                    else useUIStore.getState().addToast('success', 'Confirmation sent to new email!');
                    return { error };
                } catch (err) {
                    return { error: { message: String(err), name: 'Error' } as unknown as AuthError };
                }
            },

            signUp: async (email, password, username) => {
                console.log('[Auth] signUp called with email:', email, 'username:', username);

                if (!isSupabaseConfigured()) {
                    console.log('[Auth] Supabase not configured');
                    useUIStore.getState().addToast('warning', 'Supabase not configured. Cannot sign up.');
                    return { user: null, error: { message: 'Supabase not configured', name: 'ConfigError' } as unknown as AuthError };
                }

                try {
                    console.log('[Auth] Attempting Supabase signUp...');
                    const { data, error } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            data: {
                                username: username
                            }
                        }
                    });

                    if (error) {
                        console.error('[Auth] SignUp error:', error.message);
                        useUIStore.getState().addToast('error', error.message);
                        return { user: null, error };
                    }

                    console.log('[Auth] SignUp response:', data);


                    // Check if email confirmation is required
                    if (data.user && !data.session) {
                        console.log('[Auth] Email confirmation required');
                        useUIStore.getState().addToast('success', 'Account created! Please check your email to confirm.');
                        return { user: null, error: null };
                    }

                    // If session exists, user is auto-confirmed
                    if (data.user && data.session) {
                        console.log('[Auth] User auto-confirmed, logging in...');
                        const basicUser: User = {
                            id: data.user.id,
                            email: data.user.email || '',
                            username: username || data.user.email?.split('@')[0] || 'User',
                            xp: 0,
                            level: 1,
                            rank: 'bronze',
                            streakCurrent: 0,
                            streakBest: 0,
                            createdAt: data.user.created_at || new Date().toISOString()
                        };

                        set({
                            user: basicUser,
                            isAuthenticated: true,
                            isGuest: false
                        });

                        // Create profile in database
                        try {
                            await supabase.from('profiles').upsert({
                                id: data.user.id,
                                username: username,
                                xp: 0,
                                level: 1,
                                rank: 'bronze',
                                streak_current: 0,
                                streak_best: 0
                            });
                            console.log('[Auth] Profile created in database');
                        } catch (profileError) {
                            console.warn('[Auth] Failed to create profile:', profileError);
                        }

                        useUIStore.getState().addToast('success', 'Welcome to CatCoder!');
                        return { user: basicUser, error: null };
                    }

                    return { user: null, error: null };
                } catch (err) {
                    console.error('[Auth] Unexpected error during signUp:', err);
                    useUIStore.getState().addToast('error', 'An unexpected error occurred');
                    return {
                        user: null,
                        error: { message: 'Unexpected error', name: 'Error' } as unknown as AuthError
                    };
                }
            },

            initializeSession: async () => {
                if (!isSupabaseConfigured()) {
                    set({ isLoading: false });
                    return;
                }

                try {
                    // Helper function to handle user session (create profile if needed)
                    const handleUserSession = async (session: Session) => {
                        if (!session?.user) return false;

                        const user = session.user;
                        console.log('[Auth] Handling session for user:', user.email);

                        // Try to fetch existing profile
                        let profile = await fetchProfile(user.id);

                        // If no profile exists (e.g., first OAuth login), create one
                        if (!profile) {
                            console.log('[Auth] No profile found, creating one for OAuth user...');
                            const username = user.user_metadata?.full_name ||
                                user.user_metadata?.name ||
                                user.email?.split('@')[0] ||
                                'User';
                            const avatarUrl = user.user_metadata?.avatar_url ||
                                user.user_metadata?.picture;

                            try {
                                await supabase.from('profiles').upsert({
                                    id: user.id,
                                    username: username,
                                    avatar_url: avatarUrl,
                                    xp: 0,
                                    level: 1,
                                    rank: 'bronze',
                                    streak_current: 0,
                                    streak_best: 0
                                });
                                console.log('[Auth] Profile created for OAuth user');

                                // Set user with basic data
                                profile = {
                                    id: user.id,
                                    email: user.email || '',
                                    username: username,
                                    avatarUrl: avatarUrl,
                                    xp: 0,
                                    level: 1,
                                    rank: 'bronze' as const,
                                    streakCurrent: 0,
                                    streakBest: 0,
                                    createdAt: new Date().toISOString()
                                };
                            } catch (err) {
                                console.warn('[Auth] Failed to create profile:', err);
                                return false;
                            }
                        }

                        if (profile) {
                            profile.email = user.email || '';
                            set({ user: profile, isAuthenticated: true, isGuest: false, isLoading: false });
                            useProgressStore.getState().fetchProgress(user.id);

                            // Register device fingerprint for this session (Requirements 5.1, 5.2)
                            registerDeviceSession().catch(err => {
                                console.warn('[Auth] Failed to register device session:', err);
                            });

                            return true;
                        }

                        return false;
                    };

                    // Initial session check
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        const success = await handleUserSession(session);
                        if (!success) set({ isLoading: false });
                    } else {
                        set({ isLoading: false });
                    }

                    // Listen for auth state changes (handles OAuth redirects)
                    supabase.auth.onAuthStateChange(async (event, session) => {
                        console.log('[Auth] Auth state changed:', event);

                        if (event === 'SIGNED_IN' && session?.user) {
                            const success = await handleUserSession(session);
                            if (success) {
                                useUIStore.getState().addToast('success', 'Welcome! Signed in with Google');
                            }
                        } else if (event === 'SIGNED_OUT') {
                            set({ user: null, isAuthenticated: false, isGuest: false });
                        } else if (session?.user) {
                            await handleUserSession(session);
                        }
                    });
                } catch (error) {
                    console.error('Error initializing session:', error);
                    set({ isLoading: false });
                }
            },

            addXP: async (amount) => {
                const { user } = get();
                if (!user) return;

                // SECURITY: For authenticated users, XP is now controlled server-side
                // via the submit_completion RPC function. This method only updates
                // local state for guest/mock users.
                if (!user.id.startsWith('guest-') && !user.id.startsWith('mock-')) {
                    console.warn('[Security] addXP called for authenticated user - XP should be awarded via server RPC');
                    // For authenticated users, we should refresh from server instead
                    // The validateAndComplete function handles XP awards server-side
                    return;
                }

                const newXP = user.xp + amount;
                const newLevel = calculateLevel(newXP);
                const newRank = getRank(newXP);

                // Check for level up
                if (newLevel > user.level) {
                    useUIStore.getState().showLevelUp(newLevel);
                    // Add Level Up Activity
                    get().addActivity({
                        type: 'level_up',
                        title: `Reached Level ${newLevel}`,
                        xpEarned: 0
                    });
                }

                const updatedUser = {
                    ...user,
                    xp: newXP,
                    level: newLevel,
                    rank: newRank
                };

                set({ user: updatedUser });
            },

            setSelectedLanguage: (language) => set({ selectedLanguage: language }),

            updateStreak: async () => {
                const { user } = get();
                if (!user) return;

                // Sync server time first to ensure accurate streak calculation
                // Requirements 8.4: Use getTrueTime for all streak calculations
                await syncServerTime();

                // Check if clock is out of sync - warn but don't block
                if (isClockOutOfSync()) {
                    console.warn('[Streak] System clock is significantly out of sync with server. Streak calculation may be affected.');
                }

                // Use server-synchronized time for streak calculations
                // This prevents users from manipulating streaks by changing system clock
                const trueTime = getTrueTime();
                const today = new Date(trueTime).toDateString();
                const lastVisit = getLocalStorage('lastVisit', '');
                const yesterday = new Date(trueTime - 86400000).toDateString();

                let newStreak = user.streakCurrent;

                if (lastVisit === yesterday) {
                    newStreak += 1;
                } else if (lastVisit !== today) {
                    newStreak = 1;
                }

                setLocalStorage('lastVisit', today);

                const updatedUser = {
                    ...user,
                    streakCurrent: newStreak,
                    streakBest: Math.max(user.streakBest, newStreak)
                };

                set({ user: updatedUser });

                // Sync to Supabase using server time for last_activity_date
                if (!user.id.startsWith('guest-') && !user.id.startsWith('mock-')) {
                    syncProfileToSupabase(user.id, {
                        streak_current: newStreak,
                        streak_best: Math.max(user.streakBest, newStreak),
                        last_activity_date: getTrueDate().toISOString().split('T')[0]
                    });
                }
            },
            updateProfile: async (updates) => {
                const { user } = get();
                if (!user) return;

                const updatedUser = { ...user, ...updates };
                set({ user: updatedUser });

                if (!user.id.startsWith('guest-') && !user.id.startsWith('mock-')) {
                    // Map User fields to Supabase columns
                    const supabaseUpdates: Partial<DBProfile> = {};
                    if (updates.username) supabaseUpdates.username = updates.username;
                    if (updates.avatarUrl) supabaseUpdates.avatar_url = updates.avatarUrl;

                    // We only sync specific profile fields here, not XP/stats which are handled by addXP
                    await syncProfileToSupabase(user.id, supabaseUpdates);

                    useUIStore.getState().addToast('success', 'Profile updated successfully');
                } else {
                    useUIStore.getState().addToast('success', 'Profile updated (Guest mode)');
                }
            },

            addActivity: (activity) => {
                const { recentActivities } = get();
                const newActivity: Activity = {
                    ...activity,
                    id: Math.random().toString(36).substring(7),
                    timestamp: new Date().toISOString()
                };
                // Keep only last 20 activities
                set({ recentActivities: [newActivity, ...recentActivities].slice(0, 20) });
            }
        }),
        {
            name: 'catcoder-user',
            storage: createSecureStorage()
        }
    )
);

// Progress Store
interface ProgressState {
    progress: UserProgress[];
    completedLessons: Set<string>;
    completedProblems: Set<string>;
    isLoaded: boolean;

    // Actions
    fetchProgress: (userId: string) => Promise<void>;
    markComplete: (contentType: 'lesson' | 'problem' | 'challenge', contentId: string, score?: number, durationSeconds?: number) => void;
    isCompleted: (contentType: 'lesson' | 'problem' | 'challenge', contentId: string) => boolean;
    getProgress: (contentType: 'lesson' | 'problem' | 'challenge', contentId: string) => UserProgress | undefined;
    // Secure server-side completion (Requirements 2.2, 2.3, 2.4, 2.5, 2.6)
    // XP is calculated server-side, duplicate completions are prevented
    validateAndComplete: (contentType: 'problem' | 'lesson' | 'challenge', contentId: string, language: string, durationSeconds?: number) => Promise<{ success: boolean; xp_awarded?: number; error?: string; message?: string }>;
}

// Helper to sync progress to Supabase
const syncProgressToSupabase = async (userId: string, contentType: string, contentId: string, score?: number, durationSeconds?: number) => {
    if (!isSupabaseConfigured()) return;
    if (userId.startsWith('guest-') || userId.startsWith('mock-')) return;

    const { error } = await supabase
        .from('user_progress')
        .upsert({
            user_id: userId,
            content_type: contentType,
            content_id: contentId,
            status: 'completed',
            score: score,
            duration_seconds: durationSeconds,
            completed_at: new Date().toISOString()
        }, {
            onConflict: 'user_id,content_type,content_id'
        });

    if (error) {
        console.error('Error syncing progress:', error);
    }
};

export const useProgressStore = create<ProgressState>()(
    persist(
        (set, get) => ({
            progress: [],
            completedLessons: new Set(),
            completedProblems: new Set(),
            isLoaded: false,

            fetchProgress: async (userId: string) => {
                if (!isSupabaseConfigured()) {
                    set({ isLoaded: true });
                    return;
                }
                if (userId.startsWith('guest-') || userId.startsWith('mock-')) {
                    set({ isLoaded: true });
                    return;
                }

                const { data, error } = await supabase
                    .from('user_progress')
                    .select('*')
                    .eq('user_id', userId);

                if (error) {
                    console.error('Error fetching progress:', error);
                    set({ isLoaded: true });
                    return;
                }

                const progress: UserProgress[] = ((data as unknown as DBUserProgress[]) || []).map((row) => ({
                    id: row.id,
                    userId: row.user_id,
                    contentType: row.content_type,
                    contentId: row.content_id,
                    status: row.status,
                    score: row.score,
                    completedAt: row.completed_at
                }));

                const completedLessons = new Set<string>();
                const completedProblems = new Set<string>();

                progress.forEach(p => {
                    if (p.status === 'completed') {
                        if (p.contentType === 'lesson') completedLessons.add(p.contentId);
                        if (p.contentType === 'problem') completedProblems.add(p.contentId);
                    }
                });

                set({ progress, completedLessons, completedProblems, isLoaded: true });
            },

            markComplete: (contentType, contentId, score, durationSeconds) => {
                const { progress, completedLessons, completedProblems } = get();
                const userStore = useUserStore.getState();
                const userId = userStore.user?.id || 'current';

                const newProgress: UserProgress = {
                    id: `${contentType}-${contentId}-${Date.now()}`,
                    userId: userId,
                    contentType,
                    contentId,
                    status: 'completed',
                    score,
                    completedAt: new Date().toISOString()
                };

                const newCompletedLessons = new Set(completedLessons);
                const newCompletedProblems = new Set(completedProblems);

                if (contentType === 'lesson') {
                    newCompletedLessons.add(contentId);
                } else if (contentType === 'problem') {
                    newCompletedProblems.add(contentId);
                }

                set({
                    progress: [...progress, newProgress],
                    completedLessons: newCompletedLessons,
                    completedProblems: newCompletedProblems
                });

                // Sync to Supabase (with duration for problems)
                syncProgressToSupabase(userId, contentType, contentId, score, durationSeconds);

                // Add Activity
                if (contentType === 'lesson' || contentType === 'problem') {
                    // Fetch title (this is a bit hacky, ideally we pass it or look it up properly)
                    // For now, let's look it up from data sets if possible, or pass generic title
                    let title = contentType === 'lesson' ? 'Completed Lesson' : 'Solved Problem';
                    import('../data/lessons').then(({ lessons }) => {
                        const lesson = lessons.find(l => l.id === contentId);
                        if (lesson) title = `Completed: ${lesson.title}`;

                        // For problems we would need to dynamically import or having it passed
                        if (contentType === 'problem') {
                            import('../data/problems').then(({ problems }) => {
                                const problem = problems.find(p => p.id === contentId);
                                if (problem) title = `Solved: ${problem.title}`;

                                userStore.addActivity({
                                    type: 'problem_solved',
                                    title,
                                    xpEarned: score || 100
                                });
                            });
                        } else {
                            userStore.addActivity({
                                type: 'lesson_completed',
                                title,
                                xpEarned: score || 50
                            });
                        }
                    });
                }
            },

            isCompleted: (contentType, contentId) => {
                const { completedLessons, completedProblems } = get();

                if (contentType === 'lesson') {
                    return completedLessons.has(contentId);
                } else if (contentType === 'problem') {
                    return completedProblems.has(contentId);
                }
                return false;
            },

            getProgress: (contentType, contentId) => {
                const { progress } = get();
                return progress.find(
                    p => p.contentType === contentType && p.contentId === contentId
                );
            },

            validateAndComplete: async (contentType, contentId, language, durationSeconds) => {
                if (!isSupabaseConfigured()) {
                    return { success: false, error: 'Supabase not configured' };
                }

                const userStore = useUserStore.getState();
                if (!userStore.user || userStore.user.id.startsWith('guest-') || userStore.user.id.startsWith('mock-')) {
                    return { success: false, error: 'Not authenticated or guest user' };
                }

                // Verify device fingerprint before sensitive operation (Requirements 5.3, 5.4)
                const fingerprintResult = await verifyDeviceFingerprint({
                    onMismatch: handleFingerprintMismatch,
                    logMismatch: true
                });

                if (!fingerprintResult.valid) {
                    // If fingerprint doesn't match, the handleFingerprintMismatch callback
                    // will sign out the user and redirect to login
                    return {
                        success: false,
                        error: fingerprintResult.reason || 'Device verification failed'
                    };
                }

                try {
                    // Use the secure submit_completion RPC function
                    // This function handles:
                    // 1. Server-side XP calculation (Requirements 2.3)
                    // 2. Duplicate prevention (Requirements 2.5)
                    // 3. Atomic profile updates (Requirements 2.4)
                    const { data, error } = await supabase.rpc('submit_completion', {
                        p_content_type: contentType,
                        p_content_id: contentId,
                        p_language: language,
                        p_duration_seconds: durationSeconds ?? undefined
                    });

                    if (error) {
                        console.error('submit_completion RPC error:', error);
                        return { success: false, error: error.message };
                    }

                    const result = data as {
                        success: boolean;
                        xp_awarded?: number;
                        new_xp?: number;
                        new_level?: number;
                        new_rank?: string;
                        new_streak_current?: number;
                        new_streak_best?: number;
                        error?: string;
                        message?: string
                    };

                    if (result.success) {
                        // Update local state
                        const { completedLessons, completedProblems, progress } = get();
                        const newCompletedLessons = new Set(completedLessons);
                        const newCompletedProblems = new Set(completedProblems);

                        if (contentType === 'lesson') {
                            newCompletedLessons.add(contentId);
                        } else if (contentType === 'problem') {
                            newCompletedProblems.add(contentId);
                        }

                        const newProgress: UserProgress = {
                            id: `${contentType}-${contentId}-${Date.now()}`,
                            userId: userStore.user.id,
                            contentType,
                            contentId,
                            status: 'completed',
                            completedAt: new Date().toISOString()
                        };

                        set({
                            progress: [...progress, newProgress],
                            completedLessons: newCompletedLessons,
                            completedProblems: newCompletedProblems
                        });

                        // Refresh user profile from server to get updated XP (Requirements 2.6)
                        if (result.xp_awarded && result.xp_awarded > 0) {
                            const oldLevel = userStore.user.level;

                            // Use the values returned by the RPC if available
                            if (result.new_xp !== undefined && result.new_level !== undefined && result.new_rank !== undefined) {
                                const updatedUser = {
                                    ...userStore.user,
                                    xp: result.new_xp,
                                    level: result.new_level,
                                    rank: result.new_rank as User['rank'],
                                    streakCurrent: result.new_streak_current ?? userStore.user.streakCurrent,
                                    streakBest: result.new_streak_best ?? userStore.user.streakBest
                                };
                                useUserStore.setState({ user: updatedUser });

                                // Check for level up
                                if (result.new_level > oldLevel) {
                                    useUIStore.getState().showLevelUp(result.new_level);
                                    userStore.addActivity({
                                        type: 'level_up',
                                        title: `Reached Level ${result.new_level}`,
                                        xpEarned: 0
                                    });
                                }
                            } else {
                                // Fallback: Fetch updated profile from server
                                const { data: profileData } = await supabase
                                    .from('profiles')
                                    .select('*')
                                    .eq('id', userStore.user.id)
                                    .single();

                                if (profileData) {
                                    const updatedUser = {
                                        ...userStore.user,
                                        xp: profileData.xp || 0,
                                        level: profileData.level || 1,
                                        rank: (profileData.rank as User['rank']) || 'bronze'
                                    };
                                    useUserStore.setState({ user: updatedUser });

                                    // Check for level up
                                    const newLevel = profileData.level || 1;
                                    if (newLevel > oldLevel) {
                                        useUIStore.getState().showLevelUp(newLevel);
                                        userStore.addActivity({
                                            type: 'level_up',
                                            title: `Reached Level ${newLevel}`,
                                            xpEarned: 0
                                        });
                                    }
                                }
                            }

                            // Add activity for completion
                            userStore.addActivity({
                                type: contentType === 'lesson' ? 'lesson_completed' : 'problem_solved',
                                title: `Completed ${contentType}: ${contentId}`,
                                xpEarned: result.xp_awarded
                            });
                        }
                    }

                    return result;
                } catch (err) {
                    console.error('validateAndComplete error:', err);
                    return { success: false, error: 'Unexpected error' };
                }
            }
        }),
        {
            name: 'catcoder-progress',
            storage: createSecureStorage(),
            partialize: (state) => ({
                progress: state.progress,
                completedLessons: Array.from(state.completedLessons),
                completedProblems: Array.from(state.completedProblems)
            }),
            merge: (persisted, current) => {
                const persistedState = persisted as {
                    progress?: UserProgress[];
                    completedLessons?: string[];
                    completedProblems?: string[];
                };
                return {
                    ...current,
                    progress: persistedState?.progress || [],
                    completedLessons: new Set(persistedState?.completedLessons || []),
                    completedProblems: new Set(persistedState?.completedProblems || [])
                };
            }
        }
    )
);

// Achievements Store
interface AchievementState {
    unlockedAchievements: Set<string>;

    // Actions
    unlockAchievement: (achievementId: string) => void;
    hasAchievement: (achievementId: string) => boolean;
}

export const useAchievementStore = create<AchievementState>()(
    persist(
        (set, get) => ({
            unlockedAchievements: new Set(),

            unlockAchievement: (achievementId) => {
                const { unlockedAchievements } = get();
                const newSet = new Set(unlockedAchievements);
                newSet.add(achievementId);
                set({ unlockedAchievements: newSet });
            },

            hasAchievement: (achievementId) => {
                const { unlockedAchievements } = get();
                return unlockedAchievements.has(achievementId);
            }
        }),
        {
            name: 'catcoder-achievements',
            storage: createSecureStorage(),
            partialize: (state) => ({
                unlockedAchievements: Array.from(state.unlockedAchievements)
            }),
            merge: (persisted, current) => ({
                ...current,
                unlockedAchievements: new Set((persisted as { unlockedAchievements?: string[] })?.unlockedAchievements || [])
            })
        }
    )
);

// Toast Types
export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'xp';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

// UI Store
interface UIState {
    sidebarOpen: boolean;
    showAuthModal: boolean;
    toasts: Toast[];
    levelUpModal: {
        isOpen: boolean;
        level: number;
    } | null;

    // Actions
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    setShowAuthModal: (show: boolean) => void;
    addToast: (type: ToastType, message: string) => void;
    removeToast: (id: string) => void;
    showLevelUp: (level: number) => void;
    hideLevelUp: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
    sidebarOpen: true,
    showAuthModal: false,
    toasts: [],
    levelUpModal: null,

    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    setShowAuthModal: (show) => set({ showAuthModal: show }),

    addToast: (type, message) => {
        const id = Math.random().toString(36).substring(7);
        set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
        setTimeout(() => {
            set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
        }, 3000);
    },

    removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

    showLevelUp: (level) => set({ levelUpModal: { isOpen: true, level } }),
    hideLevelUp: () => set({ levelUpModal: null })
}));

// Theme Store
type Theme = 'dark';

interface ThemeState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const applyTheme = () => {
    // Always apply dark mode
    const root = document.documentElement;
    root.classList.add('dark');
};

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            theme: 'dark',

            setTheme: () => {
                applyTheme();
                set({ theme: 'dark' });
            },

            toggleTheme: () => {
                // Disabled: Always keep dark mode
                applyTheme();
                set({ theme: 'dark' });
            }
        }),
        {
            name: 'catcoder-theme',
            storage: createSecureStorage(),
            onRehydrateStorage: () => () => {
                applyTheme();
            }
        }
    )
);
