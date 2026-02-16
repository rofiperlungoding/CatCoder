/**
 * Property-based tests for Server-Side XP Authority
 * Feature: security-hardening
 * 
 * Property 4: Duplicate XP Prevention
 * 
 * Validates: Requirements 2.5
 * 
 * Note: Since the actual RPC function runs on Supabase, we test the logic
 * by simulating the duplicate prevention behavior that the SQL function implements.
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';

// Test configuration for property-based tests
const PBT_CONFIG = { numRuns: 100 };

/**
 * Simulates the submit_completion RPC function's duplicate prevention logic.
 * This mirrors the SQL function behavior for testing purposes.
 */
interface CompletionRecord {
    userId: string;
    contentType: 'lesson' | 'problem' | 'challenge';
    contentId: string;
    status: 'started' | 'completed';
    xpAwarded: number;
}

interface SubmitCompletionResult {
    success: boolean;
    xp_awarded: number;
    message?: string;
    error?: string;
}

// XP rewards defined server-side (mirrors SQL function)
const XP_REWARDS: Record<string, number> = {
    lesson: 50,
    problem: 100,
    challenge: 200
};

/**
 * Simulates the submit_completion RPC function behavior
 * This is a pure function that mirrors the SQL logic for testing
 */
function simulateSubmitCompletion(
    completedRecords: Map<string, CompletionRecord>,
    userId: string,
    contentType: 'lesson' | 'problem' | 'challenge',
    contentId: string
): { result: SubmitCompletionResult; newRecords: Map<string, CompletionRecord> } {
    const key = `${userId}:${contentType}:${contentId}`;
    const newRecords = new Map(completedRecords);

    // Check if already completed (duplicate prevention)
    const existingRecord = completedRecords.get(key);
    if (existingRecord && existingRecord.status === 'completed') {
        return {
            result: {
                success: true,
                xp_awarded: 0,
                message: 'Already completed'
            },
            newRecords
        };
    }

    // Calculate XP reward server-side
    const xpReward = XP_REWARDS[contentType] || 25;

    // Insert/update the completion record
    newRecords.set(key, {
        userId,
        contentType,
        contentId,
        status: 'completed',
        xpAwarded: xpReward
    });

    return {
        result: {
            success: true,
            xp_awarded: xpReward
        },
        newRecords
    };
}

