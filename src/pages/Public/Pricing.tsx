import React, { useState } from 'react';
import {
    Check,
    X,
    Sparkles
} from 'lucide-react';
import { Button, Badge } from '../../components/ui';
import { useNavigate } from 'react-router-dom';

export const PricingPage: React.FC = () => {
    const navigate = useNavigate();
    const [isAnnual, setIsAnnual] = useState(true);

    const plans = [
        {
            name: "Free",
            price: 0,
            period: "forever",
            description: "Perfect for beginners starting their journey.",
            features: [
                "Access to basic Python & JS courses",
                "50 daily coding challenges",
                "Community forum access",
                "Basic profile stats"
            ],
            missing: [
                "Advanced C++ & System Design",
                "Unlimited AI Hints",
                "Certificates of Completion",
                "Priority Support"
            ],
            cta: "Get Started Free",
            variant: "outline" as const,
            popular: false
        },
        {
            name: "Pro",
            price: isAnnual ? 12 : 15,
            period: "per month",
            description: "For serious learners who want to master coding.",
            features: [
                "Access to ALL courses (Python, JS, C++)",
                "Unlimited coding challenges",
                "Unlimited AI Hints & Explanations",
                "Advanced analytics & insights",
                "Certificates of Completion",
                "Priority Support"
            ],
            missing: [],
            cta: "Upgrade to Pro",
            variant: "primary" as const,
            popular: true
        }
    ];

    return (
        <div className="pt-32 pb-20 space-y-16 px-6 md:px-12 max-w-7xl mx-auto">
            <div className="text-center space-y-6 max-w-3xl mx-auto">
                <Badge className="bg-lime-100 text-lime-800 hover:bg-lime-200 border-0">Simple Pricing</Badge>
                <h1 className="text-4xl md:text-5xl font-extrabold text-primary animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-backwards">
                    Invest in your <span className="text-lime-500">Skills</span>.
                </h1>
                <p className="text-xl text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-backwards">
                    Choose the plan that fits your goals. Upgrade anytime.
                </p>

                {/* Toggle */}
                <div className="flex items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-backwards">
                    <span className={`text-sm font-semibold ${!isAnnual ? 'text-primary' : 'text-gray-400'}`}>Monthly</span>
                    <button
                        className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${isAnnual ? 'bg-lime-500' : 'bg-gray-200'}`}
                        onClick={() => setIsAnnual(!isAnnual)}
                    >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                    <span className={`text-sm font-semibold ${isAnnual ? 'text-primary' : 'text-gray-400'}`}>
                        Yearly <span className="text-lime-600 text-xs ml-1 font-bold bg-lime-100 px-2 py-0.5 rounded-full">-20%</span>
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-backwards">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`
                            relative bg-white rounded-[2.5rem] p-8 md:p-12 border transition-all duration-300
                            ${plan.popular
                                ? 'border-lime-500 shadow-xl shadow-lime-500/10 scale-105 z-10'
                                : 'border-gray-100 shadow-sm hover:shadow-lg'
                            }
                        `}
                    >
                        {plan.popular && (
                            <div className="absolute top-0 right-1/2 md:right-12 translate-x-1/2 md:translate-x-0 -translate-y-1/2 bg-lime-500 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg shadow-lime-500/20">
                                <Sparkles size={14} fill="currentColor" /> Most Popular
                            </div>
                        )}

                        <div className="text-center mb-8">
                            <h3 className="text-lg font-bold text-gray-500 uppercase tracking-wide mb-2">{plan.name}</h3>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-5xl font-extrabold text-primary">${plan.price}</span>
                                <span className="text-gray-400 font-medium">/{plan.period}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-4">{plan.description}</p>
                        </div>

                        <Button
                            variant={plan.variant === 'primary' ? 'primary' : 'secondary'}
                            className={`w-full h-12 rounded-full mb-8 text-lg ${plan.popular ? 'shadow-lg shadow-lime-500/20' : ''}`}
                            onClick={() => navigate('/login')}
                        >
                            {plan.cta}
                        </Button>

                        <ul className="space-y-4">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm font-medium text-gray-700">
                                    <div className="w-5 h-5 rounded-full bg-lime-100 text-lime-600 flex items-center justify-center shrink-0 mt-0.5">
                                        <Check size={12} strokeWidth={3} />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                            {plan.missing.map((feature, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm font-medium text-gray-400">
                                    <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center shrink-0 mt-0.5">
                                        <X size={12} strokeWidth={3} />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};
