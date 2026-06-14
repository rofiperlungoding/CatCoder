import {
    BookOpen01Icon, ProgrammingFlagIcon, MapsIcon, Home01Icon, Trophy,
    UserIcon, Logout01Icon, Menu01Icon, Cancel01Icon, FireIcon, FlashIcon,
    Search01Icon, ArrowRight01Icon, ArrowLeft01Icon, ArrowDown01Icon,
} from '@hugeicons/core-free-icons';
import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { useUserStore, useUIStore } from '../../stores';
import { Avatar, Icon } from '../ui';
import { Button } from '../ds';
import { calculateLevelProgress, formatXP, getRankDisplayName } from '../../lib/utils';
import type { User, Activity } from '../../types';

type SubItem = { label: string; path: string };
type NavItem = {
    icon: React.ComponentProps<typeof HugeiconsIcon>['icon'];
    label: string;
    path: string;
    children?: SubItem[];
};

const LEAGUE_CLASS: Record<User['rank'], string> = {
    bronze: 'cc-league-bronze',
    silver: 'cc-league-silver',
    gold: 'cc-league-gold',
    platinum: 'cc-league-platinum',
    diamond: 'cc-league-diamond',
};

const DAILY_GOAL = 3;

const NAV_ITEMS: NavItem[] = [
    { icon: Home01Icon, label: 'Home', path: '/home' },
    {
        icon: BookOpen01Icon, label: 'Learn', path: '/learn',
        children: [
            { label: 'All Tracks', path: '/learn' },
            { label: 'Beginner', path: '/learn?tier=beginner' },
            { label: 'Advanced', path: '/learn?tier=advanced' },
        ],
    },
    {
        icon: ProgrammingFlagIcon, label: 'Practice', path: '/practice',
        children: [
            { label: 'All Problems', path: '/practice' },
            { label: 'Easy', path: '/practice?difficulty=easy' },
            { label: 'Medium', path: '/practice?difficulty=medium' },
            { label: 'Hard', path: '/practice?difficulty=hard' },
        ],
    },
    {
        icon: Trophy, label: 'Compete', path: '/compete',
        children: [
            { label: 'Active', path: '/compete' },
            { label: 'Past', path: '/compete?tab=past' },
            { label: 'Leaderboard', path: '/compete?tab=leaderboard' },
        ],
    },
    { icon: MapsIcon, label: 'Roadmap', path: '/roadmap' },
];

/** Custom CatCoder brand mark — a cat head with `< >` code-chevron eyes, lime clay fill. */
const CatMark: React.FC<{ size?: number }> = ({ size = 22 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <defs>
            <linearGradient id="cc-mark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#c8f56e" />
                <stop offset="1" stopColor="#a3e635" />
            </linearGradient>
        </defs>
        <path d="M6 11 L9 4 L14.5 9 Z" fill="url(#cc-mark)" />
        <path d="M26 11 L23 4 L17.5 9 Z" fill="url(#cc-mark)" />
        <rect x="5" y="8" width="22" height="18" rx="8" fill="url(#cc-mark)" />
        <path d="M13.5 14.5 L11 17 L13.5 19.5" stroke="#14310a" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.5 14.5 L21 17 L18.5 19.5" stroke="#14310a" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="21.2" r="1.15" fill="#14310a" />
    </svg>
);

/** Small daily-goal progress ring (SVG stroke). */
const GoalRing: React.FC<{ pct: number; label: string; size?: number }> = ({ pct, label, size = 34 }) => {
    const r = size / 2 - 4;
    const c = 2 * Math.PI * r;
    const off = c * (1 - Math.max(0, Math.min(1, pct)));
    const mid = size / 2;
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
            <defs>
                <linearGradient id="cc-ring" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#c8f56e" />
                    <stop offset="1" stopColor="#a3e635" />
                </linearGradient>
            </defs>
            <circle cx={mid} cy={mid} r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="3" />
            <circle
                cx={mid} cy={mid} r={r} fill="none" stroke="url(#cc-ring)" strokeWidth="3"
                strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
                transform={`rotate(-90 ${mid} ${mid})`}
                style={{ transition: 'stroke-dashoffset 400ms ease-out' }}
            />
        </svg>
    );
};

function todayActions(activities: Activity[]): number {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return activities.filter((a) => new Date(a.timestamp).getTime() >= start.getTime()).length;
}

