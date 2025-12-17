import React, { useState } from 'react';
import {
    Search,
    CheckCircle2,
    Filter
} from 'lucide-react';
import { Input, Select, Badge, Button } from '../../components/ui';
import { useProgressStore, useUserStore, useUIStore } from '../../stores';
import type { Problem, Difficulty } from '../../types';

// Sample problems
const sampleProblems: Problem[] = [
    {
        id: 'two-sum',
        title: 'Two Sum',
        difficulty: 'easy',
        tier: 2,
        languages: ['python', 'javascript', 'cpp'],
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' }],
        hints: ['Try using a hash map'],
        solution: { python: '', javascript: '', cpp: '' },
        explanation: '',
        testCases: [],
        xpReward: 50,
        tags: ['Array', 'Hash Table']
    },
    {
        id: 'palindrome-check',
        title: 'Palindrome Check',
        difficulty: 'easy',
        tier: 1,
        languages: ['python', 'javascript', 'cpp'],
        description: 'Given a string s, return true if it is a palindrome, false otherwise.',
        examples: [{ input: 's = "racecar"', output: 'true' }],
        hints: ['Compare characters from both ends'],
        solution: { python: '', javascript: '', cpp: '' },
        explanation: '',
        testCases: [],
        xpReward: 50,
        tags: ['String', 'Two Pointers']
    },
    {
        id: 'reverse-string',
        title: 'Reverse String',
        difficulty: 'easy',
        tier: 1,
        languages: ['python', 'javascript', 'cpp'],
        description: 'Write a function that reverses a string.',
        examples: [{ input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' }],
        hints: ['Use two pointers'],
        solution: { python: '', javascript: '', cpp: '' },
        explanation: '',
        testCases: [],
        xpReward: 50,
        tags: ['String', 'Two Pointers']
    },
    {
        id: 'fizzbuzz',
        title: 'FizzBuzz',
        difficulty: 'easy',
        tier: 1,
        languages: ['python', 'javascript', 'cpp'],
        description: 'Given an integer n, return a string array answer.',
        examples: [{ input: 'n = 15', output: '["1","2","Fizz","4","Buzz",...]' }],
        hints: ['Use modulo operator'],
        solution: { python: '', javascript: '', cpp: '' },
        explanation: '',
        testCases: [],
        xpReward: 50,
        tags: ['Math', 'Simulation']
    },
    {
        id: 'binary-search',
        title: 'Binary Search',
        difficulty: 'easy',
        tier: 2,
        languages: ['python', 'javascript', 'cpp'],
        description: 'Given an array of integers nums which is sorted in ascending order, search target.',
        examples: [{ input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' }],
        hints: ['Divide and conquer'],
        solution: { python: '', javascript: '', cpp: '' },
        explanation: '',
        testCases: [],
        xpReward: 75,
        tags: ['Array', 'Binary Search']
    },
    {
        id: 'valid-parentheses',
        title: 'Valid Parentheses',
        difficulty: 'medium',
        tier: 3,
        languages: ['python', 'javascript', 'cpp'],
        description: 'Determine if the input string is valid.',
        examples: [{ input: 's = "()[]{}"', output: 'true' }],
        hints: ['Use a stack'],
        solution: { python: '', javascript: '', cpp: '' },
        explanation: '',
        testCases: [],
        xpReward: 100,
        tags: ['String', 'Stack']
    }
];

export const PracticePage: React.FC = () => {
    const { isCompleted, markComplete } = useProgressStore();
    const { addXP, updateStreak } = useUserStore();
    const { addToast } = useUIStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
    const [tierFilter, setTierFilter] = useState<string>('all');
    const [activeTab, setActiveTab] = useState<'all' | 'solved' | 'unsolved'>('all');

    const handleSolveProblem = (e: React.MouseEvent, problem: Problem) => {
        e.stopPropagation();
        if (isCompleted('problem', problem.id)) return;

        markComplete('problem', problem.id);
        addXP(problem.xpReward);
        updateStreak();
        addToast('success', `Solved "${problem.title}"! +${problem.xpReward} XP`);
    };

    const filteredProblems = sampleProblems.filter(problem => {
        const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            problem.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesDifficulty = difficultyFilter === 'all' || problem.difficulty === difficultyFilter;
        const matchesTier = tierFilter === 'all' || problem.tier.toString() === tierFilter;
        const completed = isCompleted('problem', problem.id);
        const matchesTab = activeTab === 'all' ||
            (activeTab === 'solved' && completed) ||
            (activeTab === 'unsolved' && !completed);

        return matchesSearch && matchesDifficulty && matchesTier && matchesTab;
    });

    const getDifficultyColor = (difficulty: Difficulty) => {
        switch (difficulty) {
            case 'easy': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'medium': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'hard': return 'text-rose-600 bg-rose-50 border-rose-100';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">Practice Arena</h1>
                    <p className="text-slate-500">Sharpen your algorithmic skills.</p>
                </div>
                <Button>Random Problem</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Column: Control Center */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bento-card bg-white sticky top-6">
                        <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold">
                            <Filter size={18} /> Filters
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Status</label>
                                <div className="space-y-2">
                                    {['all', 'solved', 'unsolved'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => setActiveTab(status as any)}
                                            className={`
                                                w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors
                                                ${activeTab === status ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}
                                            `}
                                        >
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Search</label>
                                <Input
                                    placeholder="Keywords..."
                                    icon={<Search size={14} />}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Difficulty</label>
                                <Select
                                    value={difficultyFilter}
                                    onChange={(e) => setDifficultyFilter(e.target.value as Difficulty | 'all')}
                                    options={[
                                        { value: 'all', label: 'All Difficulties' },
                                        { value: 'easy', label: 'Easy' },
                                        { value: 'medium', label: 'Medium' },
                                        { value: 'hard', label: 'Hard' }
                                    ]}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Tier</label>
                                <Select
                                    value={tierFilter}
                                    onChange={(e) => setTierFilter(e.target.value)}
                                    options={[
                                        { value: 'all', label: 'All Tiers' },
                                        { value: '1', label: 'Tier 1' },
                                        { value: '2', label: 'Tier 2' },
                                        { value: '3', label: 'Tier 3' },
                                        { value: '4', label: 'Tier 4' },
                                        { value: '5', label: 'Tier 5' }
                                    ]}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Problem Grid */}
                <div className="lg:col-span-3">
                    <div className="bento-grid grid-cols-1 md:grid-cols-2">
                        {filteredProblems.map((problem) => {
                            const completed = isCompleted('problem', problem.id);

                            return (
                                <div
                                    key={problem.id}
                                    className={`
                                        bento-card group hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between h-full relative
                                        ${completed ? 'bg-slate-50/50' : 'bg-white'}
                                    `}
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-3">
                                            <Badge className={`${getDifficultyColor(problem.difficulty)} border bg-opacity-10`}>
                                                {problem.difficulty}
                                            </Badge>
                                            {completed && (
                                                <CheckCircle2 size={18} className="text-emerald-500" />
                                            )}
                                        </div>
                                        <h3 className="font-bold text-slate-900 text-lg mb-2 group-hover:text-indigo-600 transition-colors">
                                            {problem.title}
                                        </h3>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {problem.tags.map(tag => (
                                                <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-md">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="border-t border-slate-50 pt-4 flex items-center justify-between mt-auto">
                                        <span className="text-xs font-semibold text-slate-400">Tier {problem.tier}</span>
                                        {completed ? (
                                            <span className="text-xs font-bold text-emerald-600">Solved</span>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-auto p-0 text-amber-600 hover:text-amber-700 hover:bg-transparent"
                                                onClick={(e) => handleSolveProblem(e, problem)}
                                            >
                                                Solve (+{problem.xpReward} XP)
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {filteredProblems.length === 0 && (
                        <div className="bento-card text-center py-16 text-slate-400">
                            <Search size={32} className="mx-auto mb-3 opacity-20" />
                            <p>No problems match your filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
