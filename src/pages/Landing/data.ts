import {
    EnergyIcon, ProgrammingFlagIcon, Trophy, BookOpen01Icon,
} from '@hugeicons/core-free-icons';
import type { HugeiconsIcon } from '@hugeicons/react';

type IconType = React.ComponentProps<typeof HugeiconsIcon>['icon'];

export interface Stat {
    value: number;
    suffix: string;
    label: string;
}

export interface Feature {
    id: string;
    title: string;
    blurb: string;
    icon: IconType;
    kind: 'aiReview' | 'gamified' | 'challenges' | 'courses';
}

export interface Step {
    index: string;
    title: string;
    blurb: string;
    kind: 'editor' | 'ai' | 'xp' | 'leaderboard';
}

export interface Faq {
    q: string;
    a: string;
}

export interface LeaderEntry {
    rank: number;
    handle: string;
    xp: number;
    level: number;
}

export const STATS: Stat[] = [
    { value: 100, suffix: 'K+', label: 'developers leveling up' },
    { value: 500, suffix: '+', label: 'handcrafted challenges' },
    { value: 12, suffix: '', label: 'languages supported' },
    { value: 1, suffix: 'M+', label: 'submissions judged' },
];

export const LANGUAGES = ['Python', 'JavaScript', 'TypeScript', 'C++', 'Java', 'Go', 'Rust', 'Ruby', 'Kotlin', 'C#'];

export const FEATURES: Feature[] = [
    { id: 'ai', title: 'AI feedback that reads like a mentor', blurb: 'Submit a solution and get a senior-level review in seconds — inline diffs, missed edge cases, and the reasoning behind every suggestion.', icon: EnergyIcon, kind: 'aiReview' },
    { id: 'gamified', title: 'Progress you can feel', blurb: 'XP, levels, streaks, and badges turn steady practice into a habit that compounds.', icon: Trophy, kind: 'gamified' },
    { id: 'challenges', title: 'Browser-native challenges, zero setup', blurb: 'A real runtime in the browser. Pick a problem, write, run, and get a verdict.', icon: ProgrammingFlagIcon, kind: 'challenges' },
    { id: 'courses', title: 'Structured paths', blurb: 'Curated routes from first variable to system design — one lit node at a time.', icon: BookOpen01Icon, kind: 'courses' },
];

export const STEPS: Step[] = [
    { index: '01', title: 'Pick a challenge', blurb: 'Filter by language, topic, or difficulty. Start where you are — the catalog meets you at your level.', kind: 'editor' },
    { index: '02', title: 'Write & run code', blurb: 'A real editor with a real runtime in your browser. Hit run, watch it execute, iterate fast.', kind: 'editor' },
    { index: '03', title: 'Get instant AI feedback', blurb: 'The reviewer reads your solution like a mentor would — correctness, complexity, and cleaner alternatives.', kind: 'ai' },
    { index: '04', title: 'Earn XP, level up, climb', blurb: 'Every solve feeds your XP bar, your streak, and your rank on the global leaderboard.', kind: 'xp' },
];

export const FAQS: Faq[] = [
    { q: 'Is CatCoder free?', a: 'Yes. The free tier gives you hundreds of challenges, AI feedback, XP, and leaderboards. Premium unlocks advanced courses and unlimited deep reviews.' },
    { q: 'What languages can I use?', a: 'Python, JavaScript, TypeScript, C++, Java, Go, Rust, and more — with new runtimes added from community requests.' },
    { q: 'How do XP and levels work?', a: 'Solving challenges earns XP scaled by difficulty. XP raises your level, which unlocks badges, harder tiers, and bragging rights on the board.' },
    { q: 'Can I track my progress?', a: 'Your dashboard charts solved problems, mastered topics, and streaks — so you always know the next move.' },
];

export const LEADERBOARD: LeaderEntry[] = [
    { rank: 1, handle: 'dewi_codes', xp: 48210, level: 42 },
    { rank: 2, handle: 'arga.dev', xp: 45980, level: 41 },
    { rank: 3, handle: 'nadia_rs', xp: 44120, level: 40 },
    { rank: 4, handle: 'budi.exe', xp: 39870, level: 37 },
    { rank: 5, handle: 'syntax_sari', xp: 38640, level: 36 },
];

export const ACTIVITY = [
    '@dewi solved Two Sum (+50 XP)',
    '@arga reached Level 20',
    '@nadia unlocked the Streak Master badge',
    '@budi cleared LRU Cache (+120 XP)',
    '@sari climbed to Rank 5',
    '@reza finished the Python path',
];
