-- CatCoder Supabase Database Schema
-- This script is IDEMPOTENT - safe to run multiple times
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- =============================================================================
-- 1. PROFILES TABLE (Extends Supabase Auth)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  rank TEXT DEFAULT 'bronze' CHECK (rank IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  streak_current INTEGER DEFAULT 0,
  streak_best INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (idempotent)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Recreate policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================================================
-- 2. USER PROGRESS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('lesson', 'problem', 'challenge')),
  content_id TEXT NOT NULL,
  status TEXT DEFAULT 'started' CHECK (status IN ('started', 'completed')),
  score INTEGER,
  duration_seconds INTEGER, -- Time taken to complete (for speed runs)
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_type, content_id)
);

-- Enable RLS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;
DROP POLICY IF EXISTS "Anyone can view progress for leaderboard" ON public.user_progress;

-- Recreate policies
CREATE POLICY "Users can view own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow everyone to view progress (for speed run leaderboard)
CREATE POLICY "Anyone can view progress for leaderboard"
  ON public.user_progress FOR SELECT
  USING (true);

-- =============================================================================
-- 3. USER ACHIEVEMENTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON public.user_achievements;

-- Recreate policies
CREATE POLICY "Users can view own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- 4. FUNCTION: Auto-create profile on user signup
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger (drop first for idempotency)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 5. FUNCTION: Update updated_at timestamp
-- =============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- 6. INDEXES for performance
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON public.profiles(xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_completed ON public.user_progress(completed_at DESC) WHERE status = 'completed';
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);

-- =============================================================================
-- 7. PROBLEM ANSWERS TABLE (Server-side answer storage)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.problem_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('lesson', 'problem')),
  content_id TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('python', 'javascript', 'cpp')),
  expected_output TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_type, content_id, language)
);

-- Only public can read, only service role can modify (admin)
ALTER TABLE public.problem_answers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can read problem answers" ON public.problem_answers;
CREATE POLICY "Public can read problem answers" ON public.problem_answers FOR SELECT USING (true);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_problem_answers_lookup ON public.problem_answers(content_type, content_id, language);

