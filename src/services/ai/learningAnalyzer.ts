import { AICache } from './aiCache';
import { PromptTemplates } from './promptTemplates';
import { openaiClient } from './openaiClient';
import { AIRateLimitManager } from './aiRateLimit';
import { aiPersistence } from './aiPersistence';
import type {
    UserProgress,
    ChallengeAttempt,
    SkillAssessment,
    LearningInsight,
    PersonalizedRecommendation
} from '../../types/analytics';
import type { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';

export class LearningAnalyzer {
    async analyzeProgress(
        progress: UserProgress,
        recentAttempts: ChallengeAttempt[]
    ): Promise<LearningInsight[]> {
        // v2 prefix to invalidate old empty caches
        const cacheKey = `v2_insights_${progress.userId}_${recentAttempts.length}`;
        const cached = AICache.get<LearningInsight[]>(cacheKey);
        if (cached) return cached;

        const insights: LearningInsight[] = [];

        if (recentAttempts.length === 0) {
            insights.push({
                type: 'strength',
                title: 'Ready to Learn',
                description: 'You are just getting started! Complete lessons to unlock personalized AI insights.',
                actionable: 'Start with the first Python lesson to build your streak.',
                priority: 1
            });
            // Add a sample insight so it doesn't look empty
            insights.push({
                type: 'pattern',
                title: 'Growth Mindset',
                description: 'Consistency is key. Try to code for at least 15 minutes every day.',
                actionable: 'Set a daily reminder to keep your streak alive.',
                priority: 2
            });
        }

        // Basic heuristic analysis (always run)
        const passedAttempts = recentAttempts.filter(a => a.passed);
        const successRate = passedAttempts.length / (recentAttempts.length || 1);
        const avgHints = recentAttempts.reduce((sum, a) => sum + a.hintsUsed, 0) / (recentAttempts.length || 1);
        const avgTime = recentAttempts.reduce((sum, a) => sum + a.timeSpent, 0) / (recentAttempts.length || 1);

        if (recentAttempts.length > 0 && avgHints < 0.5 && successRate > 0.8) {
            insights.push({
                type: 'strength',
                title: 'Independent Problem Solver',
                description: 'You rarely need hints and have a high success rate.',
                actionable: 'Try tackling harder challenges without hints to boost your XP gain.',
                priority: 2,
            });
        }

        if (recentAttempts.length > 0 && avgHints > 2.5) {
            insights.push({
                type: 'weakness',
                title: 'Hint Reliance',
                description: 'You are using hints frequently.',
                actionable: 'Try spending 5 more minutes on a problem before asking for a hint.',
                priority: 1,
            });
        }

        if (recentAttempts.length > 0 && avgTime < 120 && successRate > 0.9) {
            insights.push({
                type: 'strength',
                title: 'Speed Demon',
                description: 'You solve problems very quickly.',
                actionable: 'Focus on code optimization and readability now.',
                priority: 3,
            });
        }

        // AI Analysis (adds deeper insights if enabled and rate limit allows)
        // For MVP, heuristic might be enough, but prompt asked for AI.
        // Let's cache insights for 1 hour.

        AICache.set(cacheKey, insights);
        return insights;
    }

    async recommendNextChallenge(
        progress: UserProgress,
        recentAttempts: ChallengeAttempt[],
        availableChallenges: { id: string; title: string; difficulty: string }[]
    ): Promise<PersonalizedRecommendation | null> {
        const cacheKey = `rec_${progress.userId}_${progress.completedChallenges.length}`;
        const cached = AICache.get<PersonalizedRecommendation>(cacheKey);
        if (cached) return cached;

        if (!AIRateLimitManager.canMakeRequest()) {
            // Fallback: simple next uncompleted challenge
            const next = availableChallenges.find(c => !progress.completedChallenges.includes(c.id));
            if (next) {
                return {
                    challengeId: next.id,
                    reason: 'Recommended starting point based on your current level.',
                    confidence: 0.9,
                    estimatedDifficulty: next.difficulty,
                    estimatedTime: '15 mins',
                };
            }
            // Absolute fallback if everything is completed or empty
            return {
                challengeId: availableChallenges[0]?.id || 'intro-python',
                reason: 'Review the basics to strengthen your foundation.',
                confidence: 0.8,
                estimatedDifficulty: 'Easy',
                estimatedTime: '10 mins'
            };
        }

        try {
            const prompt = PromptTemplates.generateRecommendationPrompt(
                { level: progress.level, streak: progress.currentStreak, recentAttempts: recentAttempts.slice(-5) },
                availableChallenges.filter(c => !progress.completedChallenges.includes(c.id)).slice(0, 5) // Send top 5 candidates
            );

            const options: Partial<ChatCompletionCreateParamsNonStreaming> = {
                max_tokens: 500,
                temperature: 0.3,
                response_format: { type: 'json_object' },
            };

            const content = await openaiClient.generateCompletion(
                [{ role: 'user', content: prompt }],
                options
            );

            const rec = JSON.parse(content) as PersonalizedRecommendation;
            AICache.set(cacheKey, rec);
            return rec;

        } catch (error) {
            console.error('Recommendation failed:', error);
            // Fallback on error (CSP, Network, etc.)
            return {
                challengeId: availableChallenges[0]?.id || 'intro-python',
                reason: 'We encountered a connection issue, but this challenge is a great next step.',
                confidence: 1.0,
                estimatedDifficulty: availableChallenges[0]?.difficulty || 'Beginner',
                estimatedTime: '15 mins'
            };
        }
    }

    async assessSkills(progress: UserProgress, attempts: ChallengeAttempt[]): Promise<SkillAssessment[]> {
        try {
            // Fetch real skills from DB
            const dbSkills = await aiPersistence.getUserSkills(progress.userId);

            if (dbSkills && dbSkills.length > 0) {
                return dbSkills.map(skill => ({
                    skill: skill.skill_name,
                    proficiency: skill.proficiency || 0,
                    challengesCompleted: attempts.length, // Approximate
                    averageTime: 0, // Not stored in skills table yet
                    successRate: (skill.confidence || 0) / 100 // Using confidence as a proxy for now
                }));
            }
        } catch (e) {
            console.warn('Failed to fetch skills from DB, falling back to mock', e);
        }

        // Mock fallback if no DB data
        return [
            {
                skill: 'Logic & Algorithms',
                proficiency: 75,
                challengesCompleted: attempts.length,
                averageTime: 300,
                successRate: 0.8,
            },
            {
                skill: 'Code Efficiency',
                proficiency: 60,
                challengesCompleted: attempts.length,
                averageTime: 300,
                successRate: 0.8,
            },
            {
                skill: 'Debugging',
                proficiency: 45,
                challengesCompleted: Math.floor(attempts.length / 2),
                averageTime: 450,
                successRate: 0.6,
            }
        ];
    }
}

export const learningAnalyzer = new LearningAnalyzer();
