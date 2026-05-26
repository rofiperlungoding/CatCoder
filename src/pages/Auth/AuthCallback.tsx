
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores';
import { logger } from '../../lib/logger';
/**
 * AuthCallback component handles OAuth redirects.
 * This page is where Supabase redirects after successful OAuth authentication.
 * It waits for the session to be detected and then redirects to /home.
 */
export const AuthCallback = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading } = useUserStore();

    useEffect(() => {
        logger.debug('[AuthCallback] State:', { isAuthenticated, isLoading });

        // Wait for loading to complete
        if (!isLoading) {
            if (isAuthenticated) {
                logger.debug('[AuthCallback] User authenticated, redirecting to /home');
                navigate('/home', { replace: true });
            } else {
                // If not authenticated after loading, something went wrong
                logger.debug('[AuthCallback] Not authenticated after loading, redirecting to /login');
                navigate('/login', { replace: true });
            }
        }
    }, [isAuthenticated, isLoading, navigate]);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 bg-lime-400 rounded-2xl flex items-center justify-center text-black animate-pulse">
                <img src="/logo.png" alt="CatCoder Logo" className="w-8 h-8 object-contain" />
            </div>
            <div className="text-sm font-medium text-gray-400">Completing sign in...</div>
        </div>
    );
};
