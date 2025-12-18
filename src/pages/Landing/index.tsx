import React from 'react';
import { ArrowRight, Trophy, Terminal, Globe, Cpu, CheckCircle2 } from 'lucide-react';
import { useUIStore } from '../../stores';

export const LandingPage: React.FC = () => {
    const { setShowAuthModal } = useUIStore();

    const handleGetStarted = () => {
        setShowAuthModal(true);
    };

    return (
        <div className="space-y-40 pb-20">
            {/* Hero Section - Minimalist & Bold */}
            <div className="text-center max-w-5xl mx-auto pt-20 sm:pt-32 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200/50 backdrop-blur-sm transition-all hover:bg-slate-200/80 cursor-default">
                    <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
                    <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase">New Version 2.0</span>
                </div>

                <h1 className="text-6xl sm:text-8xl font-[800] text-slate-900 tracking-tight leading-[0.95] mx-auto">
                    Master Coding.<br />
                    <span className="text-slate-900/40">The Enterprise Way.</span>
                </h1>

                <p className="text-xl sm:text-2xl text-slate-600 max-w-2xl mx-auto leading-normal font-medium">
                    A zero-fluff, gamified learning platform modeled after real-world enterprise environments.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                    <button
                        onClick={handleGetStarted}
                        className="group relative h-14 px-8 rounded-full bg-slate-900 text-white font-semibold text-lg hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2"
                    >
                        Start Learning
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        className="h-14 px-8 rounded-full bg-slate-100 text-slate-900 font-semibold text-lg hover:bg-slate-200 transition-all active:scale-95"
                    >
                        View Curriculum
                    </button>
                </div>

                {/* Hero Graphic - Mac Window Style (Monochrome/Clean) */}
                <div className="relative mt-20 max-w-4xl mx-auto">
                    {/* Soft Glow behind content */}
                    <div className="absolute -inset-10 bg-gradient-to-tr from-slate-200/40 via-indigo-100/40 to-slate-200/40 blur-3xl rounded-full opacity-70"></div>

                    <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden">
                        {/* Window Header */}
                        <div className="bg-slate-50/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-slate-200/80" />
                                <div className="w-3 h-3 rounded-full bg-slate-200/80" />
                                <div className="w-3 h-3 rounded-full bg-slate-200/80" />
                            </div>
                            <div className="text-xs font-mono text-slate-400">algorithm.py</div>
                            <div className="w-12"></div> {/* Spacer for center alignment */}
                        </div>

                        {/* Minimalist Code Content */}
                        <div className="p-8 text-left font-mono text-sm sm:text-base leading-loose bg-white">
                            <div className="text-slate-400 mb-4"># Optimizing your career path...</div>
                            <div className="space-y-1 text-slate-800">
                                <div className="flex"><span className="text-indigo-600 w-24">class</span> <span className="font-bold">Developer:</span></div>
                                <div className="flex pl-8"><span className="text-indigo-600 w-24">def</span> <span className="text-slate-600">init__(self):</span></div>
                                <div className="pl-16 flex gap-2"><span className="text-slate-500">self.skills</span> = [<span className="text-green-600">"React"</span>, <span className="text-green-600">"TypeScript"</span>]</div>
                                <div className="pl-16 flex gap-2"><span className="text-slate-500">self.level</span> = <span className="text-orange-500">1</span></div>
                                <br />
                                <div className="flex pl-8"><span className="text-indigo-600 w-24">def</span> <span className="text-slate-600">level_up(self):</span></div>
                                <div className="pl-16 flex gap-2"><span className="text-slate-500">while</span> <span className="font-bold">True:</span></div>
                                <div className="pl-24 flex gap-2"><span className="text-slate-500">self.gain_xp()</span></div>
                                <div className="pl-24 flex gap-2"><span className="text-slate-500">if</span> self.xp &gt; threshold:</div>
                                <div className="pl-32 flex gap-2"><span className="text-indigo-600">return</span> <span className="font-bold bg-slate-100 px-2 rounded text-slate-900">"Senior_Engineer"</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section - Clean & Spacious */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-20">
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">Engineered for focus.</h2>
                    <p className="text-xl text-slate-500 max-w-xl">We stripped away the distractions so you can focus on what matters: writing quality code.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Feature Card 1 */}
                    <div className="group p-8 rounded-[2rem] bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-900 mb-8 group-hover:scale-110 transition-transform shadow-sm">
                            <Globe strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Multi-Language</h3>
                        <p className="text-slate-500 leading-relaxed">
                            Seamlessly switch contexts between Python, JavaScript, and C++. Master the concepts, not just the syntax.
                        </p>
                    </div>

                    {/* Feature Card 2 */}
                    <div className="group p-8 rounded-[2rem] bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-900 mb-8 group-hover:scale-110 transition-transform shadow-sm">
                            <Trophy strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Gamified Growth</h3>
                        <p className="text-slate-500 leading-relaxed">
                            Visual progress tracking that feels rewarding without being distracting. XP, Levels, and Streaks done right.
                        </p>
                    </div>

                    {/* Feature Card 3 */}
                    <div className="group p-8 rounded-[2rem] bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
                        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-900 mb-8 group-hover:scale-110 transition-transform shadow-sm">
                            <Terminal strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Instant Execution</h3>
                        <p className="text-slate-500 leading-relaxed">
                            A powerful Monaco-based editor that runs in your browser. No environment setup required. Just code.
                        </p>
                    </div>
                </div>

                {/* Big Feature Block */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group p-10 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                    <Cpu size={24} className="text-white" />
                                </div>
                                <span className="font-semibold text-slate-300">Career Paths</span>
                            </div>
                            <h3 className="text-3xl font-bold mb-4">Structured for Success</h3>
                            <p className="text-slate-400 text-lg leading-relaxed max-w-md mb-8">
                                Don't guess what to learn next. Follow industry-vetted roadmaps designed to take you from junior to senior.
                            </p>
                            <div className="space-y-3">
                                {['Frontend Developer', 'Backend Architect', 'Full Stack Engineer'].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 text-slate-300">
                                        <CheckCircle2 size={18} className="text-green-400" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Decorative Abstract blobs */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500 rounded-full blur-[100px] opacity-20"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-blue-500 rounded-full blur-[80px] opacity-20"></div>
                    </div>

                    <div className="group p-10 rounded-[2.5rem] bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-2xl hover:shadow-slate-200/40 transition-all duration-500 flex flex-col justify-between">
                        <div>
                            <h3 className="text-3xl font-bold text-slate-900 mb-4">Join the Cohort</h3>
                            <p className="text-slate-500 text-lg leading-relaxed">
                                Compete in daily challenges and see where you stand on the global leaderboard.
                            </p>
                        </div>
                        <div className="mt-10 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            {/* Mock Leaderboard Item */}
                            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-50">
                                <span className="font-bold text-slate-300 text-lg">01</span>
                                <div className="w-10 h-10 rounded-full bg-slate-900"></div>
                                <div className="flex-1">
                                    <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
                                </div>
                                <div className="font-mono text-indigo-600 font-bold">2,450 XP</div>
                            </div>
                            <div className="flex items-center gap-4 opacity-50">
                                <span className="font-bold text-slate-300 text-lg">02</span>
                                <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                                <div className="flex-1">
                                    <div className="h-4 w-20 bg-slate-200 rounded"></div>
                                </div>
                                <div className="font-mono text-slate-400 font-bold">1,800 XP</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom CTA - Minimal */}
            <div className="text-center py-20 px-4">
                <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-8 tracking-tight">Ready to start?</h2>
                <button
                    onClick={handleGetStarted}
                    className="h-16 px-12 rounded-full bg-slate-900 text-white font-bold text-xl hover:bg-slate-800 transition-all hover:scale-105 shadow-xl hover:shadow-2xl shadow-slate-900/20"
                >
                    Create Free Account
                </button>
                <p className="mt-6 text-slate-400 text-sm">No credit card required. Free tier forever.</p>
            </div>
        </div>
    );
};
