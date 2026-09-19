import { ArrowUpRight01Icon, Menu01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Icon } from '../ui';
import { Button } from '../ds';
import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
const links = [
    { path: '/', label: 'Home' },
    { path: '/features', label: 'Features' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/faq', label: 'FAQ' }
];

export const PublicLayout: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Sliding Pill Logic
    const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
    const navRef = useRef<HTMLDivElement>(null);
    const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

    useEffect(() => {
        const activeIndex = links.findIndex(link => link.path === location.pathname);
        const currentLink = linkRefs.current[activeIndex];

        if (currentLink && navRef.current) {
            // Calculate relative position
            const navRect = navRef.current.getBoundingClientRect();
            const linkRect = currentLink.getBoundingClientRect();

            setPillStyle({
                left: linkRect.left - navRect.left,
                width: linkRect.width,
                opacity: 1
            });
        } else {
            // Handle case where route doesn't match a link (optional: hide pill or keep at last pos)
            // For sub-routes (e.g. /features/xyz), we might want to keep /features active, but we only have exact checking right now.
            // We can check startsWith for better UX if needed.

            // Fallback for "active" state check using startsWith for better partial matching if exact fail
            const partialIndex = links.findIndex(link => link.path !== '/' && location.pathname.startsWith(link.path));
            if (partialIndex !== -1) {
                const partialLink = linkRefs.current[partialIndex];
                if (partialLink && navRef.current) {
                    const navRect = navRef.current.getBoundingClientRect();
                    const linkRect = partialLink.getBoundingClientRect();
                    setPillStyle({
                        left: linkRect.left - navRect.left,
                        width: linkRect.width,
                        opacity: 1
                    });
                    return;
                }
            }

            // Special case for Home trying to capture everything else is usually bad, so let's hide if no match
            if (location.pathname === '/' && linkRefs.current[0]) {
                // Home is active
                const homeLink = linkRefs.current[0];
                const navRect = navRef.current!.getBoundingClientRect();
                const linkRect = homeLink.getBoundingClientRect();
                setPillStyle({
                    left: linkRect.left - navRect.left,
                    width: linkRect.width,
                    opacity: 1
                });
            } else {
                setPillStyle(prev => ({ ...prev, opacity: 0 }));
            }
        }
    }, [location.pathname]);


    return (
        <div className="cc-root min-h-screen bg-[#050505] text-[#FAFAFA] font-sans selection:bg-lime-500/30 selection:text-white overflow-x-hidden">
            {/* Floating Glass Navbar */}
            <div className="fixed top-6 inset-x-0 z-50 flex justify-center px-4">
                <nav className="cc-glass w-full max-w-4xl rounded-full pl-5 pr-2 py-2 flex items-center justify-between transition-all duration-300">
                    {/* Logo Section */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="flex items-center justify-center">
                            <img src="/logo.png" alt="CatCoder Logo" className="w-5 h-5 object-contain" />
                        </div>
                        <span className="font-bold text-lg tracking-tight hidden sm:block" style={{ color: 'var(--cc-tx-1)', fontFamily: 'var(--cc-font-display)' }}>CatCoder</span>
                    </div>

                    {/* Desktop Menu */}
                    <div
                        ref={navRef}
                        className="hidden md:flex items-center gap-1 rounded-full p-1 relative"
                        style={{ background: 'var(--cc-surface-3)' }}
                    >
                        {/* The Sliding Pill */}
                        <div
                            className="absolute top-1 bottom-1 rounded-full transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] pointer-events-none"
                            style={{
                                left: pillStyle.left,
                                width: pillStyle.width,
                                opacity: pillStyle.opacity,
                                background: 'rgba(255,255,255,.08)',
                            }}
                        />

                        {links.map((link, index) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    ref={el => { linkRefs.current[index] = el; }}
                                    className="relative z-10 px-4 py-1.5 text-xs font-medium rounded-full transition-colors duration-200"
                                    style={{ color: isActive ? 'var(--cc-brand-1)' : 'var(--cc-tx-2)' }}
                                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--cc-tx-1)'; }}
                                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--cc-tx-2)'; }}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Auth Actions */}
                    <div className="flex items-center gap-2 pl-2">
                        <Button variant="primary" size="sm" className="hidden md:inline-flex" onClick={() => navigate('/login')}>
                            Start Learning <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} strokeWidth={2} />
                        </Button>

                        {/* Mobile Menu Toggle */}
                        <Button variant="ghost" size="sm" iconOnly className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            <Icon icon={isMenuOpen ? Cancel01Icon : Menu01Icon} size={20} />
                        </Button>
                    </div>
                </nav>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="cc-glass fixed inset-x-4 top-24 z-40 p-6 md:hidden animate-in slide-in-from-top-4 fade-in duration-200" style={{ borderRadius: 'var(--cc-r-xl)' }}>
                    <div className="flex flex-col gap-2">
                        <Link to="/" className="text-2xl font-semibold" style={{ color: 'var(--cc-tx-1)' }} onClick={() => setIsMenuOpen(false)}>Home</Link>
                        <Link to="/features" className="text-2xl font-semibold" style={{ color: 'var(--cc-tx-2)' }} onClick={() => setIsMenuOpen(false)}>Features</Link>
                        <Link to="/pricing" className="text-2xl font-semibold" style={{ color: 'var(--cc-tx-2)' }} onClick={() => setIsMenuOpen(false)}>Pricing</Link>
                        <Link to="/faq" className="text-2xl font-semibold" style={{ color: 'var(--cc-tx-2)' }} onClick={() => setIsMenuOpen(false)}>FAQ</Link>
                        <Link to="/about" className="text-2xl font-semibold" style={{ color: 'var(--cc-tx-2)' }} onClick={() => setIsMenuOpen(false)}>About</Link>
                        <Link to="/contact" className="text-2xl font-semibold" style={{ color: 'var(--cc-tx-2)' }} onClick={() => setIsMenuOpen(false)}>Contact</Link>
                        <hr className="my-4" style={{ border: 'none', borderTop: '1px solid var(--cc-border)' }} />
                        <Button fullWidth size="lg" onClick={() => { navigate('/login'); setIsMenuOpen(false); }}>Start Learning</Button>
                    </div>
                </div>
            )}


            <main className="">
                <Outlet />
            </main>

            {/* CatCoder Footer */}
            <footer className="py-20 px-6 sm:px-12 mt-20" style={{ background: 'var(--cc-surface-1)', borderTop: '1px solid var(--cc-border)', borderTopLeftRadius: 'var(--cc-r-xl)', borderTopRightRadius: 'var(--cc-r-xl)' }}>
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
                        <div className="flex flex-col gap-6 max-w-sm">
                            <div className="flex items-center gap-2">
                                <img src="/logo.png" alt="CatCoder Logo" className="w-6 h-6 object-contain" />
                                <span className="font-bold text-2xl tracking-tight" style={{ color: 'var(--cc-tx-1)', fontFamily: 'var(--cc-font-display)' }}>CatCoder</span>
                            </div>
                            <p className="leading-relaxed" style={{ color: 'var(--cc-tx-2)' }}>
                                Learn to code, then prove you can catch the AI when it writes code wrong. Free, in your browser, no account needed to try.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-24">
                            <div className="flex flex-col gap-4">
                                <h4 className="cc-eyebrow">Product</h4>
                                <Link to="/features" className="text-sm font-medium transition-colors" style={{ color: 'var(--cc-tx-2)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--cc-tx-1)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--cc-tx-2)'}>Features</Link>
                                <Link to="/arena" className="text-sm font-medium transition-colors" style={{ color: 'var(--cc-tx-2)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--cc-tx-1)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--cc-tx-2)'}>Bug Arena</Link>
                                <Link to="/pricing" className="text-sm font-medium transition-colors" style={{ color: 'var(--cc-tx-2)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--cc-tx-1)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--cc-tx-2)'}>Pricing</Link>
                            </div>
                            <div className="flex flex-col gap-4">
                                <h4 className="cc-eyebrow">Company</h4>
                                <Link to="/about" className="text-sm font-medium transition-colors" style={{ color: 'var(--cc-tx-2)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--cc-tx-1)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--cc-tx-2)'}>About</Link>
                                <Link to="/faq" className="text-sm font-medium transition-colors" style={{ color: 'var(--cc-tx-2)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--cc-tx-1)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--cc-tx-2)'}>FAQ</Link>
                                <Link to="/contact" className="text-sm font-medium transition-colors" style={{ color: 'var(--cc-tx-2)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--cc-tx-1)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--cc-tx-2)'}>Contact</Link>
                            </div>
                            <div className="flex flex-col gap-4">
                                <h4 className="cc-eyebrow">Get started</h4>
                                <Link to="/arena" className="text-sm font-medium transition-colors" style={{ color: 'var(--cc-tx-2)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--cc-tx-1)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--cc-tx-2)'}>Play as guest</Link>
                                <Link to="/login" className="text-sm font-medium transition-colors" style={{ color: 'var(--cc-tx-2)' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--cc-tx-1)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--cc-tx-2)'}>Sign in</Link>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center pt-8 gap-4" style={{ borderTop: '1px solid var(--cc-border)' }}>
                        <div className="text-xs font-semibold" style={{ color: 'var(--cc-tx-3)' }}>
                            © 2026 CatCoder. Free for everyone.
                        </div>
                        <div className="text-xs font-semibold" style={{ color: 'var(--cc-tx-3)' }}>
                            hello@catcoder.online
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
