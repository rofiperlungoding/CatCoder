import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Zap, Trophy, BookOpen, Sparkles, Target } from 'lucide-react';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="pb-20 bg-[#050505] text-[#FAFAFA]">
            {/* Hero Section */}
            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center space-y-10">
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <span className="text-xs font-semibold text-lime-400">New</span>
                    <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                    <span className="text-xs font-medium text-gray-400">AI Code Review 2.0</span>
                </div>

                <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white max-w-4xl leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-backwards">
                    Master Coding with <br className="hidden sm:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-300 to-emerald-400">AI-Powered Learning</span>
                </h1>

                <p className="text-lg sm:text-xl text-gray-400 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-backwards">
                    Level up your programming skills with interactive challenges, instant AI feedback, and a gamified learning experience that makes coding fun.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-backwards">
                    <button
                        onClick={() => navigate('/onboarding')}
                        className="bg-white text-black px-8 py-4 rounded-full font-bold text-sm hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 duration-200 ease-out"
                    >
                        Start Learning Free
                    </button>
                    <button
                        onClick={() => navigate('/courses')}
                        className="bg-white/5 text-white border border-white/10 px-8 py-4 rounded-full font-bold text-sm hover:bg-white/10 transition-all hover:scale-105 active:scale-95 duration-200 ease-out"
                    >
                        View Courses
                    </button>
                </div>

                {/* Hero Image / Code Editor Graphic */}
                <div className="w-full max-w-6xl mt-12 relative group rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95 duration-1000 delay-200 border border-white/5">
                    <div className="aspect-[16/9] w-full bg-[#0a0a0a] relative overflow-hidden">
                        {/* Code Editor Mock */}
                        <div className="absolute inset-0 p-8">
                            {/* Title Bar */}
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                <span className="ml-4 text-white/30 text-sm font-mono">solution.py</span>
                            </div>
                            {/* Code Lines */}
                            <div className="font-mono text-sm sm:text-base text-left space-y-2">
                                <div><span className="text-purple-400">def</span> <span className="text-yellow-300">solve_challenge</span><span className="text-white">(problems):</span></div>
                                <div className="pl-8"><span className="text-gray-600"># Your coding journey starts here</span></div>
                                <div className="pl-8"><span className="text-purple-400">for</span> <span className="text-white">problem</span> <span className="text-purple-400">in</span> <span className="text-white">problems:</span></div>
                                <div className="pl-16"><span className="text-white">xp = problem.</span><span className="text-yellow-300">solve</span><span className="text-white">()</span></div>
                                <div className="pl-16"><span className="text-white">level.</span><span className="text-yellow-300">up</span><span className="text-white">(xp)</span></div>
                                <div className="pl-8"><span className="text-purple-400">return</span> <span className="text-green-400">"🎉 You're a coding master!"</span></div>
                            </div>
                        </div>

                        {/* Overlay Stats - Top Right */}
                        <div className="absolute top-10 right-10 bg-black/60 backdrop-blur-md border border-white/10 p-6 rounded-3xl text-white animate-in slide-in-from-right-8 duration-700 delay-500">
                            <div className="text-3xl font-bold mb-1 text-lime-400">+500 XP</div>
                            <div className="text-sm text-gray-400">Challenge Complete!</div>
                        </div>

                        {/* Overlay Stats - Bottom Left */}
                        <div className="absolute bottom-10 left-10 bg-black/60 backdrop-blur-md border border-white/10 p-6 rounded-3xl text-white min-w-[280px] animate-in slide-in-from-bottom-8 duration-700 delay-500">
                            <div className="mb-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <Trophy className="text-yellow-400" size={24} />
                                    <span className="text-2xl font-bold">Level 12</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2">
                                    <div className="bg-lime-400 h-2 rounded-full w-3/4"></div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                                <div className="text-center">
                                    <div className="font-bold text-xl">847</div>
                                    <div className="text-xs text-gray-500">Problems</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-bold text-xl">23</div>
                                    <div className="text-xs text-gray-500">Day Streak</div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Right Button */}
                        <div className="absolute bottom-10 right-10">
                            <button
                                onClick={() => navigate('/onboarding')}
                                className="flex items-center gap-2 bg-lime-400 text-black px-6 py-3 rounded-full font-bold shadow-lg hover:bg-lime-300 transition-all hover:scale-105 active:scale-95 duration-200 ease-out"
                            >
                                Start Coding
                                <Sparkles size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Why CatCoder Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-40">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div>
                        <div className="inline-block px-4 py-1.5 rounded-full border border-lime-500/20 text-xs font-semibold text-lime-400 mb-6 bg-lime-500/10">
                            Why CatCoder?
                        </div>
                        <h2 className="text-4xl sm:text-5xl font-bold text-white max-w-2xl leading-[1.1]">
                            Everything You Need to Become a Better Developer
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(320px,auto)]">
                    {/* Card 1 - Interactive Challenges */}
                    <div className="bg-[#0a0a0a] border border-white/10 shadow-sm rounded-[2.5rem] p-8 flex flex-col justify-between hover:border-white/20 transition-all duration-300">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4">Interactive Challenges</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Learn by doing with 500+ coding challenges across multiple languages. From beginner to advanced, we've got you covered.
                            </p>
                        </div>
                        <div className="mt-8">
                            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20">
                                <Code2 strokeWidth={1.5} className="w-8 h-8" />
                            </div>
                        </div>
                    </div>

                    {/* Card 2 - Code Visual */}
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden relative group flex items-center justify-center">
                        <div className="absolute inset-x-0 top-0 h-px bg-white/5"></div>
                        <div className="p-8 font-mono text-sm w-full">
                            <div className="text-purple-400">function <span className="text-yellow-300">learn</span>() {'{'}</div>
                            <div className="pl-4 text-green-400">// Practice daily</div>
                            <div className="pl-4 text-white">skills++;</div>
                            <div className="text-purple-400">{'}'}</div>
                        </div>
                    </div>

                    {/* Card 3 - AI Feedback */}
                    <div className="bg-[#0a0a0a] border border-white/10 shadow-sm rounded-[2.5rem] p-8 flex flex-col justify-between hover:border-white/20 transition-all duration-300">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4">AI-Powered Feedback</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Get instant, intelligent feedback on your code. Our AI helps you understand mistakes and suggests improvements.
                            </p>
                        </div>
                        <div className="mt-8">
                            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400 border border-amber-500/20">
                                <Zap strokeWidth={1.5} className="w-8 h-8" />
                            </div>
                        </div>
                    </div>

                    {/* Card 4 - Gamified */}
                    <div className="bg-[#0a0a0a] border border-white/10 shadow-sm rounded-[2.5rem] p-8 flex flex-col justify-between hover:border-white/20 transition-all duration-300">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4">Gamified Learning</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Earn XP, level up, unlock achievements, and compete on leaderboards. Learning to code has never been this fun!
                            </p>
                        </div>
                        <div className="mt-8">
                            <div className="w-16 h-16 bg-lime-500/10 rounded-2xl flex items-center justify-center text-lime-400 border border-lime-500/20">
                                <Trophy strokeWidth={1.5} className="w-8 h-8" />
                            </div>
                        </div>
                    </div>

                    {/* Card 5 - Structured Courses */}
                    <div className="bg-[#0a0a0a] border border-white/10 shadow-sm rounded-[2.5rem] p-8 flex flex-col justify-between hover:border-white/20 transition-all duration-300">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4">Structured Courses</h3>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Follow curated learning paths designed by experts. Master Python, JavaScript, and more with step-by-step guidance.
                            </p>
                        </div>
                        <div className="mt-8">
                            <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 border border-purple-500/20">
                                <BookOpen strokeWidth={1.5} className="w-8 h-8" />
                            </div>
                        </div>
                    </div>

                    {/* Card 6 - Green Accent */}
                    <div className="bg-lime-400 rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold text-black mb-4">Track Your Progress</h3>
                            <p className="text-sm text-black/70 leading-relaxed font-bold">
                                Visualize your coding journey with detailed analytics. See your strengths, identify areas to improve, and celebrate milestones.
                            </p>
                        </div>
                        <div className="mt-8">
                            <div className="w-16 h-16 bg-black/10 rounded-2xl flex items-center justify-center text-black backdrop-blur-sm">
                                <Target strokeWidth={1.5} className="w-8 h-8" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl opacity-50 translate-x-10 translate-y-10"></div>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="flex items-center justify-between mb-16">
                    <h2 className="text-4xl sm:text-5xl font-bold text-white">Frequently Asked<br />Questions</h2>
                    <button
                        onClick={() => navigate('/onboarding')}
                        className="hidden md:flex bg-white/10 text-white border border-white/20 px-6 py-3 rounded-full font-bold text-sm hover:bg-white/20 transition-all hover:scale-105 active:scale-95 duration-200 ease-out"
                    >
                        Get Started
                    </button>
                </div>

                <div className="space-y-4">
                    {[
                        { title: "Is CatCoder free to use?", desc: "Yes! CatCoder offers a free tier with access to hundreds of challenges. Premium plans unlock advanced features and courses." },
                        { title: "What programming languages are supported?", desc: "We support Python, JavaScript, TypeScript, Java, C++, and more. New languages are added regularly based on community feedback." },
                        { title: "How does the XP and leveling system work?", desc: "Complete challenges to earn XP. As you accumulate XP, you level up and unlock new badges, achievements, and harder challenges." },
                        { title: "Can I track my learning progress?", desc: "Absolutely! Your dashboard shows detailed analytics including problems solved, skills mastered, and learning streaks." }
                    ].map((item, i) => (
                        <div key={i} className="group flex flex-col md:flex-row md:items-center justify-between p-8 bg-[#0a0a0a] hover:bg-[#111] border border-white/5 hover:border-white/10 rounded-[2rem] transition-all duration-300 cursor-pointer">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-lime-500/10 flex items-center justify-center text-lime-400 font-bold shrink-0 border border-lime-500/20">
                                    {i + 1}
                                </div>
                                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                            </div>
                            <div className="mt-4 md:mt-0 max-w-md text-sm text-gray-400">
                                {item.desc}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
