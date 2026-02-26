import { SparklesIcon, CheckmarkBadge01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
import React, { useState } from 'react';
import { Icon, Button, Badge } from '../../components/ui';
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
            variant: "secondary" as const,
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
                <Badge className="bg-lime-500/10 text-lime-400 hover:bg-lime-500/20 border-lime-500/20">Simple Pricing</Badge>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-backwards">
                    Invest in your <span className="text-lime-400">Skills</span>.
                </h1>
                <p className="text-xl text-gray-400 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 fill-mode-backwards">
                    Choose the plan that fits your goals. Upgrade anytime.
                </p>

                {/* Toggle */}
                <div className="flex items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-backwards">
                    <span className={`text-sm font-semibold ${!isAnnual ? 'text-white' : 'text-gray-500'}`}>Monthly</span>
                    <button
                        className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${isAnnual ? 'bg-lime-500' : 'bg-white/20'} focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500/50`}
                        onClick={() => setIsAnnual(!isAnnual)}
                    >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                    <span className={`text-sm font-semibold ${isAnnual ? 'text-white' : 'text-gray-500'}`}>
                        Yearly <span className="text-lime-400 text-xs ml-1 font-bold bg-lime-500/10 px-2 py-0.5 rounded-full border border-lime-500/20">-20%</span>
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-backwards">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`
                            relative bg-[#0a0a0a] rounded-[2.5rem] p-8 md:p-12 border transition-all duration-300
                            ${plan.popular
                                ? 'border-lime-500 shadow-xl shadow-lime-500/10 scale-105 z-10'
                                : 'border-white/5 shadow-sm hover:border-white/10'
                            }
                        `}
                    >
                        {plan.popular && (
                            <div className="absolute top-0 right-1/2 md:right-12 translate-x-1/2 md:translate-x-0 -translate-y-1/2 bg-lime-500 text-black px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg shadow-lime-500/20">
                                <Icon icon={SparklesIcon} size={14} fill="currentColor" /> Most Popular
                            </div>
                        )}

                        <div className="text-center mb-8">
                            <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wide mb-2">{plan.name}</h3>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-5xl font-extrabold text-white">${plan.price}</span>
                                <span className="text-gray-500 font-medium">/{plan.period}</span>
                            </div>
                            <p className="text-sm text-gray-400 mt-4">{plan.description}</p>
                        </div>

                        <Button
                            variant={plan.variant === 'primary' ? 'primary' : 'secondary'}
                            className={`w-full h-12 rounded-full mb-8 text-lg ${plan.popular ? 'bg-lime-400 text-black hover:bg-lime-300 shadow-lg shadow-lime-500/20' : 'border-white/10 text-white hover:bg-white/5'}`}
                            onClick={() => navigate('/login')}
                        >
                            {plan.cta}
                        </Button>

                        <ul className="space-y-4">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm font-medium text-gray-300">
                                    <div className="w-5 h-5 rounded-full bg-lime-500/10 text-lime-400 flex items-center justify-center shrink-0 mt-0.5 border border-lime-500/20">
                                        <Icon icon={CheckmarkBadge01Icon} size={12} strokeWidth={3} />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                            {plan.missing.map((feature, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm font-medium text-gray-600">
                                    <div className="w-5 h-5 rounded-full bg-white/5 text-gray-600 flex items-center justify-center shrink-0 mt-0.5">
                                        <Icon icon={Cancel01Icon} size={12} strokeWidth={3} />
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
