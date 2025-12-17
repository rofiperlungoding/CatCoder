import React from 'react';
import {
    Lock
} from 'lucide-react';
import { Button, ProgressBar } from '../../components/ui';
import { useUserStore } from '../../stores';
import type { RoadmapPath } from '../../types';

// Career Roadmap Data
const roadmaps: RoadmapPath[] = [
    {
        id: 'frontend',
        title: 'Frontend Developer',
        description: 'Master HTML, CSS, JS, and React.',
        icon: 'Web',
        color: 'from-blue-500 to-cyan-400',
        nodes: [],
        requiredLevel: 5
    },
    {
        id: 'backend',
        title: 'Backend Developer',
        description: 'Server-side logic, Databases, APIs.',
        icon: 'Server',
        color: 'from-green-500 to-emerald-400',
        nodes: [],
        requiredLevel: 5
    }
];

export const RoadmapPage: React.FC = () => {
    const { user } = useUserStore();
    const userLevel = user?.level || 1;
    const isUnlocked = userLevel >= 5;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">Career Roadmaps</h1>
                    <p className="text-slate-500">Structured paths to your dream job.</p>
                </div>
            </div>

            {!isUnlocked ? (
                <div className="bento-card bg-slate-900 text-white text-center p-12">
                    <Lock size={48} className="mx-auto mb-4 text-slate-700" />
                    <h2 className="text-2xl font-bold mb-2">Unlock Roadmaps at Level 5</h2>
                    <p className="text-slate-400 mb-6">You need more experience to access career paths.</p>
                    <div className="max-w-xs mx-auto mb-6">
                        <div className="flex justify-between text-xs mb-1">
                            <span>Level {userLevel}</span>
                            <span>Target: Level 5</span>
                        </div>
                        <ProgressBar value={userLevel} max={5} />
                    </div>
                </div>
            ) : (
                <div className="bento-grid grid-cols-1 md:grid-cols-2">
                    {roadmaps.map((map) => (
                        <div key={map.id} className="bento-card flex flex-col justify-between group cursor-pointer hover:border-indigo-300 transition-all">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4 text-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    {map.icon === 'Web' ? '🌐' : '⚙️'}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{map.title}</h3>
                                <p className="text-slate-500 mb-6">{map.description}</p>
                            </div>
                            <div className="pt-6 border-t border-slate-50">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-semibold text-slate-900">0% Complete</span>
                                    <span className="text-xs text-slate-400">0/12 Modules</span>
                                </div>
                                <ProgressBar value={0} max={12} size="sm" className="mb-4" />
                                <Button variant="secondary" fullWidth className="group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-colors">
                                    Start Journey
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
