import { Timer02Icon, ArrowUpRight01Icon, EnergyIcon, Search01Icon } from '@hugeicons/core-free-icons';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Button, LoadingSpinner } from '../../components/ui';
import { fetchSpeedRuns, formatDuration, formatTimeAgo, type SpeedRunEntry } from '../../lib/speedruns';
export { SpeedRunDetail } from './SpeedRunDetail';

export const CompetePage: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [speedRuns, setSpeedRuns] = useState<SpeedRunEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch real speed runs on mount
    useEffect(() => {
        const loadSpeedRuns = async () => {
            setIsLoading(true);
            const data = await fetchSpeedRuns(20);
            setSpeedRuns(data);
            setIsLoading(false);
        };
        loadSpeedRuns();
    }, []);

    // Filter by search
    const filteredRuns = speedRuns.filter(run =>
        run.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        run.problem.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-primary mb-2 flex items-center gap-3 tracking-tight">
                        <Icon icon={EnergyIcon} size={32} className="text-yellow-500 fill-yellow-500" />
                        Live Speed Runs
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Real-time feed of developers crushing coding challenges.
                    </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative group w-full md:w-64">
                        <Icon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors" size={18} />
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

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center py-20">
                    <LoadingSpinner size={32} className="text-muted-foreground" />
                </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredRuns.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    <p className="text-lg">No speed runs yet. Be the first to solve a problem!</p>
                </div>
            )}

            {/* Speed Run Feed */}
            {!isLoading && filteredRuns.length > 0 && (
                <div className="grid gap-4">
                    {filteredRuns.map((run, index) => (
                        <div
                            key={run.id}
                            onClick={() => navigate(`/compete/${run.id}`)}
                            className="group relative bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-muted/30 rounded-3xl p-5 border border-gray-100 dark:border-border transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-black/5 cursor-pointer"
                        >
                            <div className="flex flex-col md:flex-row items-center gap-6">

                                {/* 1. Rank & Avatar */}
                                <div className="flex items-center gap-4 w-full md:w-auto min-w-[200px]">
                                    <div className="flex justify-center w-12">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold font-mono ${index === 0 ? 'bg-yellow-500/10 text-yellow-500 ring-1 ring-yellow-500/40 shadow-[0_0_10px_rgba(234,179,8,0.2)]' :
                                            index === 1 ? 'bg-slate-400/10 text-slate-400 ring-1 ring-slate-400/40' :
                                                index === 2 ? 'bg-orange-600/10 text-orange-600 ring-1 ring-orange-600/40' :
                                                    'text-gray-500 dark:text-gray-400'
                                            }`}>
                                            {index + 1}
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg font-bold text-gray-500 overflow-hidden">
                                            {run.user.avatarUrl ? (
                                                <img src={run.user.avatarUrl} alt={run.user.username} className="w-full h-full object-cover" />
                                            ) : (
                                                run.user.username.charAt(0)
                                            )}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 text-sm">
                                            {run.user.league === 'diamond' ? '💎' :
                                                run.user.league === 'platinum' ? '🔷' :
                                                    run.user.league === 'gold' ? '🥇' :
                                                        run.user.league === 'silver' ? '🥈' : '🥉'}
                                        </div>
                                    </div>
                                    <div className="md:hidden flex-1">
                                        <h3 className="font-bold text-base text-primary">{run.user.username}</h3>
                                    </div>
                                </div>

                                {/* 2. Challenge Info */}
                                <div className="flex-1 w-full text-center md:text-left">
                                    <div className="flex flex-col md:flex-row items-center gap-2">
                                        <h3 className="font-bold text-lg text-primary hover:text-lime-500 transition-colors cursor-pointer">
                                            {run.user.username}
                                        </h3>
                                        <span className="text-muted-foreground text-sm">solved</span>
                                        <span className="font-semibold text-primary">{run.problem.title}</span>
                                    </div>

                                    <div className="flex items-center justify-center md:justify-start gap-3 mt-1 text-xs text-muted-foreground font-medium">
                                        <span className={`flex items-center gap-1.5 ${run.problem.difficulty === 'easy' ? 'text-green-500' :
                                            run.problem.difficulty === 'medium' ? 'text-yellow-500' : 'text-red-500'
                                            }`}>
                                            <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                            {run.problem.difficulty}
                                        </span>
                                        <span>•</span>
                                        <span>{formatTimeAgo(run.completedAt)}</span>
                                    </div>
                                </div>

                                {/* 3. Time Stats */}
                                <div className="flex flex-row md:flex-col items-center justify-between w-full md:w-auto gap-2 md:pl-8 md:border-l border-gray-100 dark:border-border/50">
                                    <div className="md:hidden text-sm font-semibold text-muted-foreground">Duration</div>
                                    <div className="flex flex-col items-end">
                                        <div className="text-2xl font-black text-primary font-mono tracking-tight flex items-center gap-2">
                                            <Icon icon={Timer02Icon} size={20} className="text-lime-500" />
                                            {formatDuration(run.durationSeconds)}
                                        </div>
                                        <div className="text-[10px] font-bold text-lime-600 dark:text-lime-400 uppercase tracking-wide bg-lime-100 dark:bg-lime-900/30 px-2 py-0.5 rounded-full mt-1">
                                            New PB 🔥
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button (Desktop) */}
                                <div className="hidden md:block pl-4">
                                    <Button size="sm" variant="ghost" className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-primary">
                                        <Icon icon={ArrowUpRight01Icon} size={20} />
                                    </Button>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
