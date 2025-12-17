import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Modal, Input, Button } from '../ui';
import { useUserStore } from '../../stores';

export const MainLayout: React.FC = () => {
    const { setUser } = useUserStore();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Handle generic login (placeholder)
    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, integrate Supabase Auth here
        setUser({
            id: '1',
            username: email.split('@')[0] || 'User',
            email: email,
            xp: 0,
            level: 1,
            rank: 'bronze',
            streakCurrent: 0,
            streakBest: 0,
            createdAt: new Date().toISOString()
        });
        setShowAuthModal(false);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-page)] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Sidebar (Floating Rail) */}
            <Sidebar />

            {/* Main Content Area - Bento Grid Container */}
            <main className="lg:pl-72 min-h-screen p-4 lg:p-6 transition-all duration-300">
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
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button type="submit" fullWidth>
                        {authMode === 'login' ? 'Sign In' : 'Create Account'}
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
        </div>
    );
};
