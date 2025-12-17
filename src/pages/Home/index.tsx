import React from 'react';
import { Link } from 'react-router-dom';
import {
    BookOpen,
    Code2,
    Trophy,
    ArrowRight,
    CheckCircle2,
    Shield,
    Globe
} from 'lucide-react';
export const HomePage: React.FC = () => {
    return (
        <div className="min-h-full bg-white pb-20">
            {/* Hero Section - Centered & Clean like Google Chrome Download */}
            <section className="pt-20 pb-16 px-6 text-center max-w-4xl mx-auto">
                <div className="w-20 h-20 bg-white border border-gray-100 rounded-2xl shadow-sm mx-auto mb-8 flex items-center justify-center">
                    <span className="text-5xl">🐱</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight mb-6">
                    Master Coding, <br className="hidden md:block" />
                    <span className="text-orange-600">One Step at a Time.</span>
                </h1>

                <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                    The free, comprehensive platform to take you from a curious beginner to a professional developer. No hidden fees, just pure code.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/learn">
                        <button className="h-12 px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                            Start Learning
                            <ArrowRight size={20} />
                        </button>
                    </Link>
                    <Link to="/practice">
                        <button className="h-12 px-8 rounded-full bg-white border border-gray-300 text-blue-600 hover:bg-blue-50 font-medium text-lg transition-all">
                            Solve Problems
                        </button>
                    </Link>
                </div>
            </section>

            {/* "Steps" Cards - Inspired by the Chrome "Langkah 1, 2, 3" */}
            <section className="max-w-6xl mx-auto px-6 mb-20">
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Card 1 */}
                    <div className="p-8 rounded-3xl bg-blue-50 border border-blue-100 flex flex-col items-start h-full">
                        <div className="text-xs font-bold tracking-widest text-blue-800 uppercase mb-4">Step 1</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Learn Concepts</h3>
                        <p className="text-gray-600 mb-8 flex-1">
                            Interactive lessons with built-in code editors. Master Python, JavaScript, and C++ through hands-on theory.
                        </p>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                            <BookOpen size={24} />
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="p-8 rounded-3xl bg-amber-50 border border-amber-100 flex flex-col items-start h-full">
                        <div className="text-xs font-bold tracking-widest text-amber-800 uppercase mb-4">Step 2</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Practice Daily</h3>
                        <p className="text-gray-600 mb-8 flex-1">
                            Solve over 500+ problems ranging from "Easy" to "Expert". Earn XP and build your coding streak.
                        </p>
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                            <Code2 size={24} />
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="p-8 rounded-3xl bg-green-50 border border-green-100 flex flex-col items-start h-full">
                        <div className="text-xs font-bold tracking-widest text-green-800 uppercase mb-4">Step 3</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Compete & Win</h3>
                        <p className="text-gray-600 mb-8 flex-1">
                            Join weekly contests, climb the global leaderboard, and earn badges to showcase on your profile.
                        </p>
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                            <Trophy size={24} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust/Stats Section */}
            <section className="border-t border-gray-100 py-20 bg-gray-50">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="flex justify-center text-orange-500 mb-4">
                                <Globe size={32} />
                            </div>
                            <div className="text-4xl font-bold text-gray-900 mb-2">100% Free</div>
                            <p className="text-gray-500">Accessible to everyone, forever</p>
                        </div>
                        <div>
                            <div className="flex justify-center text-blue-500 mb-4">
                                <CheckCircle2 size={32} />
                            </div>
                            <div className="text-4xl font-bold text-gray-900 mb-2">2,500+</div>
                            <p className="text-gray-500">Practice problems available</p>
                        </div>
                        <div>
                            <div className="flex justify-center text-green-500 mb-4">
                                <Shield size={32} />
                            </div>
                            <div className="text-4xl font-bold text-gray-900 mb-2">Secure</div>
                            <p className="text-gray-500">Cloud save & progress tracking</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
