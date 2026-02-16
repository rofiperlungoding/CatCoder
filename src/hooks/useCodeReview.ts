import { useState, useCallback } from 'react';
import { codeReviewer } from '../services/ai/codeReviewer';
import { aiPersistence } from '../services/ai/aiPersistence';
import { useUserStore } from '../stores';
import type { AICodeReviewRequest, AICodeReviewResponse } from '../services/ai/types';

interface UseCodeReviewReturn {
    review: AICodeReviewResponse | null;
    loading: boolean;
    error: string | null;
    generateReview: (request: AICodeReviewRequest) => Promise<void>;
    clearReview: () => void;
}

export function useCodeReview(): UseCodeReviewReturn {
    const [review, setReview] = useState<AICodeReviewResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useUserStore();

    const generateReview = useCallback(async (request: AICodeReviewRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await codeReviewer.reviewCode(request);
            setReview(response);

            // Persist to Supabase if user is logged in
            if (user?.id) {
                // Log usage
                await aiPersistence.logUsage({
                    user_id: user.id,
                    feature: 'review',
                    content_id: request.challengeId,
                    tokens_used: response.tokensUsed,
                    model: 'gpt-4o-mini' // Assuming default model
                });

                // Save review feedback
                await aiPersistence.saveCodeReview(
                    user.id,
                    request.challengeId,
                    request.code,
                    response
                );
            }
        } catch (err: unknown) {
            console.error('Review generation error:', err);
            setError('Failed to generate code review.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    const clearReview = useCallback(() => {
        setReview(null);
        setError(null);
    }, []);

    return {
        review,
        loading,
        error,
        generateReview,
        clearReview,
    };
}
