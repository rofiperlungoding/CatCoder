import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Cat, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        // TODO: Send to error tracking service (e.g., Sentry)
    }

    handleReload = (): void => {
        this.setState({ hasError: false, error: undefined });
        window.location.reload();
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
                    {/* Error Icon */}
                    <div className="relative mb-6">
                        <Cat size={100} className="text-red-500 drop-shadow-2xl" />
                    </div>

                    {/* Error Message */}
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Oops! Something went wrong
                    </h1>
                    <p className="text-muted-foreground text-center max-w-md mb-4">
                        An unexpected error occurred. Don't worry, it's not your fault!
                        Our team has been notified.
                    </p>

                    {/* Error Details (Dev Only) */}
                    {import.meta.env.DEV && this.state.error && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 max-w-lg">
                            <code className="text-sm text-red-400 break-all">
                                {this.state.error.message}
                            </code>
                        </div>
                    )}



                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            onClick={this.handleReload}
                            className="shadow-lg shadow-lime-500/20"
                        >
                            <RefreshCw size={18} className="mr-2" />
                            Try Again
                        </Button>
                        <Link to="/">
                            <Button variant="secondary">
                                <Home size={18} className="mr-2" />
                                Go Home
                            </Button>
                        </Link>
                    </div>

                    {/* Decorative */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/5 rounded-full blur-3xl" />
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
