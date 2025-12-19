import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Modal, Input, Button, Toaster, LevelUpModal } from '../ui';
import { useUserStore, useUIStore } from '../../stores';

export const MainLayout: React.FC = () => {
    const { signIn, signUp, initializeSession } = useUserStore();
    const { showAuthModal, setShowAuthModal } = useUIStore();
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();

    // Hide sidebar on active lesson/practice routes (e.g., /learn/abc, /practice/123)
    // But show it on the main lists (/learn, /practice)
    const isFocusMode = /^\/(learn|practice)\/.+/.test(location.pathname);

    useEffect(() => {
        initializeSession();
    }, [initializeSession]);

    // Handle Auth
    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (authMode === 'login') {
                const { error } = await signIn(email, password);
                if (!error) {
                    setShowAuthModal(false);
                    // Reset form
                    setEmail('');
                    setPassword('');
                }
            } else {
                const { error } = await signUp(email, password, username || email.split('@')[0]);
                if (!error) {
                    setShowAuthModal(false);
                    // Reset form
                    setEmail('');
                    setPassword('');
                    setUsername('');
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-[#FAFAFA] font-sans selection:bg-lime-500/30 selection:text-white">
            {/* Sidebar (Floating Rail) - Hidden in Focus Mode */}
            {!isFocusMode && <Sidebar />}

            {/* Main Content Area */}
            {/* Remove left padding when sidebar is hidden */}
            <main className={`${isFocusMode ? 'lg:pl-0 p-0' : 'lg:pl-[22rem] p-4 lg:p-8'} min-h-screen transition-all duration-300`}>
                <div className={`${isFocusMode ? 'w-full' : 'max-w-[1600px] mx-auto'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                    <Outlet />
                </div>
            </main>

            {/* Auth Modal (Bento Style) */}
            <Modal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                title={authMode === 'login' ? 'Welcome Back' : 'Join CatCoder'}
            >
                <form onSubmit={handleAuth} className="space-y-4">
                    <Input
                        label="Email"
                        type="email"
                        placeholder="coder@example.com"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                        required
                        className="bg-[#1a1a1a] border-[#262626] text-white focus:border-white/20"
                    />
                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        required
                        className="bg-[#1a1a1a] border-[#262626] text-white focus:border-white/20"
                    />
                    {authMode === 'signup' && (
                        <Input
                            label="Username"
                            placeholder="Type your username"
                            value={username}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                            required
                            className="bg-[#1a1a1a] border-[#262626] text-white focus:border-white/20"
                        />
                    )}
                    <Button type="submit" fullWidth disabled={isLoading} className="bg-white text-black hover:bg-gray-200">
                        {isLoading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
                    </Button>

                    <div className="text-center text-sm text-gray-500 mt-4">
                        {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            className="text-white hover:text-gray-300 font-semibold hover:underline"
                            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                        >
                            {authMode === 'login' ? 'Sign Up' : 'Log In'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Global UI Components */}
            <Toaster />
            <LevelUpModal />
        </div>
    );
};
