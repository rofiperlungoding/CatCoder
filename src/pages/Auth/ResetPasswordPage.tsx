import { GithubIcon, LockPasswordIcon, CheckmarkCircle01Icon, ViewIcon, ViewOffIcon } from '@hugeicons/core-free-icons';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Button, Input, LoadingSpinner } from '../../components/ui';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useUIStore } from '../../stores';

export const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const { addToast } = useUIStore();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isValidSession, setIsValidSession] = useState(false);
    const [isCheckingSession, setIsCheckingSession] = useState(true);

    // Check if we have a valid recovery session
    useEffect(() => {
        const checkSession = async () => {
            if (!isSupabaseConfigured()) {
                setIsCheckingSession(false);
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();

            // Supabase automatically handles the recovery token from the URL
            // If there's a session after redirect, we can proceed
            if (session) {
                setIsValidSession(true);
            }
            setIsCheckingSession(false);
        };

        checkSession();

        // Listen for auth state changes (Supabase handles recovery token automatically)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsValidSession(true);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            addToast('warning', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            addToast('error', 'Passwords do not match');
            return;
        }

        if (password.length < 6) {
            addToast('warning', 'Password must be at least 6 characters');
            return;
        }

        if (!isSupabaseConfigured()) {
            addToast('warning', 'Supabase not configured');
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({ password });

            if (error) {
                addToast('error', error.message);
            } else {
                setIsSuccess(true);
                addToast('success', 'Password updated successfully!');

                // Sign out after password reset to force re-login
                await supabase.auth.signOut();
            }
        } catch {
            addToast('error', 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    // Loading state while checking session
    if (isCheckingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505]">
                <div className="flex flex-col items-center gap-4">
                    <LoadingSpinner size={48} className="text-lime-500" />
                    <p className="text-gray-400">Verifying reset link...</p>
                </div>
            </div>
        );
    }

    // Invalid or expired link
    if (!isValidSession && !isCheckingSession) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505] p-8">
                <div className="w-full max-w-md text-center space-y-6">
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                        <Icon icon={LockPasswordIcon} size={40} className="text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Invalid or Expired Link</h2>
                    <p className="text-gray-400">
                        This password reset link is invalid or has expired. Please request a new one.
                    </p>
                    <Button
                        variant="primary"
                        className="h-14 rounded-full bg-lime-400 text-black hover:bg-lime-300 px-8"
                        onClick={() => navigate('/forgot-password')}
                    >
                        Request New Link
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] p-8 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-lime-500/5 rounded-full blur-[120px] -mr-20 -mt-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none"></div>

            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-700">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 text-white cursor-pointer" onClick={() => navigate('/')}>
                    <Icon icon={GithubIcon} size={32} strokeWidth={2.5} />
                    <span className="font-bold text-2xl tracking-tight">CatCoder</span>
                </div>

                {/* Card */}
                <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-8">
                    {isSuccess ? (
                        // Success State
                        <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-20 h-20 bg-lime-500/10 rounded-full flex items-center justify-center mx-auto border border-lime-500/20">
                                <Icon icon={CheckmarkCircle01Icon} size={40} className="text-lime-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Password Updated!</h2>
                                <p className="text-gray-400">
                                    Your password has been successfully reset. You can now sign in with your new password.
                                </p>
                            </div>
                            <Button
                                variant="primary"
                                fullWidth
                                className="h-14 rounded-full bg-lime-400 text-black hover:bg-lime-300"
                                onClick={() => navigate('/login')}
                            >
                                Sign In
                            </Button>
                        </div>
                    ) : (
                        // Form State
                        <>
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-white mb-2">Set New Password</h2>
                                <p className="text-gray-400">
                                    Enter your new password below.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-300 ml-1">New Password</label>
                                    <div className="relative group">
                                        <Icon icon={LockPasswordIcon} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-lime-500 transition-colors duration-300 z-10 pointer-events-none" />
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="h-12 pl-12 pr-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:bg-white/10 transition-all duration-300 hover:bg-white/10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <Icon icon={ViewOffIcon} size={18} /> : <Icon icon={ViewIcon} size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-300 ml-1">Confirm Password</label>
                                    <div className="relative group">
                                        <Icon icon={LockPasswordIcon} size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-lime-500 transition-colors duration-300 z-10 pointer-events-none" />
                                        <Input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="h-12 pl-12 pr-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:bg-white/10 transition-all duration-300 hover:bg-white/10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                        >
                                            {showConfirmPassword ? <Icon icon={ViewOffIcon} size={18} /> : <Icon icon={ViewIcon} size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    fullWidth
                                    disabled={isLoading}
                                    variant="primary"
                                    className="h-14 text-base rounded-full shadow-lg shadow-lime-500/20 hover:shadow-lime-500/40 bg-lime-400 text-black hover:bg-lime-300"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <LoadingSpinner size={20} />
                                            Updating...
                                        </span>
                                    ) : (
                                        'Update Password'
                                    )}
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
