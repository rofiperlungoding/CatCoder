import React, { useState, useEffect } from 'react';
import {
    Trophy,
    Flame,
    Medal,
    Clock,
    Users,
    Crown,
    ChevronRight,
    Calendar
} from 'lucide-react';
import { Button, Card, Badge, Avatar, Tabs } from '../../components/ui';
import { useUserStore } from '../../stores';
import { formatTime } from '../../lib/utils';
import type { LeaderboardEntry } from '../../types';

// Sample leaderboard data
const sampleLeaderboard: LeaderboardEntry[] = [
    { rank: 1, user: { id: '1', username: 'CodeMaster', avatarUrl: undefined, rank: 'diamond' }, score: 45000, problemsSolved: 234 },
    { rank: 2, user: { id: '2', username: 'AlgoQueen', avatarUrl: undefined, rank: 'diamond' }, score: 42000, problemsSolved: 221 },
    { rank: 3, user: { id: '3', username: 'ByteNinja', avatarUrl: undefined, rank: 'platinum' }, score: 38000, problemsSolved: 198 },
    { rank: 4, user: { id: '4', username: 'DevWizard', avatarUrl: undefined, rank: 'platinum' }, score: 35000, problemsSolved: 187 },
    { rank: 5, user: { id: '5', username: 'HackPro', avatarUrl: undefined, rank: 'gold' }, score: 28000, problemsSolved: 156 },
    { rank: 6, user: { id: '6', username: 'CodeCat', avatarUrl: undefined, rank: 'gold' }, score: 25000, problemsSolved: 143 },
    { rank: 7, user: { id: '7', username: 'PythonPanda', avatarUrl: undefined, rank: 'gold' }, score: 22000, problemsSolved: 132 },
    { rank: 8, user: { id: '8', username: 'JSJungle', avatarUrl: undefined, rank: 'silver' }, score: 18000, problemsSolved: 112 },
    { rank: 9, user: { id: '9', username: 'CppChamp', avatarUrl: undefined, rank: 'silver' }, score: 15000, problemsSolved: 98 },
    { rank: 10, user: { id: '10', username: 'NewbieCoder', avatarUrl: undefined, rank: 'bronze' }, score: 8000, problemsSolved: 67 }
];

