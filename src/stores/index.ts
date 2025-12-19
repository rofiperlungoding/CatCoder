import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserProgress, Language, Activity } from '../types';
import { calculateLevel, getRank, getLocalStorage, setLocalStorage } from '../lib/utils';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
                console.warn('[fetchProfile] Timeout after 5 seconds');
                resolve(null);
            }, 5000);
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
                avatarUrl: data.avatar_url,
                xp: data.xp || 0,
                level: data.level || 1,
                rank: (data.rank as User['rank']) || 'bronze',
                streakCurrent: data.streak_current || 0,
                streakBest: data.streak_best || 0,
                createdAt: data.created_at
            };
        })();

        const result = await Promise.race([fetchPromise, timeoutPromise]);
        console.log('[fetchProfile] Returning result:', result ? 'profile found' : 'null');
        return result;
    } catch (err) {
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
    last_activity_date: string;
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
    setUser: (user: User | null) => void;
    setGuest: () => void;
    logout: () => void;
    signIn: (email: string, password: string) => Promise<{ user: any; error: any }>;
    signUp: (email: string, password: string, username: string) => Promise<{ user: any; error: any }>;
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
                            }
                        }).catch(() => {
                            // Profile fetch failed, but we already have basic user - that's fine
                        });
                    }

                    return { user: data.user, error: null };
                } catch (err) {
                    useUIStore.getState().addToast('error', 'An unexpected error occurred');
                    return { user: null, error: { message: 'Unexpected error' } };
                }
            },

            signUp: async (email, password, username) => {
                console.log('[Auth] signUp called with email:', email, 'username:', username);

                if (!isSupabaseConfigured()) {
                    console.log('[Auth] Supabase not configured');
                    useUIStore.getState().addToast('warning', 'Supabase not configured. Cannot sign up.');
                    return { user: null, error: { message: 'Supabase not configured' } };
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
                        return { user: data.user, error: null };
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
                    }

                    return { user: data.user, error: null };
                } catch (err) {
                    console.error('[Auth] Unexpected error during signUp:', err);
                    useUIStore.getState().addToast('error', 'An unexpected error occurred');
                    return { user: null, error: { message: 'Unexpected error' } };
                }
            },

            initializeSession: async () => {
                if (!isSupabaseConfigured()) {
                    set({ isLoading: false });
                    return;
                }

                try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user) {
                        const profile = await fetchProfile(session.user.id);
                        if (profile) {
                            profile.email = session.user.email || '';
                            set({ user: profile, isAuthenticated: true, isGuest: false, isLoading: false });
                        } else {
                            set({ isLoading: false });
                        }
                    } else {
                        set({ isLoading: false });
                    }

                    supabase.auth.onAuthStateChange(async (_event, session) => {
                        if (session?.user) {
                            const profile = await fetchProfile(session.user.id);
                            if (profile) {
                                profile.email = session.user.email || '';
                                set({ user: profile, isAuthenticated: true, isGuest: false });
                            }
                        } else {
                            set({ user: null, isAuthenticated: false, isGuest: false });
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

                // Sync to Supabase
                if (!user.id.startsWith('guest-') && !user.id.startsWith('mock-')) {
                    syncProfileToSupabase(user.id, {
                        xp: newXP,
                        level: newLevel,
                        rank: newRank
                    });
                }
            },

            setSelectedLanguage: (language) => set({ selectedLanguage: language }),

            updateStreak: async () => {
                const { user } = get();
                if (!user) return;

                const today = new Date().toDateString();
                const lastVisit = getLocalStorage('lastVisit', '');
                const yesterday = new Date(Date.now() - 86400000).toDateString();

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

                // Sync to Supabase
                if (!user.id.startsWith('guest-') && !user.id.startsWith('mock-')) {
                    syncProfileToSupabase(user.id, {
                        streak_current: newStreak,
                        streak_best: Math.max(user.streakBest, newStreak),
                        last_activity_date: new Date().toISOString().split('T')[0]
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
                    const supabaseUpdates: any = {};
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
            name: 'catcoder-user'
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
    markComplete: (contentType: 'lesson' | 'problem' | 'challenge', contentId: string, score?: number) => void;
    isCompleted: (contentType: 'lesson' | 'problem' | 'challenge', contentId: string) => boolean;
    getProgress: (contentType: 'lesson' | 'problem' | 'challenge', contentId: string) => UserProgress | undefined;
}

// Helper to sync progress to Supabase
const syncProgressToSupabase = async (userId: string, contentType: string, contentId: string, score?: number) => {
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

                const progress: UserProgress[] = (data || []).map((row: any) => ({
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

            markComplete: (contentType, contentId, score) => {
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

                // Sync to Supabase
                syncProgressToSupabase(userId, contentType, contentId, score);

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
            }
        }),
        {
            name: 'catcoder-progress',
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
            onRehydrateStorage: () => () => {
                applyTheme();
            }
        }
    )
);
