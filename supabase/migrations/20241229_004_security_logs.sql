-- =============================================================================
-- Security Hardening: Security Event Logging
-- Migration: 20241229_004_security_logs.sql
-- Requirements: 9.5 - Store security logs with appropriate retention policies
-- =============================================================================

-- =============================================================================
-- 1. CREATE SECURITY LOGS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.security_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. CREATE INDEXES FOR EFFICIENT QUERYING
-- =============================================================================

-- Index for querying by user and time (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_security_logs_user 
    ON public.security_logs(user_id, created_at DESC);

-- Index for querying by event type and time (for monitoring dashboards)
CREATE INDEX IF NOT EXISTS idx_security_logs_type 
    ON public.security_logs(event_type, created_at DESC);

-- Index for time-based queries (retention cleanup, recent events)
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at 
    ON public.security_logs(created_at DESC);

-- =============================================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 4. CREATE RLS POLICIES
-- =============================================================================

-- Only allow inserts via RPC function (SECURITY DEFINER)
-- No direct read access for regular users - admin only via service role
DROP POLICY IF EXISTS "Security logs are insert only via RPC" ON public.security_logs;

-- Allow authenticated users to insert (will be done via RPC for proper metadata)
CREATE POLICY "Allow insert via authenticated"
    ON public.security_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow anonymous inserts for pre-auth security events (honeypot, etc.)
CREATE POLICY "Allow insert via anon"
    ON public.security_logs
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- No SELECT policy for regular users - logs are admin-only
-- Service role can always bypass RLS for admin access

-- =============================================================================
-- 5. ADD COMMENT FOR DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE public.security_logs IS 
    'Security event log for tracking blocked requests, DOM violations, fingerprint mismatches, and honeypot triggers';

COMMENT ON COLUMN public.security_logs.event_type IS 
    'Type of security event: blocked_request, dom_violation, fingerprint_mismatch, honeypot_access, time_manipulation';

COMMENT ON COLUMN public.security_logs.metadata IS 
    'Additional event-specific data in JSON format';

-- =============================================================================
-- VERIFICATION COMMENTS
-- =============================================================================
-- After running this migration:
-- 1. security_logs table exists with proper schema
-- 2. Indexes are created for efficient querying
-- 3. RLS is enabled with insert-only policies
-- 4. No direct read access for regular users (admin via service role)
-- =============================================================================
