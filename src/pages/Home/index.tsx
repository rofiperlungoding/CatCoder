import React from 'react';
import { Link } from 'react-router-dom';
import {
    Play,
    Trophy,
    Flame,
    ArrowRight,
    Code,
    Target,
    Zap
} from 'lucide-react';
import { Button, ProgressBar, Badge } from '../../components/ui';
import { useUserStore } from '../../stores';

export const HomePage: React.FC = () => {
    const { user, isGuest } = useUserStore();

    if (!user && !isGuest) {
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

            {/* Main Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">

                {/* 1. Hero / Continue Learning */}
                <div className="bento-card md:col-span-2 lg:col-span-2 relative overflow-hidden group border-0 shadow-sm">
                    <div className="absolute top-0 right-0 p-32 bg-lime-100 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Badge variant="default" className="bg-black/5 text-primary hover:bg-black/10">Current Course</Badge>
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
                    <div className="w-14 h-14 bg-lime-100/50 text-lime-600 rounded-full flex items-center justify-center mb-4">
                        <Zap size={28} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-3xl font-bold text-primary mb-1">{user?.xp || 0}</h3>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total XP</p>
                </div>

                {/* 3. Streak Block */}
                <div className="bento-card flex flex-col justify-center items-center text-center border-0 shadow-sm hover:shadow-md transition-all">
                    <div className="w-14 h-14 bg-orange-100/50 text-orange-600 rounded-full flex items-center justify-center mb-4">
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
                        <Button className="bg-white text-black hover:bg-gray-100 w-full md:w-auto whitespace-nowrap border-0">
                            Solve Now
                        </Button>
                    </Link>
                </div>

                {/* 5. Leaderboard Snippet */}
                <div className="bento-card md:col-span-1 lg:col-span-1 md:row-span-2 border-0 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-primary flex items-center gap-2">
                            <Trophy size={18} className="text-yellow-500" />
                            Top Rated
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className={`
                                    w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                                    ${i === 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}
                                `}>{i}</span>
                                <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200"></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-primary truncate">User {i}</p>
                                    <p className="text-[10px] text-muted-foreground">12,400 XP</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 pt-4 border-t border-gray-100 text-center">
                        <Link to="/compete" className="text-xs font-bold text-primary hover:underline">View Leaderboard</Link>
                    </div>
                </div>

                {/* 6. Recent Activity */}
                <div className="bento-card md:col-span-3 lg:col-span-3 border-0 shadow-sm">
                    <h3 className="font-bold text-primary mb-6">Recent Activity</h3>
                    <div className="space-y-0 text-sm">
                        <div className="group flex items-center justify-between py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 rounded-xl px-2 -mx-2 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-green-50 text-green-600 rounded-xl group-hover:scale-110 transition-transform">
                                    <Code size={18} />
                                </div>
                                <div>
                                    <p className="font-bold text-primary">Solved Two Sum</p>
                                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+50 XP</span>
                        </div>
                        <div className="group flex items-center justify-between py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 rounded-xl px-2 -mx-2 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                                    <Play size={18} />
                                </div>
                                <div>
                                    <p className="font-bold text-primary">Completed Lesson: Variables</p>
                                    <p className="text-xs text-muted-foreground">Yesterday</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">+100 XP</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
