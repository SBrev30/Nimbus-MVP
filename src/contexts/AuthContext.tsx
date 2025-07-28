import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, logSupabaseError } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for active session on mount - COMPLETELY NON-BLOCKING
    const checkSession = async () => {
      try {
        // NO DATABASE HEALTH CHECK - Just get auth session directly
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session error:', error);
          throw error;
        }
        
        if (data?.session) {
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (userError) {
            console.error('User data error:', userError);
            throw userError;
          }
          setUser(userData.user);
        }
      } catch (error: any) {
        console.error('Error checking session:', error.message);
        logSupabaseError(error, 'session_check');
        setError(error.message);
      } finally {
        // ALWAYS set loading to false regardless of success/failure
        setLoading(false);
      }
    };

    checkSession();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          setUser(session.user);
          
          // Create or update user profile - COMPLETELY OPTIONAL AND NON-BLOCKING
          if (event === 'SIGNED_IN' || event === 'SIGNED_UP') {
            // Run profile creation in background - don't await or block on this
            createUserProfileInBackground(session.user);
          }
        } else {
          setUser(null);
        }
        
        // ALWAYS set loading to false
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Background user profile creation - completely non-blocking
  const createUserProfileInBackground = (user: User) => {
    // Run this asynchronously without blocking auth
    setTimeout(async () => {
      try {
        if (!user.email) {
          console.warn('Skipping profile creation - no email available');
          return;
        }

        const profileData = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || null,
          updated_at: new Date().toISOString()
        };

        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert(profileData, {
            onConflict: 'id'
          });

        if (profileError) {
          console.warn('Profile creation failed (non-critical):', profileError);
        } else {
          console.log('User profile created/updated successfully');
        }
      } catch (error) {
        console.warn('Background profile creation error (non-critical):', error);
      }
    }, 100); // Small delay to ensure auth completes first
  };

  const signIn = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    
    try {
      // NO PRE-FLIGHT CHECKS - Direct sign in
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        logSupabaseError(error, 'sign_in');
        setError(getErrorMessage(error));
        return { error };
      }
      
      return { error: null };
    } catch (error: any) {
      logSupabaseError(error, 'sign_in_exception');
      setError(error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setError(null);
    setLoading(true);
    
    try {
      // Validate inputs only - no database checks
      if (!email || !password || !fullName) {
        throw new Error('Please fill in all required fields.');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long.');
      }

      console.log('Attempting signup for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) {
        console.error('Signup error:', error);
        logSupabaseError(error, 'sign_up');
        setError(getErrorMessage(error));
        return { error };
      }

      console.log('Signup successful:', data);
      
      return { error: null };
    } catch (error: any) {
      console.error('Signup exception:', error);
      logSupabaseError(error, 'sign_up_exception');
      setError(error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      logSupabaseError(error, 'sign_out');
      setError(error.message);
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    
    try {
      if (!email || !email.trim()) {
        throw new Error('Email address is required');
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        logSupabaseError(error, 'reset_password');
        setError(getErrorMessage(error));
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      logSupabaseError(error, 'reset_password_exception');
      setError(error.message);
      return { error };
    }
  };

  const updatePassword = async (password: string) => {
    setError(null);
    
    try {
      if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      }

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        logSupabaseError(error, 'update_password');
        setError(getErrorMessage(error));
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      logSupabaseError(error, 'update_password_exception');
      setError(error.message);
      return { error };
    }
  };

  // Helper function to get user-friendly error messages
  const getErrorMessage = (error: any): string => {
    switch (error.code || error.message) {
      case 'invalid_credentials':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'email_not_confirmed':
        return 'Please check your email and click the confirmation link before signing in.';
      case 'signup_disabled':
        return 'New user registration is currently disabled. Please contact support.';
      case 'too_many_requests':
        return 'Too many attempts. Please wait a few minutes before trying again.';
      case 'weak_password':
        return 'Password is too weak. Please choose a stronger password.';
      case 'user_already_exists':
        return 'An account with this email already exists. Try signing in instead.';
      case 'user_not_found':
        return 'No account found with this email address. Please check your email or sign up for a new account.';
      case 'email_address_invalid':
        return 'Please enter a valid email address.';
      case 'rate_limit_exceeded':
        return 'Too many password reset requests. Please wait before trying again.';
      case 'Database error saving new user':
      case 'unexpected_failure':
        return 'Database error occurred. Our team has been notified. Please try again in a few minutes.';
      default:
        // Handle common auth error patterns
        if (error.message?.includes('Invalid login credentials')) {
          return 'Invalid email or password. Please check your credentials and try again.';
        }
        if (error.message?.includes('Email not confirmed')) {
          return 'Please check your email and click the confirmation link before signing in.';
        }
        if (error.message?.includes('Password should be at least')) {
          return 'Password must be at least 8 characters long.';
        }
        if (error.message?.includes('rate limit')) {
          return 'Too many attempts. Please wait a few minutes before trying again.';
        }
        
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};