/** Glanceable progress pod. Collapsed mode shrinks to just the daily-goal ring. */
const ProgressPod: React.FC<{ user: User; todayCount: number; collapsed: boolean }> = ({ user, todayCount, collapsed }) => {
    const lvl = calculateLevelProgress(user.xp);
    const dailyPct = todayCount / DAILY_GOAL;

    if (collapsed) {
        return (
            <div className="flex flex-col items-center gap-1.5 px-2" title={`Daily goal: ${todayCount}/${DAILY_GOAL} · ${user.streakCurrent}d streak`}>
                <GoalRing pct={dailyPct} label={`Daily goal: ${todayCount} of ${DAILY_GOAL}`} size={40} />
                <span className="cc-mono text-[10px] flex items-center gap-0.5" style={{ color: 'var(--cc-tle)' }}>
                    <HugeiconsIcon icon={FireIcon} size={11} />{user.streakCurrent}
                </span>
            </div>
        );
    }

    return (
        <div className="cc-card cc-surface-2 mx-4 p-4 space-y-3.5" style={{ borderRadius: 'var(--cc-r-lg)' }}>
            <div className="flex items-center justify-between">
                <span className="cc-eyebrow">League</span>
                <span className={`cc-pill cc-league ${LEAGUE_CLASS[user.rank]}`}>
                    <HugeiconsIcon icon={Trophy} size={12} />
                    {getRankDisplayName(user.rank)}
                </span>
            </div>
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold" style={{ color: 'var(--cc-tx-1)' }}>Level {user.level}</span>
                    <span className="cc-mono text-[11px]" style={{ color: 'var(--cc-tx-3)' }}>
                        {formatXP(lvl.current)} / {formatXP(lvl.required)} XP
                    </span>
                </div>
                <div className="cc-progress-track h-2">
                    <div className="cc-progress-fill" style={{ width: `${lvl.percentage}%` }} />
                </div>
            </div>
            <div className="flex items-center justify-between pt-0.5">
                <span className="cc-pill" style={{ color: 'var(--cc-tle)', borderColor: 'rgba(251,113,133,.25)' }}>
                    <HugeiconsIcon icon={FireIcon} size={13} />
                    {user.streakCurrent} day{user.streakCurrent === 1 ? '' : 's'}
                </span>
                <div className="flex items-center gap-2">
                    <GoalRing pct={dailyPct} label={`Daily goal: ${todayCount} of ${DAILY_GOAL}`} />
                    <div className="leading-tight">
                        <span className="cc-eyebrow block">Daily goal</span>
                        <span className="cc-mono text-[11px]" style={{ color: 'var(--cc-tx-2)' }}>{todayCount}/{DAILY_GOAL}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

/** A single nav row. Handles expand (full) and tooltip/flyout (collapsed). */
const NavRow: React.FC<{
    item: NavItem;
    collapsed: boolean;
    pathname: string;
    search: string;
    expanded: boolean;
    onToggleExpand: () => void;
    onNavigate: () => void;
}> = ({ item, collapsed, pathname, search, expanded, onToggleExpand, onNavigate }) => {
    const [hover, setHover] = useState(false);
    const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
    const hasChildren = !!item.children?.length;
    const current = pathname + search;

    // Collapsed: icon button + tooltip (flat) or flyout (has children).
    if (collapsed) {
        return (
            <div className="relative" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
                <NavLink
                    to={item.path}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={onNavigate}
                    className={`cc-nav-item flex items-center justify-center h-11 w-11 mx-auto rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/60 ${isActive ? 'cc-nav-item-active' : ''}`}
                >
                    <Icon icon={item.icon} size={20} />
                </NavLink>

                {hover && !hasChildren && (
                    <span className="cc-tooltip" role="tooltip">{item.label}</span>
                )}
                {hover && hasChildren && (
                    <div className="cc-flyout" role="menu" aria-label={item.label}>
                        <div className="cc-eyebrow px-2 py-1">{item.label}</div>
                        {item.children!.map((c) => {
                            const subActive = current === c.path;
                            return (
                                <NavLink
                                    key={c.path}
                                    to={c.path}
                                    role="menuitem"
                                    onClick={onNavigate}
                                    className={`cc-subnav-item ${subActive ? 'cc-subnav-item-active' : ''}`}
                                    style={{ paddingLeft: '0.5rem' }}
                                >
                                    <span className="cc-subnav-dot" />
                                    {c.label}
                                </NavLink>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // Expanded: full row. If it has children, the chevron toggles the sub-tree.
    return (
        <div>
            <div className="flex items-center gap-1">
                <NavLink
                    to={item.path}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={onNavigate}
                    className={`cc-nav-item flex flex-1 items-center gap-3 px-4 py-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/60 ${isActive ? 'cc-nav-item-active' : ''}`}
                >
                    <Icon icon={item.icon} size={19} />
                    <span className="text-sm" style={{ fontWeight: 500 }}>{item.label}</span>
                </NavLink>
                {hasChildren && (
                    <button
                        type="button"
                        onClick={onToggleExpand}
                        aria-expanded={expanded}
                        aria-label={`${expanded ? 'Collapse' : 'Expand'} ${item.label}`}
                        className="cc-btn cc-btn-ghost h-9 w-8 shrink-0"
                    >
                        <HugeiconsIcon
                            icon={ArrowDown01Icon}
                            size={16}
                            style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 180ms ease-out' }}
                        />
                    </button>
                )}
            </div>

            {hasChildren && (
                <div className="cc-collapsible" data-open={expanded}>
                    <div className="cc-collapsible-inner">
                        <div className="cc-subnav" role="group" aria-label={`${item.label} sections`}>
                            {item.children!.map((c) => {
                                const subActive = current === c.path;
                                return (
                                    <NavLink
                                        key={c.path}
                                        to={c.path}
                                        onClick={onNavigate}
                                        tabIndex={expanded ? 0 : -1}
                                        aria-hidden={!expanded}
                                        className={`cc-subnav-item ${subActive ? 'cc-subnav-item-active' : ''}`}
                                    >
                                        <span className="cc-subnav-dot" />
                                        {c.label}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

interface SidebarContentProps {
    location: { pathname: string; search: string };
    setIsMobileMenuOpen: (isOpen: boolean) => void;
    user: User | null;
    recentActivities: Activity[];
    handleLogout: () => void;
    collapsed: boolean;
    onToggleCollapsed: () => void;
    onOpenPalette: () => void;
    /** Force the full (expanded) layout regardless of collapse — used by the mobile drawer. */
    forceExpanded?: boolean;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
    location, setIsMobileMenuOpen, user, recentActivities, handleLogout,
    collapsed, onToggleCollapsed, onOpenPalette, forceExpanded = false,
}) => {
    const isRail = collapsed && !forceExpanded;
    const todayCount = todayActions(recentActivities ?? []);
    const closeMobile = () => setIsMobileMenuOpen(false);

    // Track which expandable items are open (full mode only). Default-open the active section.
    const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => {
        const init: Record<string, boolean> = {};
        for (const it of NAV_ITEMS) {
            if (it.children && (location.pathname === it.path || location.pathname.startsWith(`${it.path}/`))) {
                init[it.path] = true;
            }
        }
        return init;
    });
    const toggleOpen = (path: string) => setOpenMap((m) => ({ ...m, [path]: !m[path] }));

    return (
        <div className="cc-root cc-fade-in flex flex-col h-full relative" style={{ background: 'var(--cc-surface-1)', borderRadius: 'inherit', overflow: isRail ? 'visible' : 'hidden' }}>
            <div
                aria-hidden="true"
                className="absolute top-0 left-0 right-0 h-44 pointer-events-none"
                style={{ background: 'radial-gradient(120% 80% at 50% 0%, rgba(163,230,53,.10), transparent 70%)', borderRadius: 'inherit' }}
            />

            <div className="relative z-10 flex flex-col h-full">
                {/* Brand + collapse toggle */}
                <div className={`${isRail ? 'px-2 justify-center' : 'px-5'} pt-6 pb-4 shrink-0 flex items-center gap-3`}>
                    <div className="cc-icon-well w-10 h-10 shrink-0" style={{ background: 'var(--cc-surface-3)', boxShadow: 'var(--cc-e1)' }}>
                        <CatMark />
                    </div>
                    {!isRail && (
                        <>
                            <span className="text-lg font-bold tracking-tight flex-1" style={{ fontFamily: 'var(--cc-font-display)', color: 'var(--cc-tx-1)' }}>
                                CatCoder
                            </span>
                            <button
                                type="button"
                                onClick={onToggleCollapsed}
                                aria-label="Collapse sidebar"
                                className="cc-btn cc-btn-ghost h-9 w-9 hidden lg:inline-flex"
                            >
                                <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
                            </button>
                        </>
                    )}
                </div>

                {/* Expand button when collapsed */}
                {isRail && (
                    <div className="px-2 pb-2 shrink-0 hidden lg:block">
                        <button
                            type="button"
                            onClick={onToggleCollapsed}
                            aria-label="Expand sidebar"
                            className="cc-btn cc-btn-ghost h-9 w-11 mx-auto"
                        >
                            <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                        </button>
                    </div>
                )}

                {/* Search → command palette */}
                <div className={`${isRail ? 'px-2' : 'px-4'} pb-3 shrink-0`}>
                    {isRail ? (
                        <button
                            type="button"
                            onClick={onOpenPalette}
                            aria-label="Search (Ctrl K)"
                            className="cc-btn cc-btn-secondary h-10 w-11 mx-auto"
                        >
                            <Icon icon={Search01Icon} size={18} />
                        </button>
                    ) : (
                        <button type="button" onClick={onOpenPalette} className="cc-search focus:outline-none" aria-label="Search (Ctrl K)">
                            <Icon icon={Search01Icon} size={16} />
                            <span className="flex-1 text-left text-sm" style={{ color: 'var(--cc-tx-3)' }}>Search…</span>
                            <span className="cc-kbd">Ctrl K</span>
                        </button>
                    )}
                </div>

                <hr className="cc-divider mx-4 shrink-0" />

                {/* Nav — scrollable in expanded mode; overflow-visible in rail so flyouts escape */}
                <nav
                    className={`${isRail ? 'px-2 overflow-visible' : 'px-3 overflow-y-auto overflow-x-hidden cc-scroll'} py-4 space-y-1.5 flex-1 min-h-0 cc-stagger`}
                    aria-label="Main Navigation"
                >
                    {!isRail && <div className="cc-eyebrow px-2 pb-1">Menu</div>}
                    {NAV_ITEMS.map((item) => (
                        <NavRow
                            key={item.path}
                            item={item}
                            collapsed={isRail}
                            pathname={location.pathname}
                            search={location.search}
                            expanded={!!openMap[item.path]}
                            onToggleExpand={() => toggleOpen(item.path)}
                            onNavigate={closeMobile}
                        />
                    ))}
                </nav>

                {/* You zone — pinned below the scrollable nav */}
                {user && (
                    <div className={`${isRail ? 'px-2' : ''} pb-2 shrink-0 flex flex-col gap-3`}>
                        <ProgressPod user={user} todayCount={todayCount} collapsed={isRail} />
                        {!isRail && (
                            <div className="px-4">
                                <NavLink to="/practice" onClick={closeMobile} className="block">
                                    <Button variant="secondary" size="md" fullWidth>
                                        <HugeiconsIcon icon={FlashIcon} size={16} /> Daily Challenge
                                    </Button>
                                </NavLink>
                            </div>
                        )}
                    </div>
                )}

                <hr className="cc-divider mx-4 shrink-0" />

                {/* User card */}
                <div className={`${isRail ? 'px-2 py-3' : 'p-4'} shrink-0`}>
                    {user ? (
                        isRail ? (
                            <NavLink
                                to="/profile"
                                onClick={closeMobile}
                                aria-label="Profile"
                                title={`${user.username} · ${getRankDisplayName(user.rank)}`}
                                className="block mx-auto w-fit rounded-full"
                                style={{ boxShadow: 'var(--cc-e1)' }}
                            >
                                <Avatar src={user.avatarUrl} fallback={user.username.charAt(0).toUpperCase()} size="sm" className="ring-1 ring-white/10" />
                            </NavLink>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="rounded-full" style={{ boxShadow: 'var(--cc-e1)' }}>
                                        <Avatar src={user.avatarUrl} fallback={user.username.charAt(0).toUpperCase()} size="sm" className="ring-1 ring-white/10" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--cc-tx-1)' }}>{user.username}</p>
                                        <p className="text-xs truncate" style={{ color: 'var(--cc-tx-3)' }}>{getRankDisplayName(user.rank)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <NavLink to="/profile" onClick={closeMobile} className="flex-1">
                                        <Button variant="ghost" size="sm" fullWidth>View Profile</Button>
                                    </NavLink>
                                    <Button variant="ghost" size="sm" iconOnly onClick={handleLogout} aria-label="Sign out" title="Sign out">
                                        <Icon icon={Logout01Icon} size={16} />
                                    </Button>
                                </div>
                            </>
                        )
                    ) : (
                        <div className={`flex items-center gap-3 ${isRail ? 'justify-center' : ''}`}>
                            <div className="cc-icon-well w-10 h-10" style={{ background: 'var(--cc-surface-3)' }}>
                                <Icon icon={UserIcon} size={18} className="text-gray-400" />
                            </div>
                            {!isRail && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold" style={{ color: 'var(--cc-tx-1)' }}>Guest</p>
                                    <NavLink to="/login" className="text-xs font-semibold" style={{ color: 'var(--cc-brand-1)' }}>
                                        Sign in to save
                                    </NavLink>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const Sidebar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, recentActivities } = useUserStore();
    const { sidebarCollapsed, toggleSidebarCollapsed, setCommandPaletteOpen } = useUIStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const openPalette = () => { setIsMobileMenuOpen(false); setCommandPaletteOpen(true); };

    const railWidth = sidebarCollapsed ? 'w-[72px]' : 'w-72';

    return (
        <>
            {/* Desktop Sidebar (Floating Rail) */}
            <aside
                className={`hidden lg:block fixed left-6 top-6 bottom-6 ${railWidth} rounded-[2rem] z-40`}
                style={{
                    border: '1px solid var(--cc-border)',
                    boxShadow: 'var(--cc-e3)',
                    transition: 'width 260ms cubic-bezier(.22,1,.36,1)',
                    overflow: sidebarCollapsed ? 'visible' : 'hidden',
                }}
            >
                <SidebarContent
                    key={sidebarCollapsed ? 'rail' : 'full'}
                    location={location}
                    setIsMobileMenuOpen={setIsMobileMenuOpen}
                    user={user}
                    recentActivities={recentActivities ?? []}
                    handleLogout={handleLogout}
                    collapsed={sidebarCollapsed}
                    onToggleCollapsed={toggleSidebarCollapsed}
                    onOpenPalette={openPalette}
                />
            </aside>

            {/* Mobile Header */}
            <div
                className="lg:hidden fixed top-0 left-0 right-0 h-16 backdrop-blur-md z-40 px-4 flex items-center justify-between"
                style={{ background: 'rgba(10,11,13,.85)', borderBottom: '1px solid var(--cc-border)' }}
            >
                <div className="flex items-center gap-2.5">
                    <div className="cc-icon-well w-8 h-8" style={{ background: 'var(--cc-surface-3)' }}>
                        <CatMark size={18} />
                    </div>
                    <span className="font-bold tracking-tight" style={{ fontFamily: 'var(--cc-font-display)', color: 'var(--cc-tx-1)' }}>CatCoder</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setCommandPaletteOpen(true)} className="cc-btn cc-btn-secondary h-10 w-10" aria-label="Search">
                        <Icon icon={Search01Icon} size={18} aria-hidden="true" />
                    </button>
                    <button
                        onClick={toggleMobileMenu}
                        className="cc-btn cc-btn-secondary h-10 w-10"
                        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="mobile-menu"
                    >
                        {isMobileMenuOpen ? <Icon icon={Cancel01Icon} size={20} aria-hidden="true" /> : <Icon icon={Menu01Icon} size={20} aria-hidden="true" />}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer (always full layout) */}
            {isMobileMenuOpen && (
                <div id="mobile-menu" className="lg:hidden fixed inset-0 z-30 pt-16" style={{ background: 'var(--cc-bg)' }} role="dialog" aria-modal="true">
                    <SidebarContent
                        location={location}
                        setIsMobileMenuOpen={setIsMobileMenuOpen}
                        user={user}
                        recentActivities={recentActivities ?? []}
                        handleLogout={handleLogout}
                        collapsed={false}
                        onToggleCollapsed={toggleSidebarCollapsed}
                        onOpenPalette={openPalette}
                        forceExpanded
                    />
                </div>
            )}
        </>
    );
};
