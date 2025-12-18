import React, { useState, useEffect } from 'react';
import {
    Flame,
    Medal,
    Clock,
    Calendar,
    Trophy,
    ArrowRight
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
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-primary mb-2 flex items-center gap-2">
                        Competition Center
                        <Trophy size={24} className="text-yellow-500" />
                    </h1>
                    <p className="text-muted-foreground">Compete, rank up, and earn glory among peers.</p>
                </div>
            </div>

            <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={(id) => setActiveTab(id as any)}
                className="mb-8"
            />

            {activeTab === 'challenges' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Daily Challenge - Featured */}
                    <div className="col-span-1 md:col-span-2 bg-primary text-white rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-xl shadow-black/5">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-lime-500/20 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                            <div className="max-w-xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-lime-400 font-semibold tracking-wide uppercase text-xs mb-4">
                                    <Clock size={14} /> Ends in {formatTime(dailyTimeLeft)}
                                </div>
                                <h2 className="text-4xl font-bold mb-4">Daily Algorithm Challenge</h2>
                                <p className="text-white/70 mb-8 text-lg leading-relaxed">
                                    Solve today's featured problem <span className="text-white font-semibold">"Matrix Rotation"</span> to earn double XP and extend your streak.
                                </p>
                                <Button
                                    className="bg-lime-400 text-black hover:bg-lime-500 border-none px-8 py-6 text-lg rounded-full font-bold shadow-lg shadow-lime-900/10"
                                    onClick={handleStartChallenge}
                                >
                                    Start Challenge Now
                                </Button>
                            </div>

                            <div className="hidden md:flex flex-col items-center justify-center w-32 h-32 bg-white/5 rounded-[2.5rem] backdrop-blur-md border border-white/10">
                                <span className="text-3xl">🔥</span>
                                <span className="text-xs font-bold mt-2 text-white/50">200 XP</span>
                            </div>
                        </div>
                    </div>

                    {/* Weekly */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all border border-gray-100 flex flex-col justify-between">
                        <div>
                            <Badge variant="secondary" className="mb-4 bg-gray-100 text-primary border-transparent">Weekly Contest</Badge>
                            <h3 className="font-bold text-xl mb-3 text-primary">System Design: URL Shortener</h3>
                            <p className="text-muted-foreground mb-6 leading-relaxed">Design a scalable URL shortening service like bit.ly. Focus on database schema and API.</p>
                        </div>
                        <Button variant="secondary" className="w-full rounded-full border-gray-200 hover:bg-gray-50 group">
                            View Details <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>

                    {/* Coming Soon */}
                    <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                            <Calendar size={28} className="text-gray-400" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-500 mb-1">Weekend Hackathon</h3>
                        <p className="text-sm text-gray-400 font-medium">Starts in 3 days</p>
                    </div>
                </div>
            )}

            {activeTab === 'leaderboard' && (
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Rank</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {sampleLeaderboard.map((entry) => (
                                    <tr key={entry.rank} className="group hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className={`
                                                w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm
                                                ${entry.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                                                    entry.rank === 2 ? 'bg-gray-100 text-gray-700' :
                                                        entry.rank === 3 ? 'bg-orange-100 text-orange-800' : 'bg-white border border-gray-100 text-gray-500'}
                                            `}>
                                                {entry.rank}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-lg">
                                                    🐱
                                                </div>
                                                <div>
                                                    <span className="font-bold text-primary block group-hover:text-lime-600 transition-colors">{entry.user.username}</span>
                                                    <span className="text-xs text-muted-foreground font-medium capitalize">{entry.user.rank} League</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="font-bold text-primary">{entry.score.toLocaleString()} XP</div>
                                            <div className="text-xs text-muted-foreground">{entry.problemsSolved} Solved</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
