import type { AICodeReviewResponse } from '../../services/ai/types';

interface AIReviewCardProps {
    review: AICodeReviewResponse;
    onClose?: () => void;
}

export default function AIReviewCard({ review }: AIReviewCardProps) {
    const { strengths, improvements, alternatives, explanation } = review;

    return (
        <div className="animate-in fade-in duration-300 font-sans text-sm text-muted-foreground space-y-8 text-left">
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                <p>{explanation}</p>
            </div>

            {strengths.length > 0 && (
                <div>
                    <h3 className="text-foreground font-bold text-xs uppercase tracking-wider mb-3">
                        Strengths
                    </h3>
                    <ul className="space-y-2 pl-1">
                        {strengths.map((item, i) => (
                            <li key={i} className="flex gap-3 text-[13px] leading-relaxed">
                                <span className="opacity-40 select-none">•</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {improvements.length > 0 && (
                <div>
                    <h3 className="text-foreground font-bold text-xs uppercase tracking-wider mb-3">
                        Improvements
                    </h3>
                    <ul className="space-y-2 pl-1">
                        {improvements.map((item, i) => (
                            <li key={i} className="flex gap-3 text-[13px] leading-relaxed">
                                <span className="opacity-40 select-none">•</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {alternatives.length > 0 && (
                <div>
                    <h3 className="text-foreground font-bold text-xs uppercase tracking-wider mb-3">
                        Alternatives
                    </h3>
                    <ul className="space-y-2 pl-1">
                        {alternatives.map((item, i) => (
                            <li key={i} className="flex gap-3 text-[13px] leading-relaxed">
                                <span className="opacity-40 select-none">•</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="text-[10px] text-muted-foreground/30 italic pt-8 border-t border-white/5">
                Automated check. Review carefully.
            </div>
        </div>
    );
}
