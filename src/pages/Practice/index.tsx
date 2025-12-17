import React, { useState } from 'react';
import {
    Code2,
    Search,
    CheckCircle2
} from 'lucide-react';
import { Card, Input, Select, Tabs } from '../../components/ui';
import { useProgressStore } from '../../stores';
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
        description: 'Write a function that reverses a string. The input string is given as an array of characters.',
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
        description: 'Given an integer n, return a string array answer where answer[i] == "FizzBuzz" if i is divisible by 3 and 5, "Fizz" if divisible by 3, "Buzz" if divisible by 5, or i if none apply.',
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
        description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums.',
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
        description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
        examples: [{ input: 's = "()[]{}"', output: 'true' }],
        hints: ['Use a stack'],
        solution: { python: '', javascript: '', cpp: '' },
        explanation: '',
        testCases: [],
        xpReward: 100,
        tags: ['String', 'Stack']
    },
    {
        id: 'merge-sorted-arrays',
        title: 'Merge Sorted Arrays',
        difficulty: 'medium',
        tier: 3,
        languages: ['python', 'javascript', 'cpp'],
        description: 'You are given two integer arrays nums1 and nums2, sorted in non-decreasing order. Merge nums2 into nums1 as one sorted array.',
        examples: [{ input: 'nums1 = [1,2,3], nums2 = [2,5,6]', output: '[1,2,2,3,5,6]' }],
        hints: ['Two pointers from the end'],
        solution: { python: '', javascript: '', cpp: '' },
        explanation: '',
        testCases: [],
        xpReward: 100,
        tags: ['Array', 'Two Pointers', 'Sorting']
    },
    {
        id: 'longest-substring',
        title: 'Longest Substring Without Repeating',
        difficulty: 'hard',
        tier: 4,
        languages: ['python', 'javascript', 'cpp'],
        description: 'Given a string s, find the length of the longest substring without repeating characters.',
        examples: [{ input: 's = "abcabcbb"', output: '3' }],
        hints: ['Sliding window technique'],
        solution: { python: '', javascript: '', cpp: '' },
        explanation: '',
        testCases: [],
        xpReward: 200,
        tags: ['Hash Table', 'String', 'Sliding Window']
    }
];

export const PracticePage: React.FC = () => {
    const { isCompleted } = useProgressStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
    const [tierFilter, setTierFilter] = useState<string>('all');
    const [activeTab, setActiveTab] = useState<'all' | 'solved' | 'unsolved'>('all');

    const tabs = [
        { id: 'all', label: 'All Problems' },
        { id: 'solved', label: 'Solved' },
        { id: 'unsolved', label: 'Unsolved' }
    ];

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

    const stats = {
        total: sampleProblems.length,
        solved: sampleProblems.filter(p => isCompleted('problem', p.id)).length,
        easy: sampleProblems.filter(p => p.difficulty === 'easy').length,
        medium: sampleProblems.filter(p => p.difficulty === 'medium').length,
        hard: sampleProblems.filter(p => p.difficulty === 'hard').length
    };

    const getDifficultyColor = (difficulty: Difficulty) => {
        switch (difficulty) {
            case 'easy': return 'text-green-600 bg-green-50 border-green-100';
            case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-100';
            case 'hard': return 'text-red-600 bg-red-50 border-red-100';
        }
    };

    return (
        <div className="min-h-screen py-10 px-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold mb-3 flex items-center gap-3 text-gray-900">
                    <Code2 className="text-orange-600" size={32} />
                    Practice Arena
                </h1>
                <p className="text-gray-500 text-lg">
                    Sharpen your skills with our curated collection of coding problems
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <Card padding="md" className="text-center bg-white border-gray-200">
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
                    <div className="text-sm font-medium text-gray-500">Total</div>
                </Card>
                <Card padding="md" className="text-center bg-white border-gray-200">
                    <div className="text-3xl font-bold text-green-600 mb-1">{stats.solved}</div>
                    <div className="text-sm font-medium text-gray-500">Solved</div>
                </Card>
                <Card padding="md" className="text-center bg-white border-gray-200">
                    <div className="text-3xl font-bold text-green-500 mb-1">{stats.easy}</div>
                    <div className="text-sm font-medium text-gray-500">Easy</div>
                </Card>
                <Card padding="md" className="text-center bg-white border-gray-200">
                    <div className="text-3xl font-bold text-yellow-500 mb-1">{stats.medium}</div>
                    <div className="text-sm font-medium text-gray-500">Medium</div>
                </Card>
                <Card padding="md" className="text-center bg-white border-gray-200">
                    <div className="text-3xl font-bold text-red-500 mb-1">{stats.hard}</div>
                    <div className="text-sm font-medium text-gray-500">Hard</div>
                </Card>
            </div>

            {/* Controls */}
            <div className="space-y-6 mb-8">
                <Tabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={(id) => setActiveTab(id as any)}
                />

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Search problems or tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon={<Search size={18} />}
                        />
                    </div>
                    <Select
                        className="w-full md:w-48"
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value as Difficulty | 'all')}
                        options={[
                            { value: 'all', label: 'All Difficulties' },
                            { value: 'easy', label: 'Easy' },
                            { value: 'medium', label: 'Medium' },
                            { value: 'hard', label: 'Hard' }
                        ]}
                    />
                    <Select
                        className="w-full md:w-48"
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

            {/* Problem List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Difficulty</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Reward</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredProblems.map((problem) => (
                                <tr
                                    key={problem.id}
                                    className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                >
                                    <td className="px-6 py-4">
                                        {isCompleted('problem', problem.id) ? (
                                            <div className="text-green-500"><CheckCircle2 size={20} /></div>
                                        ) : (
                                            <div className="w-5 h-5 rounded-full border-2 border-gray-300 group-hover:border-orange-400"></div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors">{problem.title}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(problem.difficulty)}`}>
                                            {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1.5">
                                            {problem.tags.slice(0, 2).map(tag => (
                                                <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                                    {tag}
                                                </span>
                                            ))}
                                            {problem.tags.length > 2 && (
                                                <span className="text-xs text-gray-400">+{problem.tags.length - 2}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-orange-600">
                                        +{problem.xpReward} XP
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredProblems.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        No problems found matching your filters.
                    </div>
                )}
            </div>
        </div>
    );
};
