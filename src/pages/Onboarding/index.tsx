import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';
import { Cat, Code2, Trophy, ArrowRight } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [isExiting, setIsExiting] = useState(false);

    const steps = [
        {
            title: "Welcome to CatCoder",
            description: "The ultimate platform to master coding through interactive challenges and gamified learning.",
            icon: <Cat size={64} className="text-lime-400" />,
            bg: "bg-lime-500/10"
        },
        {
            title: "Learn by Doing",
            description: "Solve real-world problems with our powerful in-browser code editor. Get instant feedback and improve fast.",
            icon: <Code2 size={64} className="text-blue-400" />,
            bg: "bg-blue-500/10"
        },
        {
            title: "Compete & Win",
            description: "Climb the global leaderboards, earn badges, and showcase your skills to the community.",
            icon: <Trophy size={64} className="text-amber-400" />,
            bg: "bg-amber-500/10"
        }
    ];

    const handleExit = () => {
        setIsExiting(true);
        setTimeout(() => {
            navigate('/login');
        }, 800); // Wait for animation to finish
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleExit();
        }
    };

    const handleSkip = () => {
        handleExit();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 relative overflow-hidden">
            {/* Background Decorations - Exit with fade */}
            <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-lime-500/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none transition-opacity duration-700 ${isExiting ? 'opacity-0' : 'opacity-100'}`}></div>
            <div className={`absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none transition-opacity duration-700 ${isExiting ? 'opacity-0' : 'opacity-100'}`}></div>

            <div className={`w-full max-w-lg bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] shadow-2xl p-8 relative z-10 duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${isExiting ? 'animate-out fade-out zoom-out-95 slide-out-to-top-4 fill-mode-forwards' : 'animate-in fade-in zoom-in-95 slide-in-from-bottom-4'}`}>

                <div className="flex flex-col items-center text-center mt-8">
                    {/* Animated Icon */}
                    <div
                        className={`w-32 h-32 rounded-[2.5rem] ${steps[currentStep].bg} flex items-center justify-center mb-8 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] border border-white/5`}
                    >
                        <div key={currentStep} className="animate-in fade-in zoom-in-50 duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]">
                            {steps[currentStep].icon}
                        </div>
                    </div>

                    {/* Step Indicators */}
                    <div className="flex gap-2 mb-8">
                        {steps.map((_, index) => (
                            <div
                                key={index}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentStep ? 'w-8 bg-lime-400' : 'bg-gray-800'}`}
                            ></div>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="min-h-[160px] flex flex-col items-center">
                        <h1
                            key={`title-${currentStep}`}
                            className="text-3xl font-bold text-white mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
                        >
                            {steps[currentStep].title}
                        </h1>
                        <p
                            key={`desc-${currentStep}`}
                            className="text-gray-400 text-lg leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 px-4"
                        >
                            {steps[currentStep].description}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="w-full mt-8">
                        <Button
                            onClick={handleNext}
                            className="w-full h-14 text-lg rounded-full shadow-lg shadow-lime-500/10 group relative overflow-hidden bg-lime-400 text-black hover:bg-lime-300 hover:shadow-lime-500/20"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"></div>
                        </Button>
                    </div>

                    {/* Skip Text Button */}
                    <div className="mt-4">
                        <button
                            onClick={handleSkip}
                            className="text-sm font-semibold text-gray-500 hover:text-white transition-colors py-2 px-4 rounded-full hover:bg-white/5"
                        >
                            Skip
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
