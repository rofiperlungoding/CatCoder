-- =============================================================================
-- Security Hardening: Server-Side XP Authority RPC Function
-- Migration: 20241229_002_submit_completion_rpc.sql
-- Requirements: 2.2, 2.3, 2.4, 2.5 - Server-side XP calculation and duplicate prevention
-- =============================================================================

-- =============================================================================
-- 1. HELPER FUNCTION: Calculate Level from XP
-- =============================================================================
CREATE OR REPLACE FUNCTION public.calculate_level(p_xp INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    -- Level formula: Each level requires progressively more XP
    -- Level 1: 0-99 XP
    -- Level 2: 100-249 XP
    -- Level 3: 250-449 XP
    -- etc. (each level requires 50 more XP than the previous)
    IF p_xp < 100 THEN
        RETURN 1;
    ELSIF p_xp < 250 THEN
        RETURN 2;
    ELSIF p_xp < 450 THEN
        RETURN 3;
    ELSIF p_xp < 700 THEN
        RETURN 4;
    ELSIF p_xp < 1000 THEN
        RETURN 5;
    ELSIF p_xp < 1350 THEN
        RETURN 6;
    ELSIF p_xp < 1750 THEN
        RETURN 7;
    ELSIF p_xp < 2200 THEN
        RETURN 8;
    ELSIF p_xp < 2700 THEN
        RETURN 9;
    ELSIF p_xp < 3250 THEN
        RETURN 10;
    ELSE
        -- For levels beyond 10, use a formula
        -- Approximate: level = floor(sqrt(xp / 50)) + 1
        RETURN GREATEST(10, FLOOR(SQRT(p_xp::FLOAT / 50)) + 1)::INTEGER;
    END IF;
END;
$$;

-- =============================================================================
-- 2. HELPER FUNCTION: Calculate Rank from XP
-- =============================================================================
CREATE OR REPLACE FUNCTION public.calculate_rank(p_xp INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    -- Rank thresholds based on XP
    IF p_xp < 500 THEN
        RETURN 'bronze';
    ELSIF p_xp < 1500 THEN
        RETURN 'silver';
    ELSIF p_xp < 3500 THEN
        RETURN 'gold';
    ELSIF p_xp < 7500 THEN
        RETURN 'platinum';
    ELSE
        RETURN 'diamond';
    END IF;
END;
$$;

-- =============================================================================
-- 3. MAIN RPC FUNCTION: submit_completion
-- =============================================================================
CREATE OR REPLACE FUNCTION public.submit_completion(
    p_content_type TEXT,
    p_content_id TEXT,
    p_language TEXT,
    p_duration_seconds INTEGER DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_xp_reward INTEGER;
    v_user_id UUID;
    v_already_completed BOOLEAN;
    v_current_xp INTEGER;
    v_new_xp INTEGER;
    v_new_level INTEGER;
    v_new_rank TEXT;
BEGIN
    -- Get current authenticated user
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
    END IF;
    
    -- Validate content_type
    IF p_content_type NOT IN ('lesson', 'problem', 'challenge') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid content type');
    END IF;
    
    -- Check if already completed (duplicate prevention - Requirement 2.5)
    SELECT EXISTS(
        SELECT 1 FROM public.user_progress 
        WHERE user_id = v_user_id 
        AND content_type = p_content_type 
        AND content_id = p_content_id
        AND status = 'completed'
    ) INTO v_already_completed;
    
    IF v_already_completed THEN
        RETURN jsonb_build_object(
            'success', true, 
            'xp_awarded', 0, 
            'message', 'Already completed'
        );
    END IF;
    
    -- Determine XP reward server-side (Requirement 2.3)
    -- XP values are defined here, NOT accepted as input parameters
    v_xp_reward := CASE p_content_type
        WHEN 'lesson' THEN 50
        WHEN 'problem' THEN 100
        WHEN 'challenge' THEN 200
        ELSE 25
    END;
    
    -- Get current user XP
    SELECT xp INTO v_current_xp
    FROM public.profiles
    WHERE id = v_user_id;
    
    IF v_current_xp IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User profile not found');
    END IF;
    
    -- Calculate new XP, level, and rank
    v_new_xp := v_current_xp + v_xp_reward;
    v_new_level := public.calculate_level(v_new_xp);
    v_new_rank := public.calculate_rank(v_new_xp);
    
    -- Insert progress record with ON CONFLICT handling (Requirement 2.5)
    INSERT INTO public.user_progress (
        user_id, 
        content_type, 
        content_id, 
        status, 
        duration_seconds, 
        completed_at
    )
    VALUES (
        v_user_id, 
        p_content_type, 
        p_content_id, 
        'completed', 
        p_duration_seconds, 
        NOW()
    )
    ON CONFLICT (user_id, content_type, content_id) 
    DO UPDATE SET 
        status = 'completed',
        duration_seconds = COALESCE(p_duration_seconds, public.user_progress.duration_seconds),
        completed_at = NOW()
    WHERE public.user_progress.status != 'completed';
    
    -- Check if the insert/update actually happened (for duplicate prevention)
    IF NOT FOUND THEN
        -- This means the record existed and was already completed
        RETURN jsonb_build_object(
            'success', true, 
            'xp_awarded', 0, 
            'message', 'Already completed'
        );
    END IF;
    
    -- Update profile XP atomically (Requirement 2.4)
    UPDATE public.profiles 
    SET 
        xp = v_new_xp,
        level = v_new_level,
        rank = v_new_rank,
        updated_at = NOW()
    WHERE id = v_user_id;
    
    RETURN jsonb_build_object(
        'success', true, 
        'xp_awarded', v_xp_reward,
        'new_xp', v_new_xp,
        'new_level', v_new_level,
        'new_rank', v_new_rank
    );
END;
$$;

-- =============================================================================
-- 4. GRANT EXECUTE PERMISSION TO AUTHENTICATED USERS
-- =============================================================================
GRANT EXECUTE ON FUNCTION public.submit_completion(TEXT, TEXT, TEXT, INTEGER) TO authenticated;

-- =============================================================================
-- 5. VERIFICATION COMMENTS
-- =============================================================================
-- This function:
-- 1. Uses SECURITY DEFINER to bypass RLS and update protected tables
-- 2. Calculates XP rewards server-side (not accepting XP as input)
-- 3. Prevents duplicate XP awards using ON CONFLICT handling
-- 4. Updates profile XP, level, and rank atomically
-- 5. Returns detailed response including new XP totals
-- =============================================================================
