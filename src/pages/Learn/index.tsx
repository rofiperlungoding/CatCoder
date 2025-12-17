import React, { useState } from 'react';
import {
    BookOpen,
    Search,
    Clock,
    Code,
    Sparkles
} from 'lucide-react';
import { Badge, ProgressBar, Tabs } from '../../components/ui';
import { useUserStore, useProgressStore } from '../../stores';
import type { Lesson, Language, Tier } from '../../types';

// Sample lesson data
const sampleLessons: Lesson[] = [
    {
        id: 'py-intro-1',
        title: 'Hello, World!',
        description: 'Write your first Python program and learn about print statements.',
        tier: 1,
        language: 'python',
        sections: [],
        xpReward: 50,
        estimatedTime: 10
    },
    {
        id: 'py-intro-2',
        title: 'Variables & Data Types',
        description: 'Learn how to store and manipulate data using variables.',
        tier: 1,
        language: 'python',
        sections: [],
        xpReward: 75,
        estimatedTime: 15
    },
    {
        id: 'py-intro-3',
        title: 'User Input',
        description: 'Make your programs interactive by accepting user input.',
        tier: 1,
        language: 'python',
        sections: [],
        xpReward: 75,
        estimatedTime: 12
    },
    {
        id: 'py-basics-1',
        title: 'Conditionals: If/Else',
        description: 'Make decisions in your code using conditional statements.',
        tier: 2,
        language: 'python',
        sections: [],
        xpReward: 100,
        estimatedTime: 20
    },
    {
        id: 'py-basics-2',
        title: 'Loops: For & While',
        description: 'Repeat actions efficiently using loops.',
        tier: 2,
        language: 'python',
        sections: [],
        xpReward: 125,
        estimatedTime: 25
    },
    {
        id: 'js-intro-1',
        title: 'Hello, JavaScript!',
        description: 'Your first step into the world of JavaScript.',
        tier: 1,
        language: 'javascript',
        sections: [],
        xpReward: 50,
        estimatedTime: 10
    },
    {
        id: 'js-intro-2',
        title: 'Variables: let, const, var',
        description: 'Understanding variable declarations in JavaScript.',
        tier: 1,
        language: 'javascript',
        sections: [],
        xpReward: 75,
        estimatedTime: 15
    },
    {
        id: 'cpp-intro-1',
        title: 'Hello, C++!',
        description: 'Introduction to C++ programming basics.',
        tier: 1,
        language: 'cpp',
        sections: [],
        xpReward: 50,
        estimatedTime: 12
    }
];

export const LearnPage: React.FC = () => {
    const { selectedLanguage, setSelectedLanguage } = useUserStore();
    const { isCompleted } = useProgressStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTier, setSelectedTier] = useState<Tier | 'all'>('all');

    const languageTabs = [
        { id: 'python', label: 'Python', icon: <Code size={16} /> },
        { id: 'javascript', label: 'JavaScript', icon: <Code size={16} /> },
        { id: 'cpp', label: 'C++', icon: <Code size={16} /> }
    ];

    const filteredLessons = sampleLessons.filter(lesson => {
        const matchesLanguage = lesson.language === selectedLanguage;
        const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTier = selectedTier === 'all' || lesson.tier === selectedTier;
        return matchesLanguage && matchesSearch && matchesTier;
    });

    const groupedLessons = filteredLessons.reduce((acc, lesson) => {
        const tier = lesson.tier;
        if (!acc[tier]) acc[tier] = [];
        acc[tier].push(lesson);
        return acc;
    }, {} as Record<number, Lesson[]>);

    const completedCount = sampleLessons.filter(l =>
        l.language === selectedLanguage && isCompleted('lesson', l.id)
    ).length;
    const totalCount = sampleLessons.filter(l => l.language === selectedLanguage).length;

    return (
        <div className="space-y-6">
            {/* Header Bento */}
            <div className="bento-card bg-slate-900 text-white flex flex-col md:flex-row justify-between items-center gap-6 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                        <BookOpen className="text-indigo-400" size={32} />
                        Learning Library
                    </h1>
                    <p className="text-slate-300 max-w-lg">
                        Structured, interactive lessons designed to take you from hello world to system architect.
                    </p>
                </div>
                <div className="relative z-10 flex flex-col items-end min-w-[200px]">
                    <div className="text-sm font-medium text-slate-300 mb-1">Course Progress</div>
                    <div className="text-3xl font-bold mb-2">{Math.round((completedCount / (totalCount || 1)) * 100)}%</div>
                    <ProgressBar value={completedCount} max={totalCount || 1} size="sm" variant="primary" />
                </div>
            </div>

            {/* Controls Row */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <Tabs
                    tabs={languageTabs}
                    activeTab={selectedLanguage}
                    onTabChange={(id) => setSelectedLanguage(id as Language)}
                />
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search lessons..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all"
                        />
                    </div>
                    <select
                        className="bg-white border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        value={selectedTier.toString()}
                        onChange={(e) => setSelectedTier(e.target.value === 'all' ? 'all' : parseInt(e.target.value) as Tier)}
                    >
                        <option value="all">All Tiers</option>
                        <option value="1">Tier 1: Seedling</option>
                        <option value="2">Tier 2: Sprout</option>
                        <option value="3">Tier 3: Growing</option>
                        <option value="4">Tier 4: Mature</option>
                        <option value="5">Tier 5: Expert</option>
                    </select>
                </div>
            </div>

            {/* Tiers & Lessons Grid */}
            <div className="space-y-8">
                {Object.entries(groupedLessons).map(([tier, lessons]) => (
                    <div key={tier}>
                        <div className="flex items-center gap-4 mb-4">
                            <Badge variant="secondary" className="px-3 py-1 text-sm bg-white shadow-sm border-slate-200">
                                Tier {tier}
                            </Badge>
                            <div className="h-px flex-1 bg-slate-200"></div>
                        </div>

                        <div className="bento-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {lessons.map((lesson) => (
                                <div
                                    key={lesson.id}
                                    className="bento-card group hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer relative"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <Code size={20} />
                                        </div>
                                        {isCompleted('lesson', lesson.id) && (
                                            <Badge variant="success" size="sm">Completed</Badge>
                                        )}
                                    </div>

                                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                                        {lesson.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-6 line-clamp-2">
                                        {lesson.description}
                                    </p>

                                    <div className="flex items-center justify-between text-xs font-medium text-slate-400 pt-4 border-t border-slate-50">
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} /> {lesson.estimatedTime} min
                                        </span>
                                        <span className="flex items-center gap-1 text-amber-600">
                                            <Sparkles size={14} /> {lesson.xpReward} XP
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
