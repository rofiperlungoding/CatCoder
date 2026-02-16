import { openaiClient } from './openaiClient';
import { PromptTemplates } from './promptTemplates';
import { AICache } from './aiCache';
import { AIRateLimitManager } from './aiRateLimit';
import { AIServiceError } from './types';
import type { AIHintRequest, AIHintResponse } from './types';

export class HintGenerator {
    async generateHint(request: AIHintRequest): Promise<AIHintResponse> {
        const { challengeId, code, hintLevel } = request;

        // 1. Check rate limit
        if (!AIRateLimitManager.canUseHint(challengeId)) {
            const remaining = AIRateLimitManager.getRemainingHints(challengeId);
            throw new AIServiceError(
                `Hint limit reached for this challenge. You have ${remaining} hints left.`,
                'RATE_LIMIT_EXCEEDED'
            );
        }

        // 2. Check cache
        // Cache key: challengeId + code hash? 
        // Wait, code changes often. Maybe just challengeId + hintLevel?
        // But hints depend on the code state.
        // Let's use a simplified hash of the code + challengeId + hintLevel.
        const codeHash = this.hashCode(code);
        const cacheKey = `hint_${challengeId}_${hintLevel}_${codeHash}`;

        const cachedHint = AICache.get<AIHintResponse>(cacheKey);
        if (cachedHint) {
            return { ...cachedHint, cached: true };
        }

        try {
            // 3. Generate prompt
            const prompt = PromptTemplates.generateHintPrompt(request);

            // 4. Call API
            const maxTokens = hintLevel === 'gentle' ? 500 : hintLevel === 'detailed' ? 800 : 1500;

            const content = await openaiClient.generateCompletion(
                [{ role: 'user', content: prompt }],
                { max_tokens: maxTokens, temperature: 0.7 }
            );

            // 5. Track usage
            AIRateLimitManager.recordHintUsage(challengeId);

            // 6. Construct response
            const response: AIHintResponse = {
                hint: content,
                confidence: 0.9, // Placeholder
                tokensUsed: 0, // Not available in simple client wrapper yet, needs enhancement or assumption
                cached: false,
            };

            // 7. Cache response
            AICache.set(cacheKey, response);

            return response;
        } catch (error) {
            console.error('Hint generation failed:', error);
            throw error;
        }
    }

    getRemainingHints(challengeId: string): number {
        return AIRateLimitManager.getRemainingHints(challengeId);
    }

    canGenerateHint(challengeId: string): boolean {
        return AIRateLimitManager.canUseHint(challengeId);
    }

    private hashCode(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(16);
    }
}

export const hintGenerator = new HintGenerator();
