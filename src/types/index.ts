// User types
export interface User {
    id: string;
    email: string;
    username: string;
    avatarUrl?: string;
    xp: number;
    level: number;
    rank: Rank;
    streakCurrent: number;
    streakBest: number;
    createdAt: string;
}

export type Rank = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface UserProgress {
    id: string;
    userId: string;
    contentType: 'lesson' | 'problem' | 'challenge';
    contentId: string;
    status: 'started' | 'completed';
    score?: number;
    completedAt?: string;
}

export interface UserAchievement {
    id: string;
    userId: string;
    achievementId: string;
    unlockedAt: string;
}

export interface Activity {
    id: string;
    type: 'lesson_completed' | 'problem_solved' | 'level_up' | 'achievement_unlocked';
    title: string;
    xpEarned: number;
    timestamp: string;
}

// Content types
export type Language = 'python' | 'javascript' | 'cpp';
export type Tier = 1 | 2 | 3 | 4 | 5;
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Lesson {
    id: string;
    title: string;
    description: string;
    tier: Tier;
    language: Language;
    sections: LessonSection[];
    xpReward: number;
    estimatedTime: number; // in minutes
    prerequisites?: string[];
}

export interface LessonSection {
    id: string;
    type: 'text' | 'code' | 'challenge' | 'quiz';
    title?: string;
    content: string;
    codeTemplate?: string;
    expectedOutput?: string;
    hints?: string[];
}

export interface Problem {
    id: string;
    title: string;
    difficulty: Difficulty;
    tier: Tier;
    languages: Language[];
    description: string;
    examples: Example[];
    hints: string[];
    solution: Partial<Record<Language, string>>;
    explanation: string;
    // Per-language starter code
    starterCode: Partial<Record<Language, string>>;
    // Per-language test cases
    testCases: Partial<Record<Language, TestCase[]>>;
    xpReward: number;
    tags: string[];
}

export interface Example {
    input: string;
    output: string;
    explanation?: string;
}

export interface TestCase {
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
}

// Challenge types
export interface Challenge {
    id: string;
    type: 'daily' | 'weekly';
    problem: Problem;
    startTime: string;
    endTime: string;
    xpMultiplier: number;
}

export interface Contest {
    id: string;
    title: string;
    description: string;
    problems: Problem[];
    startTime: string;
    endTime: string;
    participants: number;
}

// Roadmap types
export interface RoadmapPath {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    nodes: RoadmapNode[];
    requiredLevel: number;
}

export interface RoadmapNode {
    id: string;
    title: string;
    description: string;
    type: 'lesson' | 'project' | 'milestone';
    contentIds: string[];
    position: { x: number; y: number };
    dependencies: string[];
}

// Gamification types
export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    xpReward: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    condition: AchievementCondition;
}

export interface AchievementCondition {
    type: 'lessons_completed' | 'problems_solved' | 'streak' | 'xp_earned' | 'rank_reached' | 'special';
    value: number | string;
}

// Leaderboard types
export interface LeaderboardEntry {
    rank: number;
    user: Pick<User, 'id' | 'username' | 'avatarUrl' | 'rank'>;
    score: number;
    problemsSolved?: number;
}

// Navigation types
export interface NavItem {
    label: string;
    path: string;
    icon: string;
    badge?: number | string;
}
