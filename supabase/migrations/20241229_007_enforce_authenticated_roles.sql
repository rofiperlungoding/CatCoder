-- =============================================================================
-- Security Hardening: Enforce Authenticated Roles
-- Migration: 20241229_007_enforce_authenticated_roles.sql
-- Description: Drops permissive public policies and recreates them strictly for authenticated users.
-- =============================================================================

-- =============================================================================
-- 1. PROFILES
-- =============================================================================

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile non-xp fields" ON public.profiles;
CREATE POLICY "Users can update own profile non-xp fields"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- =============================================================================
-- 2. USER PROGRESS
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
CREATE POLICY "Users can view own progress"
    ON public.user_progress
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Wait, leaderboard might require public read. Keep Anyone can view progress for leaderboard as public,
-- but the above read policy can be strictly authenticated.

-- =============================================================================
-- 3. USER ACHIEVEMENTS
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own achievements" ON public.user_achievements;
CREATE POLICY "Users can view own achievements"
    ON public.user_achievements
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own achievements" ON public.user_achievements;
CREATE POLICY "Users can insert own achievements"
    ON public.user_achievements
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 4. AI USAGE LOGS
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own usage logs" ON public.ai_usage_logs;
CREATE POLICY "Users can view own usage logs"
    ON public.ai_usage_logs
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own usage logs" ON public.ai_usage_logs;
CREATE POLICY "Users can insert own usage logs"
    ON public.ai_usage_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 5. USER AI REVIEWS
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own code reviews" ON public.user_ai_reviews;
CREATE POLICY "Users can view own code reviews"
    ON public.user_ai_reviews
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own code reviews" ON public.user_ai_reviews;
CREATE POLICY "Users can insert own code reviews"
    ON public.user_ai_reviews
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 6. USER SKILLS
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own skills" ON public.user_skills;
CREATE POLICY "Users can view own skills"
    ON public.user_skills
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own skills" ON public.user_skills;
CREATE POLICY "Users can update own skills"
    ON public.user_skills
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 7. ACTIVE SESSIONS
-- =============================================================================

DROP POLICY IF EXISTS "Users can view own sessions" ON public.active_sessions;
CREATE POLICY "Users can view own sessions"
    ON public.active_sessions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own sessions" ON public.active_sessions;
CREATE POLICY "Users can create own sessions"
    ON public.active_sessions
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own sessions" ON public.active_sessions;
CREATE POLICY "Users can update own sessions"
    ON public.active_sessions
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own sessions" ON public.active_sessions;
CREATE POLICY "Users can delete own sessions"
    ON public.active_sessions
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
