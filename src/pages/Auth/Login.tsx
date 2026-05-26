import {  ArrowRight01Icon, Mail01Icon, LockPasswordIcon } from '@hugeicons/core-free-icons';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Button, Input, Toaster, LoadingSpinner } from '../../components/ui';
import { useUserStore, useUIStore } from '../../stores';
import { logger } from '../../lib/logger';

// Google Icon SVG Component
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { signIn, signUp, signInWithGoogle, isAuthenticated } = useUserStore();
    const { addToast } = useUIStore();

    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [isMagicLink, setIsMagicLink] = useState(false);
    const { magicLinkLogin } = useUserStore();

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    // Watch for authentication state changes and redirect
    useEffect(() => {
        logger.debug('[Login] isAuthenticated changed:', isAuthenticated);
        if (isAuthenticated) {
            logger.debug('[Login] User authenticated! Redirecting to /home...');
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

    const handleMagicLinkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await magicLinkLogin(email);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        try {
            const { error } = await signInWithGoogle();
            if (!error) {
                navigate('/home', { replace: true });
            }
        } catch (err) {
            console.error('[Login] Google sign-in error:', err);
        } finally {
            setIsGoogleLoading(false);
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
                            <img src="/logo.png" alt="CatCoder Logo" className="w-8 h-8 object-contain text-white" />
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

                <div className="flex items-center justify-center p-8 lg:p-24 bg-[#0a0a0a] relative">
                    {/* Background Decor for Mobile */}
                    <div className="lg:hidden absolute top-0 right-0 w-64 h-64 bg-lime-500/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]">
                        <div className="text-center lg:text-left transition-all duration-300">
                            <div className="flex justify-center lg:justify-start lg:hidden mb-8">
                                <div className="flex items-center gap-2 text-white">
                                    <img src="/logo.png" alt="CatCoder Logo" className="w-8 h-8 object-contain" />
                                    <span className="font-bold text-2xl tracking-tight">CatCoder</span>
                                </div>
                            </div>

                            {/* Animated Mode Switch Text */}
                            <div className="relative h-16 overflow-hidden">
                                <div className={`transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] transform ${isSignUp || isMagicLink ? '-translate-y-full opacity-50 blur-sm' : 'translate-y-0 opacity-100 blur-0'}`}>
                                    <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
                                    <p className="text-gray-400">Please enter your details to sign in.</p>
                                </div>

                                <div className={`absolute top-0 left-0 w-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] transform ${isSignUp && !isMagicLink ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-full opacity-50 blur-sm'}`}>
                                    <h2 className="text-3xl font-bold text-white mb-2">Create an account</h2>
                                    <p className="text-gray-400">Start your coding journey for free today.</p>
                                </div>

                                <div className={`absolute top-0 left-0 w-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] transform ${isMagicLink ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-full opacity-50 blur-sm'}`}>
                                    <h2 className="text-3xl font-bold text-white mb-2">Magic Link Login</h2>
                                    <p className="text-gray-400">Sign in with just your email.</p>
                                </div>
                            </div>
                        </div>

                        {!isMagicLink ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Collapsible Name Field for SignUp */}
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
                                        <Icon icon={Mail01Icon} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-lime-500 transition-colors duration-300 z-10 pointer-events-none" />
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
                                        <Icon icon={LockPasswordIcon} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-lime-500 transition-colors duration-300 z-10 pointer-events-none" />
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
                                                <LoadingSpinner size={20} />
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>{isSignUp ? "Create Account" : "Sign in"}</span>
                                                <Icon icon={ArrowRight01Icon} size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </span>
                                </Button>

                                {/* Divider */}
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-[#0a0a0a] text-gray-500">or continue with</span>
                                    </div>
                                </div>

                                {/* Google Sign In Button */}
                                <button
                                    type="button"
                                    onClick={handleGoogleSignIn}
                                    disabled={isGoogleLoading || isLoading}
                                    className="w-full h-14 flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isGoogleLoading ? (
                                        <>
                                            <LoadingSpinner size={20} />
                                            <span>Signing in...</span>
                                        </>
                                    ) : (
                                        <>
                                            <GoogleIcon />
                                            <span>Continue with Google</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleMagicLinkSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-300 ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Icon icon={Mail01Icon} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-lime-500 transition-colors duration-300 z-10 pointer-events-none" />
                                        <Input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="name@example.com"
                                            required
                                            className="h-12 pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:bg-white/10 transition-all duration-300 hover:bg-white/10"
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    fullWidth
                                    disabled={isLoading}
                                    className="h-14 text-base rounded-full shadow-lg shadow-lime-500/20 hover:shadow-lime-500/40 relative overflow-hidden group bg-lime-400 text-black hover:bg-lime-300"
                                >
                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"></div>
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {isLoading ? (
                                            <>
                                                <LoadingSpinner size={20} />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                Send Magic Link <Icon icon={ArrowRight01Icon} size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </span>
                                </Button>
                            </form>
                        )}

                        <div className="text-center space-y-4">
                            {!isSignUp && (
                                <button
                                    type="button"
                                    onClick={() => setIsMagicLink(!isMagicLink)}
                                    className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                                >
                                    {isMagicLink ? 'Sign in with Password' : 'Or sign in with Magic Link ✨'}
                                </button>
                            )}

                            <div className="flex items-center justify-center gap-2 pt-4 border-t border-white/10">
                                <span className="text-zinc-500">{isSignUp ? 'Already have an account?' : "Don't have an account?"}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsSignUp(!isSignUp);
                                        setIsMagicLink(false);
                                    }}
                                    className="font-bold text-white hover:text-lime-500 transition-colors"
                                >
                                    {isSignUp ? 'Sign in' : 'Create account'}
                                </button>
                            </div>

                            {!isSignUp && !isMagicLink && (
                                <button
                                    type="button"
                                    onClick={() => navigate('/forgot-password')}
                                    className="text-xs text-zinc-500 hover:text-white transition-colors block mx-auto"
                                >
                                    Forgot your password?
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div >
            <Toaster />
        </>
    );
};

