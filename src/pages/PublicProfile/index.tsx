import { ProgrammingFlagIcon, BookOpen01Icon, Location01Icon, Share01Icon, FireIcon, ArrowLeft01Icon, GithubIcon, CheckmarkBadge01Icon } from '@hugeicons/core-free-icons';
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Icon, Avatar, Button } from '../../components/ui';
import { PublicContributionGraph } from '../../components/profile/PublicContributionGraph';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { calculateLevelProgress } from '../../lib/utils';

interface PublicUser {
    id: string;
    username: string;
    avatarUrl?: string;
    xp: number;
    level: number;
    rank: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    streakCurrent: number;
    streakBest: number;
    createdAt: string;
}

interface PublicStats {
    completedProblems: number;
    completedLessons: number;
}

export const PublicProfilePage: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const [user, setUser] = useState<PublicUser | null>(null);
    const [stats, setStats] = useState<PublicStats>({ completedProblems: 0, completedLessons: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchPublicProfile = async () => {
            if (!username) {
                setError('Username tidak ditemukan');
                setIsLoading(false);
                return;
            }

            if (!isSupabaseConfigured()) {
                setError('Database tidak tersedia');
                setIsLoading(false);
                return;
            }

            try {
                // Fetch profile by username
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('username', username)
                    .maybeSingle();

                if (profileError) {
                    console.error('Error fetching profile:', profileError);
                    setError('Gagal memuat profil');
                    setIsLoading(false);
                    return;
                }

                if (!profileData) {
                    setError('Profil tidak ditemukan');
                    setIsLoading(false);
                    return;
                }

                const publicUser: PublicUser = {
                    id: profileData.id,
                    username: profileData.username,
                    avatarUrl: profileData.avatar_url || undefined,
                    xp: profileData.xp || 0,
                    level: profileData.level || 1,
                    rank: (profileData.rank as PublicUser['rank']) || 'bronze',
                    streakCurrent: profileData.streak_current || 0,
                    streakBest: profileData.streak_best || 0,
                    createdAt: profileData.created_at || new Date().toISOString()
                };

                setUser(publicUser);

                // Fetch user stats (completed problems and lessons)
                const { data: progressData } = await supabase
                    .from('user_progress')
                    .select('content_type')
                    .eq('user_id', profileData.id)
                    .eq('status', 'completed');

                if (progressData) {
                    const problems = progressData.filter(p => p.content_type === 'problem').length;
                    const lessons = progressData.filter(p => p.content_type === 'lesson').length;
                    setStats({ completedProblems: problems, completedLessons: lessons });
                }

            } catch (err) {
                console.error('Error:', err);
                setError('Terjadi kesalahan');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPublicProfile();
    }, [username]);

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const formatJoinDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const levelProgress = user ? calculateLevelProgress(user.xp) : { current: 0, required: 100, percentage: 0 };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white animate-pulse">
                        <Icon icon={GithubIcon} size={32} />
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">Memuat profil...</div>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                        <Icon icon={GithubIcon} size={40} className="text-gray-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {error || 'Profil tidak ditemukan'}
                    </h1>
                    <p className="text-muted-foreground mb-6">
                        Coder dengan username "{username}" tidak ditemukan. Mungkin mereka belum bergabung dengan CatCoder.
                    </p>
                    <Link to="/">
                        <Button className="gap-2">
                            <Icon icon={ArrowLeft01Icon} size={16} />
                            Kembali ke Beranda
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background">
            {/* Header */}
            <header className="bg-white dark:bg-card border-b border-gray-100 dark:border-border sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                            <Icon icon={GithubIcon} size={24} />
                        </div>
                        <span className="font-bold text-xl">CatCoder</span>
                    </Link>
                    <Button
                        variant="secondary"
                        onClick={handleShare}
                        className="gap-2"
                    >
                        {copied ? <Icon icon={CheckmarkBadge01Icon} size={16} className="text-lime-500" /> : <Icon icon={Share01Icon} size={16} />}
                        {copied ? 'Tersalin!' : 'Bagikan'}
                    </Button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
                {/* Profile Header */}
                <div className="bg-white dark:bg-card rounded-[2.5rem] p-0 overflow-hidden shadow-sm border border-gray-100 dark:border-border">
                    {/* Banner */}
                    <div className="h-48 md:h-64 bg-zinc-900 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-lime-500/10 rounded-full blur-[100px] -mr-24 -mt-24 pointer-events-none"></div>
                        <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
                    </div>

                    <div className="px-6 md:px-10 pb-8 md:pb-10 relative">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 -mt-16 md:-mt-20">
                            {/* Avatar */}
                            <div className="p-2 bg-white dark:bg-card rounded-[2rem] shadow-xl shadow-black/5">
                                <Avatar
                                    src={user.avatarUrl}
                                    fallback={user.username[0]}
                                    size="xl"
                                    className="w-28 h-28 md:w-36 md:h-36 !rounded-[1.5rem] md:!rounded-[2rem] bg-gray-50 dark:bg-muted text-2xl md:text-3xl font-bold text-slate-700 dark:text-slate-300"
                                />
                            </div>

                            {/* User Info */}
                            <div className="flex-1 text-center md:text-left mb-0 md:mb-3">
                                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
                                    {user.username}
                                </h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 text-sm font-medium text-muted-foreground">
                                    <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                        <Icon icon={Location01Icon} size={16} /> Global
                                    </span>
                                    <span className="hidden md:block w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                    <span className="text-gray-500 dark:text-gray-400">
                                        Bergabung {formatJoinDate(user.createdAt)}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${user.rank === 'diamond' ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800' :
                                            user.rank === 'platinum' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800' :
                                                user.rank === 'gold' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800' :
                                                    user.rank === 'silver' ? 'bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700' :
                                                        'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800'
                                        }`}>
                                        {user.rank}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {/* Stats */}
                    <div className="bg-white dark:bg-card rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-gray-100 dark:border-border h-full flex flex-col gap-6 md:gap-8">
                        <div>
                            <div className="flex justify-between items-end mb-3">
                                <span className="text-lg font-bold text-primary dark:text-white">Level {user.level}</span>
                                <span className="text-xs font-bold text-lime-600 bg-lime-50 dark:bg-lime-900/30 dark:text-lime-400 px-2 py-1 rounded-full">
                                    {levelProgress.current} XP / {levelProgress.required} XP
                                </span>
                            </div>
                            <div className="h-3 bg-gray-100 dark:bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-lime-500 rounded-full transition-all duration-500"
                                    style={{ width: `${levelProgress.percentage}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-3 font-medium">
                                {levelProgress.required - levelProgress.current} XP untuk Level {user.level + 1}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 md:p-5 bg-gray-50 dark:bg-muted/50 rounded-[1.25rem] md:rounded-[1.5rem] flex items-center justify-between group hover:bg-gray-100/80 dark:hover:bg-muted transition-colors">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="p-2 md:p-2.5 bg-white dark:bg-card rounded-lg md:rounded-xl shadow-sm text-primary dark:text-white group-hover:scale-110 transition-transform">
                                        <Icon icon={ProgrammingFlagIcon} size={18} />
                                    </div>
                                    <span className="text-sm font-bold text-muted-foreground">Problems</span>
                                </div>
                                <span className="font-bold text-lg md:text-xl text-primary dark:text-white">{stats.completedProblems}</span>
                            </div>
                            <div className="p-4 md:p-5 bg-gray-50 dark:bg-muted/50 rounded-[1.25rem] md:rounded-[1.5rem] flex items-center justify-between group hover:bg-gray-100/80 dark:hover:bg-muted transition-colors">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="p-2 md:p-2.5 bg-white dark:bg-card rounded-lg md:rounded-xl shadow-sm text-lime-600 dark:text-lime-400 group-hover:scale-110 transition-transform">
                                        <Icon icon={BookOpen01Icon} size={18} />
                                    </div>
                                    <span className="text-sm font-bold text-muted-foreground">Lessons</span>
                                </div>
                                <span className="font-bold text-lg md:text-xl text-primary dark:text-white">{stats.completedLessons}</span>
                            </div>
                            <div className="p-4 md:p-5 bg-gray-50 dark:bg-muted/50 rounded-[1.25rem] md:rounded-[1.5rem] flex items-center justify-between group hover:bg-gray-100/80 dark:hover:bg-muted transition-colors">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="p-2 md:p-2.5 bg-white dark:bg-card rounded-lg md:rounded-xl shadow-sm text-orange-500 dark:text-orange-400 group-hover:scale-110 transition-transform">
                                        <Icon icon={FireIcon} size={18} />
                                    </div>
                                    <span className="text-sm font-bold text-muted-foreground">Streak</span>
                                </div>
                                <span className="font-bold text-lg md:text-xl text-primary dark:text-white">{user.streakCurrent} hari</span>
                            </div>
                        </div>
                    </div>

                    {/* Contribution Graph */}
                    <div className="md:col-span-2 bg-white dark:bg-card rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-gray-100 dark:border-border h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-primary dark:text-white">Contribution Graph</h3>
                            <div className="text-sm text-muted-foreground font-medium">12 Bulan Terakhir</div>
                        </div>

                        <PublicContributionGraph userId={user.id} className="flex-1 flex flex-col justify-center" />
                    </div>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-r from-lime-500 to-lime-600 rounded-[2rem] p-8 text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Mulai Coding Journey Kamu!</h2>
                    <p className="text-lime-100 mb-6">Bergabung dengan CatCoder dan tingkatkan skill coding kamu secara gratis.</p>
                    <Link to="/login">
                        <Button className="bg-white text-lime-600 hover:bg-lime-50 font-bold px-8 py-3 h-auto">
                            Daftar Gratis Sekarang
                        </Button>
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-card border-t border-gray-100 dark:border-border mt-12">
                <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
                    <p>© 2024 CatCoder. 100% Gratis untuk Semua.</p>
                </div>
            </footer>
        </div>
    );
};

export default PublicProfilePage;
