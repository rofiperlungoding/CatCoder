import React from 'react';
import { Link } from 'react-router-dom';
import {
    Map,
    Lock,
    CheckCircle2,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { Button, Card, Badge, ProgressBar } from '../../components/ui';
import { useUserStore } from '../../stores';
import type { RoadmapPath } from '../../types';

// Career Roadmap Data
const roadmaps: RoadmapPath[] = [
    {
        id: 'frontend',
        title: 'Frontend Developer',
        description: 'Build beautiful, interactive user interfaces for the web',
        icon: '🌐',
        color: 'from-blue-500 to-cyan-400',
        nodes: [],
        requiredLevel: 5
    },
    {
        id: 'backend',
        title: 'Backend Developer',
        description: 'Create powerful server-side applications and APIs',
        icon: '⚙️',
        color: 'from-green-500 to-emerald-400',
        nodes: [],
        requiredLevel: 5
    },
    {
        id: 'mobile',
        title: 'Mobile Developer',
        description: 'Develop apps for iOS and Android platforms',
        icon: '📱',
        color: 'from-purple-500 to-pink-400',
        nodes: [],
        requiredLevel: 5
    },
    {
        id: 'datascience',
        title: 'Data Science / ML',
        description: 'Analyze data and build machine learning models',
        icon: '🤖',
        color: 'from-yellow-500 to-orange-400',
        nodes: [],
        requiredLevel: 5
    },
    {
        id: 'gamedev',
        title: 'Game Developer',
        description: 'Create immersive gaming experiences',
        icon: '🎮',
        color: 'from-red-500 to-rose-400',
        nodes: [],
        requiredLevel: 5
    },
    {
        id: 'cybersecurity',
        title: 'Cybersecurity',
        description: 'Protect systems and data from threats',
        icon: '🔒',
        color: 'from-slate-500 to-slate-400',
        nodes: [],
        requiredLevel: 5
    },
    {
        id: 'devops',
        title: 'DevOps / Cloud',
        description: 'Automate deployment and manage cloud infrastructure',
        icon: '☁️',
        color: 'from-indigo-500 to-violet-400',
        nodes: [],
        requiredLevel: 5
    },
    {
        id: 'competitive',
        title: 'Competitive Programming',
        description: 'Master algorithms and compete at the highest level',
        icon: '🏆',
        color: 'from-amber-500 to-yellow-400',
        nodes: [],
        requiredLevel: 5
    }
];

export const RoadmapPage: React.FC = () => {
    const { user } = useUserStore();
    const userLevel = user?.level || 1;
    const isUnlocked = userLevel >= 5;

    return (
        <div className="min-h-screen py-10 px-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold mb-3 flex items-center gap-3 text-gray-900">
                    <Map className="text-orange-600" size={32} />
                    Career Roadmaps
                </h1>
                <p className="text-gray-500 text-lg">
                    Choose your path and follow a structured learning journey
                </p>
            </div>

            {/* Lock Status */}
            {!isUnlocked && (
                <Card padding="lg" className="mb-10 bg-orange-50 border-orange-100 shadow-sm">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                            <Lock size={40} className="text-orange-500" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-xl font-bold mb-2 text-gray-900">Unlock Career Roadmaps</h3>
                            <p className="text-gray-600 mb-4 max-w-2xl">
                                Reach Level 5 to unlock personalized career roadmaps.
                                Complete lessons and solve problems to gain XP and level up!
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="flex-1 max-w-xs w-full">
                                    <div className="flex justify-between text-sm mb-1 font-medium">
                                        <span className="text-gray-700">Level {userLevel}</span>
                                        <span className="text-orange-600">Level 5 required</span>
                                    </div>
                                    <ProgressBar value={userLevel} max={5} />
                                </div>
                                <Link to="/learn">
                                    <Button className="gap-2 shadow-sm">
                                        <Sparkles size={16} />
                                        Continue Learning
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Roadmap Preview Message */}
            {!isUnlocked && (
                <div className="text-center mb-8">
                    <span className="px-4 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-500 border border-gray-200">
                        Preview available paths • Unlock at Level 5
                    </span>
                </div>
            )}

            {/* Roadmap Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                {roadmaps.map((roadmap) => (
                    <Card
                        key={roadmap.id}
                        variant={isUnlocked ? 'hover' : 'default'}
                        padding="none"
                        className={`overflow-hidden bg-white border-gray-200 ${!isUnlocked ? 'opacity-70 contrast-95 grayscale-[0.3]' : 'hover:border-orange-200 hover:shadow-md'}`}
                    >
                        {/* Header with gradient */}
                        <div className={`bg-gradient-to-r ${roadmap.color} p-1`}>
                            <div className="bg-white p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${roadmap.color} bg-opacity-10 flex items-center justify-center text-3xl shadow-sm`}>
                                            <span className="drop-shadow-sm">{roadmap.icon}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{roadmap.title}</h3>
                                            <p className="text-sm text-gray-500 mt-0.5">{roadmap.description}</p>
                                        </div>
                                    </div>
                                    {!isUnlocked && (
                                        <Lock size={20} className="text-gray-400 mt-1" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 border-t border-gray-50 bg-gray-50/50">
                            {isUnlocked ? (
                                <>
                                    <div className="flex items-center gap-4 mb-5">
                                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                            <CheckCircle2 size={16} className="text-green-500" />
                                            <span>0/12 completed</span>
                                        </div>
                                        <Badge variant="default" size="sm" className="bg-gray-200 text-gray-700 hover:bg-gray-300">~3 months</Badge>
                                    </div>

                                    <ProgressBar value={0} max={100} size="sm" className="mb-5" />

                                    <Link to={`/roadmap/${roadmap.id}`}>
                                        <Button variant="secondary" className="w-full gap-2 justify-between group">
                                            <span className="font-semibold text-gray-700">Start Path</span>
                                            <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                                        </Button>
                                    </Link>
                                </>
                            ) : (
                                <div className="text-center py-3">
                                    <p className="text-sm font-medium text-gray-500 flex items-center justify-center gap-2">
                                        <Lock size={14} /> Locked untill Level 5
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Info Section */}
            <div className="mt-12 grid md:grid-cols-3 gap-6">
                {[
                    { icon: '🎯', title: 'Structured Learning', desc: 'Follow a proven path designed by industry experts' },
                    { icon: '📊', title: 'Track Progress', desc: 'See exactly where you are and what comes next' },
                    { icon: '💼', title: 'Job Ready', desc: 'Build skills that employers are looking for' }
                ].map((item, i) => (
                    <Card key={i} padding="lg" className="border-gray-200 bg-white">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 text-2xl">
                                {item.icon}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
