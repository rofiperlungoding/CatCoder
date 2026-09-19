export interface TestCase {
    input: string;
    expected: string;
}

export interface ArenaProblem {
    id: string;
    prompt: string;
    language: string;
    code: string;
    difficulty: number;
}

export interface JudgeRequest {
    variantId: string;
    hypothesis: string;
    tests: TestCase[];
    turnstileToken: string;
}

export interface JudgeVerdict {
    correct: boolean;
    correctness: number;
    feedback: string;
    verificationRating: number | null;
    delta: number;
    misconceptionTag?: string | null;
}

import { readSession } from './sessionStorage';

const API_BASE =
    (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') || '';

export function getSessionToken(): string | null {
    return readSession()?.access_token ?? null;
}

export function isSignedIn(): boolean {
    return getSessionToken() !== null;
}

export async function getProblem(): Promise<ArenaProblem> {
    const res = await fetch(`${API_BASE}/api/arena/problem`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
        throw new Error(res.status === 404 ? 'No problems are available yet.' : 'Failed to load problem.');
    }
    return (await res.json()) as ArenaProblem;
}

export async function submitJudge(body: JudgeRequest): Promise<JudgeVerdict> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = getSessionToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/arena/judge`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });

    if (res.status === 429) throw new Error('You are submitting too fast. Please wait a moment and try again.');
    if (res.status === 403) throw new Error('Verification failed. Please complete the challenge and retry.');
    if (res.status === 404) throw new Error('This problem is no longer available.');
    if (!res.ok) throw new Error('The judge could not evaluate this attempt. Please try again.');

    return (await res.json()) as JudgeVerdict;
}

export interface LeaderboardEntry {
    rank: number;
    id: string;
    username: string;
    verificationRating: number;
    xp: number;
    tier: string;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
    const res = await fetch(`${API_BASE}/api/arena/leaderboard`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to load the leaderboard.');
    const data = (await res.json()) as { entries: LeaderboardEntry[] };
    return data.entries;
}

export interface ConceptSkill {
    concept: string;
    total: number;
    correct: number;
    accuracy: number;
}

export interface MisconceptionCount {
    misconception: string;
    count: number;
}

export interface SkillProfile {
    rating: number;
    attempts: number;
    concepts: ConceptSkill[];
    misconceptions: MisconceptionCount[];
}

export async function getSkill(): Promise<SkillProfile> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = getSessionToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/arena/skill`, { method: 'GET', headers });
    if (res.status === 401) throw new Error('Sign in to view your skill profile.');
    if (!res.ok) throw new Error('Failed to load your skill profile.');
    return (await res.json()) as SkillProfile;
}
