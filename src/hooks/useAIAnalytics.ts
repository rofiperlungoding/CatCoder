import { useState, useCallback, useEffect } from 'react';
import { learningAnalyzer } from '../services/ai/learningAnalyzer';
import type {
    UserProgress,
    ChallengeAttempt,
    SkillAssessment,
    LearningInsight,
    PersonalizedRecommendation
} from '../types/analytics';

interface UseAIAnalyticsReturn {
    insights: LearningInsight[];
    skills: SkillAssessment[];
    recommendation: PersonalizedRecommendation | null;
    loading: boolean;
    refresh: () => Promise<void>;
}

export function useAIAnalytics(
    progress: UserProgress,
    recentAttempts: ChallengeAttempt[],
    availableChallenges: { id: string; title: string; difficulty: string; }[]
): UseAIAnalyticsReturn {
    const [insights, setInsights] = useState<LearningInsight[]>([]);
    const [skills, setSkills] = useState<SkillAssessment[]>([]);
    const [recommendation, setRecommendation] = useState<PersonalizedRecommendation | null>(null);
    const [loading, setLoading] = useState(false);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const [newInsights, newRecommendation, newSkills] = await Promise.all([
                learningAnalyzer.analyzeProgress(progress, recentAttempts),
                learningAnalyzer.recommendNextChallenge(progress, recentAttempts, availableChallenges),
                learningAnalyzer.assessSkills(progress, recentAttempts)
            ]);

            setInsights(newInsights);
            setRecommendation(newRecommendation);
            setSkills(newSkills);
        } catch (e) {
            console.error('Failed to load insights', e);
        } finally {
            setLoading(false);
        }
    }, [progress, recentAttempts, availableChallenges]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return {
        insights,
        skills,
        recommendation,
        loading,
        refresh,
    };
}
