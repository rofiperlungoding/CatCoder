import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserProgress, Language } from '../types';
import { calculateLevel, getRank, getLocalStorage, setLocalStorage } from '../lib/utils';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// User Store
interface UserState {
    user: User | null;
    isAuthenticated: boolean;
    isGuest: boolean;
    selectedLanguage: Language;

    // Actions
    setUser: (user: User | null) => void;
    setGuest: () => void;
    logout: () => void;
    signIn: (email: string, password: string) => Promise<{ user: any; error: any }>;
    signUp: (email: string, password: string, username: string) => Promise<{ user: any; error: any }>;
    initializeSession: () => void;
    addXP: (amount: number) => void;
    setSelectedLanguage: (language: Language) => void;
    updateStreak: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isGuest: false,
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
                const { error } = await supabase.auth.signOut();
                if (error) {
                    console.error('Error signing out:', error);
                    useUIStore.getState().addToast('error', 'Failed to sign out');
                    return;
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
                    // Fallback to mock login for demo/dev without env vars
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

                // User session mapping is handled by onAuthStateChange or manually here
                // For now, let's manually map basic data
                if (data.user) {
                    const mappedUser: User = {
                        id: data.user.id,
                        email: data.user.email || '',
                        username: data.user.user_metadata?.username || data.user.email?.split('@')[0] || 'User',
                        xp: data.user.user_metadata?.xp || 0,
                        level: data.user.user_metadata?.level || 1,
                        rank: data.user.user_metadata?.rank || 'bronze',
                        streakCurrent: data.user.user_metadata?.streakCurrent || 0,
                        streakBest: data.user.user_metadata?.streakBest || 0,
                        createdAt: data.user.created_at
                    };

                    set({
                        user: mappedUser,
                        isAuthenticated: true,
                        isGuest: false
                    });
                    useUIStore.getState().addToast('success', 'Welcome back!');
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
                            username: username,
                            xp: 0,
                            level: 1,
                            rank: 'bronze'
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
                if (!isSupabaseConfigured()) return;

                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    const mappedUser: User = {
                        id: session.user.id,
                        email: session.user.email || '',
                        username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User',
                        xp: session.user.user_metadata?.xp || 0,
                        level: session.user.user_metadata?.level || 1,
                        rank: session.user.user_metadata?.rank || 'bronze',
                        streakCurrent: session.user.user_metadata?.streakCurrent || 0,
                        streakBest: session.user.user_metadata?.streakBest || 0,
                        createdAt: session.user.created_at
                    };
                    set({ user: mappedUser, isAuthenticated: true, isGuest: false });
                }

                supabase.auth.onAuthStateChange((_event, session) => {
                    if (session?.user) {
                        const mappedUser: User = {
                            id: session.user.id,
                            email: session.user.email || '',
                            username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User',
                            xp: session.user.user_metadata?.xp || 0,
                            level: session.user.user_metadata?.level || 1,
                            rank: session.user.user_metadata?.rank || 'bronze',
                            streakCurrent: session.user.user_metadata?.streakCurrent || 0,
                            streakBest: session.user.user_metadata?.streakBest || 0,
                            createdAt: session.user.created_at
                        };
                        set({ user: mappedUser, isAuthenticated: true, isGuest: false });
                    } else {
                        // Keep guest mode if not explicitly logged out? 
                        // Or reset? For now, if no session, assume logged out unless guest.
                        // Actually, this might conflict with 'Guest' mode if we aren't careful.
                        // We will let explicit logout handle clearing, but if session expires, we might want to clear.
                    }
                });
            },

            addXP: (amount) => {
                const { user } = get();
                if (!user) return;

                const newXP = user.xp + amount;
                const newLevel = calculateLevel(newXP);
                const newRank = getRank(newXP);

                // Check for level up
                if (newLevel > user.level) {
                    useUIStore.getState().showLevelUp(newLevel);
                }

                set({
                    user: {
                        ...user,
                        xp: newXP,
                        level: newLevel,
                        rank: newRank
                    }
                });
            },

            setSelectedLanguage: (language) => set({ selectedLanguage: language }),

            updateStreak: () => {
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

                set({
                    user: {
                        ...user,
                        streakCurrent: newStreak,
                        streakBest: Math.max(user.streakBest, newStreak)
                    }
                });
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

    // Actions
    markComplete: (contentType: 'lesson' | 'problem' | 'challenge', contentId: string, score?: number) => void;
    isCompleted: (contentType: 'lesson' | 'problem' | 'challenge', contentId: string) => boolean;
    getProgress: (contentType: 'lesson' | 'problem' | 'challenge', contentId: string) => UserProgress | undefined;
}

export const useProgressStore = create<ProgressState>()(
    persist(
        (set, get) => ({
            progress: [],
            completedLessons: new Set(),
            completedProblems: new Set(),

            markComplete: (contentType, contentId, score) => {
                const { progress, completedLessons, completedProblems } = get();

                const newProgress: UserProgress = {
                    id: `${contentType}-${contentId}-${Date.now()}`,
                    userId: 'current',
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
