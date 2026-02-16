import { TrendingUp, AlertCircle, Target, ArrowRight, Sparkles } from 'lucide-react';
import type { LearningInsight } from '../../types/analytics';

interface InsightCardProps {
    insight: LearningInsight;
}

export default function InsightCard({ insight }: InsightCardProps) {
    const styles = {
        strength: {
            border: 'border-emerald-500/20',
            bg: 'bg-emerald-500/10',
            text: 'text-emerald-200',
            icon: TrendingUp,
            iconColor: 'text-emerald-400',
        },
        weakness: {
            border: 'border-orange-500/20',
            bg: 'bg-orange-500/10',
            text: 'text-orange-200',
            icon: AlertCircle,
            iconColor: 'text-orange-400',
        },
        recommendation: {
            border: 'border-blue-500/20',
            bg: 'bg-blue-500/10',
            text: 'text-blue-200',
            icon: Target,
            iconColor: 'text-blue-400',
        },
        pattern: {
            border: 'border-purple-500/20',
            bg: 'bg-purple-500/10',
            text: 'text-purple-200',
            icon: Sparkles,
            iconColor: 'text-purple-400',
        },
    };

    const style = styles[insight.type];
    const Icon = style.icon;

    return (
        <div className={`p-4 rounded-2xl border ${style.border} ${style.bg} backdrop-blur-sm`}>
            <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-xl bg-black/20 ${style.iconColor} shadow-inner`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-2">
                    <div>
                        <h4 className={`font-bold text-sm ${style.text} flex items-center gap-2`}>
                            {insight.title}
                            {insight.priority === 1 && (
                                <span className="text-[10px] uppercase font-bold bg-white/10 px-2 py-0.5 rounded-full border border-white/5">
                                    Focus
                                </span>
                            )}
                        </h4>
                        <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                            {insight.description}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm group cursor-default text-emerald-100/80 hover:text-white transition-colors">
                        <ArrowRight className={`w-4 h-4 ${style.iconColor} group-hover:translate-x-1 transition-transform`} />
                        <span className="font-medium">
                            {insight.actionable}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
