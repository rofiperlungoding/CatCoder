import React from 'react';
import { Link } from 'react-router-dom';
import {
    Play,
    Trophy,
    Flame,
    ArrowRight,
    Code,
    Target
} from 'lucide-react';
import { Button, ProgressBar, Badge } from '../../components/ui';
import { useUserStore } from '../../stores';

export const HomePage: React.FC = () => {
    const { user, isGuest } = useUserStore();

    if (!user && !isGuest) {
        return (
            <div className="bento-grid">
                <div className="bento-card col-span-full min-h-[60vh] flex flex-col items-center justify-center text-center p-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-slate-900">
                        Master Coding. <br />
                        <span className="text-indigo-600">Build Your Future.</span>
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mb-8 leading-relaxed">
                        The enterprise-grade platform for aspiring developers.
                        Learn Python, JavaScript, and C++ with interactive lessons and real-world challenges.
                    </p>
                    <div className="flex gap-4">
                        <Link to="/learn">
                            <Button size="lg" className="rounded-xl shadow-lg shadow-indigo-500/20">Start Learning Free</Button>
                        </Link>
                        <Link to="/practice">
                            <Button variant="secondary" size="lg" className="rounded-xl">Explore Problems</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header / Welcome Bento */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Welcome back, {user?.username || 'Guest'}
                    </h1>
                    <p className="text-slate-500">Here's what's happening today.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" size="sm" className="hidden md:flex">
                        <Code size={16} className="mr-2" />
                        Daily Code
                    </Button>
                </div>
            </div>

            {/* Main Bento Grid */}
            <div className="bento-grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 auto-rows-[minmax(180px,auto)]">

                {/* 1. Hero / Continue Learning (2x2 or 2x1) */}
                <div className="bento-card md:col-span-2 lg:col-span-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <Badge variant="primary" className="mb-3">Current Course</Badge>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Python Fundamentals</h2>
                            <p className="text-slate-500 mb-6 max-w-md">
                                Continue where you left off. You're currently on <span className="font-semibold text-slate-700">Chapter 3: Loops & Logic</span>.
                            </p>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
                                <span>Progress</span>
                                <span>45%</span>
                            </div>
                            <ProgressBar value={45} className="mb-6" />
                            <Link to="/learn">
                                <Button className="w-full sm:w-auto gap-2 group-hover:bg-slate-800">
                                    Continue Learning <ArrowRight size={16} />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 2. Stats Block (1x1) */}
                <div className="bento-card flex flex-col justify-center items-center text-center">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-3">
                        <Target size={24} />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-1">{user?.xp || 0}</h3>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total XP</p>
                </div>

                {/* 3. Streak Block (1x1) */}
                <div className="bento-card flex flex-col justify-center items-center text-center">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-3">
                        <Flame size={24} />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-1">{user?.streakCurrent || 0}</h3>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Day Streak</p>
                </div>

                {/* 4. Daily Challenge (Horizontal Strip) */}
                <div className="bento-card md:col-span-3 lg:col-span-3 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                            <span className="text-2xl font-bold">17</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Daily Challenge: Reverse Linked List</h3>
                            <p className="text-sm text-slate-500">Solve this problem directly to earn <span className="text-amber-600 font-bold">+150 XP</span>.</p>
                        </div>
                    </div>
                    <Link to="/practice/daily">
                        <Button variant="secondary" className="whitespace-nowrap">
                            Solve Now
                        </Button>
                    </Link>
                </div>

                {/* 5. Leaderboard Snippet (Vertical Tall) */}
                <div className="bento-card md:col-span-1 lg:col-span-1 md:row-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Trophy size={18} className="text-indigo-600" />
                            Top Rated
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className={`
                                    w-6 h-6 flex items-center justify-center rounded text-xs font-bold
                                    ${i === 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'}
                                `}>{i}</span>
                                <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-700 truncate">User {i}</p>
                                    <p className="text-[10px] text-slate-400">12,400 XP</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                        <Link to="/compete" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View Leaderboard</Link>
                    </div>
                </div>

                {/* 6. Recent Activity (2x1) */}
                <div className="bento-card md:col-span-3 lg:col-span-3">
                    <h3 className="font-bold text-slate-900 mb-4">Recent Activity</h3>
                    <div className="space-y-0 divider-y divide-slate-100">
                        <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <Code size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Solved Two Sum</p>
                                    <p className="text-xs text-slate-500">2 hours ago</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-emerald-600">+50 XP</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Play size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Completed Lesson: Variables</p>
                                    <p className="text-xs text-slate-500">Yesterday</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-blue-600">+100 XP</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
