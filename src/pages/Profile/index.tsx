import React from 'react';
import {
    Flame,
    Code2,
    BookOpen,
    MapPin,
    Settings
} from 'lucide-react';
import { Avatar, ProgressBar, Button } from '../../components/ui';
import { useUserStore, useProgressStore } from '../../stores';
import { calculateLevelProgress } from '../../lib/utils';

export const ProfilePage: React.FC = () => {
    const { user } = useUserStore();
    const { completedLessons, completedProblems } = useProgressStore();

    if (!user) return null;

    const levelProgress = calculateLevelProgress(user.xp);

    return (
        <div className="space-y-6">
            {/* Cover & Profile Header - Bento Style */}
            <div className="bento-card p-0 overflow-hidden">
                <div className="h-32 bg-slate-900 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-slate-900 opacity-50"></div>
                    <Button variant="ghost" className="absolute top-4 right-4 text-white hover:bg-white/10">
                        <Settings size={18} />
                    </Button>
                </div>
                <div className="px-8 pb-8 relative">
                    <div className="flex flex-col md:flex-row items-end gap-6 -mt-12">
                        <div className="p-1 bg-white rounded-full">
                            <Avatar
                                src={user.avatarUrl}
                                fallback={user.username[0]}
                                size="xl"
                                className="w-32 h-32 border-4 border-white shadow-sm" // Override size for bento feel
                            />
                        </div>
                        <div className="flex-1 mb-2">
                            <h1 className="text-2xl font-bold text-slate-900">{user.username}</h1>
                            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                <span className="flex items-center gap-1"><MapPin size={14} /> Global</span>
                                <span>•</span>
                                <span>Joined Dec 2024</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="secondary" size="sm">Edit Profile</Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bento-grid grid-cols-1 md:grid-cols-3">
                {/* Left Col: Stats */}
                <div className="bento-card col-span-1 space-y-6">
                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-sm font-bold text-slate-900">Level {user.level}</span>
                            <span className="text-xs font-mono text-slate-400">{user.xp} XP</span>
                        </div>
                        <ProgressBar value={levelProgress.percentage} max={100} size="sm" />
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600"><Code2 size={18} /></div>
                                <span className="text-sm font-medium text-slate-600">Problems</span>
                            </div>
                            <span className="font-bold text-slate-900">{completedProblems.size}</span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-emerald-600"><BookOpen size={18} /></div>
                                <span className="text-sm font-medium text-slate-600">Lessons</span>
                            </div>
                            <span className="font-bold text-slate-900">{completedLessons.size}</span>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm text-amber-600"><Flame size={18} /></div>
                                <span className="text-sm font-medium text-slate-600">Streak</span>
                            </div>
                            <span className="font-bold text-slate-900">{user.streakCurrent} days</span>
                        </div>
                    </div>
                </div>

                {/* Right Col: Activity Graph (Placeholder) */}
                <div className="bento-card md:col-span-2">
                    <h3 className="font-bold text-slate-900 mb-4">Contribution Graph</h3>
                    <div className="grid grid-cols-12 gap-1 gap-y-1 h-32">
                        {Array.from({ length: 84 }).map((_, i) => (
                            <div
                                key={i}
                                className={`rounded-sm ${Math.random() > 0.7 ? 'bg-indigo-500' : Math.random() > 0.4 ? 'bg-indigo-200' : 'bg-slate-100'}`}
                            ></div>
                        ))}
                    </div>
                    <div className="mt-4 flex items-center justify-end text-xs text-slate-400 gap-2">
                        <span>Less</span>
                        <div className="flex gap-1">
                            <div className="w-3 h-3 bg-slate-100 rounded-sm"></div>
                            <div className="w-3 h-3 bg-indigo-200 rounded-sm"></div>
                            <div className="w-3 h-3 bg-indigo-500 rounded-sm"></div>
                        </div>
                        <span>More</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