export const CompetePage: React.FC = () => {
    const { user } = useUserStore();
    const [activeTab, setActiveTab] = useState<'challenges' | 'leaderboard' | 'contests'>('challenges');
    const [dailyTimeLeft, setDailyTimeLeft] = useState(0);
    const [weeklyTimeLeft, setWeeklyTimeLeft] = useState(0);

    // Calculate time remaining
    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();

            // Daily resets at midnight
            const tomorrow = new Date(now);
            tomorrow.setHours(24, 0, 0, 0);
            const dailySeconds = Math.floor((tomorrow.getTime() - now.getTime()) / 1000);
            setDailyTimeLeft(dailySeconds);

            // Weekly resets on Monday
            const nextMonday = new Date(now);
            nextMonday.setDate(now.getDate() + ((8 - now.getDay()) % 7 || 7));
            nextMonday.setHours(0, 0, 0, 0);
            const weeklySeconds = Math.floor((nextMonday.getTime() - now.getTime()) / 1000);
            setWeeklyTimeLeft(weeklySeconds);
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(interval);
    }, []);

    const tabs = [
        { id: 'challenges', label: 'Challenges', icon: <Flame size={16} /> },
        { id: 'leaderboard', label: 'Leaderboard', icon: <Medal size={16} /> },
        { id: 'contests', label: 'Contests', icon: <Trophy size={16} /> }
    ];

    const getRankMedal = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return <span className="text-gray-500 font-mono">#{rank}</span>;
    };

    return (
        <div className="min-h-screen py-10 px-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold mb-3 flex items-center gap-3 text-gray-900">
                    <Trophy className="text-orange-600" size={32} />
                    Competition Center
                </h1>
                <p className="text-gray-500 text-lg">
                    Test your skills, climb the leaderboard, and earn glory
                </p>
            </div>

            {/* Tabs */}
            <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={(id) => setActiveTab(id as typeof activeTab)}
                className="mb-8"
            />

            {/* Challenges Tab */}
            {activeTab === 'challenges' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Daily Challenge */}
                    <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 overflow-hidden">
                        <div className="relative p-6 sm:p-8">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                                        <Calendar size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Daily Challenge</h2>
                                        <p className="text-blue-600 font-medium">New challenge every day at midnight</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-blue-100 shadow-sm text-blue-600 font-mono font-bold">
                                    <Clock size={16} />
                                    {formatTime(dailyTimeLeft)}
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 border border-blue-100 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Array Rotation</h3>
                                        <div className="flex gap-2">
                                            <Badge variant="warning" size="sm">Medium</Badge>
                                            <Badge variant="primary" size="sm">+150 XP</Badge>
                                            <Badge variant="info" size="sm">1.5x Multiplier</Badge>
                                        </div>
                                    </div>
                                    <Button size="lg" className="shrink-0">
                                        Start Challenge <ChevronRight size={18} className="ml-1" />
                                    </Button>
                                </div>
                                <p className="text-gray-600">
                                    Given an array, rotate it to the right by k steps. Complete before midnight to earn bonus XP!
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Weekly Challenge */}
                    <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100 overflow-hidden">
                        <div className="relative p-6 sm:p-8">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                                        <Flame size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Weekly Challenge</h2>
                                        <p className="text-purple-600 font-medium">Bigger challenge, bigger rewards</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-purple-100 shadow-sm text-purple-600 font-mono font-bold">
                                    <Clock size={16} />
                                    {formatTime(weeklyTimeLeft)}
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 border border-purple-100 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">LRU Cache Design</h3>
                                        <div className="flex gap-2">
                                            <Badge variant="danger" size="sm">Hard</Badge>
                                            <Badge variant="primary" size="sm">+500 XP</Badge>
                                            <Badge variant="info" size="sm">2x Multiplier</Badge>
                                        </div>
                                    </div>
                                    <Button variant="secondary" size="lg" className="shrink-0">
                                        View Challenge <ChevronRight size={18} className="ml-1" />
                                    </Button>
                                </div>
                                <p className="text-gray-600">
                                    Design and implement a data structure for a Least Recently Used (LRU) cache.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Leaderboard Tab */}
            {activeTab === 'leaderboard' && (
                <Card className="bg-white border-gray-200 animate-fade-in overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rank</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Coder</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Solved</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {sampleLeaderboard.map((entry) => (
                                    <tr
                                        key={entry.rank}
                                        className={`
                                            ${entry.user.id === user?.id ? 'bg-orange-50' : 'hover:bg-gray-50'} 
                                            transition-colors
                                        `}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center w-8 h-8 font-bold text-lg">
                                                {getRankMedal(entry.rank)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    src={entry.user.avatarUrl}
                                                    fallback={entry.user.username[0]}
                                                    size="sm"
                                                    className="border-2 border-white shadow-sm"
                                                />
                                                <div>
                                                    <div className="font-bold text-gray-900 flex items-center gap-2">
                                                        {entry.user.username}
                                                        {entry.rank === 1 && <Crown size={14} className="text-yellow-500 fill-yellow-500" />}
                                                    </div>
                                                    <div className="text-xs text-gray-500 capitalize">{entry.user.rank} League</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center font-medium text-gray-600">
                                            {entry.problemsSolved}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                                            {entry.score.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Contests Tab */}
            {activeTab === 'contests' && (
                <div className="grid gap-6 animate-fade-in">
                    <Card className="bg-white border-gray-200">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
                                <Trophy size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Global Coding Cup 2024</h2>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                Join thousands of developers worldwide in our annual coding championship.
                            </p>
                            <div className="flex items-center justify-center gap-6 mb-8 text-sm font-medium">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar size={18} />
                                    <span>Dec 24, 2024</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Clock size={18} />
                                    <span>10:00 AM UTC</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Users size={18} />
                                    <span>1.2k Registered</span>
                                </div>
                            </div>
                            <Button size="lg">Register Now (Free)</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};
