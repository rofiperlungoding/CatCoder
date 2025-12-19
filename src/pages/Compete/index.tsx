import React, { useState } from 'react';
import {
    Zap,
    Clock,
    Trophy,
    Timer,
    ArrowUpRight,
    Search
} from 'lucide-react';
import { Badge, Button } from '../../components/ui';
import { useUserStore } from '../../stores';

// Types for Speed Run
interface SpeedRunEntry {
    id: string;
    user: {
        username: string;
        avatarUrl?: string;
        league: string;
    };
    problem: {
        title: string;
        difficulty: 'easy' | 'medium' | 'hard';
    };
    duration: string; // e.g., "12m 30s"
    solvedAt: string; // e.g., "2 mins ago"
}

// Mock Data
const MOCK_SPEED_RUNS: SpeedRunEntry[] = [
    {
        id: '1',
        user: { username: 'kucing_glitch', league: 'diamond' },
        problem: { title: 'Two Sum', difficulty: 'easy' },
        duration: '00:45s',
        solvedAt: 'Just now'
    },
    {
        id: '2',
        user: { username: 'keyboard_warior', league: 'gold' },
        problem: { title: 'Merge Sort Implementation', difficulty: 'medium' },
        duration: '12m 10s',
        solvedAt: '2 mins ago'
    },
    {
        id: '3',
        user: { username: 'algo_master', league: 'platinum' },
        problem: { title: 'Dijkstra Pathfinding', difficulty: 'hard' },
        duration: '45m 00s',
        solvedAt: '5 mins ago'
    },
    {
        id: '4',
        user: { username: 'newbie_coder', league: 'silver' },
        problem: { title: 'Palindrome Check', difficulty: 'easy' },
        duration: '05m 20s',
        solvedAt: '12 mins ago'
    },
    {
        id: '5',
        user: { username: 'bug_hunter_99', league: 'gold' },
        problem: { title: 'Valid Parentheses', difficulty: 'medium' },
        duration: '08m 45s',
        solvedAt: '25 mins ago'
    },
];

export const CompetePage: React.FC = () => {
    const { user } = useUserStore();
    const [searchTerm, setSearchTerm] = useState('');

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'easy': return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case 'hard': return 'text-red-500 bg-red-500/10 border-red-500/20';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-primary mb-2 flex items-center gap-3 tracking-tight">
                        <Zap size={32} className="text-yellow-500 fill-yellow-500" />
                        Live Speed Runs
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Real-time feed of developers crushing coding challenges.
                    </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative group w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search racer..."
                            className="w-full bg-white dark:bg-card border-none ring-1 ring-gray-200 dark:ring-border rounded-full pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Speed Run Feed */}
            <div className="grid gap-4">
                {MOCK_SPEED_RUNS.map((run, index) => (
                    <div
                        key={run.id}
                        className="group relative bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-muted/30 rounded-3xl p-5 border border-gray-100 dark:border-border transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-black/5"
                    >
                        <div className="flex flex-col md:flex-row items-center gap-6">

                            {/* 1. Rank & Avatar */}
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="font-mono text-2xl font-bold text-gray-300 w-8 text-center">
                                    #{index + 1}
                                </div>
                                <div className="relative">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border-2 border-white dark:border-gray-700 shadow-sm flex items-center justify-center text-xl font-bold text-gray-500 uppercase overflow-hidden">
                                        {run.user.avatarUrl ? (
                                            <img src={run.user.avatarUrl} alt={run.user.username} className="w-full h-full object-cover" />
                                        ) : (
                                            run.user.username.charAt(0)
                                        )}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white dark:border-black uppercase tracking-wider">
                                        {run.user.league}
                                    </div>
                                </div>
                                <div className="md:hidden flex-1">
                                    <h3 className="font-bold text-base text-primary">{run.user.username}</h3>
                                    <span className="text-xs text-muted-foreground">{run.solvedAt}</span>
                                </div>
                            </div>

                            {/* 2. Challenge Info */}
                            <div className="flex-1 w-full text-center md:text-left">
                                <div className="hidden md:block">
                                    <h3 className="font-bold text-lg text-primary flex items-center gap-2 group-hover:text-lime-600 transition-colors cursor-pointer">
                                        {run.user.username}
                                        <span className="text-muted-foreground font-normal text-sm">solved</span>
                                        {run.problem.title}
                                    </h3>
                                </div>
                                <div className="md:hidden text-center mb-2">
                                    <span className="text-muted-foreground text-sm">solved</span>
                                    <div className="font-bold text-primary">{run.problem.title}</div>
                                </div>

                                <div className="flex items-center justify-center md:justify-start gap-3 mt-1">
                                    <Badge variant="outline" className={`border h-6 ${getDifficultyColor(run.problem.difficulty)}`}>
                                        {run.problem.difficulty}
                                    </Badge>
                                    <span className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
                                        <Clock size={12} /> {run.solvedAt}
                                    </span>
                                </div>
                            </div>

                            {/* 3. Time Stats */}
                            <div className="flex flex-row md:flex-col items-center justify-between w-full md:w-auto gap-2 md:pl-8 md:border-l border-gray-100 dark:border-border/50">
                                <div className="md:hidden text-sm font-semibold text-muted-foreground">Duration</div>
                                <div className="flex flex-col items-end">
                                    <div className="text-2xl font-black text-primary font-mono tracking-tight flex items-center gap-2">
                                        <Timer size={20} className="text-lime-500" />
                                        {run.duration}
                                    </div>
                                    <div className="text-[10px] font-bold text-lime-600 dark:text-lime-400 uppercase tracking-wide bg-lime-100 dark:bg-lime-900/30 px-2 py-0.5 rounded-full mt-1">
                                        New PB 🔥
                                    </div>
                                </div>
                            </div>

                            {/* Action Button (Desktop) */}
                            <div className="hidden md:block pl-4">
                                <Button size="icon" variant="ghost" className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary">
                                    <ArrowUpRight size={20} />
                                </Button>
                            </div>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
