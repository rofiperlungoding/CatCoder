import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    BookOpen,
    Search,
    Clock,
    Code,
    CheckCircle2,
    Sparkles,
    ArrowRight,
    ChevronLeft,
    Play,
    Terminal
} from 'lucide-react';
import { Badge, ProgressBar, Tabs, Button } from '../../components/ui';
import { CodeEditor } from '../../components/editor';
import { useUserStore, useProgressStore, useUIStore } from '../../stores';
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
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const { selectedLanguage, setSelectedLanguage, addXP } = useUserStore();
    const { isCompleted, markComplete } = useProgressStore();
    const { addToast } = useUIStore();

    // List State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTier, setSelectedTier] = useState<Tier | 'all'>('all');

    // Detail State
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

    useEffect(() => {
        if (lessonId) {
            const lesson = sampleLessons.find(l => l.id === lessonId);
            if (lesson) {
                setActiveLesson(lesson);
            }
        } else {
            setActiveLesson(null);
        }
    }, [lessonId]);

    // Editor State
    const [code, setCode] = useState('');
    const [output, setOutput] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(false);

    // Reset code when lesson changes
    useEffect(() => {
        if (activeLesson) {
            const defaultCode = {
                python: 'print("Hello, World!")',
                javascript: 'console.log("Hello, World!");',
                cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}'
            };
            setCode(defaultCode[activeLesson.language as keyof typeof defaultCode] || '');
            setOutput(null);
        }
    }, [activeLesson]);

    const handleRunCode = () => {
        setIsRunning(true);
        setOutput(null);

        // Simulate execution delay
        setTimeout(() => {
            setIsRunning(false);
            const mockOutputs = {
                python: 'Hello, World!\n\nProcess finished with exit code 0',
                javascript: 'Hello, World!',
                cpp: 'Hello, World!'
            };
            setOutput(mockOutputs[activeLesson?.language as keyof typeof mockOutputs] || 'Executed successfully.');
            addToast('success', 'Code executed successfully');
        }, 1000);
    };

    const handleCompleteLessonDisplay = () => {
        if (!activeLesson) return;

        if (!isCompleted('lesson', activeLesson.id)) {
            markComplete('lesson', activeLesson.id);
            addXP(activeLesson.xpReward);
            addToast('xp', `Completed "${activeLesson.title}"! +${activeLesson.xpReward} XP`);
        }
        navigate('/learn');
    };



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

    // Render Detail View
    if (activeLesson) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" className="rounded-full mb-2" onClick={() => navigate('/learn')}>
                    <ChevronLeft size={20} /> Back to Library
                </Button>

                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 border-b border-gray-100 pb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <Badge variant="secondary" className="bg-gray-100 text-primary border-transparent">
                                    Tier {activeLesson.tier}
                                </Badge>
                                <span className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
                                    <Clock size={16} /> {activeLesson.estimatedTime} min read
                                </span>
                            </div>
                            <h1 className="text-4xl font-bold text-primary mb-4">{activeLesson.title}</h1>
                            <p className="text-xl text-muted-foreground max-w-2xl">{activeLesson.description}</p>
                        </div>
                        <div className="w-16 h-16 bg-lime-100 rounded-2xl flex items-center justify-center text-lime-600">
                            <BookOpen size={32} />
                        </div>
                    </div>

                    <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-primary prose-p:text-gray-600 prose-code:text-indigo-600 prose-pre:bg-gray-900 prose-pre:text-gray-50 prose-pre:rounded-2xl">
                        <h3>Introduction</h3>
                        <p>
                            Welcome to <strong>{activeLesson.title}</strong>. In this lesson, we will explore the fundamental concepts
                            that will build the foundation for your coding journey in {activeLesson.language === 'python' ? 'Python' : activeLesson.language === 'javascript' ? 'JavaScript' : 'C++'}.
                        </p>
                        <p>
                            Programming is essentially about giving instructions to a computer. We do this by writing code statements.
                            Let's look at a simple example:
                        </p>
                        <div className="not-prose my-8">
                            <div className="bg-slate-900 rounded-t-2xl p-4 flex items-center justify-between border-b border-white/10">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                </div>
                                <div className="text-xs font-mono text-slate-400">main.{activeLesson.language === 'python' ? 'py' : activeLesson.language === 'javascript' ? 'js' : 'cpp'}</div>
                            </div>
                            <div className="h-[300px] border-x border-slate-200 border-b rounded-b-2xl overflow-hidden shadow-sm relative group">
                                <CodeEditor
                                    value={code}
                                    onChange={(v) => setCode(v || '')}
                                    language={activeLesson.language}
                                />
                                <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        size="sm"
                                        className="rounded-full shadow-lg shadow-indigo-500/20"
                                        onClick={handleRunCode}
                                        disabled={isRunning}
                                    >
                                        {isRunning ? <Sparkles className="animate-spin mr-2" size={14} /> : <Play className="mr-2" size={14} />}
                                        Run Code
                                    </Button>
                                </div>
                            </div>

                            {/* Output Console */}
                            {output && (
                                <div className="mt-4 bg-slate-950 rounded-xl p-4 font-mono text-sm shadow-inner border border-slate-800 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center gap-2 text-slate-400 mb-2 text-xs uppercase tracking-wider font-semibold">
                                        <Terminal size={14} /> Output
                                    </div>
                                    <div className="text-emerald-400 whitespace-pre-wrap">{output}</div>
                                </div>
                            )}
                        </div>
                        <h3>Key Concepts</h3>
                        <ul>
                            <li><strong>Syntax</strong>: The grammar rules of a programming language.</li>
                            <li><strong>Execution</strong>: Running your code to see the result.</li>
                            <li><strong>Debugging</strong>: Finding and fixing errors in your code.</li>
                        </ul>
                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 my-8">
                            <h4 className="flex items-center gap-2 text-blue-800 mt-0">
                                <Sparkles size={20} /> Pro Tip
                            </h4>
                            <p className="mb-0 text-blue-700">
                                Always comment your code! It helps others (and your future self) understand what your code does.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-100">
                        <Button variant="ghost" className="rounded-full" onClick={() => navigate('/learn')}>
                            Cancel
                        </Button>
                        <Button className="rounded-full px-8" onClick={handleCompleteLessonDisplay}>
                            Complete Lesson <CheckCircle2 size={18} className="ml-2" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Render List View
    return (
        <div className="space-y-8">
            {/* Header Bento */}
            <div className="relative overflow-hidden bg-primary text-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-black/5">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-500/20 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold mb-6">
                            <Sparkles size={12} className="text-lime-400" />
                            <span>Interactive Curriculum</span>
                        </div>
                        <h1 className="text-4xl font-bold mb-4 flex items-center gap-4">
                            Learning Library
                        </h1>
                        <p className="text-white/70 max-w-lg text-lg leading-relaxed">
                            Structured paths to take you from beginner to expert. Master concepts one by one.
                        </p>
                    </div>

                    <div className="w-full md:w-auto min-w-[240px] bg-white/5 backdrop-blur-md rounded-[2rem] p-6 border border-white/10">
                        <div className="flex justify-between items-end mb-2">
                            <div className="text-sm font-medium text-white/80">Course Progress</div>
                            <div className="text-3xl font-bold text-lime-400">{Math.round((completedCount / (totalCount || 1)) * 100)}%</div>
                        </div>
                        <ProgressBar value={completedCount} max={totalCount || 1} size="md" className="h-3 bg-white/20" />
                        <div className="mt-4 flex gap-2">
                            <div className="flex-1 bg-white/10 h-10 rounded-full flex items-center justify-center text-xs font-bold border border-white/10">
                                {completedCount} Completed
                            </div>
                            <div className="flex-1 bg-white/10 h-10 rounded-full flex items-center justify-center text-xs font-bold border border-white/10">
                                {totalCount} Total
                            </div>
                        </div>
                    </div>
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
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search lessons..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-6 py-3 bg-white text-primary border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-lime-100 focus:border-lime-500 transition-all font-sans shadow-sm"
                        />
                    </div>
                    <select
                        className="bg-white border border-gray-200 rounded-full text-sm px-6 py-3 focus:outline-none focus:ring-2 focus:ring-lime-100 font-sans shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
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
            <div className="space-y-12 pb-20">
                {Object.entries(groupedLessons).map(([tier, lessons]) => (
                    <div key={tier}>
                        <div className="flex items-center gap-4 mb-8">
                            <Badge variant="secondary" className="px-4 py-1.5 text-sm bg-white shadow-sm border border-gray-100 rounded-full">
                                Tier {tier}
                            </Badge>
                            <div className="h-px flex-1 bg-gray-200"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {lessons.map((lesson) => {
                                const completed = isCompleted('lesson', lesson.id);
                                return (
                                    <div
                                        key={lesson.id}
                                        onClick={() => handleStartLesson(lesson)}
                                        className={`
                                            group relative p-8 rounded-[2.5rem] border border-transparent transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[240px]
                                            ${completed
                                                ? 'bg-gray-50 border-gray-100'
                                                : 'bg-white shadow-sm hover:shadow-xl hover:shadow-black/5 hover:border-lime-200 hover:-translate-y-1'
                                            }
                                        `}
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`
                                                    w-12 h-12 rounded-2xl flex items-center justify-center transition-colors
                                                    ${completed
                                                        ? 'bg-lime-100 text-lime-600'
                                                        : 'bg-gray-100 text-primary group-hover:bg-primary group-hover:text-lime-400'
                                                    }
                                                `}>
                                                    {completed ? <CheckCircle2 size={24} /> : <Code size={24} />}
                                                </div>
                                                {completed && (
                                                    <Badge variant="success" size="sm" className="bg-lime-100 text-lime-700 border-lime-200">Completed</Badge>
                                                )}
                                            </div>

                                            <h3 className="font-bold text-lg text-primary mb-3">
                                                {lesson.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                                {lesson.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                                            <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                                <Clock size={14} /> {lesson.estimatedTime} min
                                            </span>

                                            {!completed ? (
                                                <div className="flex items-center gap-2 text-xs font-bold text-primary group-hover:text-lime-600 transition-colors">
                                                    Start Lesson <ArrowRight size={14} />
                                                </div>
                                            ) : (
                                                <span className="flex items-center gap-1 text-lime-600 text-xs font-bold">
                                                    +{lesson.xpReward} XP Earned
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
