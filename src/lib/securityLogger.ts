/**
 * Security Logger Module
 * 
 * Provides non-blocking security event logging to the server.
 * Events are logged asynchronously and failures do not block application functionality.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4
 */

import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Security event types that can be logged
 * Requirements: 9.3 - Capture events for blocked requests, DOM violations, 
 * fingerprint mismatches, and honeypot triggers
 */
export type SecurityEventType =
    | 'blocked_request'
    | 'dom_violation'
    | 'fingerprint_mismatch'
    | 'honeypot_access'
    | 'time_manipulation';

/**
 * Security event structure
 * Requirements: 9.2 - Include event type, timestamp, user ID, and metadata
 */
export interface SecurityEvent {
    type: SecurityEventType;
    timestamp: string;
    userId?: string;
    metadata: Record<string, unknown>;
}

/**
 * Input for logging a security event (timestamp is auto-generated)
 */
export type SecurityEventInput = Omit<SecurityEvent, 'timestamp'>;

/**
 * Result of a security log operation
 */
export interface SecurityLogResult {
    success: boolean;
    logId?: string;
    error?: string;
}

/**
 * Validates that the event type is one of the allowed types
 */
export function isValidEventType(type: string): type is SecurityEventType {
    return [
        'blocked_request',
        'dom_violation',
        'fingerprint_mismatch',
        'honeypot_access',
        'time_manipulation'
    ].includes(type);
}

/**
 * Creates a properly structured security event with timestamp
 * Requirements: 9.2 - Include timestamp in ISO 8601 format
 */
export function createSecurityEvent(input: SecurityEventInput): SecurityEvent {
    return {
        type: input.type,
        timestamp: new Date().toISOString(),
        userId: input.userId,
        metadata: input.metadata
    };
}

/**
 * Logs a security event to the server via RPC
 * 
 * This function is non-blocking and will not throw errors.
 * If logging fails, it silently fails to avoid blocking application functionality.
 * 
 * Requirements: 
 * - 9.1: Send event to server via RPC
 * - 9.4: Do not block application functionality if logging fails
 * 
 * @param event - The security event to log (without timestamp)
 * @returns Promise resolving to the log result
 */
export async function logSecurityEvent(
    event: SecurityEventInput
): Promise<SecurityLogResult> {
    // Don't attempt to log if Supabase isn't configured
    if (!isSupabaseConfigured()) {
        return { success: false, error: 'Supabase not configured' };
    }

    // Validate event type
    if (!isValidEventType(event.type)) {
        return { success: false, error: 'Invalid event type' };
    }

    try {
        // Create the full event with timestamp
        const fullEvent = createSecurityEvent(event);

        // Call the RPC function
        const { data, error } = await supabase.rpc('log_security_event', {
            p_event_type: fullEvent.type,
            p_metadata: {
                ...fullEvent.metadata,
                client_timestamp: fullEvent.timestamp,
                user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
            }
        });

        if (error) {
            // Log to console in development, but don't throw
            if (import.meta.env.DEV) {
                console.warn('[SecurityLogger] Failed to log event:', error.message);
            }
            return { success: false, error: error.message };
        }

        // Handle the response
        if (data && typeof data === 'object') {
            const result = data as { success: boolean; log_id?: string; error?: string };
            return {
                success: result.success,
                logId: result.log_id,
                error: result.error
            };
        }

        return { success: true };
    } catch (err) {
        // Catch any unexpected errors and fail silently
        // Requirements: 9.4 - Do not block application functionality
        if (import.meta.env.DEV) {
            console.warn('[SecurityLogger] Unexpected error:', err);
        }
        return { 
            success: false, 
            error: err instanceof Error ? err.message : 'Unknown error' 
        };
    }
}

/**
 * Convenience function to log a blocked request event
 * Requirements: 9.3 - Capture blocked request events
 */
export function logBlockedRequest(
    url: string,
    reason: string,
    additionalMetadata?: Record<string, unknown>
): Promise<SecurityLogResult> {
    return logSecurityEvent({
        type: 'blocked_request',
        metadata: {
            url,
            reason,
            ...additionalMetadata
        }
    });
}

/**
 * Convenience function to log a DOM violation event
 * Requirements: 9.3 - Capture DOM violation events
 */
export function logDOMViolation(
    elementType: string,
    action: string,
    additionalMetadata?: Record<string, unknown>
): Promise<SecurityLogResult> {
    return logSecurityEvent({
        type: 'dom_violation',
        metadata: {
            element_type: elementType,
            action,
            ...additionalMetadata
        }
    });
}

/**
 * Convenience function to log a fingerprint mismatch event
 * Requirements: 9.3 - Capture fingerprint mismatch events
 */
export function logFingerprintMismatch(
    expectedHash: string,
    actualHash: string,
    additionalMetadata?: Record<string, unknown>
): Promise<SecurityLogResult> {
    return logSecurityEvent({
        type: 'fingerprint_mismatch',
        metadata: {
            expected_hash: expectedHash,
            actual_hash: actualHash,
            ...additionalMetadata
        }
    });
}

/**
 * Convenience function to log a honeypot access event
 * Requirements: 9.3 - Capture honeypot trigger events
 */
export function logHoneypotAccess(
    route: string,
    additionalMetadata?: Record<string, unknown>
): Promise<SecurityLogResult> {
    return logSecurityEvent({
        type: 'honeypot_access',
        metadata: {
            route,
            referrer: typeof document !== 'undefined' ? document.referrer : undefined,
            ...additionalMetadata
        }
    });
}

/**
 * Convenience function to log a time manipulation event
 * Requirements: 9.3 - Capture time manipulation events
 */
export function logTimeManipulation(
    offsetMs: number,
    additionalMetadata?: Record<string, unknown>
): Promise<SecurityLogResult> {
    return logSecurityEvent({
        type: 'time_manipulation',
        metadata: {
            offset_ms: offsetMs,
            local_time: new Date().toISOString(),
            ...additionalMetadata
        }
    });
}
