-- Migration: Create active_sessions table for device fingerprinting
-- Requirements: 5.2 - Store device fingerprint hash alongside user session

-- Create active_sessions table
CREATE TABLE IF NOT EXISTS active_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    device_hash TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_active TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, device_hash)
);

-- Index for querying sessions by user
CREATE INDEX IF NOT EXISTS idx_active_sessions_user ON active_sessions(user_id, last_active DESC);

-- Index for querying by device hash
CREATE INDEX IF NOT EXISTS idx_active_sessions_device ON active_sessions(device_hash);

-- Enable RLS
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own sessions
CREATE POLICY "Users can view own sessions" ON active_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can create own sessions" ON active_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions (for last_active timestamp)
CREATE POLICY "Users can update own sessions" ON active_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own sessions (for logout)
CREATE POLICY "Users can delete own sessions" ON active_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- RPC function to register a device session
CREATE OR REPLACE FUNCTION register_device_session(
    p_device_hash TEXT,
    p_user_agent TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_user_id UUID;
    v_session_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
    END IF;
    
    -- Insert or update session
    INSERT INTO active_sessions (user_id, device_hash, user_agent, last_active)
    VALUES (v_user_id, p_device_hash, p_user_agent, NOW())
    ON CONFLICT (user_id, device_hash) 
    DO UPDATE SET last_active = NOW(), user_agent = COALESCE(p_user_agent, active_sessions.user_agent)
    RETURNING id INTO v_session_id;
    
    RETURN jsonb_build_object('success', true, 'session_id', v_session_id);
END;
$$;

-- RPC function to verify device fingerprint
CREATE OR REPLACE FUNCTION verify_device_fingerprint(
    p_device_hash TEXT
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_user_id UUID;
    v_session_exists BOOLEAN;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated', 'valid', false);
    END IF;
    
    -- Check if session exists for this user and device
    SELECT EXISTS(
        SELECT 1 FROM active_sessions 
        WHERE user_id = v_user_id 
        AND device_hash = p_device_hash
    ) INTO v_session_exists;
    
    IF v_session_exists THEN
        -- Update last_active timestamp
        UPDATE active_sessions 
        SET last_active = NOW() 
        WHERE user_id = v_user_id AND device_hash = p_device_hash;
        
        RETURN jsonb_build_object('success', true, 'valid', true);
    ELSE
        RETURN jsonb_build_object('success', true, 'valid', false, 'reason', 'Device not recognized');
    END IF;
END;
$$;

-- RPC function to invalidate all sessions (for security events)
CREATE OR REPLACE FUNCTION invalidate_all_sessions()
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_user_id UUID;
    v_deleted_count INTEGER;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
    END IF;
    
    DELETE FROM active_sessions WHERE user_id = v_user_id;
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    RETURN jsonb_build_object('success', true, 'sessions_invalidated', v_deleted_count);
END;
$$;
