import { FavouriteIcon, Target01Icon, Globe, UserGroupIcon } from '@hugeicons/core-free-icons';
import { Icon } from '../../components/ui';
import React from 'react';
export const AboutPage: React.FC = () => {
    return (
        <div className="pt-32 pb-20 space-y-24">
            {/* Hero */}
            <section className="px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-8 max-w-4xl leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-backwards">
                    Empowering the next generation of <span className="text-lime-400">Builders</span>.
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-backwards">
                    CatCoder is on a mission to democratize coding education. We believe anyone can master the art of programming with the right tools and community.
                </p>
            </section>

            {/* Values */}
            <section className="px-6 md:px-12 max-w-7xl mx-auto">
                <div className="bg-[#0a0a0a] text-white rounded-[3rem] p-12 md:p-24 relative overflow-hidden border border-white/10">
                    <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-lime-500/10 rounded-full blur-[120px] -ml-32 -mt-32 pointer-events-none"></div>

                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-16 text-center text-white">Our Core Values</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                            <div className="space-y-4">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-lime-400 border border-white/5">
                                    <Icon icon={Target01Icon} size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white">Excellence</h3>
                                <p className="text-gray-400">We strive for the highest quality in our curriculum and platform experience.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-rose-400 border border-white/5">
                                    <Icon icon={FavouriteIcon} size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white">Passion</h3>
                                <p className="text-gray-400">We love code, and we want to share that excitement with the world.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400 border border-white/5">
                                    <Icon icon={Globe} size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white">Accessibility</h3>
                                <p className="text-gray-400">Education should be open to everyone, everywhere, regardless of background.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-amber-400 border border-white/5">
                                    <Icon icon={UserGroupIcon} size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white">Community</h3>
                                <p className="text-gray-400">Learning is a social activity. We build bridges between learners.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Story */}
            <section className="px-6 md:px-12 max-w-4xl mx-auto text-center space-y-8">
                <h2 className="text-3xl font-bold text-white">Our Story</h2>
                <div className="prose prose-lg mx-auto text-gray-400">
                    <p>
                        CatCoder started as a small project in a university dorm room. We realized that traditional coding tutorials were boring, static, and lonely. We wanted to create something alive.
                    </p>
                    <p>
                        By combining interactive challenges, gamification, and a supportive community, we've helped over 100,000 students write their first line of code. And we're just getting started.
                    </p>
                </div>
            </section>
        </div>
    );
};
