/**
 * Honeypot Page Component
 * 
 * A decoy page designed to detect and track attackers probing for vulnerabilities.
 * Displays a convincing fake loading state and redirects after a delay.
 * 
 * Requirements: 10.3, 10.4
 */

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { logHoneypotAccess } from '../../lib/securityLogger';
import { LoadingSpinner } from '../../components/ui';

// Delay before redirecting (in milliseconds)
const REDIRECT_DELAY_MS = 3000;

export const HoneypotPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loadingText, setLoadingText] = useState('Verifying credentials...');

    useEffect(() => {
        // Log the honeypot access as a security event
        // Requirements: 10.2 - Log access with user's session info
        logHoneypotAccess(location.pathname, {
            search: location.search,
            timestamp: new Date().toISOString()
        });

        // Cycle through fake loading messages to appear convincing
        // Requirements: 10.3 - Display convincing fake loading state
        const messages = [
            'Verifying credentials...',
            'Checking permissions...',
            'Loading admin panel...',
            'Authenticating session...'
        ];

        let messageIndex = 0;
        const messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % messages.length;
            setLoadingText(messages[messageIndex]);
        }, 800);

        // Redirect after delay
        // Requirements: 10.4 - Redirect to harmless destination after delay
        const redirectTimeout = setTimeout(() => {
            navigate('/', { replace: true });
        }, REDIRECT_DELAY_MS);

        return () => {
            clearInterval(messageInterval);
            clearTimeout(redirectTimeout);
        };
    }, [navigate, location.pathname, location.search]);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
            {/* Fake admin loading UI */}
            <div className="flex flex-col items-center gap-6 max-w-md text-center">
                {/* Shield icon with loading animation */}
                <div className="relative">
                    <Shield size={64} className="text-muted-foreground" />
                    <div className="absolute -bottom-1 -right-1">
                        <LoadingSpinner size={24} className="text-primary" />
                    </div>
                </div>

                {/* Fake loading text */}
                <div className="space-y-2">
                    <h1 className="text-xl font-semibold text-foreground">
                        Admin Access
                    </h1>
                    <p className="text-muted-foreground">
                        {loadingText}
                    </p>
                </div>

                {/* Fake progress indicator */}
                <div className="w-full max-w-xs">
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full animate-pulse"
                            style={{
                                width: '60%',
                                animation: 'pulse 1s ease-in-out infinite'
                            }}
                        />
                    </div>
                </div>

                {/* Fake security notice */}
                <p className="text-xs text-muted-foreground mt-4">
                    This area is protected. Unauthorized access attempts are logged.
                </p>
            </div>
        </div>
    );
};

export default HoneypotPage;
