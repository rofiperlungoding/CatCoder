import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    Home,
    BookOpen,
    Code2,
    Trophy,
    Map,
    User,
    LogOut
} from 'lucide-react';
import { useUserStore } from '../../stores';
import { Avatar } from '../ui';
import { calculateLevelProgress, getRankDisplayName, formatXP } from '../../lib/utils';



export const Sidebar: React.FC = () => {
    const { user } = useUserStore();
    const location = useLocation();

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/learn', icon: BookOpen, label: 'Learn' },
        { path: '/practice', icon: Code2, label: 'Practice' },
        { path: '/compete', icon: Trophy, label: 'Compete' },
        { path: '/roadmap', icon: Map, label: 'Roadmap' },
    ];

    const levelProgress = user ? calculateLevelProgress(user.xp) : { current: 0, required: 100, percentage: 0 };

    return (
        <aside className="w-full h-full flex flex-col bg-white border-r border-gray-200">
            {/* Header */}
            <div className="h-16 px-6 flex items-center border-b border-gray-100">
                <NavLink to="/" className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        🐱
                    </div>
                    <span className="font-bold text-xl text-gray-800 tracking-tight">CatCoder</span>
                </NavLink>
            </div>

            {/* User Profile Card */}
            <div className="p-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                        <Avatar
                            src={user?.avatarUrl}
                            fallback={user?.username?.[0] || 'G'}
                            className="bg-white border-2 border-white shadow-sm text-orange-600"
                        />
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm text-gray-900 truncate">
                                {user ? user.username : 'Guest User'}
                            </p>
                            <p className="text-xs text-gray-500 font-medium">
                                Level {user?.level || 1} • {user ? getRankDisplayName(user.rank) : 'Newbie'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium text-gray-500">
                            <span>Progress</span>
                            <span>{formatXP(user?.xp || 0)} XP</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-orange-500 rounded-full transition-all duration-300"
                                style={{ width: `${levelProgress.percentage}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-2 space-y-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path));

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`
                                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                ${isActive
                                    ? 'bg-orange-50 text-orange-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }
                            `}
                        >
                            <item.icon size={20} className={isActive ? 'text-orange-600' : 'text-gray-400'} />
                            {item.label}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Footer Actions */}
            <div className="p-3 mt-auto border-t border-gray-100">
                <NavLink
                    to="/profile"
                    className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1
                        ${location.pathname === '/profile'
                            ? 'bg-orange-50 text-orange-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                    `}
                >
                    <User size={20} className={location.pathname === '/profile' ? 'text-orange-600' : 'text-gray-400'} />
                    Profile
                </NavLink>

                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                    <LogOut size={20} className="text-gray-400" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};
