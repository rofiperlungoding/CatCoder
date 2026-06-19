import {
    ProgrammingFlagIcon, BookOpen01Icon, SparklesIcon, Target01Icon, EnergyIcon,
    Trophy, ArrowRight01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button, Surface, Progress } from '../../components/ds';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const FAQ_ITEMS: { title: string; desc: string }[] = [
    { title: 'Is CatCoder free to use?', desc: 'Yes! CatCoder offers a free tier with access to hundreds of challenges. Premium plans unlock advanced features and courses.' },
    { title: 'What programming languages are supported?', desc: 'We support Python, JavaScript, TypeScript, Java, C++, and more. New languages are added regularly based on community feedback.' },
    { title: 'How does the XP and leveling system work?', desc: 'Complete challenges to earn XP. As you accumulate XP, you level up and unlock new badges, achievements, and harder challenges.' },
    { title: 'Can I track my learning progress?', desc: 'Absolutely! Your dashboard shows detailed analytics including problems solved, skills mastered, and learning streaks.' },
];

const FEATURE_ICONS = [
    { icon: ProgrammingFlagIcon, accent: 'text-sky-300', title: 'Interactive Challenges', desc: 'Learn by doing with 500+ coding challenges across multiple languages. From beginner to advanced, we’ve got you covered.' },
    { icon: EnergyIcon, accent: 'text-amber-300', title: 'AI-Powered Feedback', desc: 'Get instant, intelligent feedback on your code. Our AI helps you understand mistakes and suggests improvements.' },
    { icon: Trophy, accent: 'text-lime-300', title: 'Gamified Learning', desc: 'Earn XP, level up, unlock achievements, and compete on leaderboards. Learning to code has never been this fun!' },
    { icon: BookOpen01Icon, accent: 'text-purple-300', title: 'Structured Courses', desc: 'Follow curated learning paths designed by experts. Master Python, JavaScript, and more with step-by-step guidance.' },
];

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="cc-root relative">
            {/* Ambient brand glow */}
            <div aria-hidden className="pointer-events-none absolute -z-0" style={{
                top: -120, left: '50%', transform: 'translateX(-50%)', width: 720, height: 560,
                background: 'radial-gradient(circle, rgba(163,230,53,.14), transparent 70%)',
                filter: 'blur(60px)',
            }} />

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center space-y-10">
                <span className="cc-pill cc-pill-brand">
                    <HugeiconsIcon icon={SparklesIcon} size={13} /> New · AI Code Review 2.0
                </span>

                <h1 className="text-5xl sm:text-7xl font-bold tracking-tight max-w-4xl leading-[1.1]" style={{ color: 'var(--cc-tx-1)' }}>
                    Master Coding with <br className="hidden sm:block" />
                    <span style={{ color: 'var(--cc-brand-1)' }}>AI-Powered Learning</span>
                </h1>

                <p className="text-lg sm:text-xl max-w-2xl leading-relaxed" style={{ color: 'var(--cc-tx-2)' }}>
                    Level up your programming skills with interactive challenges, instant AI feedback, and a gamified learning experience that makes coding fun.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="lg" onClick={() => navigate('/onboarding')}>
                        Start Learning Free <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                    </Button>
                    <Button variant="secondary" size="lg" onClick={() => navigate('/learn')}>
                        View Courses
                    </Button>
                </div>

                {/* Code Editor showcase — reskinned to glass */}
                <div className="w-full max-w-6xl mt-12 relative cc-glass overflow-hidden" style={{ borderRadius: 'var(--cc-r-xl)' }}>
                    <div className="aspect-[16/9] w-full relative overflow-hidden" style={{ background: 'var(--cc-bg)' }}>
                        {/* Code Editor Mock */}
                        <div className="absolute inset-0 p-6 sm:p-8">
                            {/* Title Bar */}
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                <span className="ml-4 text-sm cc-mono" style={{ color: 'var(--cc-tx-3)' }}>solution.py</span>
                            </div>
                            {/* Code Lines */}
                            <div className="cc-mono text-sm sm:text-base text-left space-y-2">
                                <div><span className="text-purple-400">def</span> <span className="text-yellow-300">solve_challenge</span><span className="text-white">(problems):</span></div>
                                <div className="pl-8"><span className="text-gray-600"># Your coding journey starts here</span></div>
                                <div className="pl-8"><span className="text-purple-400">for</span> <span className="text-white">problem</span> <span className="text-purple-400">in</span> <span className="text-white">problems:</span></div>
                                <div className="pl-16"><span className="text-white">xp = problem.</span><span className="text-yellow-300">solve</span><span className="text-white">()</span></div>
                                <div className="pl-16"><span className="text-white">level.</span><span className="text-yellow-300">up</span><span className="text-white">(xp)</span></div>
                                <div className="pl-8"><span className="text-purple-400">return</span> <span className="text-green-400">"🎉 You're a coding master!"</span></div>
                            </div>
                        </div>

                        {/* Overlay Stats - Top Right */}
                        <div className="absolute top-8 right-8 cc-glass cc-glass-interactive p-5 sm:p-6" style={{ borderRadius: 'var(--cc-r-lg)' }}>
                            <div className="text-3xl font-bold mb-1 cc-mono" style={{ color: 'var(--cc-brand-1)' }}>+500 XP</div>
                            <div className="text-sm" style={{ color: 'var(--cc-tx-2)' }}>Challenge Complete!</div>
                        </div>

                        {/* Overlay Stats - Bottom Left */}
                        <div className="absolute bottom-8 left-8 cc-glass cc-glass-interactive p-5 sm:p-6 min-w-[280px]" style={{ borderRadius: 'var(--cc-r-lg)' }}>
                            <div className="mb-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="cc-icon-well w-9 h-9 text-amber-300 shrink-0">
                                        <HugeiconsIcon icon={Trophy} size={18} strokeWidth={1.8} />
                                    </span>
                                    <span className="text-2xl font-bold cc-mono" style={{ color: 'var(--cc-tx-1)' }}>Level 12</span>
                                </div>
                                <Progress value={75} className="h-2" aria-label="Level progress" />
                            </div>
                            <div className="flex items-center gap-4 pt-4" style={{ borderTop: '1px solid var(--cc-border)' }}>
                                <div className="text-center">
                                    <div className="cc-mono font-bold text-xl" style={{ color: 'var(--cc-tx-1)' }}>847</div>
                                    <div className="cc-eyebrow mt-0.5">Problems</div>
                                </div>
                                <div className="text-center">
                                    <div className="cc-mono font-bold text-xl" style={{ color: 'var(--cc-tx-1)' }}>23</div>
                                    <div className="cc-eyebrow mt-0.5">Day Streak</div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Right Button */}
                        <div className="absolute bottom-8 right-8">
                            <Button size="md" onClick={() => navigate('/onboarding')}>
                                Start Coding <HugeiconsIcon icon={SparklesIcon} size={16} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Why CatCoder Section */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-32">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div>
                        <span className="cc-pill cc-pill-brand mb-6">Why CatCoder?</span>
                        <h2 className="text-4xl sm:text-5xl font-bold max-w-2xl leading-[1.1]" style={{ color: 'var(--cc-tx-1)' }}>
                            Everything You Need to Become a Better Developer
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(320px,auto)] cc-stagger">
                    {FEATURE_ICONS.map((f) => (
                        <div key={f.title} className="cc-glass cc-glass-interactive p-7 md:p-8 flex flex-col justify-between" style={{ borderRadius: 'var(--cc-r-xl)' }}>
                            <div>
                                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--cc-tx-1)' }}>{f.title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--cc-tx-2)' }}>
                                    {f.desc}
                                </p>
                            </div>
                            <div className="mt-8">
                                <span className={`cc-icon-well w-12 h-12 ${f.accent}`}>
                                    <HugeiconsIcon icon={f.icon} size={24} strokeWidth={1.5} />
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Code-visual card */}
                    <div className="cc-glass cc-glass-interactive overflow-hidden flex items-center justify-center p-7 md:p-8" style={{ borderRadius: 'var(--cc-r-xl)' }}>
                        <div className="cc-mono text-sm w-full">
                            <div className="text-purple-400">function <span className="text-yellow-300">learn</span>() {'{'}</div>
                            <div className="pl-4 text-green-400">// Practice daily</div>
                            <div className="pl-4 text-white">skills++;</div>
                            <div className="text-purple-400">{'}'}</div>
                        </div>
                    </div>

                    {/* Brand-accent "Track Your Progress" card */}
                    <div className="relative overflow-hidden p-7 md:p-8 flex flex-col justify-between cc-glass" style={{ borderRadius: 'var(--cc-r-xl)', background: 'rgba(163,230,53,.10)', boxShadow: 'var(--cc-e2), var(--cc-glow-brand)' }}>
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--cc-tx-1)' }}>Track Your Progress</h3>
                            <p className="text-sm leading-relaxed font-semibold" style={{ color: 'var(--cc-tx-2)' }}>
                                Visualize your coding journey with detailed analytics. See your strengths, identify areas to improve, and celebrate milestones.
                            </p>
                        </div>
                        <div className="mt-8 relative z-10">
                            <span className="cc-icon-well w-12 h-12 text-lime-300">
                                <HugeiconsIcon icon={Target01Icon} size={24} strokeWidth={1.5} />
                            </span>
                        </div>
                        <div aria-hidden className="absolute bottom-0 right-0 w-32 h-32 rounded-full opacity-40 translate-x-10 translate-y-10" style={{ background: 'rgba(163,230,53,.30)', filter: 'blur(40px)' }} />
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="flex items-center justify-between mb-16 gap-6">
                    <h2 className="text-4xl sm:text-5xl font-bold" style={{ color: 'var(--cc-tx-1)' }}>Frequently Asked<br />Questions</h2>
                    <Button variant="secondary" size="md" className="hidden md:inline-flex" onClick={() => navigate('/onboarding')}>
                        Get Started <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                    </Button>
                </div>

                <div className="space-y-4 cc-stagger">
                    {FAQ_ITEMS.map((item, i) => (
                        <Surface key={i} elevation={1} className="p-6 md:p-7 cc-glass-interactive cursor-pointer">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-5">
                                    <span className="cc-icon-well w-10 h-10 text-lime-300 shrink-0 cc-mono font-bold flex items-center justify-center">
                                        {i + 1}
                                    </span>
                                    <h3 className="text-lg font-bold" style={{ color: 'var(--cc-tx-1)' }}>{item.title}</h3>
                                </div>
                                <div className="md:max-w-md text-sm md:text-right" style={{ color: 'var(--cc-tx-2)' }}>
                                    {item.desc}
                                </div>
                            </div>
                        </Surface>
                    ))}
                </div>
            </div>
        </div>
    );
};
