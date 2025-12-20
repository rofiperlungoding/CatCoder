import { Cat, Home, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';

export const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
            {/* Animated Cat Icon */}
            {/* Cat Icon */}
            <div className="relative mb-8 z-10">
                <Cat size={120} className="text-lime-500 drop-shadow-2xl" />
            </div>

            {/* 404 Text */}
            <h1 className="relative z-10 text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-lime-500 to-emerald-500 mb-2 tracking-tighter">
                404
            </h1>

            {/* Message */}
            <h2 className="relative z-10 text-2xl md:text-3xl font-bold text-foreground mb-4 text-center">
                Oops! This cat wandered off.
            </h2>
            <p className="relative z-10 text-muted-foreground text-center max-w-md mb-10 leading-relaxed text-lg">
                The page you're looking for doesn't exist or has been moved to another dimension.
            </p>

            {/* Action Buttons */}
            <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link to="/">
                    <Button size="lg" className="w-full sm:w-auto shadow-xl shadow-lime-500/20">
                        <Home size={18} className="mr-2" />
                        Go Home
                    </Button>
                </Link>
                <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => window.history.back()}
                    className="w-full sm:w-auto"
                >
                    <ArrowLeft size={18} className="mr-2" />
                    Go Back
                </Button>
            </div>

            {/* Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl opacity-50 mix-blend-multiply dark:mix-blend-screen animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl opacity-50 mix-blend-multiply dark:mix-blend-screen" />
            </div>
        </div>
    );
};


