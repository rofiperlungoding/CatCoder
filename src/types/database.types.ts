export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            active_sessions: {
                Row: {
                    created_at: string | null
                    device_hash: string
                    id: string
                    ip_address: unknown
                    last_active: string | null
                    user_agent: string | null
                    user_id: string
                }
                Insert: {
                    created_at?: string | null
                    device_hash: string
                    id?: string
                    ip_address?: unknown
                    last_active?: string | null
                    user_agent?: string | null
                    user_id: string
                }
                Update: {
                    created_at?: string | null
                    device_hash?: string
                    id?: string
                    ip_address?: unknown
                    last_active?: string | null
                    user_agent?: string | null
                    user_id?: string
                }
                Relationships: []
            }
            ai_usage_logs: {
                Row: {
                    content_id: string | null
                    created_at: string | null
                    feature: string
                    id: string
                    metadata: Json | null
                    model: string | null
                    tokens_used: number | null
                    user_id: string | null
                }
                Insert: {
                    content_id?: string | null
                    created_at?: string | null
                    feature: string
                    id?: string
                    metadata?: Json | null
                    model?: string | null
                    tokens_used?: number | null
                    user_id?: string | null
                }
                Update: {
                    content_id?: string | null
                    created_at?: string | null
                    feature?: string
                    id?: string
                    metadata?: Json | null
                    model?: string | null
                    tokens_used?: number | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "ai_usage_logs_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            problem_answers: {
                Row: {
                    content_id: string
                    content_type: string
                    created_at: string | null
                    expected_output: string
                    id: string
                    language: string
                    xp_reward: number
                }
                Insert: {
                    content_id: string
                    content_type: string
                    created_at?: string | null
                    expected_output: string
                    id?: string
                    language: string
                    xp_reward?: number
                }
                Update: {
                    content_id?: string
                    content_type?: string
                    created_at?: string | null
                    expected_output?: string
                    id?: string
                    language?: string
                    xp_reward?: number
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    created_at: string | null
                    id: string
                    last_activity_date: string | null
                    level: number | null
                    rank: string | null
                    streak_best: number | null
                    streak_current: number | null
                    updated_at: string | null
                    username: string
                    xp: number | null
                }
                Insert: {
                    avatar_url?: string | null
                    created_at?: string | null
                    id: string
                    last_activity_date?: string | null
                    level?: number | null
                    rank?: string | null
                    streak_best?: number | null
                    streak_current?: number | null
                    updated_at?: string | null
                    username: string
                    xp?: number | null
                }
                Update: {
                    avatar_url?: string | null
                    created_at?: string | null
                    id?: string
                    last_activity_date?: string | null
                    level?: number | null
                    rank?: string | null
                    streak_best?: number | null
                    streak_current?: number | null
                    updated_at?: string | null
                    username?: string
                    xp?: number | null
                }
                Relationships: []
            }
            security_logs: {
                Row: {
                    created_at: string | null
                    event_type: string
                    id: string
                    ip_address: unknown
                    metadata: Json | null
                    user_agent: string | null
                    user_id: string | null
                }
                Insert: {
                    created_at?: string | null
                    event_type: string
                    id?: string
                    ip_address?: unknown
                    metadata?: Json | null
                    user_agent?: string | null
                    user_id?: string | null
                }
                Update: {
                    created_at?: string | null
                    event_type?: string
                    id?: string
                    ip_address?: unknown
                    metadata?: Json | null
                    user_agent?: string | null
                    user_id?: string | null
                }
                Relationships: []
            }
            user_achievements: {
                Row: {
                    achievement_id: string
                    id: string
                    unlocked_at: string | null
                    user_id: string
                }
                Insert: {
                    achievement_id: string
                    id?: string
                    unlocked_at?: string | null
                    user_id: string
                }
                Update: {
                    achievement_id?: string
                    id?: string
                    unlocked_at?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "user_achievements_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            user_ai_reviews: {
                Row: {
                    alternatives: Json | null
                    code_snapshot: string | null
                    content_id: string
                    created_at: string | null
                    id: string
                    improvements: Json | null
                    rating: number | null
                    strengths: Json | null
                    tokens_used: number | null
                    user_id: string | null
                }
                Insert: {
                    alternatives?: Json | null
                    code_snapshot?: string | null
                    content_id: string
                    created_at?: string | null
                    id?: string
                    improvements?: Json | null
                    rating?: number | null
                    strengths?: Json | null
                    tokens_used?: number | null
                    user_id?: string | null
                }
                Update: {
                    alternatives?: Json | null
                    code_snapshot?: string | null
                    content_id?: string
                    created_at?: string | null
                    id?: string
                    improvements?: Json | null
                    rating?: number | null
                    strengths?: Json | null
                    tokens_used?: number | null
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "user_ai_reviews_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            user_progress: {
                Row: {
                    completed_at: string | null
                    content_id: string
                    content_type: string
                    created_at: string | null
                    duration_seconds: number | null
                    id: string
                    score: number | null
                    status: string | null
                    user_id: string
                }
                Insert: {
                    completed_at?: string | null
                    content_id: string
                    content_type: string
                    created_at?: string | null
                    duration_seconds?: number | null
                    id?: string
                    score?: number | null
                    status?: string | null
                    user_id: string
                }
                Update: {
                    completed_at?: string | null
                    content_id?: string
                    content_type?: string
                    created_at?: string | null
                    duration_seconds?: number | null
                    id?: string
                    score?: number | null
                    status?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "user_progress_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            user_skills: {
                Row: {
                    confidence: number | null
                    id: string
                    last_assessed_at: string | null
                    proficiency: number | null
                    skill_name: string
                    user_id: string | null
                }
                Insert: {
                    confidence?: number | null
                    id?: string
                    last_assessed_at?: string | null
                    proficiency?: number | null
                    skill_name: string
                    user_id?: string | null
                }
                Update: {
                    confidence?: number | null
                    id?: string
                    last_assessed_at?: string | null
                    proficiency?: number | null
                    skill_name?: string
                    user_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "user_skills_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            calculate_level: { Args: { p_xp: number }; Returns: number }
            calculate_rank: { Args: { p_xp: number }; Returns: string }
            get_server_time: { Args: never; Returns: Json }
            invalidate_all_sessions: { Args: never; Returns: Json }
            log_security_event: {
                Args: { p_event_type: string; p_metadata?: Json }
                Returns: Json
            }
            log_app_error: {
                Args: {
                    p_area: string
                    p_message: string
                    p_stack?: string | null
                    p_component_stack?: string | null
                    p_user_id?: string | null
                    p_extra?: Json
                }
                Returns: string
            }
            register_device_session: {
                Args: { p_device_hash: string; p_user_agent?: string }
                Returns: Json
            }
            submit_completion: {
                Args: {
                    p_content_id: string
                    p_content_type: string
                    p_duration_seconds?: number
                    p_language: string
                }
                Returns: Json
            }
            validate_and_complete: {
                Args: {
                    p_content_id: string
                    p_content_type: string
                    p_duration_seconds?: number
                    p_language: string
                    p_user_output: string
                }
                Returns: Json
            }
            verify_device_fingerprint: {
                Args: { p_device_hash: string }
                Returns: Json
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
