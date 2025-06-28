import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, checkDatabaseHealth, logSupabaseError } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
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
    // Check for active session on mount
    const checkSession = async () => {
      try {
        // First check database health
        const isHealthy = await checkDatabaseHealth();
        if (!isHealthy) {
          throw new Error('Database connection failed. Please try again later.');
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        
        if (data?.session) {
          const { data: userData } = await supabase.auth.getUser();
          setUser(userData.user);
        }
      } catch (error: any) {
        console.error('Error checking session:', error.message);
        logSupabaseError(error, 'session_check');
        setError(error.message);
      } finally {
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
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    
    try {
      // Pre-flight database check
      const isHealthy = await checkDatabaseHealth();
      if (!isHealthy) {
        throw new Error('Database connection failed. Please try again later.');
      }

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
      // Pre-flight checks
      const isHealthy = await checkDatabaseHealth();
      if (!isHealthy) {
        throw new Error('Database connection failed. Please try again later.');
      }

      // Validate inputs
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
      case 'Database error saving new user':
      case 'unexpected_failure':
        return 'Database error occurred. Our team has been notified. Please try again in a few minutes.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};