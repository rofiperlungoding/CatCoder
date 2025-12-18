import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Cat, Menu, X, ArrowUpRight, ChevronDown } from 'lucide-react';
import { useUIStore } from '../../stores';

export const PublicLayout: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { setShowAuthModal } = useUIStore();
    const navigate = useNavigate();
    const location = useLocation();


    // Sliding Pill Logic
    const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
    const navRef = useRef<HTMLDivElement>(null);
    const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

    const links = [
        { path: '/', label: 'Home' },
        { path: '/features', label: 'Features' },
        { path: '/courses', label: 'Courses' },
        { path: '/pricing', label: 'Pricing' },
        { path: '/about', label: 'About' }
    ];

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

    const handleLoginClick = () => {
        setShowAuthModal(true);
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent selection:text-white overflow-x-hidden">
            {/* Floating Pill Navbar */}
            <div className="fixed top-6 inset-x-0 z-50 flex justify-center px-4">
                <nav className="w-full max-w-4xl bg-white/90 backdrop-blur-md border border-white/20 shadow-xl shadow-black/5 rounded-full pl-5 pr-2 py-2 flex items-center justify-between transition-all duration-300">
                    {/* Logo Section */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="flex items-center justify-center text-primary">
                            <Cat size={20} strokeWidth={2.5} />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-primary hidden sm:block">CatCoder</span>
                    </div>

                    {/* Desktop Menu */}
                    <div
                        ref={navRef}
                        className="hidden md:flex items-center gap-1 bg-muted/50 rounded-full p-1 border border-white/50 relative"
                    >
                        {/* The Sliding Pill */}
                        <div
                            className="absolute top-1 bottom-1 bg-white shadow-sm rounded-full transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] pointer-events-none"
                            style={{
                                left: pillStyle.left,
                                width: pillStyle.width,
                                opacity: pillStyle.opacity
                            }}
                        />

                        {links.map((link, index) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    ref={el => linkRefs.current[index] = el}
                                    className={`relative z-10 px-4 py-1.5 text-xs font-medium rounded-full transition-colors duration-200 ${isActive || (pillStyle.opacity === 0 && isActive) // Fallback style if js fails or loading
                                        ? 'text-primary font-semibold'
                                        : 'text-muted-foreground hover:text-primary'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Auth Actions */}
                    <div className="flex items-center gap-3 pl-2">
                        <button
                            onClick={() => navigate('/login')}
                            className="hidden md:flex items-center gap-2 bg-primary hover:bg-primary/90 text-white rounded-full px-6 py-2.5 text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md group"
                        >
                            Start Learning
                            <ArrowUpRight size={16} strokeWidth={2} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                        <button className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium transition-colors text-primary hover:border-gray-300">
                            <span>eng</span>
                            <ChevronDown size={14} strokeWidth={2} className="text-gray-500" />
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-primary hover:bg-muted rounded-full transition-colors">
                            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </nav>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="fixed inset-x-4 top-24 z-40 bg-white rounded-[2rem] border border-gray-100 shadow-2xl p-6 md:hidden animate-in slide-in-from-top-4 fade-in duration-200">
                    <div className="flex flex-col gap-2">
                        <Link to="/" className="text-2xl font-semibold text-primary" onClick={() => setIsMenuOpen(false)}>Home</Link>
                        <Link to="/features" className="text-2xl font-semibold text-muted-foreground" onClick={() => setIsMenuOpen(false)}>Features</Link>
                        <Link to="/courses" className="text-2xl font-semibold text-muted-foreground" onClick={() => setIsMenuOpen(false)}>Courses</Link>
                        <Link to="/pricing" className="text-2xl font-semibold text-muted-foreground" onClick={() => setIsMenuOpen(false)}>Pricing</Link>
                        <Link to="/about" className="text-2xl font-semibold text-muted-foreground" onClick={() => setIsMenuOpen(false)}>About</Link>
                        <Link to="/contact" className="text-2xl font-semibold text-muted-foreground" onClick={() => setIsMenuOpen(false)}>Contact</Link>
                        <hr className="border-gray-100 my-4" />
                        <button onClick={() => { navigate('/login'); setIsMenuOpen(false); }} className="w-full py-4 rounded-xl bg-primary text-white font-bold text-lg">Start Learning</button>
                    </div>
                </div>
            )}


            <main className="">
                <Outlet />
            </main>

            {/* CatCoder Footer */}
            <footer className="bg-white py-20 px-6 sm:px-12 mt-20 rounded-t-[3rem]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
                        <div className="flex flex-col gap-6 max-w-sm">
                            <div className="flex items-center gap-2">
                                <Cat size={24} strokeWidth={2.5} className="text-primary" />
                                <span className="font-bold text-2xl tracking-tight text-primary">CatCoder</span>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                The best place to learn, practice, and master programming. Join our community of 100,000+ developers today.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-24">
                            <div className="flex flex-col gap-4">
                                <h4 className="font-semibold text-sm text-muted-foreground">Product</h4>
                                <Link to="/learn" className="text-sm font-medium hover:text-primary transition-colors">Learn</Link>
                                <Link to="/practice" className="text-sm font-medium hover:text-primary transition-colors">Practice</Link>
                                <Link to="/compete" className="text-sm font-medium hover:text-primary transition-colors">Compete</Link>
                            </div>
                            <div className="flex flex-col gap-4">
                                <h4 className="font-semibold text-sm text-muted-foreground">Services</h4>
                                <Link to="/courses" className="text-sm font-medium hover:text-primary transition-colors">Courses</Link>
                                <Link to="/features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
                            </div>
                            <div className="flex flex-col gap-4">
                                <h4 className="font-semibold text-sm text-muted-foreground">Company</h4>
                                <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">About</Link>
                                <Link to="/contact" className="text-sm font-medium hover:text-primary transition-colors">Contact</Link>
                                <Link to="/pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</Link>
                            </div>
                            <div className="flex flex-col gap-4">
                                <h4 className="font-semibold text-sm text-muted-foreground">Legal</h4>
                                <Link to="#" className="text-sm font-medium hover:text-primary transition-colors">Privacy</Link>
                                <Link to="#" className="text-sm font-medium hover:text-primary transition-colors">Terms</Link>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-100 gap-4">
                        <div className="flex gap-6 text-xs font-semibold text-muted-foreground">
                            <span>© 2024 CatCoder. All rights reserved.</span>
                        </div>
                        <div className="flex gap-6 text-xs font-semibold text-muted-foreground">
                            <span>hello@catcoder.com</span>
                        </div>
                        <div className="flex gap-6 text-xs font-semibold text-muted-foreground">
                            <span>San Francisco, CA</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
