export interface AIConfig {
    apiKey: string;
    model: string;
}

export interface AIHintRequest {
    challengeId: string;
    code: string;
    language: 'python' | 'javascript' | 'cpp';
    hintLevel: 'gentle' | 'detailed' | 'solution';
    previousHints?: string[];
}

export interface AIHintResponse {
    hint: string;
    confidence: number;
    tokensUsed: number;
    cached: boolean;
}

export interface AICodeReviewRequest {
    challengeId: string;
    code: string;
    language: 'python' | 'javascript' | 'cpp';
    testResults: {
        passed: boolean;
        output: string;
        error?: string;
    }[];
}

export interface AICodeReviewResponse {
    rating: number; // 1-5
    strengths: string[];
    improvements: string[];
    alternatives: string[];
    explanation: string;
    tokensUsed: number;
    cached: boolean;
}

export interface AIRecommendationRequest {
    userId: string;
    recentAttempts: AIHintRequest[]; // Simplified history
}

export interface AIRecommendationResponse {
    challengeId: string;
    reason: string;
    confidence: number;
    estimatedDifficulty: string;
    estimatedTime: string;
}

export class AIServiceError extends Error {
    code?: string;

    constructor(message: string, code?: string) {
        super(message);
        this.name = 'AIServiceError';
        this.code = code;
    }
}
