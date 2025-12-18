import React from 'react';
import {
    Flame,
    Code2,
    BookOpen,
    MapPin,
    Settings,
    Edit2
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
        <div className="space-y-8">
            {/* Cover & Profile Header - Bento Style */}
            <div className="bg-white rounded-[2.5rem] p-0 overflow-hidden shadow-sm border border-gray-100">
                <div className="h-48 bg-primary relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-lime-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
                    <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>

                    <Button variant="ghost" className="absolute top-6 right-6 text-white hover:bg-white/10 rounded-full p-2 h-auto">
                        <Settings size={20} />
                    </Button>
                </div>
                <div className="px-10 pb-10 relative">
                    <div className="flex flex-col md:flex-row items-end gap-8 -mt-16">
                        <div className="p-1.5 bg-white rounded-[2rem] shadow-xl shadow-black/5">
                            <Avatar
                                src={user.avatarUrl}
                                fallback={user.username[0]}
                                size="xl"
                                className="w-32 h-32 rounded-[1.8rem] bg-gray-100/50"
                            />
                        </div>
                        <div className="flex-1 mb-2">
                            <h1 className="text-3xl font-bold text-primary mb-1">{user.username}</h1>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                                <span className="flex items-center gap-1.5"><MapPin size={16} /> Global</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span>Joined Dec 2024</span>
                                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-bold text-primary border border-gray-200 uppercase tracking-wide">Pro Member</span>
                            </div>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                            <Button variant="outline" size="sm" className="rounded-full border-gray-200 hover:bg-gray-50">
                                Share Profile
                            </Button>
                            <Button size="sm" className="rounded-full flex gap-2">
                                <Edit2 size={14} /> Edit Profile
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Col: Stats */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 h-full flex flex-col gap-8">
                    <div>
                        <div className="flex justify-between items-end mb-3">
                            <span className="text-lg font-bold text-primary">Level {user.level}</span>
                            <span className="text-xs font-bold text-lime-600 bg-lime-50 px-2 py-1 rounded-full">{user.xp} XP / {levelProgress.nextLevelXp} XP</span>
                        </div>
                        <ProgressBar value={levelProgress.percentage} max={100} size="md" className="h-3" />
                        <p className="text-xs text-muted-foreground mt-3 font-medium">
                            {levelProgress.xpToNextLevel} XP needed for Level {user.level + 1}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="p-5 bg-gray-50 rounded-[1.5rem] flex items-center justify-between group hover:bg-gray-100/80 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-white rounded-xl shadow-sm text-primary group-hover:scale-110 transition-transform"><Code2 size={20} /></div>
                                <span className="text-sm font-bold text-muted-foreground">Problems</span>
                            </div>
                            <span className="font-bold text-xl text-primary">{completedProblems.size}</span>
                        </div>
                        <div className="p-5 bg-gray-50 rounded-[1.5rem] flex items-center justify-between group hover:bg-gray-100/80 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-white rounded-xl shadow-sm text-lime-600 group-hover:scale-110 transition-transform"><BookOpen size={20} /></div>
                                <span className="text-sm font-bold text-muted-foreground">Lessons</span>
                            </div>
                            <span className="font-bold text-xl text-primary">{completedLessons.size}</span>
                        </div>
                        <div className="p-5 bg-gray-50 rounded-[1.5rem] flex items-center justify-between group hover:bg-gray-100/80 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-white rounded-xl shadow-sm text-orange-500 group-hover:scale-110 transition-transform"><Flame size={20} /></div>
                                <span className="text-sm font-bold text-muted-foreground">Streak</span>
                            </div>
                            <span className="font-bold text-xl text-primary">{user.streakCurrent} days</span>
                        </div>
                    </div>
                </div>

                {/* Right Col: Activity Graph */}
                <div className="md:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-primary">Contribution Graph</h3>
                        <div className="text-sm text-muted-foreground font-medium">Last 12 Months</div>
                    </div>

                    <div className="grid grid-cols-12 gap-2 h-48 content-center">
                        {Array.from({ length: 84 }).map((_, i) => {
                            const active = Math.random();
                            let colorClass = 'bg-gray-100';
                            if (active > 0.8) colorClass = 'bg-lime-500';
                            else if (active > 0.6) colorClass = 'bg-lime-300';
                            else if (active > 0.4) colorClass = 'bg-lime-200';

                            return (
                                <div
                                    key={i}
                                    className={`rounded-lg w-full h-full transition-all hover:scale-110 cursor-pointer ${colorClass}`}
                                    title={`Day ${i}`}
                                ></div>
                            );
                        })}
                    </div>

                    <div className="mt-8 flex items-center justify-end text-xs font-bold text-muted-foreground gap-3">
                        <span>Less</span>
                        <div className="flex gap-1.5">
                            <div className="w-4 h-4 bg-gray-100 rounded-md"></div>
                            <div className="w-4 h-4 bg-lime-200 rounded-md"></div>
                            <div className="w-4 h-4 bg-lime-300 rounded-md"></div>
                            <div className="w-4 h-4 bg-lime-500 rounded-md"></div>
                        </div>
                        <span>More</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