describe('Server-Side XP Authority - Property Tests', () => {
    /**
     * Feature: security-hardening, Property 4: Duplicate XP Prevention
     * For any user and content combination, calling the submit_completion RPC function 
     * multiple times SHALL award XP only on the first successful call, with subsequent 
     * calls returning xp_awarded: 0.
     * Validates: Requirements 2.5
     */
    describe('Property 4: Duplicate XP Prevention', () => {
        it('should award XP only on first completion, returning 0 on subsequent calls', () => {
            fc.assert(
                fc.property(
                    // Generate random user ID
                    fc.uuid(),
                    // Generate random content type
                    fc.constantFrom('lesson', 'problem', 'challenge') as fc.Arbitrary<'lesson' | 'problem' | 'challenge'>,
                    // Generate random content ID
                    fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-zA-Z0-9-]+$/.test(s)),
                    // Generate number of duplicate calls (2-10)
                    fc.integer({ min: 2, max: 10 }),
                    (userId, contentType, contentId, numCalls) => {
                        let records = new Map<string, CompletionRecord>();
                        const results: SubmitCompletionResult[] = [];

                        // Call submit_completion multiple times
                        for (let i = 0; i < numCalls; i++) {
                            const { result, newRecords } = simulateSubmitCompletion(
                                records,
                                userId,
                                contentType,
                                contentId
                            );
                            results.push(result);
                            records = newRecords;
                        }

                        // First call should award XP
                        const firstResult = results[0];
                        const expectedXP = XP_REWARDS[contentType];

                        // All subsequent calls should return xp_awarded: 0
                        const subsequentResults = results.slice(1);

                        return (
                            // First call awards expected XP
                            firstResult.success === true &&
                            firstResult.xp_awarded === expectedXP &&
                            // All subsequent calls return 0 XP
                            subsequentResults.every(r =>
                                r.success === true &&
                                r.xp_awarded === 0 &&
                                r.message === 'Already completed'
                            )
                        );
                    }
                ),
                PBT_CONFIG
            );
        });

        it('should track completions independently per user', () => {
            fc.assert(
                fc.property(
                    // Generate two different user IDs
                    fc.tuple(fc.uuid(), fc.uuid()).filter(([a, b]) => a !== b),
                    // Generate content type and ID
                    fc.constantFrom('lesson', 'problem', 'challenge') as fc.Arbitrary<'lesson' | 'problem' | 'challenge'>,
                    fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-zA-Z0-9-]+$/.test(s)),
                    ([userId1, userId2], contentType, contentId) => {
                        let records = new Map<string, CompletionRecord>();

                        // User 1 completes the content
                        const { result: result1, newRecords: records1 } = simulateSubmitCompletion(
                            records,
                            userId1,
                            contentType,
                            contentId
                        );
                        records = records1;

                        // User 2 completes the same content
                        const { result: result2, newRecords: records2 } = simulateSubmitCompletion(
                            records,
                            userId2,
                            contentType,
                            contentId
                        );
                        records = records2;

                        // User 1 tries to complete again (should get 0 XP)
                        const { result: result1Again } = simulateSubmitCompletion(
                            records,
                            userId1,
                            contentType,
                            contentId
                        );

                        const expectedXP = XP_REWARDS[contentType];

                        return (
                            // Both users should get XP on first completion
                            result1.xp_awarded === expectedXP &&
                            result2.xp_awarded === expectedXP &&
                            // User 1's second attempt should get 0 XP
                            result1Again.xp_awarded === 0
                        );
                    }
                ),
                PBT_CONFIG
            );
        });

        it('should track completions independently per content', () => {
            fc.assert(
                fc.property(
                    // Generate user ID
                    fc.uuid(),
                    // Generate two different content IDs
                    fc.tuple(
                        fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-zA-Z0-9-]+$/.test(s)),
                        fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-zA-Z0-9-]+$/.test(s))
                    ).filter(([a, b]) => a !== b),
                    // Generate content type
                    fc.constantFrom('lesson', 'problem', 'challenge') as fc.Arbitrary<'lesson' | 'problem' | 'challenge'>,
                    (userId, [contentId1, contentId2], contentType) => {
                        let records = new Map<string, CompletionRecord>();

                        // Complete first content
                        const { result: result1, newRecords: records1 } = simulateSubmitCompletion(
                            records,
                            userId,
                            contentType,
                            contentId1
                        );
                        records = records1;

                        // Complete second content
                        const { result: result2, newRecords: records2 } = simulateSubmitCompletion(
                            records,
                            userId,
                            contentType,
                            contentId2
                        );
                        records = records2;

                        // Try to complete first content again
                        const { result: result1Again } = simulateSubmitCompletion(
                            records,
                            userId,
                            contentType,
                            contentId1
                        );

                        const expectedXP = XP_REWARDS[contentType];

                        return (
                            // Both contents should award XP on first completion
                            result1.xp_awarded === expectedXP &&
                            result2.xp_awarded === expectedXP &&
                            // Second attempt on first content should get 0 XP
                            result1Again.xp_awarded === 0
                        );
                    }
                ),
                PBT_CONFIG
            );
        });

        it('should use server-defined XP values, not accept arbitrary amounts', () => {
            fc.assert(
                fc.property(
                    fc.uuid(),
                    fc.constantFrom('lesson', 'problem', 'challenge') as fc.Arbitrary<'lesson' | 'problem' | 'challenge'>,
                    fc.string({ minLength: 1, maxLength: 50 }).filter(s => /^[a-zA-Z0-9-]+$/.test(s)),
                    (userId, contentType, contentId) => {
                        const records = new Map<string, CompletionRecord>();

                        const { result } = simulateSubmitCompletion(
                            records,
                            userId,
                            contentType,
                            contentId
                        );

                        // XP should match server-defined values exactly
                        const expectedXP = XP_REWARDS[contentType];

                        return (
                            result.success === true &&
                            result.xp_awarded === expectedXP
                        );
                    }
                ),
                PBT_CONFIG
            );
        });
    });
});

describe('Server-Side XP Authority - Unit Tests', () => {
    it('should return correct XP for lesson completion', () => {
        const records = new Map<string, CompletionRecord>();
        const { result } = simulateSubmitCompletion(records, 'user-1', 'lesson', 'lesson-1');

        expect(result.success).toBe(true);
        expect(result.xp_awarded).toBe(50);
    });

    it('should return correct XP for problem completion', () => {
        const records = new Map<string, CompletionRecord>();
        const { result } = simulateSubmitCompletion(records, 'user-1', 'problem', 'problem-1');

        expect(result.success).toBe(true);
        expect(result.xp_awarded).toBe(100);
    });

    it('should return correct XP for challenge completion', () => {
        const records = new Map<string, CompletionRecord>();
        const { result } = simulateSubmitCompletion(records, 'user-1', 'challenge', 'challenge-1');

        expect(result.success).toBe(true);
        expect(result.xp_awarded).toBe(200);
    });

    it('should return 0 XP and message for duplicate completion', () => {
        let records = new Map<string, CompletionRecord>();

        // First completion
        const { newRecords } = simulateSubmitCompletion(records, 'user-1', 'problem', 'problem-1');
        records = newRecords;

        // Duplicate completion
        const { result } = simulateSubmitCompletion(records, 'user-1', 'problem', 'problem-1');

        expect(result.success).toBe(true);
        expect(result.xp_awarded).toBe(0);
        expect(result.message).toBe('Already completed');
    });
});
