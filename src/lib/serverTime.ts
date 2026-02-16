/**
 * Server Time Synchronization Module
 * 
 * Provides accurate server time to prevent client-side time manipulation
 * for features like streaks and timed challenges.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.5
 */

import { supabase, isSupabaseConfigured } from './supabase';

// 5 minute threshold for out-of-sync detection (in milliseconds)
const OUT_OF_SYNC_THRESHOLD_MS = 5 * 60 * 1000;

interface TimeSync {
    offset: number;
    lastSync: number;
    isOutOfSync: boolean;
}

interface ServerTimeResponse {
    server_time: string;
    server_time_ms: number;
}

// Module state
let timeSyncState: TimeSync = {
    offset: 0,
    lastSync: 0,
    isOutOfSync: false
};

let syncPromise: Promise<TimeSync> | null = null;

/**
 * Synchronizes with server time and calculates the offset from local time.
 * Accounts for network latency by measuring round-trip time.
 * 
 * @returns TimeSync object with offset, lastSync timestamp, and out-of-sync status
 */
export async function syncServerTime(): Promise<TimeSync> {
    // If a sync is already in progress, return that promise
    if (syncPromise) {
        return syncPromise;
    }

    syncPromise = performSync();

    try {
        const result = await syncPromise;
        return result;
    } finally {
        syncPromise = null;
    }
}

async function performSync(): Promise<TimeSync> {
    // If Supabase is not configured, return zero offset
    if (!isSupabaseConfigured()) {
        timeSyncState = {
            offset: 0,
            lastSync: Date.now(),
            isOutOfSync: false
        };
        return timeSyncState;
    }

    try {
        // Record time before request for latency calculation
        const requestStartTime = Date.now();

        const { data, error } = await supabase.rpc('get_server_time');

        // Record time after response
        const requestEndTime = Date.now();

        if (error) {
            console.error('Failed to sync server time:', error);
            // Keep existing state on error
            return timeSyncState;
        }

        if (!data || typeof data !== 'object') {
            console.error('Invalid server time response format');
            return timeSyncState;
        }

        const response = data as unknown as ServerTimeResponse;
        if (typeof response.server_time_ms !== 'number') {
            console.error('Invalid server time response: missing server_time_ms');
            return timeSyncState;
        }

        // Calculate network latency (round-trip time / 2)
        const roundTripTime = requestEndTime - requestStartTime;
        const estimatedLatency = roundTripTime / 2;

        // Server time adjusted for latency
        const serverTimeMs = response.server_time_ms + estimatedLatency;

        // Calculate offset: positive means server is ahead, negative means behind
        const localTimeAtResponse = requestEndTime;
        const offset = serverTimeMs - localTimeAtResponse;

        // Check if out of sync
        const isOutOfSync = Math.abs(offset) > OUT_OF_SYNC_THRESHOLD_MS;

        timeSyncState = {
            offset,
            lastSync: Date.now(),
            isOutOfSync
        };

        if (isOutOfSync) {
            console.warn(
                `System clock is out of sync with server by ${Math.round(offset / 1000)} seconds. ` +
                'Time-sensitive features may be restricted.'
            );
        }

        return timeSyncState;
    } catch (err) {
        console.error('Error during time sync:', err);
        return timeSyncState;
    }
}

/**
 * Returns the current time adjusted by the server offset.
 * This approximates the actual server time.
 * 
 * @returns Current timestamp in milliseconds, adjusted for server offset
 */
export function getTrueTime(): number {
    return Date.now() + timeSyncState.offset;
}

/**
 * Returns a Date object representing the current server time.
 * 
 * @returns Date object adjusted for server offset
 */
export function getTrueDate(): Date {
    return new Date(getTrueTime());
}

/**
 * Returns the current time sync state.
 * Useful for checking if the system is out of sync.
 * 
 * @returns Current TimeSync state
 */
export function getTimeSyncState(): TimeSync {
    return { ...timeSyncState };
}

/**
 * Checks if the local clock is significantly out of sync with the server.
 * 
 * @returns true if the offset exceeds the threshold (5 minutes)
 */
export function isClockOutOfSync(): boolean {
    return timeSyncState.isOutOfSync;
}

/**
 * Gets the current offset in milliseconds.
 * Positive means server is ahead, negative means server is behind.
 * 
 * @returns Offset in milliseconds
 */
export function getTimeOffset(): number {
    return timeSyncState.offset;
}

/**
 * Calculates the offset given server time and local times.
 * Exported for testing purposes.
 * 
 * @param serverTimeMs - Server time in milliseconds
 * @param requestStartTime - Local time when request was sent
 * @param requestEndTime - Local time when response was received
 * @returns Calculated offset in milliseconds
 */
export function calculateOffset(
    serverTimeMs: number,
    requestStartTime: number,
    requestEndTime: number
): number {
    const roundTripTime = requestEndTime - requestStartTime;
    const estimatedLatency = roundTripTime / 2;
    const adjustedServerTime = serverTimeMs + estimatedLatency;
    return adjustedServerTime - requestEndTime;
}
