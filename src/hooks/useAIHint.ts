import { useState, useCallback, useEffect } from 'react';
import { hintGenerator } from '../services/ai/hintGenerator';
import { aiPersistence } from '../services/ai/aiPersistence';
import { useUserStore } from '../stores';
import { AIServiceError } from '../services/ai/types';
import type { AIHintRequest, AIHintResponse } from '../services/ai/types';

interface UseAIHintReturn {
    hint: AIHintResponse | null;
    loading: boolean;
    error: string | null;
    remainingHints: number;
    generateHint: (request: AIHintRequest) => Promise<void>;
    clearHint: () => void;
}

export function useAIHint(challengeId: string): UseAIHintReturn {
    const [hint, setHint] = useState<AIHintResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [remainingHints, setRemainingHints] = useState<number>(0);
    const { user } = useUserStore();

    useEffect(() => {
        // Initialize remaining hints on mount or challenge change
        const updateRemaining = () => {
            setRemainingHints(hintGenerator.getRemainingHints(challengeId));
        };
        updateRemaining();
        // No polling needed unless multiple tabs, but let's re-check on focus if we wanted to be robust
    }, [challengeId]);

    const generateHint = useCallback(async (request: AIHintRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await hintGenerator.generateHint(request);
            setHint(response);
            setRemainingHints(hintGenerator.getRemainingHints(challengeId));

            // Log usage to Supabase if user is logged in
            if (user?.id) {
                await aiPersistence.logUsage({
                    user_id: user.id,
                    feature: 'hint',
                    content_id: challengeId,
                    tokens_used: response.tokensUsed,
                    model: 'gpt-4o-mini',
                    metadata: { level: request.hintLevel }
                });
            }

        } catch (err: unknown) {
            console.error('Hint generation error:', err);
            if (err instanceof AIServiceError) {
                setError(err.message);
            } else {
                setError('Failed to generate hint. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }, [challengeId, user]);

    const clearHint = useCallback(() => {
        setHint(null);
        setError(null);
    }, []);

    return {
        hint,
        loading,
        error,
        remainingHints,
        generateHint,
        clearHint,
    };
}
