import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
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
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent selection:text-white">
            {/* Sidebar (Floating Rail) */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="lg:pl-80 min-h-screen p-4 lg:p-8 transition-all duration-300">
                <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                    />
                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        required
                    />
                    {authMode === 'signup' && (
                        <Input
                            label="Username"
                            placeholder="Type your username"
                            value={username}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                            required
                        />
                    )}
                    <Button type="submit" fullWidth disabled={isLoading}>
                        {isLoading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
                    </Button>

                    <div className="text-center text-sm text-slate-500 mt-4">
                        {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline"
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
