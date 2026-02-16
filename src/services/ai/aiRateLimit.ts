export interface AIRateLimit {
    hints: Record<string, number>; // challengeId -> warnings
    globalRequests: number;
    lastReset: number;
}

export class AIRateLimitManager {
    private static readonly STORAGE_KEY = 'ai_rate_limit';
    private static readonly MAX_HINTS_PER_CHALLENGE = 3;
    private static readonly GLOBAL_HOURLY_LIMIT = 50;
    private static readonly RESET_INTERVAL = 3600000; // 1 hour

    static getLimit(): AIRateLimit {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (!stored) {
            return this.init();
        }
        const limit: AIRateLimit = JSON.parse(stored);

        // Check global reset
        if (Date.now() - limit.lastReset > this.RESET_INTERVAL) {
            limit.hints = {};
            limit.globalRequests = 0;
            limit.lastReset = Date.now();
            this.save(limit);
        }

        return limit;
    }

    static save(limit: AIRateLimit): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(limit));
    }

    static init(): AIRateLimit {
        const limit = {
            hints: {},
            globalRequests: 0,
            lastReset: Date.now(),
        };
        this.save(limit);
        return limit;
    }

    static canUseHint(challengeId: string): boolean {
        const limit = this.getLimit();
        if (!this.canMakeRequest()) return false;
        return (limit.hints[challengeId] || 0) < this.MAX_HINTS_PER_CHALLENGE;
    }

    static getRemainingHints(challengeId: string): number {
        const limit = this.getLimit();
        return Math.max(0, this.MAX_HINTS_PER_CHALLENGE - (limit.hints[challengeId] || 0));
    }

    static recordHintUsage(challengeId: string): void {
        const limit = this.getLimit();
        if (!this.canUseHint(challengeId)) {
            throw new Error('Hint limit reached for this challenge.');
        }
        limit.hints[challengeId] = (limit.hints[challengeId] || 0) + 1;
        limit.globalRequests++;
        this.save(limit);
    }

    static canMakeRequest(): boolean {
        const limit = this.getLimit();
        return limit.globalRequests < this.GLOBAL_HOURLY_LIMIT;
    }

    static getRemainingRequests(): number {
        const limit = this.getLimit();
        return Math.max(0, this.GLOBAL_HOURLY_LIMIT - limit.globalRequests);
    }

    static resetChallenge(challengeId: string): void {
        const limit = this.getLimit();
        delete limit.hints[challengeId];
        this.save(limit);
    }

    static resetAll(): void {
        this.init();
    }
}
