-- =============================================================================
-- Security Hardening: Security Logger RPC Function
-- Migration: 20241229_005_security_logger_rpc.sql
-- Requirements: 9.1 - Send security events to server via RPC
-- =============================================================================

-- =============================================================================
-- 1. CREATE SECURITY LOGGER RPC FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION log_security_event(
    p_event_type TEXT,
    p_metadata JSONB DEFAULT '{}'
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_user_id UUID;
    v_log_id UUID;
BEGIN
    -- Get current user ID (may be null for anonymous events)
    v_user_id := auth.uid();
    
    -- Validate event type
    IF p_event_type NOT IN (
        'blocked_request', 
        'dom_violation', 
        'fingerprint_mismatch', 
        'honeypot_access', 
        'time_manipulation'
    ) THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'Invalid event type'
        );
    END IF;
    
    -- Insert the security log entry
    -- Note: ip_address and user_agent should be captured at the edge/proxy level
    -- For client-side logging, we include what metadata the client provides
    INSERT INTO public.security_logs (
        event_type,
        user_id,
        metadata,
        created_at
    ) VALUES (
        p_event_type,
        v_user_id,
        p_metadata,
        NOW()
    )
    RETURNING id INTO v_log_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'log_id', v_log_id
    );
    
EXCEPTION WHEN OTHERS THEN
    -- Log errors but don't expose internal details
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Failed to log security event'
    );
END;
$$;

-- =============================================================================
-- 2. GRANT EXECUTE PERMISSIONS
-- =============================================================================

-- Allow both authenticated and anonymous users to log security events
GRANT EXECUTE ON FUNCTION log_security_event(TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION log_security_event(TEXT, JSONB) TO anon;

-- =============================================================================
-- 3. ADD FUNCTION COMMENT
-- =============================================================================

COMMENT ON FUNCTION log_security_event IS 
    'Logs security events to the security_logs table. Accepts event_type and optional metadata. Returns success status and log_id.';

-- =============================================================================
-- VERIFICATION COMMENTS
-- =============================================================================
-- After running this migration:
-- 1. log_security_event RPC function is available
-- 2. Function validates event types
-- 3. Function handles errors gracefully without exposing internals
-- 4. Both authenticated and anonymous users can call the function
-- =============================================================================
