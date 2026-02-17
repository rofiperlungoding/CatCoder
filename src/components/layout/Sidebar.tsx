import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    Home,
    BookOpen,
    Code2,
    Trophy,
    Map,
    User as UserIcon,
    LogOut,
    Menu,
    X,
    Cat
} from 'lucide-react';
import { useUserStore } from '../../stores';
import { Avatar, Button } from '../ui';

import type { User } from '../../types';

interface SidebarContentProps {
    location: { pathname: string };
    navItems: { icon: React.ElementType; label: string; path: string }[];
    setIsMobileMenuOpen: (isOpen: boolean) => void;
    user: User | null;
    handleLogout: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
    location,
    navItems,
    setIsMobileMenuOpen,
    user,
    handleLogout
}) => (
    <div className="flex flex-col h-full bg-[#050505] border-r border-white/5 relative overflow-hidden">
        {/* Smooth Gradient Backgrounds - INTENSIFIED */}
        {/* Top Left Emerald Glow */}
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-br from-emerald-500/20 via-emerald-900/5 to-transparent opacity-100 pointer-events-none" />

        {/* Bottom Right Violet Glow for contrast/premium feel */}
        <div className="absolute bottom-0 right-0 w-full h-[400px] bg-gradient-to-tl from-violet-500/10 via-transparent to-transparent opacity-100 pointer-events-none" />

        {/* Content Container (z-10 to sit above backgrounds) */}
        <div className="relative z-10 flex flex-col h-full">
            {/* Brand */}
            <div className="p-6 mb-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-white to-gray-400 text-black rounded-full flex items-center justify-center shadow-lg shadow-white/5 ring-1 ring-white/20">
                        <Cat size={20} />
                    </div>
                    <h1 className="font-bold text-lg tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
                        CatCoder
                    </h1>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2" aria-label="Main Navigation">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`
                                flex items-center gap-3 px-5 py-3.5 rounded-full transition-all duration-300 group focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/50
                                ${isActive
                                    ? 'bg-white text-black shadow-lg shadow-white/5 translate-x-1'
                                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                                }
                            `}
                        >
                            <item.icon size={20} className={isActive ? 'text-black' : 'group-hover:text-white transition-colors'} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Profile */}
            <div className="p-4 mt-auto">
                <div className="bg-[#0a0a0a] rounded-[2rem] p-5 border border-white/10 shadow-sm group hover:border-white/20 transition-colors">
                    {user ? (
                        <div className="flex items-center gap-3 mb-4">
                            <Avatar
                                src={user.avatarUrl}
                                fallback={user.username.charAt(0).toUpperCase()}
                                size="sm"
                                className="border-2 border-grau-800 shadow-sm ring-1 ring-white/10"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{user.username}</p>
                                <p className="text-xs text-gray-500 truncate">Level {user.level}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                <UserIcon size={18} className="text-gray-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Guest</p>
                                <p className="text-xs text-gray-500">Sign in to save</p>
                            </div>
                        </div>
                    )}

                    {user && (
                        <NavLink to="/profile">
                            <Button variant="secondary" size="sm" fullWidth className="text-xs mb-3 rounded-full border-transparent bg-white/5 text-white hover:bg-white/10 font-bold border-0">
                                View Profile
                            </Button>
                        </NavLink>
                    )}

                    <button
                        onClick={user ? handleLogout : () => { }}
                        className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 hover:text-red-400 py-2 transition-colors"
                    >
                        <LogOut size={14} />
                        {user ? 'Sign Out' : 'Sign In'}
                    </button>
                </div>
            </div>
        </div>
    </div>
);

export const Sidebar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useUserStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        console.log('[Sidebar] Logging out...');
        await logout();
        console.log('[Sidebar] Logout complete, navigating to /login');
        navigate('/login', { replace: true });
    };

    const navItems = [
        { icon: Home, label: 'Home', path: '/home' },
        { icon: BookOpen, label: 'Learn', path: '/learn' },
        { icon: Code2, label: 'Practice', path: '/practice' },
        { icon: Trophy, label: 'Compete', path: '/compete' },
        { icon: Map, label: 'Roadmap', path: '/roadmap' },
    ];

    // Mobile Menu Toggle
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);



    return (
        <>
            {/* Desktop Sidebar (Floating Rail) */}
            <aside className="hidden lg:block fixed left-6 top-6 bottom-6 w-72 bg-black/60 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-2xl shadow-black/50 z-40 overflow-hidden">
                <SidebarContent
                    location={location}
                    navItems={navItems}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                    user={user}
                    handleLogout={handleLogout}
                />
            </aside>

            {/* Mobile Header & Menu */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-40 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground" aria-hidden="true">
                        <Cat size={16} />
                    </div>
                    <span className="font-bold text-primary dark:text-white">CatCoder</span>
                </div>
                <button
                    onClick={toggleMobileMenu}
                    className="p-2 text-primary dark:text-white bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={isMobileMenuOpen}
                    aria-controls="mobile-menu"
                >
                    {isMobileMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
                </button>
            </div>

            {/* Mobile Drawer */}
            {isMobileMenuOpen && (
                <div id="mobile-menu" className="lg:hidden fixed inset-0 z-30 pt-16 bg-background" role="dialog" aria-modal="true">
                    <SidebarContent
                        location={location}
                        navItems={navItems}
                        setIsMobileMenuOpen={setIsMobileMenuOpen}
                        user={user}
                        handleLogout={handleLogout}
                    />
                </div>
            )}
        </>
    );
};
