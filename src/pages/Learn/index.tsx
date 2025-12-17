import React, { useState } from 'react';
import {
    BookOpen,
    Search,
    Clock,
    Star,
    ChevronRight
} from 'lucide-react';
import { Card, Badge, ProgressBar, Input, Select, Tabs } from '../../components/ui';
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
        { id: 'python', label: 'Python', icon: <span>🐍</span> },
        { id: 'javascript', label: 'JavaScript', icon: <span>⚡</span> },
        { id: 'cpp', label: 'C++', icon: <span>🔧</span> }
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
        <div className="min-h-screen py-10 px-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold mb-3 flex items-center gap-3 text-gray-900">
                    <BookOpen className="text-orange-600" size={32} />
                    Learning Library
                </h1>
                <p className="text-gray-500 text-lg">
                    Master programming with our step-by-step interactive lessons
                </p>
            </div>

            {/* Language Tabs - Google Style */}
            <Tabs
                tabs={languageTabs}
                activeTab={selectedLanguage}
                onTabChange={(id) => setSelectedLanguage(id as Language)}
                className="mb-8"
            />

            {/* Progress Overview */}
            <Card padding="lg" className="mb-8 border-none shadow-md bg-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1">Your Progress</h3>
                        <p className="text-sm text-gray-500">
                            {completedCount} of {totalCount} lessons completed
                        </p>
                    </div>
                    <div className="flex-1 max-w-xl">
                        <ProgressBar
                            value={completedCount}
                            max={totalCount || 1}
                            size="md"
                            variant="success"
                        />
                    </div>
                    <Badge variant="success" className="self-start px-3 py-1">
                        {Math.round((completedCount / (totalCount || 1)) * 100)}% Complete
                    </Badge>
                </div>
            </Card>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex-1">
                    <Input
                        placeholder="Search lessons..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        icon={<Search size={18} />}
                        className="bg-white border-gray-200 shadow-sm"
                    />
                </div>
                <div className="w-full sm:w-64">
                    <Select
                        value={selectedTier.toString()}
                        onChange={(e) => setSelectedTier(e.target.value === 'all' ? 'all' : parseInt(e.target.value) as Tier)}
                        options={[
                            { value: 'all', label: 'All Tiers' },
                            { value: '1', label: '🌱 Tier 1: Seedling' },
                            { value: '2', label: '🌿 Tier 2: Sprout' },
                            { value: '3', label: '🌳 Tier 3: Growing' },
                            { value: '4', label: '🌲 Tier 4: Mature' },
                            { value: '5', label: '🏔️ Tier 5: Expert' }
                        ]}
                    />
                </div>
            </div>

            {/* Lesson List */}
            <div className="space-y-8">
                {Object.entries(groupedLessons).map(([tier, lessons]) => (
                    <div key={tier} className="animate-fade-in">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                            <span>Tier {tier}</span>
                            <div className="h-px flex-1 bg-gray-100 ml-4"></div>
                        </h2>
                        <div className="grid gap-4">
                            {lessons.map((lesson) => (
                                <Card
                                    key={lesson.id}
                                    variant="hover"
                                    className="group relative overflow-hidden bg-white border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all duration-300"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                                                    {lesson.title}
                                                </h3>
                                                {isCompleted('lesson', lesson.id) && (
                                                    <Badge variant="success" size="sm">Completed</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mb-3 max-w-2xl">
                                                {lesson.description}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={14} />
                                                    {lesson.estimatedTime} min
                                                </span>
                                                <span className="flex items-center gap-1 text-orange-500">
                                                    <Star size={14} />
                                                    {lesson.xpReward} XP
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-2 bg-gray-50 rounded-full text-gray-300 group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}

                {Object.keys(groupedLessons).length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                        <p className="text-gray-500 mb-2">No lessons found</p>
                        <button
                            className="text-orange-500 hover:underline font-medium"
                            onClick={() => { setSearchQuery(''); setSelectedTier('all'); }}
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
