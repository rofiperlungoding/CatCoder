import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserProgress, Language } from '../types';
import { calculateLevel, getRank, getLocalStorage, setLocalStorage } from '../lib/utils';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Helper function to fetch profile from Supabase
const fetchProfile = async (userId: string): Promise<User | null> => {
    // Don't attempt to fetch if Supabase isn't configured
    if (!isSupabaseConfigured()) {
        return null;
    }

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle(); // Use maybeSingle to avoid 406 errors when no row exists

        if (error) {
            // Only log if it's an unexpected error
            if (error.code !== 'PGRST116') { // PGRST116 = no rows returned
                console.error('Error fetching profile:', error);
            }
            return null;
        }

        if (!data) {
            return null;
        }

        return {
            id: data.id,
            email: '', // Will be filled from auth
            username: data.username,
            avatarUrl: data.avatar_url,
            xp: data.xp || 0,
            level: data.level || 1,
            rank: (data.rank as User['rank']) || 'bronze',
            streakCurrent: data.streak_current || 0,
            streakBest: data.streak_best || 0,
            createdAt: data.created_at
        };
    } catch (err) {
        // Silently fail for network errors in dev mode
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
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isGuest: false,
            isLoading: true,
            selectedLanguage: 'python',

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

            logout: async () => {
                if (isSupabaseConfigured()) {
                    const { error } = await supabase.auth.signOut();
                    if (error) {
                        console.error('Error signing out of Supabase:', error);
                        // Continue to clear local state anyway
                    }
                }

                set({
                    user: null,
                    isAuthenticated: false,
                    isGuest: false
                });
                useUIStore.getState().addToast('success', 'Signed out successfully');
            },

            signIn: async (email, password) => {
                if (!isSupabaseConfigured()) {
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

                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) {
                    useUIStore.getState().addToast('error', error.message);
                    return { user: null, error };
                }

                if (data.user) {
                    // Fetch profile from profiles table
                    const profile = await fetchProfile(data.user.id);
                    if (profile) {
                        profile.email = data.user.email || '';
                        set({
                            user: profile,
                            isAuthenticated: true,
                            isGuest: false
                        });
                        useUIStore.getState().addToast('success', 'Welcome back!');
                    }
                }

                return { user: data.user, error: null };
            },

            signUp: async (email, password, username) => {
                if (!isSupabaseConfigured()) {
                    useUIStore.getState().addToast('warning', 'Supabase not configured. Cannot sign up.');
                    return { user: null, error: { message: 'Supabase not configured' } };
                }

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
                    useUIStore.getState().addToast('error', error.message);
                    return { user: null, error };
                }

                useUIStore.getState().addToast('success', 'Account created! Please check your email.');
                return { user: data.user, error: null };
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
