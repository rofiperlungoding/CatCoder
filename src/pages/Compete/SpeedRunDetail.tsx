import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Calendar,
    ArrowLeft,
    Share2,
    ExternalLink,
    Zap
} from 'lucide-react';
import { Button } from '../../components/ui';
import { fetchSpeedRunById, formatDuration, formatTimeAgo, type SpeedRunEntry } from '../../lib/speedruns';
import { useUserStore } from '../../stores';

export const SpeedRunDetail: React.FC = () => {
    const { runId } = useParams();
    const navigate = useNavigate();
    const [run, setRun] = useState<SpeedRunEntry | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useUserStore();

    useEffect(() => {
        const loadRun = async () => {
            if (!runId) return;
            setIsLoading(true);
            const data = await fetchSpeedRunById(runId);
            setRun(data);
            setIsLoading(false);
        };
        loadRun();
    }, [runId]);

    const handleShare = () => {
        // Mock share functionality
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-pulse text-zinc-500">Loading speed run data...</div>
            </div>
        );
    }

    if (!run) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="text-xl font-bold">Speed Run Not Found</div>
                <Button onClick={() => navigate('/compete')}>Back to Leaderboard</Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
            {/* Header / Nav */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/compete')} className="rounded-full p-2">
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        Speed Run Details
                        <span className="text-xs font-mono font-normal bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-muted-foreground">
                            #{run.id.slice(0, 8)}
                        </span>
                    </h1>
                </div>
                <div className="flex-1" />
                <Button variant="secondary" size="sm" onClick={handleShare} className="gap-2">
                    <Share2 size={16} />
                    Share
                </Button>
            </div>

            {/* Main Content Info Card */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                {/* Top Banner / Hero */}
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-10 -translate-y-10">
                        <Zap size={140} />
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                        {/* Time Big Display */}
                        <div className="flex flex-col items-center md:items-start text-center md:text-left">
                            <span className="text-violet-200 font-medium mb-1 uppercase tracking-wider text-sm">Total Duration</span>
                            <div className="text-6xl md:text-7xl font-black font-mono tracking-tighter">
                                {formatDuration(run.durationSeconds)}
                            </div>
                            <div className="flex items-center gap-2 mt-4 text-violet-100 bg-white/10 px-3 py-1 rounded-full text-sm">
                                <Calendar size={14} />
                                {new Date(run.completedAt).toLocaleDateString(undefined, {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>

                        <div className="w-px h-24 bg-white/20 hidden md:block" />

                        {/* Player Info */}
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center text-3xl font-bold shadow-inner border border-white/20 overflow-hidden">
                                    {run.user.avatarUrl ? (
                                        <img src={run.user.avatarUrl} alt={run.user.username} className="w-full h-full object-cover" />
                                    ) : (
                                        run.user.username.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-lg border-2 border-indigo-600">
                                    {run.user.league === 'diamond' ? '💎' :
                                        run.user.league === 'platinum' ? '🔷' :
                                            run.user.league === 'gold' ? '🥇' :
                                                run.user.league === 'silver' ? '🥈' : '🥉'}
                                </div>
                            </div>
                            <div>
                                <div className="text-violet-200 text-sm font-medium mb-1">Run by</div>
                                <div className="text-2xl font-bold">{run.user.username}</div>
                                <div className="text-violet-200 text-sm capitalize">{run.user.league} League</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-8 grid md:grid-cols-2 gap-8">
                    {/* Problem Details */}
                    <div>
                        <h3 className="text-muted-foreground font-medium mb-4 uppercase text-xs tracking-wider">Problem Solved</h3>
                        <div className="bg-zinc-50 dark:bg-black/20 border border-zinc-100 dark:border-zinc-800 rounded-xl p-5">
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-xl font-bold text-foreground">{run.problem.title}</h2>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${run.problem.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                    run.problem.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                    {run.problem.difficulty}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-6">
                                The user successfully submitted a solution that passed all test cases within the recorded time.
                            </p>

                            <Button className="w-full gap-2" onClick={() => navigate(`/practice/${run.problem.id}`)}>
                                Try this Problem <ExternalLink size={14} />
                            </Button>
                        </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-muted-foreground font-medium mb-4 uppercase text-xs tracking-wider">Performance Stats</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                                    <div className="text-muted-foreground text-xs mb-1">Time</div>
                                    <div className="font-mono text-xl font-bold text-foreground">
                                        {formatDuration(run.durationSeconds)}
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                                    <div className="text-muted-foreground text-xs mb-1">Finished</div>
                                    <div className="font-mono text-sm font-bold text-foreground">
                                        {formatTimeAgo(run.completedAt)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {user?.id !== run.user.id && (
                            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <p className="text-sm text-center text-muted-foreground mb-4">
                                    Think you can do better? Beat {run.user.username}'s time!
                                </p>
                                <Button size="lg" className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-lg shadow-orange-500/20"
                                    onClick={() => navigate(`/practice/${run.problem.id}`)}
                                >
                                    Challenge Run ⚡
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
