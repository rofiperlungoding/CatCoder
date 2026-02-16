/**
 * Security Logger Property-Based Tests
 * Feature: security-hardening
 * 
 * Property 10: Security Log Structure
 * 
 * Validates: Requirements 9.2
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import {
    SecurityEventType,
    SecurityEventInput,
    isValidEventType,
    createSecurityEvent,
    logSecurityEvent,
    logBlockedRequest,
    logDOMViolation,
    logFingerprintMismatch,
    logHoneypotAccess,
    logTimeManipulation
} from './securityLogger';

// Mock the supabase module
vi.mock('./supabase', () => ({
    supabase: {
        rpc: vi.fn()
    },
    isSupabaseConfigured: vi.fn(() => true)
}));

import { supabase, isSupabaseConfigured } from './supabase';

// Valid event types for testing
const validEventTypes: SecurityEventType[] = [
    'blocked_request',
    'dom_violation',
    'fingerprint_mismatch',
    'honeypot_access',
    'time_manipulation'
];

// Arbitrary for generating valid event types
const eventTypeArb = fc.constantFrom(...validEventTypes);

// Arbitrary for generating metadata objects
const metadataArb = fc.dictionary(
    fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
    fc.oneof(
        fc.string(),
        fc.integer(),
        fc.boolean(),
        fc.constant(null)
    ),
    { minKeys: 0, maxKeys: 5 }
);

// Arbitrary for generating security event inputs
const securityEventInputArb = fc.record({
    type: eventTypeArb,
    userId: fc.option(fc.uuid(), { nil: undefined }),
    metadata: metadataArb
}) as fc.Arbitrary<SecurityEventInput>;

describe('Security Logger - Property-Based Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    /**
     * Feature: security-hardening, Property 10: Security Log Structure
     * 
     * For any security event logged via logSecurityEvent, the resulting log entry
     * SHALL contain: event_type (matching the input type), timestamp (ISO 8601 format),
     * and all metadata fields provided in the input.
     * 
     * Validates: Requirements 9.2
     */
    describe('Property 10: Security Log Structure', () => {
        it('should create events with valid ISO 8601 timestamps for any input', () => {
            fc.assert(
                fc.property(
                    securityEventInputArb,
                    (input) => {
                        const event = createSecurityEvent(input);

                        // Timestamp should be valid ISO 8601
                        const timestamp = new Date(event.timestamp);
                        const isValidTimestamp = !isNaN(timestamp.getTime());

                        // Timestamp should be in ISO format
                        const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
                        const isISOFormat = isoRegex.test(event.timestamp);

                        return isValidTimestamp && isISOFormat;
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });

        it('should preserve event type exactly as provided', () => {
            fc.assert(
                fc.property(
                    securityEventInputArb,
                    (input) => {
                        const event = createSecurityEvent(input);
                        return event.type === input.type;
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });

        it('should preserve all metadata fields from input', () => {
            fc.assert(
                fc.property(
                    securityEventInputArb,
                    (input) => {
                        const event = createSecurityEvent(input);

                        // All input metadata keys should be present in output
                        const inputKeys = Object.keys(input.metadata);
                        const outputKeys = Object.keys(event.metadata);

                        // Check all input keys are in output
                        const allKeysPresent = inputKeys.every(key => outputKeys.includes(key));

                        // Check all values match
                        const allValuesMatch = inputKeys.every(
                            key => event.metadata[key] === input.metadata[key]
                        );

                        return allKeysPresent && allValuesMatch;
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });

        it('should preserve userId when provided', () => {
            fc.assert(
                fc.property(
                    securityEventInputArb,
                    (input) => {
                        const event = createSecurityEvent(input);
                        return event.userId === input.userId;
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });

        it('should pass correct structure to RPC when logging events', async () => {
            const mockRpc = vi.mocked(supabase.rpc);

            await fc.assert(
                fc.asyncProperty(
                    securityEventInputArb,
                    async (input) => {
                        // Setup mock to capture the call
                        mockRpc.mockResolvedValueOnce({
                            data: { success: true, log_id: 'test-id' },
                            error: null
                        } as { data: unknown; error: unknown });

                        await logSecurityEvent(input);

                        // Verify RPC was called
                        expect(mockRpc).toHaveBeenCalled();

                        // Get the call arguments
                        const lastCall = mockRpc.mock.calls[mockRpc.mock.calls.length - 1];
                        const [funcName, params] = lastCall;

                        // Verify function name
                        expect(funcName).toBe('log_security_event');

                        // Verify event type matches
                        expect((params as { p_event_type: string }).p_event_type).toBe(input.type);

                        // Verify metadata contains all input metadata
                        const inputKeys = Object.keys(input.metadata);
                        const passedMetadata = (params as { p_metadata: Record<string, unknown> }).p_metadata;

                        const allInputMetadataPresent = inputKeys.every(
                            key => passedMetadata[key] === input.metadata[key]
                        );

                        // Verify client_timestamp is added
                        const hasClientTimestamp = 'client_timestamp' in passedMetadata;

                        return allInputMetadataPresent && hasClientTimestamp;
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });
    });

    describe('Event Type Validation', () => {
        it('should accept all valid event types', () => {
            fc.assert(
                fc.property(
                    eventTypeArb,
                    (eventType) => {
                        return isValidEventType(eventType) === true;
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });

        it('should reject invalid event types', () => {
            fc.assert(
                fc.property(
                    fc.string().filter(s => !validEventTypes.includes(s as SecurityEventType)),
                    (invalidType) => {
                        return isValidEventType(invalidType) === false;
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });
    });
});

describe('Security Logger - Unit Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createSecurityEvent', () => {
        it('should create a properly structured event', () => {
            const input: SecurityEventInput = {
                type: 'blocked_request',
                metadata: { url: 'https://evil.com', reason: 'not in allowlist' }
            };

            const event = createSecurityEvent(input);

            expect(event.type).toBe('blocked_request');
            expect(event.metadata).toEqual(input.metadata);
            expect(event.timestamp).toBeDefined();
            expect(new Date(event.timestamp).getTime()).not.toBeNaN();
        });

        it('should include userId when provided', () => {
            const input: SecurityEventInput = {
                type: 'dom_violation',
                userId: 'user-123',
                metadata: { element: 'script' }
            };

            const event = createSecurityEvent(input);

            expect(event.userId).toBe('user-123');
        });
    });

    describe('logSecurityEvent', () => {
        it('should return error when Supabase is not configured', async () => {
            vi.mocked(isSupabaseConfigured).mockReturnValueOnce(false);

            const result = await logSecurityEvent({
                type: 'blocked_request',
                metadata: {}
            });

            expect(result.success).toBe(false);
            expect(result.error).toBe('Supabase not configured');
        });

        it('should return error for invalid event type', async () => {
            const result = await logSecurityEvent({
                type: 'invalid_type' as SecurityEventType,
                metadata: {}
            });

            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid event type');
        });

        it('should handle RPC success', async () => {
            vi.mocked(supabase.rpc).mockResolvedValueOnce({
                data: { success: true, log_id: 'abc-123' },
                error: null
            } as { data: unknown; error: unknown });

            const result = await logSecurityEvent({
                type: 'blocked_request',
                metadata: { url: 'https://test.com' }
            });

            expect(result.success).toBe(true);
            expect(result.logId).toBe('abc-123');
        });

        it('should handle RPC error gracefully', async () => {
            vi.mocked(supabase.rpc).mockResolvedValueOnce({
                data: null,
                error: { message: 'Database error' }
            } as { data: unknown; error: unknown });

            const result = await logSecurityEvent({
                type: 'blocked_request',
                metadata: {}
            });

            expect(result.success).toBe(false);
            expect(result.error).toBe('Database error');
        });

        it('should handle unexpected exceptions gracefully', async () => {
            vi.mocked(supabase.rpc).mockRejectedValueOnce(new Error('Network error'));

            const result = await logSecurityEvent({
                type: 'blocked_request',
                metadata: {}
            });

            expect(result.success).toBe(false);
            expect(result.error).toBe('Network error');
        });
    });

    describe('Convenience Functions', () => {
        beforeEach(() => {
            vi.mocked(supabase.rpc).mockResolvedValue({
                data: { success: true, log_id: 'test-id' },
                error: null
            } as { data: unknown; error: unknown });
        });

        it('logBlockedRequest should include url and reason in metadata', async () => {
            await logBlockedRequest('https://evil.com', 'not in allowlist');

            expect(supabase.rpc).toHaveBeenCalledWith('log_security_event', expect.objectContaining({
                p_event_type: 'blocked_request',
                p_metadata: expect.objectContaining({
                    url: 'https://evil.com',
                    reason: 'not in allowlist'
                })
            }));
        });

        it('logDOMViolation should include element type and action', async () => {
            await logDOMViolation('script', 'removed');

            expect(supabase.rpc).toHaveBeenCalledWith('log_security_event', expect.objectContaining({
                p_event_type: 'dom_violation',
                p_metadata: expect.objectContaining({
                    element_type: 'script',
                    action: 'removed'
                })
            }));
        });

        it('logFingerprintMismatch should include expected and actual hashes', async () => {
            await logFingerprintMismatch('hash1', 'hash2');

            expect(supabase.rpc).toHaveBeenCalledWith('log_security_event', expect.objectContaining({
                p_event_type: 'fingerprint_mismatch',
                p_metadata: expect.objectContaining({
                    expected_hash: 'hash1',
                    actual_hash: 'hash2'
                })
            }));
        });

        it('logHoneypotAccess should include route', async () => {
            await logHoneypotAccess('/admin');

            expect(supabase.rpc).toHaveBeenCalledWith('log_security_event', expect.objectContaining({
                p_event_type: 'honeypot_access',
                p_metadata: expect.objectContaining({
                    route: '/admin'
                })
            }));
        });

        it('logTimeManipulation should include offset', async () => {
            await logTimeManipulation(300000);

            expect(supabase.rpc).toHaveBeenCalledWith('log_security_event', expect.objectContaining({
                p_event_type: 'time_manipulation',
                p_metadata: expect.objectContaining({
                    offset_ms: 300000
                })
            }));
        });
    });
});
