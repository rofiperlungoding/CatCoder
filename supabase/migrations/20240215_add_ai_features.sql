-- AI Usage Tracking
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    feature text NOT NULL CHECK (feature IN ('hint', 'review', 'insight', 'chat')),
    content_id text, -- lesson_id or challenge_id
    tokens_used integer DEFAULT 0,
    model text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- AI Code Reviews History
CREATE TABLE IF NOT EXISTS public.user_ai_reviews (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_id text NOT NULL,
    code_snapshot text,
    rating integer CHECK (rating BETWEEN 1 AND 5),
    strengths jsonb DEFAULT '[]'::jsonb,
    improvements jsonb DEFAULT '[]'::jsonb,
    alternatives jsonb DEFAULT '[]'::jsonb,
    tokens_used integer,
    created_at timestamp with time zone DEFAULT now()
);

-- User Skill Proficiency
CREATE TABLE IF NOT EXISTS public.user_skills (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    skill_name text NOT NULL,
    proficiency integer DEFAULT 0 CHECK (proficiency BETWEEN 0 AND 100),
    confidence integer DEFAULT 0 CHECK (confidence BETWEEN 0 AND 100),
    last_assessed_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, skill_name)
);

-- RLS Policies
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ai_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

-- AI Usage Logs: Users can view their own usage
CREATE POLICY "Users can view own usage logs" ON public.ai_usage_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage logs" ON public.ai_usage_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Code Reviews: Users can view and create their own reviews
CREATE POLICY "Users can view own code reviews" ON public.user_ai_reviews
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own code reviews" ON public.user_ai_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Skills: Users can view their own skills
CREATE POLICY "Users can view own skills" ON public.user_skills
    FOR SELECT USING (auth.uid() = user_id);

-- Only system/functions should ideally update skills, but for now allow user updates via client
CREATE POLICY "Users can update own skills" ON public.user_skills
    FOR ALL USING (auth.uid() = user_id);
