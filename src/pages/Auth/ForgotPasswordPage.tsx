import { GithubIcon, ArrowLeft01Icon, Mail01Icon, SentIcon, CheckmarkCircle01Icon } from '@hugeicons/core-free-icons';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, LoadingSpinner, Icon } from '../../components/ui';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useUIStore } from '../../stores';

export const ForgotPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const { addToast } = useUIStore();

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            addToast('warning', 'Please enter your email address');
            return;
        }

        if (!isSupabaseConfigured()) {
            addToast('warning', 'Supabase not configured. Cannot send reset email.');
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            });

            if (error) {
                addToast('error', error.message);
            } else {
                setIsSubmitted(true);
                addToast('success', 'Password reset email sent!');
            }
        } catch {
            addToast('error', 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

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
                    {isSubmitted ? (
                        // Success State
                        <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-20 h-20 bg-lime-500/10 rounded-full flex items-center justify-center mx-auto border border-lime-500/20">
                                <Icon icon={CheckmarkCircle01Icon} size={40} className="text-lime-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
                                <p className="text-gray-400">
                                    We've sent a password reset link to <span className="text-white font-medium">{email}</span>
                                </p>
                            </div>
                            <p className="text-sm text-gray-500">
                                Didn't receive the email? Check your spam folder or{' '}
                                <button
                                    onClick={() => setIsSubmitted(false)}
                                    className="text-lime-400 hover:underline font-medium"
                                >
                                    try again
                                </button>
                            </p>
                            <Button
                                variant="primary"
                                fullWidth
                                className="h-14 rounded-full bg-lime-400 text-black hover:bg-lime-300"
                                onClick={() => navigate('/login')}
                            >
                                Back to Login
                            </Button>
                        </div>
                    ) : (
                        // Form State
                        <>
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-white mb-2">Forgot your password?</h2>
                                <p className="text-gray-400">
                                    No worries! Enter your email and we'll send you a reset link.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-300 ml-1">Email Address</label>
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
                                            Sending...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Send Reset Link
                                            <Icon icon={SentIcon} size={18} />
                                        </span>
                                    )}
                                </Button>
                            </form>

                            <div className="text-center">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                    <Icon icon={ArrowLeft01Icon} size={16} />
                                    Back to Login
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
