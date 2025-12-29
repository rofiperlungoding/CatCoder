-- =============================================================================
-- Security Hardening: RLS Policies for Server-Side XP Authority
-- Migration: 20241229_001_security_rls_policies.sql
-- Requirements: 2.1 - Enforce RLS preventing direct INSERT/UPDATE/DELETE
-- =============================================================================

-- =============================================================================
-- 1. REVOKE DIRECT WRITE ACCESS FROM AUTHENTICATED USERS
-- =============================================================================

-- Revoke direct INSERT, UPDATE, DELETE on user_progress from authenticated users
-- The submit_completion RPC function will handle all writes using SECURITY DEFINER
REVOKE INSERT, UPDATE, DELETE ON public.user_progress FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.user_progress FROM anon;

-- Revoke direct UPDATE on XP-related columns in profiles from authenticated users
-- Users can still update non-sensitive fields (username, avatar_url) via existing policies
REVOKE UPDATE (xp, level, rank) ON public.profiles FROM authenticated;
REVOKE UPDATE (xp, level, rank) ON public.profiles FROM anon;

-- =============================================================================
-- 2. DROP EXISTING PERMISSIVE POLICIES ON user_progress
-- =============================================================================

-- Drop existing policies that allow direct writes
DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;

-- =============================================================================
-- 3. CREATE NEW RESTRICTIVE RLS POLICIES FOR user_progress
-- =============================================================================

-- Users can only SELECT their own progress (read-only)
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
CREATE POLICY "Users can view own progress"
    ON public.user_progress
    FOR SELECT
    USING (auth.uid() = user_id);

-- Keep the leaderboard policy for public viewing of completed progress
DROP POLICY IF EXISTS "Anyone can view progress for leaderboard" ON public.user_progress;
CREATE POLICY "Anyone can view progress for leaderboard"
    ON public.user_progress
    FOR SELECT
    USING (true);

-- =============================================================================
-- 4. UPDATE PROFILES RLS POLICIES
-- =============================================================================

-- Drop the existing update policy
DROP POLICY IF EXISTS "Users can update own profile safe fields" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create a new policy that allows users to update only non-XP fields
-- Note: This policy allows UPDATE but the REVOKE above prevents XP/level/rank changes
CREATE POLICY "Users can update own profile non-xp fields"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Ensure profiles table has RLS enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Ensure user_progress table has RLS enabled
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 5. VERIFICATION COMMENTS
-- =============================================================================
-- After running this migration:
-- 1. Authenticated users CANNOT directly INSERT/UPDATE/DELETE user_progress
-- 2. Authenticated users CANNOT directly UPDATE xp, level, rank on profiles
-- 3. The submit_completion RPC function (SECURITY DEFINER) CAN still modify these
-- 4. Users CAN still read their own progress and update non-sensitive profile fields
-- =============================================================================
