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
    PersonalizedRecommendation,
    LearningPathGuide
} from '../../types/analytics';
import type { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';

export class LearningAnalyzer {
    async analyzeProgress(
        progress: UserProgress,
        recentAttempts: ChallengeAttempt[]
    ): Promise<LearningInsight[]> {
        // v3 prefix to invalidate old empty/mock caches
        const cacheKey = `v3_insights_${progress.userId}_${recentAttempts.length}`;
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
        const cacheKey = `rec_v2_${progress.userId}_${progress.completedChallenges.length}`;
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
                    averageTime: 0,
                    successRate: (skill.confidence || 0) / 100
                }));
            }

            // No skills in DB? Ask AI to analyze based on history!
            const prompt = `
                Analyze the coding progress for a user with:
                - Level: ${progress.level}
                - XP: ${progress.totalXP}
                - Recent Attempts: ${JSON.stringify(attempts.slice(-5).map(a => ({
                challenge: a.challengeId,
                passed: a.passed,
                hints: a.hintsUsed,
                time: a.timeSpent
            })))}

                Return a JSON array of 3-5 skill objects with:
                - "skill": (e.g., "Logic & Algorithms", "Code Efficiency", "Debugging", "Python Syntax", "Problem Solving")
                - "proficiency": (0-100 integer based on success rate and level)
                - "confidence": (0-100 integer based on consistency)
                
                Example: [{"skill": "Logic", "proficiency": 60, "confidence": 80}]
            `;

            const options: Partial<ChatCompletionCreateParamsNonStreaming> = {
                max_tokens: 300,
                temperature: 0.3,
                response_format: { type: 'json_object' },
            };

            const content = await openaiClient.generateCompletion(
                [{ role: 'system', content: 'You are an expert coding tutor analyzer.' }, { role: 'user', content: prompt }],
                options
            );

            const aiSkills = JSON.parse(content).skills || JSON.parse(content);

            // Return real AI analysis
            if (Array.isArray(aiSkills)) {
                return aiSkills.map((s: { skill: string; proficiency?: number; confidence?: number }) => ({
                    skill: s.skill,
                    proficiency: s.proficiency || 50,
                    challengesCompleted: attempts.length,
                    averageTime: 0,
                    successRate: (s.confidence || 50) / 100
                }));
            }
            throw new Error("AI returned malformed skill schema.");

        } catch (aiError) {
            console.error('AI Skill Analysis failed:', aiError);
            throw aiError;
        }
    }
    async generateLearningPathGuide(
        progress: UserProgress,
        recentAttempts: ChallengeAttempt[],
        availableLessons: { id: string; title: string; topic?: string }[] = []
    ): Promise<LearningPathGuide> {
        // v2 cache key to invalidate old non-curriculum guides
        const cacheKey = `guide_v3_${progress.userId}_${progress.completedChallenges.length}_${progress.currentStreak}`;
        const cached = AICache.get<LearningPathGuide>(cacheKey);
        if (cached) return cached;

        const fallbackGuide: LearningPathGuide = {
            message: "Welcome back! Consistency is key to mastery.",
            recommendation: "Continue your Python journey.",
            reason: "Building a daily habit is the fastest way to learn.",
            actionLabel: "Continue Learning",
            targetUrl: "/learn"
        };

        // Find next uncompleted lessons to feed the AI
        const nextLessons = availableLessons
            .filter(l => !progress.completedChallenges.includes(l.id))
            .slice(0, 5); // Take top 5 candidates

        if (!AIRateLimitManager.canMakeRequest()) {
            // Smart Fallback: Recommend the very first available lesson if we can't call AI
            if (nextLessons.length > 0) {
                return {
                    message: "Ready to continue your learning streak?",
                    recommendation: nextLessons[0].title,
                    reason: "This is the next step in your path.",
                    actionLabel: "Start Lesson",
                    targetUrl: `/learn/${nextLessons[0].id}`
                };
            }
            return fallbackGuide;
        }

        try {
            const userContext = {
                level: progress.level,
                xp: progress.totalXP,
                recentActivity: recentAttempts.slice(-3).map(a => ({
                    id: a.challengeId,
                    passed: a.passed,
                    hints: a.hintsUsed
                })),
                streak: progress.currentStreak
            };

            const prompt = PromptTemplates.generateLearningPathPrompt(userContext, nextLessons);

            const options: Partial<ChatCompletionCreateParamsNonStreaming> = {
                max_tokens: 300,
                temperature: 0.4,
                response_format: { type: 'json_object' },
            };

            const content = await openaiClient.generateCompletion(
                [{ role: 'user', content: prompt }],
                options
            );

            const rawGuide = JSON.parse(content);
            const recommendationId = rawGuide.recommendationId;

            // Validate that the ID exists in our options
            const matchedLesson = nextLessons.find(l => l.id === recommendationId);

            // If AI hallucinated an ID or didn't provide one, default to the first available lesson
            const targetLesson = matchedLesson || nextLessons[0];
            const safeTargetUrl = targetLesson ? `/learn/${targetLesson.id}` : '/learn';

            const guide: LearningPathGuide = {
                message: rawGuide.message || "Keep up the momentum!",
                recommendation: rawGuide.recommendation || targetLesson?.title || "Next Lesson",
                reason: rawGuide.reason || "Consistency is key.",
                actionLabel: rawGuide.actionLabel || "Start Lesson",
                targetUrl: safeTargetUrl
            };

            AICache.set(cacheKey, guide); // Cache for 24 hours (default in AICache)
            return guide;

        } catch (error) {
            console.error('Failed to generate learning guide:', error);
            if (nextLessons.length > 0) {
                return {
                    message: "We're having trouble reaching the AI, but don't let that stop you!",
                    recommendation: nextLessons[0].title,
                    reason: "Continuity is important.",
                    actionLabel: "Start Lesson",
                    targetUrl: `/learn/${nextLessons[0].id}`
                };
            }
            return fallbackGuide;
        }
    }
}

export const learningAnalyzer = new LearningAnalyzer();
