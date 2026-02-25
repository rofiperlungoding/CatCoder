import React from 'react';
import { Link } from 'react-router-dom';
import {
    Play,
    Trophy,
    Flame,
    ArrowRight,
    Code,
    Zap,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { Button, ProgressBar, Badge, Avatar } from '../../components/ui';
import { AILearningGuide } from '../../components/ai/AILearningGuide';
import { useUserStore } from '../../stores';
import { fetchLeaderboard } from '../../lib/leaderboard';
import { syncUserXP } from '../../lib/sync';
import type { LeaderboardEntry } from '../../types';

export const HomePage: React.FC = () => {
    const { user, recentActivities } = useUserStore();
    const [leaderboardData, setLeaderboardData] = React.useState<LeaderboardEntry[]>([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = React.useState(true);
    const [isActivityExpanded, setIsActivityExpanded] = React.useState(false);

    React.useEffect(() => {
        const loadLeaderboard = async () => {
            try {
                const data = await fetchLeaderboard(5);
                setLeaderboardData(data);
            } catch (error) {
                console.error('Failed to load leaderboard', error);
            } finally {
                setLoadingLeaderboard(false);
            }
        };

        if (user) {
            loadLeaderboard();
        }

        // Sync XP with history to ensure accuracy
        if (user) {
            syncUserXP(user.id).catch(err => console.error('XP Sync failed:', err));
        }
    }, [user]);

    if (!user) {
        return (
            <div className="bento-grid">
                <div className="bento-card col-span-full min-h-[60vh] flex flex-col items-center justify-center text-center p-12 bg-white">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-primary">
                        Master Coding. <br />
                        <span className="text-lime-500">Build Your Future.</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mb-8 leading-relaxed">
                        The enterprise-grade platform for aspiring developers.
                        Learn Python, JavaScript, and C++ with interactive lessons and real-world challenges.
                    </p>
                    <div className="flex gap-4">
                        <Link to="/learn">
                            <Button size="lg" className="shadow-xl shadow-black/5">Start Learning Free</Button>
                        </Link>
                        <Link to="/practice">
                            <Button variant="secondary" size="lg">Explore Problems</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header / Welcome */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-primary">
                        Welcome back, {user?.username || 'Guest'}
                    </h1>
                    <p className="text-muted-foreground">Here's what's happening today.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" size="sm" className="hidden md:flex rounded-full">
                        <Code size={16} className="mr-2" />
                        Daily Code
                    </Button>
                </div>
            </div>

            {/* AI Learning Guide - Prominent Placement */}
            <AILearningGuide />

            {/* Main Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">

                {/* 1. Hero / Continue Learning */}
                <div className="bento-card md:col-span-2 lg:col-span-2 relative overflow-hidden group border-0 shadow-sm">
                    <div className="absolute top-0 right-0 p-32 bg-lime-100 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Badge variant="secondary" className="bg-black/5 text-primary hover:bg-black/10">Current Course</Badge>
                            </div>
                            <h2 className="text-2xl font-bold text-primary mb-2">Python Fundamentals</h2>
                            <p className="text-muted-foreground mb-6 max-w-md">
                                Continue where you left off. You're currently on <span className="font-semibold text-primary">Chapter 3: Loops & Logic</span>.
                            </p>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-2">
                                <span>Progress</span>
                                <span>45%</span>
                            </div>
                            <ProgressBar value={45} max={100} className="mb-6 h-2" />
                            <Link to="/learn/py-intro-1">
                                <Button className="w-full sm:w-auto gap-2 group-hover:bg-black/80">
                                    Continue Learning <ArrowRight size={16} />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 2. Stats Block - XP */}
                <div className="bento-card flex flex-col justify-center items-center text-center border-0 shadow-sm hover:shadow-md transition-all">
                    <div className="w-14 h-14 bg-lime-100 dark:bg-lime-500/20 text-lime-600 dark:text-lime-400 rounded-2xl flex items-center justify-center mb-4">
                        <Zap size={28} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-3xl font-bold text-primary dark:text-white mb-1">{user?.xp || 0}</h3>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total XP</p>
                </div>

                {/* 3. Streak Block */}
                <div className="bento-card flex flex-col justify-center items-center text-center border-0 shadow-sm hover:shadow-md transition-all">
                    <div className="w-14 h-14 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mb-4">
                        <Flame size={28} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-3xl font-bold text-primary mb-1">{user?.streakCurrent || 0}</h3>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Day Streak</p>
                </div>

                {/* 4. Daily Challenge */}
                <div className="bento-card md:col-span-3 lg:col-span-3 flex flex-col md:flex-row items-center justify-between gap-6 border-0 shadow-sm bg-black text-white relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black z-0"></div>
                    <div className="absolute right-0 top-0 p-24 bg-lime-500/10 rounded-full blur-3xl translate-x-10 -translate-y-10 group-hover:bg-lime-500/20 transition-colors duration-500"></div>

                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm border border-white/10 shrink-0">
                            <span className="text-2xl font-bold">17</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold bg-lime-400 text-black px-2 py-0.5 rounded-full">DAILY</span>
                                <span className="text-xs font-medium text-white/60">Challenge</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">Reverse Linked List</h3>
                            <p className="text-sm text-white/60">Solve this problem directly to earn <span className="text-lime-400 font-bold">+150 XP</span>.</p>
                        </div>
                    </div>
                    <Link to="/practice/two-sum" className="relative z-10 w-full md:w-auto">
                        <Button className="!bg-white !text-black hover:!bg-gray-100 w-full md:w-auto whitespace-nowrap border-0 font-bold">
                            Solve Now
                        </Button>
                    </Link>
                </div>

                {/* 5. Leaderboard Snippet */}
                <div className="bento-card md:col-span-1 lg:col-span-1 md:row-span-2 border-0 shadow-sm flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-24 bg-yellow-500/10 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none"></div>

                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <h3 className="font-bold text-primary dark:text-white flex items-center gap-2 text-lg">
                            <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-600 dark:text-yellow-500">
                                <Trophy size={18} />
                            </div>
                            Leaderboard
                        </h3>
                    </div>

                    <div className="space-y-2 relative z-10 flex-1 overflow-y-auto pr-1">
                        {loadingLeaderboard ? (
                            // Simple Loading Skeleton
                            [1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center gap-3 animate-pulse py-2">
                                    <div className="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-20"></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            leaderboardData.map((entry, index) => {
                                const isCurrentUser = user?.id === entry.user.id;
                                return (
                                    <div
                                        key={entry.user.id}
                                        className={`
                                            flex items-center gap-3 p-2 rounded-xl transition-all
                                            ${isCurrentUser
                                                ? 'bg-lime-50 dark:bg-lime-900/20 border border-lime-200 dark:border-lime-800 shadow-sm'
                                                : 'hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent'
                                            }
                                        `}
                                    >
                                        <span className={`
                                            w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0
                                            ${index === 0 ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                                                index === 1 ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' :
                                                    index === 2 ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400' :
                                                        'text-muted-foreground font-semibold'}
                                        `}>
                                            {index + 1}
                                        </span>

                                        <div className="relative shrink-0">
                                            <Avatar
                                                src={entry.user.avatarUrl}
                                                fallback={entry.user.username.charAt(0).toUpperCase()}
                                                size="sm"
                                                className={`h-8 w-8 ${isCurrentUser ? 'ring-2 ring-lime-400 dark:ring-lime-500 ring-offset-2 ring-offset-white dark:ring-offset-black' : ''}`}
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className={`text-sm font-bold truncate ${isCurrentUser ? 'text-lime-700 dark:text-lime-400' : 'text-primary dark:text-white'}`}>
                                                    {isCurrentUser ? 'You' : entry.user.username}
                                                </p>
                                                {isCurrentUser && (
                                                    <Badge variant="success" size="sm" className="px-1.5 py-0 h-4 text-[9px] uppercase tracking-wide">
                                                        Me
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-muted-foreground font-medium">{entry.score.toLocaleString()} XP</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        {!loadingLeaderboard && leaderboardData.length === 0 && (
                            <div className="text-center py-6 text-muted-foreground">
                                <Trophy size={24} className="mx-auto mb-2 opacity-20" />
                                <p className="text-xs">No pioneers yet.</p>
                                <p className="text-[10px] opacity-60">Be the first to join!</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-6 pt-3 border-t border-gray-100 dark:border-white/5 text-center relative z-10">
                        <Link to="/compete" className="inline-flex items-center gap-1 text-xs font-bold text-primary dark:text-white hover:text-lime-600 dark:hover:text-lime-400 transition-colors">
                            View Full Standings <ArrowRight size={12} />
                        </Link>
                    </div>
                </div>

                {/* 6. Recent Activity */}
                <div className="bento-card md:col-span-3 lg:col-span-3 border-0 shadow-sm">
                    <h3 className="font-bold text-primary mb-6">Recent Activity</h3>
                    <div className="space-y-0 text-sm">
                        {(!recentActivities || recentActivities.length === 0) ? (
                            <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-3">
                                    <Code size={20} className="text-gray-400" />
                                </div>
                                <p>No activity yet.</p>
                                <p className="text-xs mt-1">Start learning or solving problems to see your progress!</p>
                            </div>
                        ) : (
                            <>
                                {recentActivities.slice(0, 3).map((activity) => (
                                    <div key={activity.id} className="group flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/5 rounded-xl px-2 -mx-2 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2.5 rounded-xl group-hover:scale-110 transition-transform ${activity.type === 'lesson_completed' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                                                activity.type === 'problem_solved' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                                                    activity.type === 'level_up' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' :
                                                        'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                                                }`}>
                                                {activity.type === 'lesson_completed' ? <Play size={18} /> :
                                                    activity.type === 'problem_solved' ? <Code size={18} /> :
                                                        activity.type === 'level_up' ? <Zap size={18} /> :
                                                            <Trophy size={18} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-primary dark:text-white">{activity.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(activity.timestamp).toLocaleDateString()} • {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        {activity.xpEarned > 0 && (
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${activity.type === 'problem_solved' ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' :
                                                'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                                                }`}>+{activity.xpEarned} XP</span>
                                        )}
                                    </div>
                                ))}

                                {/* Collapsible Section */}
                                <div className={`grid transition-all duration-500 ease-in-out ${isActivityExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                    <div className="overflow-hidden">
                                        {recentActivities.slice(3).map((activity) => (
                                            <div key={activity.id} className="group flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/5 rounded-xl px-2 -mx-2 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2.5 rounded-xl group-hover:scale-110 transition-transform ${activity.type === 'lesson_completed' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :
                                                        activity.type === 'problem_solved' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                                                            activity.type === 'level_up' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' :
                                                                'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                                                        }`}>
                                                        {activity.type === 'lesson_completed' ? <Play size={18} /> :
                                                            activity.type === 'problem_solved' ? <Code size={18} /> :
                                                                activity.type === 'level_up' ? <Zap size={18} /> :
                                                                    <Trophy size={18} />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-primary dark:text-white">{activity.title}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(activity.timestamp).toLocaleDateString()} • {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                {activity.xpEarned > 0 && (
                                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${activity.type === 'problem_solved' ? 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400' :
                                                        'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                                                        }`}>+{activity.xpEarned} XP</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Toggle Button */}
                                {recentActivities.length > 3 && (
                                    <div className="pt-2 text-center border-t border-gray-50 dark:border-white/5 mt-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsActivityExpanded(!isActivityExpanded)}
                                            className="text-xs font-bold text-muted-foreground hover:text-primary gap-2"
                                        >
                                            {isActivityExpanded ? (
                                                <>Show Less <ChevronUp size={14} /></>
                                            ) : (
                                                <>View All Activity <ChevronDown size={14} /></>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
