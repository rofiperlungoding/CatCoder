/**
 * Server Time Synchronization Property-Based Tests
 * Feature: security-hardening
 * 
 * Property 9: Server Time Offset Calculation
 * 
 * Validates: Requirements 8.2
 */
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { calculateOffset, getTrueTime, getTimeSyncState } from './serverTime';

describe('Server Time - Property-Based Tests', () => {
    /**
     * Feature: security-hardening, Property 9: Server Time Offset Calculation
     * 
     * For any server time response and local time, the getTrueTime function SHALL
     * return a value equal to the current local time plus the calculated offset
     * (accounting for network latency), such that the result approximates the
     * actual server time.
     * 
     * Validates: Requirements 8.2
     */
    describe('Property 9: Server Time Offset Calculation', () => {
        it('should calculate offset correctly accounting for network latency', () => {
            fc.assert(
                fc.property(
                    // Server time in ms (realistic range: year 2020-2030)
                    fc.integer({ min: 1577836800000, max: 1893456000000 }),
                    // Request start time (slightly before server time to simulate realistic scenario)
                    fc.integer({ min: 1577836800000, max: 1893456000000 }),
                    // Network latency (0-2000ms round trip)
                    fc.integer({ min: 0, max: 2000 }),
                    (serverTimeMs, requestStartTime, roundTripTime) => {
                        const requestEndTime = requestStartTime + roundTripTime;
                        
                        const offset = calculateOffset(serverTimeMs, requestStartTime, requestEndTime);
                        
                        // The offset should be: (serverTime + latency/2) - requestEndTime
                        const expectedLatency = roundTripTime / 2;
                        const expectedOffset = (serverTimeMs + expectedLatency) - requestEndTime;
                        
                        return offset === expectedOffset;
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });

        it('should produce zero offset when server and client times are synchronized', () => {
            fc.assert(
                fc.property(
                    // Current time
                    fc.integer({ min: 1577836800000, max: 1893456000000 }),
                    // Small network latency (0-100ms)
                    fc.integer({ min: 0, max: 100 }),
                    (currentTime, roundTripTime) => {
                        // Simulate perfectly synchronized clocks
                        const requestStartTime = currentTime;
                        const requestEndTime = currentTime + roundTripTime;
                        // Server time is exactly at the midpoint (when request arrived at server)
                        const serverTimeMs = currentTime + (roundTripTime / 2);
                        
                        const offset = calculateOffset(serverTimeMs, requestStartTime, requestEndTime);
                        
                        // Offset should be approximately zero (within floating point tolerance)
                        return Math.abs(offset) < 1;
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });

        it('should detect positive offset when server is ahead of client', () => {
            fc.assert(
                fc.property(
                    // Base time
                    fc.integer({ min: 1577836800000, max: 1893456000000 }),
                    // Server ahead by this amount (1 second to 10 minutes)
                    fc.integer({ min: 1000, max: 600000 }),
                    // Network latency
                    fc.integer({ min: 10, max: 200 }),
                    (baseTime, serverAhead, roundTripTime) => {
                        const requestStartTime = baseTime;
                        const requestEndTime = baseTime + roundTripTime;
                        // Server time is ahead
                        const serverTimeMs = baseTime + serverAhead + (roundTripTime / 2);
                        
                        const offset = calculateOffset(serverTimeMs, requestStartTime, requestEndTime);
                        
                        // Offset should be positive (server ahead)
                        return offset > 0;
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });

        it('should detect negative offset when server is behind client', () => {
            fc.assert(
                fc.property(
                    // Base time (ensure enough room for server to be behind)
                    fc.integer({ min: 1600000000000, max: 1893456000000 }),
                    // Server behind by this amount (1 second to 10 minutes)
                    fc.integer({ min: 1000, max: 600000 }),
                    // Network latency
                    fc.integer({ min: 10, max: 200 }),
                    (baseTime, serverBehind, roundTripTime) => {
                        const requestStartTime = baseTime;
                        const requestEndTime = baseTime + roundTripTime;
                        // Server time is behind
                        const serverTimeMs = baseTime - serverBehind + (roundTripTime / 2);
                        
                        const offset = calculateOffset(serverTimeMs, requestStartTime, requestEndTime);
                        
                        // Offset should be negative (server behind)
                        return offset < 0;
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });

        it('should handle high latency scenarios correctly', () => {
            fc.assert(
                fc.property(
                    // Base time
                    fc.integer({ min: 1577836800000, max: 1893456000000 }),
                    // High latency (1-10 seconds round trip)
                    fc.integer({ min: 1000, max: 10000 }),
                    (baseTime, roundTripTime) => {
                        const requestStartTime = baseTime;
                        const requestEndTime = baseTime + roundTripTime;
                        // Server time at midpoint
                        const serverTimeMs = baseTime + (roundTripTime / 2);
                        
                        const offset = calculateOffset(serverTimeMs, requestStartTime, requestEndTime);
                        
                        // Even with high latency, offset calculation should be consistent
                        // The formula should still hold
                        const expectedLatency = roundTripTime / 2;
                        const expectedOffset = (serverTimeMs + expectedLatency) - requestEndTime;
                        
                        return offset === expectedOffset;
                    }
                ),
                { numRuns: 100, verbose: true }
            );
        });
    });
});

describe('Server Time - Unit Tests', () => {
    it('should calculate offset for a known scenario', () => {
        // Scenario: Server is 5 seconds ahead, 100ms round trip
        const requestStartTime = 1700000000000;
        const requestEndTime = 1700000000100; // 100ms later
        const serverTimeMs = 1700000005050; // 5 seconds + 50ms (midpoint) ahead
        
        const offset = calculateOffset(serverTimeMs, requestStartTime, requestEndTime);
        
        // Expected: (5050 + 50) - 100 = 5000ms = 5 seconds
        expect(offset).toBe(5000);
    });

    it('should return current state from getTimeSyncState', () => {
        const state = getTimeSyncState();
        
        expect(state).toHaveProperty('offset');
        expect(state).toHaveProperty('lastSync');
        expect(state).toHaveProperty('isOutOfSync');
        expect(typeof state.offset).toBe('number');
        expect(typeof state.lastSync).toBe('number');
        expect(typeof state.isOutOfSync).toBe('boolean');
    });

    it('should return a number from getTrueTime', () => {
        const trueTime = getTrueTime();
        
        expect(typeof trueTime).toBe('number');
        // Should be close to current time (within a day, accounting for any offset)
        const now = Date.now();
        const dayInMs = 24 * 60 * 60 * 1000;
        expect(Math.abs(trueTime - now)).toBeLessThan(dayInMs);
    });

    it('should handle zero latency edge case', () => {
        const time = 1700000000000;
        const offset = calculateOffset(time, time, time);
        
        // With zero latency and same times, offset should be 0
        expect(offset).toBe(0);
    });
});
