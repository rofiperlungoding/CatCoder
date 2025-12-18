import React from 'react';
import {
    Lock,
    Globe,
    Server,
    Map,
    ArrowRight
} from 'lucide-react';
import { Button, ProgressBar, Badge } from '../../components/ui';
import { useUserStore } from '../../stores';
import type { RoadmapPath } from '../../types';

// Career Roadmap Data
const roadmaps: RoadmapPath[] = [
    {
        id: 'frontend',
        title: 'Frontend Developer',
        description: 'Master HTML, CSS, JS, and React to build beautiful user interfaces.',
        icon: 'Web',
        color: 'from-blue-500 to-cyan-400',
        nodes: [],
        requiredLevel: 5
    },
    {
        id: 'backend',
        title: 'Backend Developer',
        description: 'Server-side logic, Databases, APIs. Power the web from behind the scenes.',
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
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-primary mb-2 flex items-center gap-2">
                        Career Roadmaps
                        <Map size={24} className="text-lime-500" />
                    </h1>
                    <p className="text-muted-foreground">Structured paths to guide your learning journey.</p>
                </div>
            </div>

            {!isUnlocked ? (
                <div className="bg-primary text-white text-center p-16 rounded-[2.5rem] shadow-xl shadow-black/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
                    <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>

                    <div className="relative z-10 max-w-lg mx-auto">
                        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-md border border-white/10">
                            <Lock size={32} className="text-lime-400" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Unlock Roadmaps at Level 5</h2>
                        <p className="text-white/60 mb-10 text-lg">
                            Career roadmaps are advanced paths. Master the basics and reach Level 5 to unlock specialized tracks.
                        </p>
                        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-sm">
                            <div className="flex justify-between text-sm font-semibold mb-3">
                                <span className="text-lime-400">Current: Level {userLevel}</span>
                                <span className="text-white/40">Target: Level 5</span>
                            </div>
                            <ProgressBar value={userLevel} max={5} className="h-3 bg-white/10" variant="accent" />
                            <div className="mt-4 text-xs text-center text-white/40 font-medium">
                                {(5 - userLevel)} more levels to go
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {roadmaps.map((map) => (
                        <div key={map.id} className="group bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-black/5 border border-gray-100 transition-all flex flex-col justify-between cursor-pointer hover:-translate-y-1">
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 flex items-center justify-center text-primary group-hover:bg-lime-400 group-hover:text-black transition-all duration-300 shadow-inner group-hover:shadow-lg group-hover:shadow-lime-400/20">
                                        {map.icon === 'Web' ? <Globe size={32} strokeWidth={1.5} /> : <Server size={32} strokeWidth={1.5} />}
                                    </div>
                                    <Badge variant="secondary" className="bg-gray-50 text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors">Career Path</Badge>
                                </div>
                                <h3 className="text-2xl font-bold text-primary mb-3">{map.title}</h3>
                                <p className="text-muted-foreground mb-8 leading-relaxed">{map.description}</p>
                            </div>
                            <div className="pt-8 border-t border-gray-100">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold text-primary group-hover:text-lime-600 transition-colors">0% Complete</span>
                                    <span className="text-xs font-medium text-muted-foreground">0/12 Modules</span>
                                </div>
                                <ProgressBar value={0} max={12} size="sm" className="mb-6" />
                                <Button className="w-full rounded-full group-hover:bg-black group-hover:text-white transition-all shadow-md shadow-gray-200 group-hover:shadow-xl group-hover:shadow-black/10">
                                    Start Journey <ArrowRight size={16} className="ml-2" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
