import React, { useState, useEffect } from 'react';
import {
    Flame,
    Medal,
    Clock,
    Calendar
} from 'lucide-react';
import { Button, Badge, Tabs } from '../../components/ui';
import { useUserStore, useUIStore } from '../../stores';
import { formatTime } from '../../lib/utils';
import type { LeaderboardEntry } from '../../types';

// Sample leaderboard data
const sampleLeaderboard: LeaderboardEntry[] = [
    { rank: 1, user: { id: '1', username: 'CodeMaster', avatarUrl: undefined, rank: 'diamond' }, score: 45000, problemsSolved: 234 },
    { rank: 2, user: { id: '2', username: 'AlgoQueen', avatarUrl: undefined, rank: 'diamond' }, score: 42000, problemsSolved: 221 },
    { rank: 3, user: { id: '3', username: 'ByteNinja', avatarUrl: undefined, rank: 'platinum' }, score: 38000, problemsSolved: 198 },
    { rank: 4, user: { id: '4', username: 'DevWizard', avatarUrl: undefined, rank: 'platinum' }, score: 35000, problemsSolved: 187 },
    { rank: 5, user: { id: '5', username: 'HackPro', avatarUrl: undefined, rank: 'gold' }, score: 28000, problemsSolved: 156 }
];

export const CompetePage: React.FC = () => {
    const { addXP, updateStreak } = useUserStore();
    const { addToast } = useUIStore();

    const [activeTab, setActiveTab] = useState<'challenges' | 'leaderboard'>('challenges');
    const [dailyTimeLeft, setDailyTimeLeft] = useState(0);

    const handleStartChallenge = () => {
        // Mock starting/completing a challenge
        addToast('info', 'Challenge started! Timer running...');

        // Simulate completion after 2 seconds
        setTimeout(() => {
            addXP(200);
            updateStreak();
            addToast('success', 'Challenge Solved! +200 XP (Double Rewards)');
        }, 2000);
    };

    // Calculate time remaining
    useEffect(() => {
        const calculateTimeLeft = () => {
            // Mock countdown for demo
            setDailyTimeLeft(prev => (prev > 0 ? prev - 1 : 86400));
        };
        calculateTimeLeft();
    }, []);

    const tabs = [
        { id: 'challenges', label: 'Active Challenges', icon: <Flame size={16} /> },
        { id: 'leaderboard', label: 'Global Rankings', icon: <Medal size={16} /> }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">Competition Center</h1>
                    <p className="text-slate-500">Compete, rank up, and earn glory.</p>
                </div>
            </div>

            <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={(id) => setActiveTab(id as any)}
                className="mb-6"
            />

            {activeTab === 'challenges' && (
                <div className="bento-grid grid-cols-1 md:grid-cols-2">
                    {/* Daily Challenge - Featured */}
                    <div className="bento-card col-span-1 md:col-span-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-none p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-indigo-300 font-semibold tracking-wide uppercase text-xs">
                                    <Clock size={14} /> Ends in {formatTime(dailyTimeLeft)}
                                </div>
                                <h2 className="text-3xl font-bold mb-2">Daily Algorithm Challenge</h2>
                                <p className="text-slate-300 mb-6 max-w-xl">
                                    Solve today's featured problem "Matrix Rotation" to earn double XP and extend your streak.
                                </p>
                                <Button
                                    className="bg-white text-slate-900 hover:bg-indigo-50 border-none"
                                    onClick={handleStartChallenge}
                                >
                                    Start Challenge Now
                                </Button>
                            </div>
                            {/* ... trophy icon ... */}
                        </div>
                    </div>

                    {/* Weekly */}
                    <div className="bento-card border-l-4 border-l-indigo-500">
                        <Badge variant="primary" className="mb-3">Weekly Contest</Badge>
                        <h3 className="font-bold text-lg mb-2">System Design: URL Shortener</h3>
                        <p className="text-sm text-slate-500 mb-4">Design a scalable URL shortening service like bit.ly.</p>
                        <Button variant="secondary" size="sm" fullWidth>View Details</Button>
                    </div>

                    {/* Coming Soon */}
                    <div className="bento-card border-dashed border-2 bg-slate-50/50 flex flex-col items-center justify-center text-center p-8">
                        <Calendar size={32} className="text-slate-400 mb-2" />
                        <h3 className="font-semibold text-slate-500">Weekend Hackathon</h3>
                        <p className="text-xs text-slate-400">Starts in 3 days</p>
                    </div>
                </div>
            )}

            {activeTab === 'leaderboard' && (
                <div className="bento-card p-0 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Rank</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">User</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {sampleLeaderboard.map((entry) => (
                                <tr key={entry.rank} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className={`
                                            w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
                                            ${entry.rank === 1 ? 'bg-amber-100 text-amber-700' :
                                                entry.rank === 2 ? 'bg-slate-200 text-slate-700' :
                                                    entry.rank === 3 ? 'bg-orange-100 text-orange-800' : 'text-slate-500'}
                                        `}>
                                            {entry.rank}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                                            <span className="font-semibold text-slate-900">{entry.user.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono font-medium text-slate-700">
                                        {entry.score.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
