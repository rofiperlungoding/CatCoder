export interface UserProgress {
    userId: string;
    level: number;
    totalXP: number;
    completedChallenges: string[];
    currentStreak: number;
}

export interface ChallengeAttempt {
    challengeId: string;
    timestamp: number;
    hintsUsed: number;
    timeSpent: number; // in seconds
    passed: boolean;
    codeLength: number;
    attemptCount: number;
}

export interface SkillAssessment {
    skill: string;
    proficiency: number; // 0-100
    challengesCompleted: number;
    averageTime: number;
    successRate: number;
}

export interface LearningInsight {
    type: 'strength' | 'weakness' | 'recommendation';
    title: string;
    description: string;
    actionable: string;
    priority: number; // 1-3
}

export interface PersonalizedRecommendation {
    challengeId: string;
    reason: string;
    confidence: number;
    estimatedDifficulty: string;
    estimatedTime: string;
}
