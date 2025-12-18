import React from 'react';
import {
    Code,
    Zap,
    Trophy,
    Users,
    Cpu,
    Globe,
    ArrowRight
} from 'lucide-react';
import { Button } from '../../components/ui';
import { useNavigate } from 'react-router-dom';

export const FeaturesPage: React.FC = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: <Code size={32} />,
            title: "Interactive Code Editor",
            description: "Write, run, and debug code directly in your browser with our powerful Monaco-based editor. Supports Python, JavaScript, and C++.",
            color: "text-blue-500",
            bg: "bg-blue-50"
        },
        {
            icon: <Zap size={32} />,
            title: "Instant Feedback",
            description: "Get real-time feedback on your code. Our automated testing engine checks your solutions against multiple test cases in milliseconds.",
            color: "text-amber-500",
            bg: "bg-amber-50"
        },
        {
            icon: <Trophy size={32} />,
            title: "Gamified Learning",
            description: "Earn XP, maintain streaks, and climb the leaderboards. Unlock badges and achievements as you master new skills.",
            color: "text-lime-600",
            bg: "bg-lime-100"
        },
        {
            icon: <Users size={32} />,
            title: "Community & Peer Review",
            description: "Connect with other learners, discuss solutions, and review code. Learning is better when we do it together.",
            color: "text-purple-500",
            bg: "bg-purple-50"
        },
        {
            icon: <Cpu size={32} />,
            title: "AI-Powered Hints",
            description: "Stuck on a problem? Our intelligent hints system guides you to the solution without giving it away instantly.",
            color: "text-rose-500",
            bg: "bg-rose-50"
        },
        {
            icon: <Globe size={32} />,
            title: "Real-world Scenarios",
            description: "Practice with challenges inspired by real-world interview questions and industry use cases.",
            color: "text-teal-500",
            bg: "bg-teal-50"
        }
    ];

    return (
        <div className="pt-32 pb-20 space-y-24">
            {/* Hero Section */}
            <section className="px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-100 text-lime-800 text-sm font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Zap size={16} fill="currentColor" />
                    <span>Supercharge your coding skills</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-primary mb-8 max-w-4xl leading-tight">
                    Everything you need to become a <span className="text-lime-500">Master Developer</span>.
                </h1>

                <p className="text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
                    CatCoder provides a comprehensive ecosystem for learning, practicing, and competing.
                    From hello world to system design, we've got you covered.
                </p>

                <div className="flex gap-4">
                    <Button size="lg" className="rounded-full px-8 h-14 text-lg shadow-xl shadow-lime-500/20" onClick={() => navigate('/learn')}>
                        Start for Free <ArrowRight className="ml-2" />
                    </Button>
                </div>
            </section>

            {/* Features Grid */}
            <section className="px-6 md:px-12 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all duration-300 hover:-translate-y-1 group"
                        >
                            <div className={`w-16 h-16 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-6 text-current group-hover:scale-110 transition-transform duration-300`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-primary mb-4">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Bento Highlight */}
            <section className="px-6 md:px-12 max-w-7xl mx-auto">
                <div className="bg-black text-white rounded-[3rem] p-12 md:p-24 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-lime-500/20 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-16">
                        <div className="flex-1 space-y-8">
                            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                                Designed for <span className="text-lime-400">Efficiency</span> and <span className="text-lime-400">Focus</span>.
                            </h2>
                            <p className="text-white/60 text-lg leading-relaxed max-w-xl">
                                Our platform is built with a minimalist aesthetic to reduce distractions.
                                The clean interface puts your code front and center, helping you enter the flow state faster and stay there longer.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Distraction-free coding environment",
                                    "Dark mode optimized for long sessions",
                                    "Keyboard shortcuts for power users"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-lg font-medium">
                                        <div className="w-6 h-6 rounded-full bg-lime-500/20 flex items-center justify-center text-lime-400">
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex-1 w-full relative">
                            <div className="absolute inset-0 bg-lime-500/20 blur-3xl transform rotate-6 scale-90 rounded-[2rem]"></div>
                            <div className="bg-gray-900 border border-white/10 rounded-[2rem] p-6 shadow-2xl relative rotate-3 hover:rotate-0 transition-transform duration-500">
                                <div className="flex gap-2 mb-4">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <div className="space-y-3 font-mono text-sm">
                                    <div className="flex">
                                        <span className="text-purple-400 w-8 text-right mr-4 select-none opacity-50">1</span>
                                        <span className="text-blue-400">def</span> <span className="text-yellow-400">is_prime</span>(n):
                                    </div>
                                    <div className="flex">
                                        <span className="text-gray-500 w-8 text-right mr-4 select-none opacity-50">2</span>
                                        <span className="pl-4"><span className="text-purple-400">if</span> n &lt;= 1:</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-gray-500 w-8 text-right mr-4 select-none opacity-50">3</span>
                                        <span className="pl-8"><span className="text-purple-400">return</span> <span className="text-yellow-400">False</span></span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-gray-500 w-8 text-right mr-4 select-none opacity-50">4</span>
                                        <span className="pl-4"><span className="text-purple-400">for</span> i <span className="text-purple-400">in</span> <span className="text-blue-400">range</span>(2, <span className="text-blue-400">int</span>(n**0.5) + 1):</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-gray-500 w-8 text-right mr-4 select-none opacity-50">5</span>
                                        <span className="pl-8"><span className="text-purple-400">if</span> n % i == 0:</span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-gray-500 w-8 text-right mr-4 select-none opacity-50">6</span>
                                        <span className="pl-12"><span className="text-purple-400">return</span> <span className="text-yellow-400">False</span></span>
                                    </div>
                                    <div className="flex">
                                        <span className="text-gray-500 w-8 text-right mr-4 select-none opacity-50">7</span>
                                        <span className="pl-4"><span className="text-purple-400">return</span> <span className="text-yellow-400">True</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
