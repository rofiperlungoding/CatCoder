import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cat, ArrowRight, Github, Mail, Lock } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { useUserStore } from '../../stores';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useUserStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            login({ id: '1', name: 'Demo User', email: 'demo@catcoder.com', avatar: '', xp: 0, level: 1, streak: 0 });
            setIsLoading(false);
            navigate('/home');
        }, 1500);
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white selection:bg-lime-500/30">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex flex-col justify-between bg-[#0A0A0A] text-white p-12 relative overflow-hidden group lg:rounded-r-[2.5rem]">
                {/* Animated Background Elements */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-lime-500/10 rounded-full blur-[120px] -mr-20 -mt-20 pointer-events-none animate-pulse duration-[5000ms]"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none"></div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] opacity-20"></div>

                <div className="relative z-10 animate-in fade-in slide-in-from-top-8 duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)]">
                    <div className="flex items-center gap-2 mb-12">
                        <Cat size={32} strokeWidth={2.5} className="text-white" />
                        <span className="font-bold text-2xl tracking-tight text-white">CatCoder</span>
                    </div>

                    <div className="max-w-md space-y-6">
                        <h1 className="text-7xl font-bold leading-[0.9] text-white tracking-tight">
                            <span className="block animate-in fade-in slide-in-from-left-8 duration-700 ease-out fill-mode-backwards">Master the Art</span>
                            <span className="block animate-in fade-in slide-in-from-left-8 duration-700 delay-150 ease-out fill-mode-backwards">of</span>
                            <span className="block text-lime-500 animate-in fade-in slide-in-from-left-8 duration-700 delay-300 ease-out fill-mode-backwards">Coding.</span>
                        </h1>

                    </div>
                </div>

                <div className="relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-backwards w-full">
                    <div className="bg-white/5 backdrop-blur-sm rounded-[2.5rem] p-8 border border-white/10 hover:border-white/20 transition-all duration-500 group/card">
                        <div className="flex gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="w-12 h-1.5 rounded-full bg-lime-500" style={{ opacity: i <= 5 ? 1 : 0.2 }}></div>
                            ))}
                        </div>
                        <p className="text-xl font-medium italic mb-8 text-white/90 leading-relaxed font-serif tracking-wide">
                            "The gamified approach made me addicted to solving algorithms.
                            I landed my dream job at a top tech company thanks to CatCoder."
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-lime-500 rounded-full shadow-lg shadow-lime-500/20"></div>
                            <div>
                                <div className="font-bold text-white text-lg">Alex Chen</div>
                                <div className="text-sm text-white/60 font-medium">Software Engineer at Google</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-8 lg:p-24 bg-background lg:bg-white relative">
                {/* Background Decor for Mobile */}
                <div className="lg:hidden absolute top-0 right-0 w-64 h-64 bg-lime-500/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>

                <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]">
                    <div className="text-center lg:text-left transition-all duration-300">
                        <div className="flex justify-center lg:justify-start lg:hidden mb-8">
                            <div className="flex items-center gap-2 text-primary">
                                <Cat size={32} strokeWidth={2.5} />
                                <span className="font-bold text-2xl tracking-tight">CatCoder</span>
                            </div>
                        </div>

                        {/* Animated Mode Switch Text */}
                        <div className="relative h-16 overflow-hidden">
                            <div className={`transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] transform ${isSignUp ? '-translate-y-full opacity-50 blur-sm' : 'translate-y-0 opacity-100 blur-0'}`}>
                                <h2 className="text-3xl font-bold text-primary mb-2">Welcome back</h2>
                                <p className="text-muted-foreground">Please enter your details to sign in.</p>
                            </div>
                            <div className={`absolute top-0 left-0 w-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] transform ${isSignUp ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-full opacity-50 blur-sm'}`}>
                                <h2 className="text-3xl font-bold text-primary mb-2">Create an account</h2>
                                <p className="text-muted-foreground">Start your coding journey for free today.</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Collapsible Name Field */}
                        <div
                            className={`grid transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden ${isSignUp ? 'grid-rows-[1fr] opacity-100 mb-6' : 'grid-rows-[0fr] opacity-0 mb-0'}`}
                        >
                            <div className="min-h-0 space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                                <Input
                                    placeholder="Enter your name"
                                    className="h-12 bg-gray-50 border-gray-100 focus:bg-white transition-all duration-300 hover:bg-gray-100"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
                            <div className="relative group">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-lime-500 transition-colors duration-300" />
                                <Input
                                    type="email"
                                    placeholder="name@example.com"
                                    className="h-12 pl-12 bg-gray-50 border-gray-100 focus:bg-white transition-all duration-300 hover:bg-gray-100 group-focus-within:ring-2 ring-lime-500/20"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
                            <div className="relative group">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-lime-500 transition-colors duration-300" />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-12 pl-12 bg-gray-50 border-gray-100 focus:bg-white transition-all duration-300 hover:bg-gray-100 group-focus-within:ring-2 ring-lime-500/20"
                                />
                            </div>
                        </div>

                        <div className={`flex items-center justify-end transition-all duration-300 ${isSignUp ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
                            <button type="button" className="text-sm font-semibold text-primary hover:underline">
                                Forgot password?
                            </button>
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            disabled={isLoading}
                            variant="primary"
                            className="h-14 text-base rounded-full shadow-lg shadow-lime-500/20 hover:shadow-lime-500/40 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                            <span className="relative flex items-center gap-2">
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{isSignUp ? "Create Account" : "Sign in"}</span>
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </span>
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-100"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background lg:bg-white px-4 text-muted-foreground font-semibold">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-2 h-12 rounded-full border border-gray-200 hover:bg-gray-50 transition-all hover:scale-[1.02] active:scale-[0.98] font-semibold text-sm">
                            <Github size={18} />
                            GitHub
                        </button>
                        <button className="flex items-center justify-center gap-2 h-12 rounded-full border border-gray-200 hover:bg-gray-50 transition-all hover:scale-[1.02] active:scale-[0.98] font-semibold text-sm">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </button>
                    </div>

                    <p className="text-center text-sm">
                        {isSignUp ? "Already have an account?" : "Don't have an account?"}
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="ml-1 text-primary font-bold hover:underline relative inline-block group"
                        >
                            {isSignUp ? "Sign in" : "Sign up"}
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};
