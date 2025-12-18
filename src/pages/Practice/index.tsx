import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Search,
    CheckCircle2,
    Filter,
    ArrowRight,
    Sparkles,
    ChevronLeft,
    Play,
    Send
} from 'lucide-react';
import { Input, Select, Badge, Button } from '../../components/ui';
import { CodeEditor } from '../../components/editor';
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
    const { problemId } = useParams();
    const navigate = useNavigate();
    const { isCompleted, markComplete } = useProgressStore();
    const { addXP, updateStreak } = useUserStore();
    const { addToast } = useUIStore();

    // List State
    const [searchQuery, setSearchQuery] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
    const [tierFilter, setTierFilter] = useState<string>('all');
    const [activeTab, setActiveTab] = useState<'all' | 'solved' | 'unsolved'>('all');

    // Detail State
    const [activeProblem, setActiveProblem] = useState<Problem | null>(null);
    const [code, setCode] = useState<string>('// Write your code here\n\nfunction solution() {\n  \n}');

    useEffect(() => {
        if (problemId) {
            const problem = sampleProblems.find(p => p.id === problemId);
            if (problem) {
                setActiveProblem(problem);
            }
        } else {
            setActiveProblem(null);
        }
    }, [problemId]);

    const handleSolveProblem = (e: React.MouseEvent, problem: Problem) => {
        e.stopPropagation();
        navigate(`/practice/${problem.id}`);
    };

    const handleSubmitCode = () => {
        if (!activeProblem) return;

        // Mock submission success
        addToast('info', 'Running validation tests...');

        setTimeout(() => {
            if (!isCompleted('problem', activeProblem.id)) {
                markComplete('problem', activeProblem.id);
                addXP(activeProblem.xpReward);
                updateStreak();
                addToast('success', `Correct Answer! +${activeProblem.xpReward} XP`);
            } else {
                addToast('success', 'Correct Answer! (Already Solved)');
            }
            navigate('/practice');
        }, 1500);
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

    // Render Detail View
    if (activeProblem) {
        return (
            <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="rounded-full" onClick={() => navigate('/practice')}>
                        <ChevronLeft size={20} /> Back
                    </Button>
                    <h1 className="text-2xl font-bold text-primary">{activeProblem.title}</h1>
                    <Badge className={`${getDifficultyColor(activeProblem.difficulty)} rounded-full border bg-opacity-20`}>
                        {activeProblem.difficulty}
                    </Badge>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                    {/* Problem Description */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 overflow-y-auto">
                        <div className="prose max-w-none">
                            <h3 className="text-xl font-bold mb-4">Description</h3>
                            <p className="text-muted-foreground mb-6">{activeProblem.description}</p>

                            <h4 className="text-md font-bold mb-3">Examples</h4>
                            <div className="space-y-4 mb-6">
                                {activeProblem.examples.map((ex, i) => (
                                    <div key={i} className="bg-gray-50 p-4 rounded-xl font-mono text-sm border border-gray-100">
                                        <div className="mb-2"><span className="font-bold text-primary">Input:</span> {ex.input}</div>
                                        <div><span className="font-bold text-primary">Output:</span> {ex.output}</div>
                                    </div>
                                ))}
                            </div>

                            <h4 className="text-md font-bold mb-3">Tags</h4>
                            <div className="flex gap-2">
                                {activeProblem.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-gray-50 text-muted-foreground text-xs font-semibold rounded-full border border-gray-100">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Editor */}
                    <div className="flex flex-col gap-4">
                        <div className="flex-1 min-h-0">
                            <CodeEditor
                                value={code}
                                onChange={(val) => setCode(val || '')}
                                language="javascript"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="secondary" className="rounded-full" onClick={() => addToast('info', 'Code executed successfully. Output: ...')}>
                                <Play size={16} className="mr-2" /> Run Code
                            </Button>
                            <Button className="rounded-full" onClick={handleSubmitCode}>
                                <Send size={16} className="mr-2" /> Submit Solution
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render List View (Existing)
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-primary mb-2 flex items-center gap-2">
                        Practice Arena
                        <Sparkles size={24} className="text-lime-500" />
                    </h1>
                    <p className="text-muted-foreground">Sharpen your algorithmic skills with curated problems.</p>
                </div>
                <Button className="rounded-full px-6 shadow-lg shadow-black/5" onClick={() => {
                    const random = sampleProblems[Math.floor(Math.random() * sampleProblems.length)];
                    navigate(`/practice/${random.id}`);
                }}>Random Problem</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Column: Control Center */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-6 shadow-sm sticky top-6 border border-gray-100">
                        <div className="flex items-center gap-2 mb-6 text-primary font-bold text-lg">
                            <Filter size={20} /> Filters
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Status</label>
                                <div className="space-y-2">
                                    {['all', 'solved', 'unsolved'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => setActiveTab(status as any)}
                                            className={`
                                                w-full text-left px-4 py-3 rounded-full text-sm font-semibold transition-all
                                                ${activeTab === status
                                                    ? 'bg-primary text-white shadow-md'
                                                    : 'text-muted-foreground hover:bg-gray-50'
                                                }
                                            `}
                                        >
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="h-px bg-gray-100" />

                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Search</label>
                                <Input
                                    placeholder="Keywords..."
                                    icon={<Search size={14} />}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-gray-50 border-transparent focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Difficulty</label>
                                <Select
                                    value={difficultyFilter}
                                    onChange={(e) => setDifficultyFilter(e.target.value as Difficulty | 'all')}
                                    options={[
                                        { value: 'all', label: 'All Difficulties' },
                                        { value: 'easy', label: 'Easy' },
                                        { value: 'medium', label: 'Medium' },
                                        { value: 'hard', label: 'Hard' }
                                    ]}
                                    className="bg-gray-50 border-transparent focus:bg-white"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Tier</label>
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
                                    className="bg-gray-50 border-transparent focus:bg-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Problem Grid */}
                <div className="lg:col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredProblems.map((problem) => {
                            const completed = isCompleted('problem', problem.id);

                            return (
                                <div
                                    key={problem.id}
                                    className={`
                                        group relative p-6 rounded-[2.5rem] border border-transparent transition-all duration-300 cursor-pointer flex flex-col justify-between h-full min-h-[220px]
                                        ${completed
                                            ? 'bg-gray-50 border-gray-100'
                                            : 'bg-white shadow-sm hover:shadow-xl hover:shadow-black/5 hover:border-lime-200 hover:-translate-y-1'
                                        }
                                    `}
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <Badge className={`${getDifficultyColor(problem.difficulty)} border bg-opacity-10 rounded-full px-3`}>
                                                {problem.difficulty}
                                            </Badge>
                                            {completed && (
                                                <div className="bg-lime-100 text-lime-600 p-1.5 rounded-full">
                                                    <CheckCircle2 size={16} />
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-primary text-xl mb-3 group-hover:text-black transition-colors">
                                            {problem.title}
                                        </h3>
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {problem.tags.map(tag => (
                                                <span key={tag} className="px-3 py-1 bg-gray-50 text-muted-foreground text-xs font-semibold rounded-full border border-gray-100">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-100 pt-4 flex items-center justify-between mt-auto">
                                        <span className="text-xs font-semibold text-muted-foreground">Tier {problem.tier}</span>
                                        {completed ? (
                                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                                <CheckCircle2 size={12} /> Solved
                                            </span>
                                        ) : (
                                            <div
                                                onClick={(e) => handleSolveProblem(e, problem)}
                                                className="flex items-center gap-1 text-xs font-bold text-primary group-hover:text-lime-600 transition-colors"
                                            >
                                                Solve Challenge <ArrowRight size={14} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
