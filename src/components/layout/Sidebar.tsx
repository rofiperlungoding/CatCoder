import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    Home,
    BookOpen,
    Code2,
    Trophy,
    Map,
    User,
    LogOut,
    Menu,
    X,
    Cat
} from 'lucide-react';
import { useUserStore } from '../../stores';
import { Avatar, Button } from '../ui'; // Updated imports

export const Sidebar: React.FC = () => {
    const location = useLocation();
    const { user, logout } = useUserStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: BookOpen, label: 'Learn', path: '/learn' },
        { icon: Code2, label: 'Practice', path: '/practice' },
        { icon: Trophy, label: 'Compete', path: '/compete' },
        { icon: Map, label: 'Roadmap', path: '/roadmap' },
    ];

    // Mobile Menu Toggle
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Brand - Bento Block */}
            <div className="p-6 mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <Cat size={20} />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight text-slate-900">CatCoder</h1>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">Enterprise</span>
                    </div>
                </div>
            </div>

            {/* Navigation - Bento List */}
            <nav className="flex-1 px-4 space-y-1.5">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                ${isActive
                                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10 translate-x-1'
                                    : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm border border-transparent hover:border-slate-100'
                                }
                            `}
                        >
                            <item.icon size={20} className={isActive ? 'text-indigo-300' : 'group-hover:text-indigo-600 transition-colors'} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Profile - Bento Card */}
            <div className="p-4 mt-auto">
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm group hover:border-indigo-200 transition-colors">
                    {user ? (
                        <div className="flex items-center gap-3 mb-3">
                            <Avatar
                                src={user.avatarUrl}
                                fallback={user.username.charAt(0).toUpperCase()}
                                size="sm"
                                className="border-2 border-white shadow-sm"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate">{user.username}</p>
                                <p className="text-xs text-slate-500 truncate">Level {user.level}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                <User size={16} className="text-slate-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">Guest</p>
                                <p className="text-xs text-slate-500">Sign in to save</p>
                            </div>
                        </div>
                    )}

                    {user ? (
                        <NavLink to="/profile">
                            <Button variant="secondary" size="sm" fullWidth className="text-xs mb-2">
                                View Profile
                            </Button>
                        </NavLink>
                    ) : null}

                    <button
                        onClick={user ? logout : () => { }} // In real app, open auth modal
                        className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 hover:text-red-500 py-1.5 transition-colors"
                    >
                        <LogOut size={14} />
                        {user ? 'Sign Out' : 'Sign In'}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar (Floating Rail) */}
            <aside className="hidden lg:block fixed left-4 top-4 bottom-4 w-64 bg-slate-50/50 backdrop-blur-xl rounded-3xl border border-white/50 shadow-sm z-40 overflow-hidden">
                <SidebarContent />
            </aside>

            {/* Mobile Header & Menu */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                        <Cat size={16} />
                    </div>
                    <span className="font-bold text-slate-900">CatCoder</span>
                </div>
                <button onClick={toggleMobileMenu} className="p-2 text-slate-600 bg-slate-100 rounded-lg">
                    {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Drawer */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-30 pt-16 bg-slate-50">
                    <SidebarContent />
                </div>
            )}
        </>
    );
};
