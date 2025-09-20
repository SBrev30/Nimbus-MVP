import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  subscriptionTier: 'free' | 'premium' | 'pro';
  aiCreditsRemaining: number;
  preferences: Record<string, any>;
  createdAt: string;
}

export const userService = {
  /**
   * Get the current user's profile
   */
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const { data: authUser } = await supabase.auth.getUser();

      if (!authUser.user) {
        return null;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.user.id)
        .limit(1);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return null;
      }

      const profile = data[0];

      return {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
        subscriptionTier: profile.subscription_tier,
        aiCreditsRemaining: profile.ai_credits_remaining,
        preferences: profile.preferences,
        createdAt: profile.created_at
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  },
  
  /**
   * Get the user's first name
   */
  async getFirstName(): Promise<string> {
    try {
      const profile = await this.getCurrentUserProfile();
      
      if (!profile?.fullName) {
        return 'Writer';
      }
      
      // Extract first name from full name
      return profile.fullName.split(' ')[0];
    } catch (error) {
      console.error('Error getting first name:', error);
      return 'Writer';
    }
  },
  
  /**
   * Update the current user's profile
   */
  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data: authUser } = await supabase.auth.getUser();

      if (!authUser.user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          full_name: updates.fullName,
          avatar_url: updates.avatarUrl,
          preferences: updates.preferences
        })
        .eq('id', authUser.user.id)
        .select()
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        return null;
      }

      const profile = data[0];
      
      return {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
        subscriptionTier: profile.subscription_tier,
        aiCreditsRemaining: profile.ai_credits_remaining,
        preferences: profile.preferences,
        createdAt: profile.created_at
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  },
  
  /**
   * Get AI credits usage for the current user
   */
  async getAICreditsUsage(): Promise<number> {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      
      if (!authUser.user) {
        return 0;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('ai_credits_remaining')
        .eq('id', authUser.user.id)
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        return 0;
      }
      
      return data[0].ai_credits_remaining;
    } catch (error) {
      console.error('Error getting AI credits usage:', error);
      return 0;
    }
  },
  
  /**
   * Use AI credits for a specific operation
   */
  async useAICredits(amount: number, operationType: string): Promise<boolean> {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      
      if (!authUser.user) {
        return false;
      }

      // First, check if user has enough credits
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('ai_credits_remaining')
        .eq('id', authUser.user.id)
        .limit(1);
      
      if (userError) {
        throw userError;
      }
      
      if (!userData || userData.length === 0) {
        throw new Error('User profile not found');
      }
      
      if (userData[0].ai_credits_remaining < amount) {
        throw new Error('Insufficient AI credits');
      }
      
      // Update user's credits
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          ai_credits_remaining: userData[0].ai_credits_remaining - amount
        })
        .eq('id', authUser.user.id);
      
      if (updateError) {
        throw updateError;
      }
      
      // Log the usage
      const { error: usageError } = await supabase
        .from('ai_usage')
        .insert({
          user_id: authUser.user.id,
          analysis_type: operationType,
          tokens_used: amount
        });
      
      if (usageError) {
        console.error('Error logging AI usage:', usageError);
      }
      
      return true;
    } catch (error) {
      console.error('Error using AI credits:', error);
      return false;
    }
  }
};
