/**
 * Device Fingerprinting Module
 * 
 * Generates and verifies device fingerprints for session security.
 * Uses FingerprintJS for reliable cross-browser identification.
 * 
 * Requirements: 5.1, 5.3, 5.4, 5.5
 */

import FingerprintJS, { type Agent } from '@fingerprintjs/fingerprintjs';
import { supabase, isSupabaseConfigured } from './supabase';
import { logFingerprintMismatch } from './securityLogger';

/**
 * Result of fingerprint generation
 */
export interface FingerprintResult {
    success: boolean;
    hash?: string;
    error?: string;
}

/**
 * Result of session registration
 */
export interface SessionRegistrationResult {
    success: boolean;
    sessionId?: string;
    error?: string;
}

/**
 * Result of fingerprint verification
 */
export interface FingerprintVerificationResult {
    success: boolean;
    valid: boolean;
    reason?: string;
    error?: string;
}

// Singleton FingerprintJS agent
let fpAgent: Agent | null = null;

// Cached fingerprint hash for the current session
let cachedFingerprint: string | null = null;

/**
 * Initializes the FingerprintJS agent
 * Requirements: 5.5 - Use third-party fingerprinting library
 */
async function getAgent(): Promise<Agent> {
    if (!fpAgent) {
        fpAgent = await FingerprintJS.load();
    }
    return fpAgent;
}

/**
 * Generates a device fingerprint hash using hardware characteristics
 * Requirements: 5.1 - Generate device fingerprint hash using hardware characteristics
 * 
 * @returns Promise resolving to fingerprint result with hash
 */
export async function generateFingerprint(): Promise<FingerprintResult> {
    try {
        const agent = await getAgent();
        const result = await agent.get();
        
        // The visitorId is a stable hash of device characteristics
        const hash = result.visitorId;
        
        // Cache the fingerprint for this session
        cachedFingerprint = hash;
        
        return {
            success: true,
            hash
        };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        
        if (import.meta.env.DEV) {
            console.warn('[DeviceFingerprint] Failed to generate fingerprint:', errorMessage);
        }
        
        return {
            success: false,
            error: errorMessage
        };
    }
}

/**
 * Gets the cached fingerprint or generates a new one
 * 
 * @returns Promise resolving to the fingerprint hash or null
 */
export async function getFingerprint(): Promise<string | null> {
    if (cachedFingerprint) {
        return cachedFingerprint;
    }
    
    const result = await generateFingerprint();
    return result.success ? result.hash! : null;
}

/**
 * Registers the current device session with the server
 * Requirements: 5.2 - Store device fingerprint hash alongside user session
 * 
 * @param deviceHash - The device fingerprint hash (optional, will generate if not provided)
 * @returns Promise resolving to session registration result
 */
export async function registerDeviceSession(
    deviceHash?: string
): Promise<SessionRegistrationResult> {
    if (!isSupabaseConfigured()) {
        return { success: false, error: 'Supabase not configured' };
    }
    
    try {
        // Get or generate fingerprint
        const hash = deviceHash || await getFingerprint();
        
        if (!hash) {
            return { success: false, error: 'Failed to generate fingerprint' };
        }
        
        // Call the RPC function to register the session
        const { data, error } = await supabase.rpc('register_device_session', {
            p_device_hash: hash,
            p_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
        });
        
        if (error) {
            return { success: false, error: error.message };
        }
        
        if (data && typeof data === 'object') {
            const result = data as { success: boolean; session_id?: string; error?: string };
            return {
                success: result.success,
                sessionId: result.session_id,
                error: result.error
            };
        }
        
        return { success: true };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, error: errorMessage };
    }
}

/**
 * Verifies the current device fingerprint against stored session
 * Requirements: 5.3 - Verify current device fingerprint matches stored session
 * Requirements: 5.4 - Terminate session if fingerprint doesn't match
 * 
 * @param options - Verification options
 * @returns Promise resolving to verification result
 */
export async function verifyDeviceFingerprint(options?: {
    onMismatch?: () => void;
    logMismatch?: boolean;
}): Promise<FingerprintVerificationResult> {
    const { onMismatch, logMismatch = true } = options || {};
    
    if (!isSupabaseConfigured()) {
        return { success: false, valid: false, error: 'Supabase not configured' };
    }
    
    try {
        // Get current fingerprint
        const currentHash = await getFingerprint();
        
        if (!currentHash) {
            return { 
                success: false, 
                valid: false, 
                error: 'Failed to generate fingerprint' 
            };
        }
        
        // Call the RPC function to verify
        const { data, error } = await supabase.rpc('verify_device_fingerprint', {
            p_device_hash: currentHash
        });
        
        if (error) {
            return { success: false, valid: false, error: error.message };
        }
        
        if (data && typeof data === 'object') {
            const result = data as { 
                success: boolean; 
                valid: boolean; 
                reason?: string; 
                error?: string 
            };
            
            // Handle fingerprint mismatch
            if (result.success && !result.valid) {
                // Log the mismatch
                if (logMismatch) {
                    await logFingerprintMismatch(
                        'stored_session',
                        currentHash,
                        { reason: result.reason }
                    );
                }
                
                // Call the mismatch handler
                if (onMismatch) {
                    onMismatch();
                }
            }
            
            return {
                success: result.success,
                valid: result.valid,
                reason: result.reason,
                error: result.error
            };
        }
        
        return { success: true, valid: true };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, valid: false, error: errorMessage };
    }
}

/**
 * Invalidates all sessions for the current user
 * Useful when a security event is detected
 * 
 * @returns Promise resolving to the number of sessions invalidated
 */
export async function invalidateAllSessions(): Promise<{
    success: boolean;
    sessionsInvalidated?: number;
    error?: string;
}> {
    if (!isSupabaseConfigured()) {
        return { success: false, error: 'Supabase not configured' };
    }
    
    try {
        const { data, error } = await supabase.rpc('invalidate_all_sessions');
        
        if (error) {
            return { success: false, error: error.message };
        }
        
        if (data && typeof data === 'object') {
            const result = data as { 
                success: boolean; 
                sessions_invalidated?: number; 
                error?: string 
            };
            return {
                success: result.success,
                sessionsInvalidated: result.sessions_invalidated,
                error: result.error
            };
        }
        
        return { success: true };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return { success: false, error: errorMessage };
    }
}

/**
 * Clears the cached fingerprint
 * Useful for testing or when user logs out
 */
export function clearCachedFingerprint(): void {
    cachedFingerprint = null;
}

/**
 * Handles fingerprint verification failure by signing out the user
 * Requirements: 5.4 - Terminate session and require re-authentication
 */
export async function handleFingerprintMismatch(): Promise<void> {
    // Clear cached fingerprint
    clearCachedFingerprint();
    
    // Sign out the user
    if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
    }
    
    // Redirect to login (if in browser context)
    if (typeof window !== 'undefined') {
        window.location.href = '/login?reason=session_invalid';
    }
}
