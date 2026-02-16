import { supabase } from '../../lib/supabase';
import type { Database, Json } from '../../types/database.types';
import type { AICodeReviewResponse } from './types';

// Types derived from DB for insertion
type AIUsageLog = Database['public']['Tables']['ai_usage_logs']['Insert'];
type UserAIReview = Database['public']['Tables']['user_ai_reviews']['Insert'];
// UserSkill type definition removed as it was unused and caused lint errors

export const aiPersistence = {
    /**
     * Log AI usage for tracking and analysis
     */
    async logUsage(usage: AIUsageLog) {
        const { error } = await supabase
            .from('ai_usage_logs')
            .insert(usage);

        if (error) {
            console.error('Failed to log AI usage:', error);
            // Don't throw, usage logging shouldn't break the app
        }
    },

    /**
     * Save a generated code review
     */
    async saveCodeReview(
        userId: string,
        contentId: string,
        snapshot: string,
        review: AICodeReviewResponse
    ) {
        const dbReview: UserAIReview = {
            user_id: userId,
            content_id: contentId,
            code_snapshot: snapshot,
            rating: review.rating,
            strengths: review.strengths as unknown as Json,
            improvements: review.improvements as unknown as Json,
            alternatives: review.alternatives as unknown as Json,
            tokens_used: review.tokensUsed
        };

        const { error } = await supabase
            .from('user_ai_reviews')
            .insert(dbReview);

        if (error) {
            console.error('Failed to save AI review:', error);
            throw error;
        }
    },

    /**
     * Get user skills and proficiencies
     */
    async getUserSkills(userId: string) {
        const { data, error } = await supabase
            .from('user_skills')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            console.error('Failed to fetch user skills:', error);
            return [];
        }

        return data;
    },

    /**
     * Update or insert a user skill proficiency
     */
    async updateUserSkill(
        userId: string,
        skillName: string,
        proficiency: number,
        confidence: number = 50
    ) {
        const { error } = await supabase
            .from('user_skills')
            .upsert({
                user_id: userId,
                skill_name: skillName,
                proficiency,
                confidence,
                last_assessed_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,skill_name'
            });

        if (error) {
            console.error('Failed to update user skill:', error);
        }
    }
};
