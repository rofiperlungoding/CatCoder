import React from 'react';
import {
    Calendar,
    Flame,
    Trophy,
    Code2,
    BookOpen,
    Star,
    TrendingUp,
    MapPin
} from 'lucide-react';
import { Card, Badge, Avatar, ProgressBar, Button } from '../../components/ui';
import { useUserStore, useProgressStore } from '../../stores';
import {
    calculateLevelProgress,
    getRankDisplayName,
    getRankColor,
    formatRelativeTime
} from '../../lib/utils';

export const ProfilePage: React.FC = () => {
    const { user } = useUserStore();
    const { completedLessons, completedProblems } = useProgressStore();

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <Card padding="lg" className="text-center max-w-md w-full shadow-lg border-gray-200 bg-white">
                    <div className="text-6xl mb-6">🐱</div>
                    <h2 className="text-2xl font-bold mb-3 text-gray-900">Not Logged In</h2>
                    <p className="text-gray-500 mb-6">Sign in to unlock your full coding profile and track your progress.</p>
                </Card>
            </div>
        );
    }

    const levelProgress = calculateLevelProgress(user.xp);
    const lessonsCompleted = completedLessons.size;
    const problemsSolved = completedProblems.size;

    const stats = [
        { icon: BookOpen, label: 'Lessons', value: lessonsCompleted, color: 'text-blue-500', bg: 'bg-blue-50' },
        { icon: Code2, label: 'Problems', value: problemsSolved, color: 'text-green-500', bg: 'bg-green-50' },
        { icon: Flame, label: 'Current Streak', value: user.streakCurrent, color: 'text-orange-500', bg: 'bg-orange-50' },
        { icon: Star, label: 'Best Streak', value: user.streakBest, color: 'text-yellow-500', bg: 'bg-yellow-50' }
    ];

    // Mock recent activity
    const activities = [
        { id: 1, type: 'lesson', title: 'Completed "Introduction to Python"', xp: 50, time: '2 mins ago' },
        { id: 2, type: 'problem', title: 'Solved "Two Sum"', xp: 75, time: '1 hour ago' },
        { id: 3, type: 'achievement', title: 'Earned "Problem Solver" Badge', xp: 0, time: '1 day ago' },
    ];

    return (
        <div className="min-h-screen py-10 px-6 max-w-6xl mx-auto">
            {/* Profile Header Block */}
            <Card padding="none" className="mb-8 overflow-hidden bg-white border-gray-200 shadow-sm">
                {/* Cover Image/Banner */}
                <div className="h-32 bg-gradient-to-r from-orange-400 to-amber-300"></div>

                <div className="px-8 pb-8">
                    <div className="flex flex-col md:flex-row items-end -mt-12 gap-6 relative z-10">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="p-1.5 bg-white rounded-full">
                                <Avatar
                                    src={user.avatarUrl}
                                    fallback={user.username.charAt(0).toUpperCase()}
                                    size="xl"
                                    className="w-32 h-32 text-4xl shadow-md border-2 border-gray-100"
                                />
                            </div>
                            <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-gray-900 border-4 border-white flex items-center justify-center text-white font-bold text-sm shadow-sm" title="Level">
                                {user.level}
                            </div>
                        </div>

                        {/* Name & Title */}
                        <div className="flex-1 text-center md:text-left mb-2 md:mb-0">
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">{user.username}</h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <Badge className={`px-3 py-1 ${getRankColor(user.rank)} bg-opacity-10 rounded-full`}>
                                    <Trophy size={14} className="mr-1.5" />
                                    {getRankDisplayName(user.rank)}
                                </Badge>
                                <span className="text-gray-500 text-sm flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    Joined {formatRelativeTime(user.createdAt)}
                                </span>
                                <span className="text-gray-500 text-sm flex items-center gap-1.5">
                                    <MapPin size={14} />
                                    Global
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-4 md:mt-0">
                            <Button variant="secondary" className="gap-2">
                                Edit Profile
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & XP */}
                <div className="space-y-8">
                    {/* Level Progress */}
                    <Card padding="md" className="bg-white border-gray-200 shadow-sm">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Level Progress</h3>
                                <div className="text-3xl font-bold text-gray-900 mt-1">{user.xp.toLocaleString()} <span className="text-sm text-gray-400 font-normal">XP</span></div>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-medium text-orange-600">{Math.round(levelProgress.percentage)}%</span>
                            </div>
                        </div>
                        <ProgressBar value={Math.round(levelProgress.percentage)} max={100} size="md" className="mb-2" />
                        <p className="text-xs text-gray-400">Next level at {((user.level + 1) * 1000).toLocaleString()} XP</p>
                    </Card>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {stats.map((stat, i) => (
                            <Card key={i} padding="md" className="bg-white border-gray-200 text-center hover:shadow-md transition-shadow">
                                <div className={`w-10 h-10 mx-auto rounded-lg ${stat.bg} flex items-center justify-center mb-3 ${stat.color}`}>
                                    <stat.icon size={20} />
                                </div>
                                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">{stat.label}</div>
                            </Card>
                        ))}
                    </div>

                    {/* Badges / Achievements Preview */}
                    <Card padding="md" className="bg-white border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900">Achievements</h3>
                            <Button variant="ghost" size="sm" className="text-xs text-orange-600 hover:text-orange-700 p-0 hover:bg-transparent">View All</Button>
                        </div>
                        <div className="flex gap-2">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xl grayscale opacity-50 cursor-help" title="Locked">
                                    🏆
                                </div>
                            ))}
                            <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-xl" title="First Steps">
                                🚀
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Activity & Charts */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Activity Feed */}
                    <Card padding="lg" className="bg-white border-gray-200 shadow-sm h-full">
                        <h3 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-2">
                            <TrendingUp size={20} className="text-gray-400" />
                            Recent Activity
                        </h3>

                        <div className="relative pl-4 border-l-2 border-gray-100 space-y-8">
                            {activities.map((activity) => (
                                <div key={activity.id} className="relative">
                                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-white border-2 border-orange-400"></div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900">{activity.title}</p>
                                            <span className="text-xs text-green-500 font-medium">+{activity.xp} XP</span>
                                        </div>
                                        <span className="text-xs text-gray-400">{activity.time}</span>
                                    </div>
                                </div>
                            ))}

                            {/* Empty State spacer */}
                            <div className="relative pt-4">
                                <div className="absolute -left-[21px] top-5 w-3 h-3 rounded-full bg-gray-200"></div>
                                <p className="text-sm text-gray-400 italic">No more recent activity</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
