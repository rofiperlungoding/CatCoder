import type { AIHintRequest, AIHintResponse } from '../../services/ai/types';
import MarkdownContent from '../ui/MarkdownContent';

interface AIHintPanelProps {
    challenge: { id: string; title: string; language: 'python' | 'javascript' | 'cpp' };
    userCode: string;
    onClose?: () => void;
    // Hook values passed as props
    hint: AIHintResponse | null;
    loading: boolean;
    error: string | null;
    remainingHints: number;
    generateHint: (request: AIHintRequest) => Promise<void>;
    clearHint: () => void;
}

export default function AIHintPanel({
    challenge,
    userCode,
    hint,
    loading,
    error,
    remainingHints,
    generateHint,
    clearHint
}: AIHintPanelProps) {
    // AIHintPanel receives hook values as props for state lifting

    const handleSelectLevel = async (level: 'gentle' | 'detailed' | 'solution') => {
        const request: AIHintRequest = {
            challengeId: challenge.id,
            code: userCode,
            language: challenge.language,
            hintLevel: level,
            previousHints: [],
        };
        await generateHint(request);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground animate-pulse">
                <p className="text-xs font-bold tracking-wide uppercase">Searching...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-400 text-sm p-4 border border-red-500/20 rounded-lg bg-red-500/5">
                <p className="mb-2">{error}</p>
                <button onClick={() => clearHint()} className="underline text-xs opacity-50 hover:opacity-100">Retry</button>
            </div>
        );
    }

    if (hint) {
        return (
            <div className="animate-in fade-in duration-300">
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                    <MarkdownContent content={hint.hint} />
                </div>

                {remainingHints > 0 ? (
                    <button
                        onClick={() => clearHint()}
                        className="mt-8 text-xs text-muted-foreground hover:text-white transition-colors border-t border-white/5 pt-4 w-full text-left"
                    >
                        Search for another
                    </button>
                ) : (
                    <p className="mt-8 text-[10px] text-muted-foreground opacity-30 border-t border-white/5 pt-4">Limit reached.</p>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300 font-sans text-sm text-muted-foreground text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">
                Select type:
            </p>
            <ul className="space-y-4">
                <li>
                    <button
                        onClick={() => handleSelectLevel('gentle')}
                        disabled={remainingHints <= 0}
                        className="hover:text-foreground transition-colors text-left flex items-center justify-between group w-full disabled:opacity-30"
                    >
                        <span className="font-medium">Gentle Guide</span>
                        <span className="text-[10px] font-mono text-amber-500/60 transition-colors group-hover:text-amber-500">-5 XP</span>
                    </button>
                </li>
                <li>
                    <button
                        onClick={() => handleSelectLevel('detailed')}
                        disabled={remainingHints <= 0}
                        className="hover:text-foreground transition-colors text-left flex items-center justify-between group w-full disabled:opacity-30"
                    >
                        <span className="font-medium">Detailed Guide</span>
                        <span className="text-[10px] font-mono text-amber-500/60 transition-colors group-hover:text-amber-500">-10 XP</span>
                    </button>
                </li>
                <li>
                    <button
                        onClick={() => handleSelectLevel('solution')}
                        disabled={remainingHints <= 0}
                        className="hover:text-foreground transition-colors text-left flex items-center justify-between group w-full disabled:opacity-30"
                    >
                        <span className="font-bold text-foreground">Reveal Solution</span>
                        <span className="text-[10px] font-mono text-amber-500/60 font-normal transition-colors group-hover:text-amber-500">-25 XP</span>
                    </button>
                </li>
            </ul>
        </div>
    );
}