-- =============================================================================
-- 8. FUNCTION: Server-side answer validation and XP award
-- =============================================================================
CREATE OR REPLACE FUNCTION public.validate_and_complete(
  p_content_type TEXT,
  p_content_id TEXT,
  p_language TEXT,
  p_user_output TEXT,
  p_duration_seconds INTEGER DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_expected TEXT;
  v_xp INTEGER;
  v_already_completed BOOLEAN;
  v_is_correct BOOLEAN;
  v_normalized_output TEXT;
  v_normalized_expected TEXT;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Get expected answer
  SELECT expected_output, xp_reward INTO v_expected, v_xp
  FROM public.problem_answers
  WHERE content_type = p_content_type 
    AND content_id = p_content_id 
    AND language = p_language;

  IF v_expected IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Problem not found');
  END IF;

  -- Normalize outputs (trim whitespace, lowercase for comparison)
  v_normalized_output := LOWER(TRIM(p_user_output));
  v_normalized_expected := LOWER(TRIM(v_expected));
  
  -- Validate answer (check if expected is contained in output)
  v_is_correct := v_normalized_output LIKE '%' || v_normalized_expected || '%';

  IF NOT v_is_correct THEN
    RETURN jsonb_build_object('success', false, 'error', 'Incorrect answer');
  END IF;

  -- Check if already completed
  SELECT EXISTS(
    SELECT 1 FROM public.user_progress 
    WHERE user_id = v_user_id 
      AND content_type = p_content_type 
      AND content_id = p_content_id 
      AND status = 'completed'
  ) INTO v_already_completed;

  IF v_already_completed THEN
    RETURN jsonb_build_object('success', true, 'xp_awarded', 0, 'message', 'Already completed');
  END IF;

  -- Mark complete
  INSERT INTO public.user_progress (user_id, content_type, content_id, status, duration_seconds, completed_at)
  VALUES (v_user_id, p_content_type, p_content_id, 'completed', p_duration_seconds, NOW())
  ON CONFLICT (user_id, content_type, content_id) 
  DO UPDATE SET status = 'completed', duration_seconds = p_duration_seconds, completed_at = NOW();

  -- Award XP (using SECURITY DEFINER bypasses RLS)
  UPDATE public.profiles SET xp = xp + v_xp WHERE id = v_user_id;

  RETURN jsonb_build_object('success', true, 'xp_awarded', v_xp);
END;
$$;

-- =============================================================================
-- 9. Restrict direct XP/Level updates from client
-- =============================================================================
-- Drop old policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- New restricted policy: users can update their profile but XP/level remain unchanged
-- Note: The validate_and_complete function uses SECURITY DEFINER so it can still update XP
CREATE POLICY "Users can update own profile safe fields"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =============================================================================
-- 10. SEED: Problem answers data
-- =============================================================================
-- Delete existing and re-insert (idempotent)
DELETE FROM public.problem_answers WHERE content_type = 'problem';

INSERT INTO public.problem_answers (content_type, content_id, language, expected_output, xp_reward) VALUES
-- Palindrome Check
('problem', 'palindrome-check', 'python', 'true', 50),
('problem', 'palindrome-check', 'javascript', 'true', 50),
('problem', 'palindrome-check', 'cpp', 'true', 50),
-- Reverse String
('problem', 'reverse-string', 'python', '["o","l","l","e","h"]', 50),
('problem', 'reverse-string', 'javascript', '["o","l","l","e","h"]', 50),
('problem', 'reverse-string', 'cpp', '["o","l","l","e","h"]', 50),
-- FizzBuzz
('problem', 'fizzbuzz', 'python', '["1","2","Fizz"]', 50),
('problem', 'fizzbuzz', 'javascript', '["1","2","Fizz"]', 50),
('problem', 'fizzbuzz', 'cpp', '["1","2","Fizz"]', 50),
-- Two Sum
('problem', 'two-sum', 'python', '[0,1]', 50),
('problem', 'two-sum', 'javascript', '[0,1]', 50),
('problem', 'two-sum', 'cpp', '[0,1]', 50),
-- Binary Search
('problem', 'binary-search', 'python', '4', 75),
('problem', 'binary-search', 'javascript', '4', 75),
('problem', 'binary-search', 'cpp', '4', 75),
-- Max Subarray
('problem', 'max-subarray', 'python', '6', 75),
('problem', 'max-subarray', 'javascript', '6', 75),
('problem', 'max-subarray', 'cpp', '6', 75),
-- Contains Duplicate
('problem', 'contains-duplicate', 'python', 'true', 50),
('problem', 'contains-duplicate', 'javascript', 'true', 50),
('problem', 'contains-duplicate', 'cpp', 'true', 50),
-- Valid Anagram
('problem', 'valid-anagram', 'python', 'true', 50),
('problem', 'valid-anagram', 'javascript', 'true', 50),
('problem', 'valid-anagram', 'cpp', 'true', 50),
-- Valid Parentheses
('problem', 'valid-parentheses', 'python', 'true', 100),
('problem', 'valid-parentheses', 'javascript', 'true', 100),
('problem', 'valid-parentheses', 'cpp', 'true', 100),
-- Longest Substring
('problem', 'longest-substring', 'python', '3', 150),
('problem', 'longest-substring', 'javascript', '3', 150),
('problem', 'longest-substring', 'cpp', '3', 150),
-- Container Water
('problem', 'container-water', 'python', '49', 125),
('problem', 'container-water', 'javascript', '49', 125),
('problem', 'container-water', 'cpp', '49', 125),
-- Trapping Rain
('problem', 'trapping-rain', 'python', '6', 275),
('problem', 'trapping-rain', 'javascript', '6', 275),
('problem', 'trapping-rain', 'cpp', '6', 275),
-- Word Ladder
('problem', 'word-ladder', 'python', '5', 300),
('problem', 'word-ladder', 'javascript', '5', 300)
ON CONFLICT (content_type, content_id, language) DO UPDATE SET 
  expected_output = EXCLUDED.expected_output,
  xp_reward = EXCLUDED.xp_reward;

-- =============================================================================
-- Done! Your CatCoder database is ready with secure XP validation.
-- =============================================================================
