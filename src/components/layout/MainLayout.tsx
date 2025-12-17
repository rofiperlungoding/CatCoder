import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useUIStore, useUserStore } from '../../stores';
import { Modal, Button, Input } from '../ui';

export const MainLayout: React.FC = () => {
    const { showAuthModal, setShowAuthModal } = useUIStore();
    const { setGuest } = useUserStore();

    // Initialize guest user if not set
    React.useEffect(() => {
        const userStore = useUserStore.getState();
        if (!userStore.user) {
            setGuest();
        }
    }, [setGuest]);

    return (
        <div className="flex h-screen bg-secondary overflow-hidden">
            {/* Sidebar - Fixed Width */}
            <div className="w-64 flex-shrink-0 border-r border-border bg-white z-20">
                <Sidebar />
            </div>

            {/* Main Content - Scrollable */}
            <main className="flex-1 overflow-y-auto bg-secondary relative">
                <div className="min-h-full">
                    <Outlet />
                </div>
            </main>

            {/* Auth Modal */}
            <Modal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                title="Save Your Progress"
                size="md"
            >
                <div className="space-y-4">
                    <p className="text-[#a1a1aa]">
                        Create an account to save your progress, sync across devices, and track your achievements!
                    </p>

                    <div className="space-y-3">
                        <Input
                            label="Email"
                            type="email"
                            placeholder="your@email.com"
                        />
                        <Input
                            label="Username"
                            type="text"
                            placeholder="CatCoder123"
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button variant="secondary" className="flex-1" onClick={() => setShowAuthModal(false)}>
                            Maybe Later
                        </Button>
                        <Button variant="primary" className="flex-1">
                            Create Account
                        </Button>
                    </div>

                    <p className="text-center text-sm text-[#71717a]">
                        Already have an account?{' '}
                        <button className="text-[#f97316] hover:underline">Sign in</button>
                    </p>
                </div>
            </Modal>
        </div>
    );
};
