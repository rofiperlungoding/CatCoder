import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Cat, Menu, X } from 'lucide-react';
import { useUIStore } from '../../stores';

export const PublicLayout: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { setShowAuthModal } = useUIStore();
    const navigate = useNavigate();

    const handleLoginClick = () => {
        setShowAuthModal(true);
    };

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-200 selection:text-slate-900 overflow-x-hidden">
            {/* Floating Pill Navbar */}
            <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
                <nav className="w-full max-w-5xl bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-lg shadow-slate-200/20 rounded-full px-6 py-3 flex items-center justify-between transition-all duration-300">
                    {/* Logo Section */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="flex items-center justify-center text-slate-900">
                            <Cat size={20} strokeWidth={2.5} />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-slate-900 hidden sm:block">CatCoder</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/features" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Features</Link>
                        <Link to="/pricing" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Pricing</Link>
                        <Link to="/about" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">Manifesto</Link>
                    </div>

                    {/* Auth Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleLoginClick}
                            className="hidden md:block text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors px-2"
                        >
                            Log in
                        </button>
                        <button
                            onClick={handleLoginClick}
                            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full px-5 py-2 text-sm font-bold transition-all active:scale-95"
                        >
                            Get Started
                        </button>
                        {/* Mobile Menu Toggle */}
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden ml-2 p-1 text-slate-600">
                            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </nav>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="fixed top-24 left-4 right-4 z-40 bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 md:hidden animate-in slide-in-from-top-4 fade-in">
                    <div className="flex flex-col gap-4">
                        <Link to="/features" className="text-lg font-medium text-slate-600">Features</Link>
                        <Link to="/pricing" className="text-lg font-medium text-slate-600">Pricing</Link>
                        <Link to="/about" className="text-lg font-medium text-slate-600">Manifesto</Link>
                        <hr className="border-slate-100" />
                        <button onClick={handleLoginClick} className="w-full py-3 rounded-xl bg-slate-50 font-bold text-slate-900">Log in</button>
                        <button onClick={handleLoginClick} className="w-full py-3 rounded-xl bg-slate-900 font-bold text-white">Create Account</button>
                    </div>
                </div>
            )}

            <main className="pt-32 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Outlet />
                </div>
            </main>

            {/* Minimal Footer */}
            <footer className="py-12 border-t border-slate-100 mt-20">
                <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
                        <Cat size={16} />
                        <span className="font-semibold text-sm">CatCoder Inc.</span>
                    </div>
                    <div className="flex gap-6 text-sm text-slate-400 font-medium">
                        <Link to="#" className="hover:text-slate-900 transition-colors">Privacy</Link>
                        <Link to="#" className="hover:text-slate-900 transition-colors">Terms</Link>
                        <Link to="#" className="hover:text-slate-900 transition-colors">Twitter</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};
