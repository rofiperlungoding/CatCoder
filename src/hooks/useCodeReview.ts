import { useState, useCallback, useRef } from 'react';
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

    // Internal cache
    const lastRequestRef = useRef<AICodeReviewRequest | null>(null);
    const lastResponseRef = useRef<AICodeReviewResponse | null>(null);

    // Reset cache if challenge ID changes (we can detect this inside generateReview or via useEffect if we had challengeId prop)
    // But this hook is challenge-agnostic in props. We rely on request.challengeId.

    const generateReview = useCallback(async (request: AICodeReviewRequest) => {
        // Check local cache
        if (
            lastRequestRef.current &&
            lastResponseRef.current &&
            request.challengeId === lastRequestRef.current.challengeId &&
            request.code === lastRequestRef.current.code
            // We can also check testResults if we want to be strict, but code is main factor
        ) {
            setReview(lastResponseRef.current);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await codeReviewer.reviewCode(request);
            setReview(response);

            // Update cache
            lastRequestRef.current = request;
            lastResponseRef.current = response;

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
