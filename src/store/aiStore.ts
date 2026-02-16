import { create } from 'zustand';
import type { AIHintResponse, AICodeReviewResponse } from '../services/ai/types';

interface AIState {
    // Hint State
    currentHint: AIHintResponse | null;
    showHintPanel: boolean;

    // Review State
    currentReview: AICodeReviewResponse | null;
    showReviewPanel: boolean;

    // Insights State
    showInsightsPanel: boolean;

    // Actions
    setHint: (hint: AIHintResponse | null) => void;
    setShowHintPanel: (show: boolean) => void;
    setReview: (review: AICodeReviewResponse | null) => void;
    setShowReviewPanel: (show: boolean) => void;
    setShowInsightsPanel: (show: boolean) => void;
    clearAll: () => void;
}

export const useAIStore = create<AIState>((set) => ({
    currentHint: null,
    showHintPanel: false,

    currentReview: null,
    showReviewPanel: false,

    showInsightsPanel: false,

    setHint: (hint) => set({ currentHint: hint }),
    setShowHintPanel: (show) => set({ showHintPanel: show }),

    setReview: (review) => set({
        currentReview: review,
        showReviewPanel: !!review // Auto-show panel when review is set
    }),
    setShowReviewPanel: (show) => set({ showReviewPanel: show }),

    setShowInsightsPanel: (show) => set({ showInsightsPanel: show }),

    clearAll: () => set({
        currentHint: null,
        showHintPanel: false,
        currentReview: null,
        showReviewPanel: false,
        showInsightsPanel: false, // Maybe keep insights open? No, prompt says reset.
    }),
}));
