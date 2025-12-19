import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cat, ArrowRight, Mail, Lock } from 'lucide-react';
import { Button, Input, Toaster } from '../../components/ui';
import { useUserStore, useUIStore } from '../../stores';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { signIn, signUp, isAuthenticated } = useUserStore();
    const { addToast } = useUIStore();

    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    // Watch for authentication state changes and redirect
    useEffect(() => {
        console.log('[Login] isAuthenticated changed:', isAuthenticated);
        if (isAuthenticated) {
            console.log('[Login] User authenticated! Redirecting to /home...');
            navigate('/home', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isSignUp) {
                const { error } = await signUp(email, password, username);
                if (!error) {
                    addToast('success', 'Account created! Please check your email to confirm.');
                }
            } else {
                const { error, user } = await signIn(email, password);

                if (!error && user) {
                    // Navigate immediately - no delay needed
                    navigate('/home', { replace: true });
                } else if (!error) {
                    navigate('/home', { replace: true });
                }
            }
        } catch (err) {
            console.error('[Login] Error during submit:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-black selection:bg-lime-500/30 text-white">
                {/* Left Side - Visual */}
                <div className="hidden lg:flex flex-col justify-between bg-[#050505] p-12 relative overflow-hidden group lg:rounded-r-[2.5rem] border-r border-white/5">
                    {/* Animated Background Elements */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-lime-500/5 rounded-full blur-[120px] -mr-20 -mt-20 pointer-events-none animate-pulse duration-[5000ms]"></div>
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none"></div>

                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] opacity-20"></div>

                    <div className="relative z-10 animate-in fade-in slide-in-from-top-8 duration-1000 ease-[cubic-bezier(0.2,0.8,0.2,1)]">
                        <div className="flex items-center gap-2 mb-12 cursor-pointer w-fit" onClick={() => navigate('/')}>
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

                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="flex items-center justify-center p-8 lg:p-24 bg-[#0a0a0a] relative">
                    {/* Background Decor for Mobile */}
                    <div className="lg:hidden absolute top-0 right-0 w-64 h-64 bg-lime-500/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]">
                        <div className="text-center lg:text-left transition-all duration-300">
                            <div className="flex justify-center lg:justify-start lg:hidden mb-8">
                                <div className="flex items-center gap-2 text-white">
                                    <Cat size={32} strokeWidth={2.5} />
                                    <span className="font-bold text-2xl tracking-tight">CatCoder</span>
                                </div>
                            </div>

                            {/* Animated Mode Switch Text */}
                            <div className="relative h-16 overflow-hidden">
                                <div className={`transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] transform ${isSignUp ? '-translate-y-full opacity-50 blur-sm' : 'translate-y-0 opacity-100 blur-0'}`}>
                                    <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
                                    <p className="text-gray-400">Please enter your details to sign in.</p>
                                </div>
                                <div className={`absolute top-0 left-0 w-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] transform ${isSignUp ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-full opacity-50 blur-sm'}`}>
                                    <h2 className="text-3xl font-bold text-white mb-2">Create an account</h2>
                                    <p className="text-gray-400">Start your coding journey for free today.</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Collapsible Name Field */}
                            <div
                                className={`grid transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden ${isSignUp ? 'grid-rows-[1fr] opacity-100 mb-6' : 'grid-rows-[0fr] opacity-0 mb-0'}`}
                            >
                                <div className="min-h-0 space-y-2">
                                    <label className="text-sm font-bold text-gray-300 ml-1">Full Name</label>
                                    <Input
                                        placeholder="Enter your name"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:bg-white/10 transition-all duration-300 hover:bg-white/10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-300 ml-1">Email</label>
                                <div className="relative group">
                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-lime-500 transition-colors duration-300" />
                                    <Input
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:bg-white/10 transition-all duration-300 hover:bg-white/10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-300 ml-1">Password</label>
                                <div className="relative group">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-lime-500 transition-colors duration-300" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-12 pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:bg-white/10 transition-all duration-300 hover:bg-white/10"
                                    />
                                </div>
                            </div>

                            <div className={`flex items-center justify-end transition-all duration-300 ${isSignUp ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}>
                                <button type="button" onClick={() => navigate('/forgot-password')} className="text-sm font-semibold text-lime-400 hover:text-lime-300 hover:underline">
                                    Forgot password?
                                </button>
                            </div>

                            <Button
                                type="submit"
                                fullWidth
                                disabled={isLoading}
                                variant="primary"
                                className="h-14 text-base rounded-full shadow-lg shadow-lime-500/20 hover:shadow-lime-500/40 relative overflow-hidden group bg-lime-400 text-black hover:bg-lime-300"
                            >
                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"></div>
                                <span className="relative flex items-center gap-2">
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
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

                        <p className="text-center text-sm text-gray-400">
                            {isSignUp ? "Already have an account?" : "Don't have an account?"}
                            <button
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="ml-1 text-lime-400 font-bold hover:underline relative inline-block group"
                            >
                                {isSignUp ? "Sign in" : "Sign up"}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-lime-400 transition-all duration-300 group-hover:w-full"></span>
                            </button>
                        </p>
                    </div>
                </div>
            </div>
            <Toaster />
        </>
    );
};
