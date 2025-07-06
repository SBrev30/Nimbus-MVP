import { createClient } from '@supabase/supabase-js'

// Validate environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(`
    Missing Supabase environment variables.
    Please check your .env file contains:
    - VITE_SUPABASE_URL=${supabaseUrl ? '✓' : '✗ MISSING'}
    - VITE_SUPABASE_ANON_KEY=${supabaseKey ? '✓' : '✗ MISSING'}
  `)
}

// Enhanced client configuration with better error handling
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: import.meta.env.DEV
  },
  global: {
    headers: {
      'x-client-info': 'nimbus-mvp@1.0.0'
    }
  }
})

// Database health check function
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1)

    if (error) {
      console.error('Database health check failed:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Enhanced error logging
export function logSupabaseError(error: any, context: string) {
  const errorInfo = {
    context,
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      status: error.status
    },
    url: typeof window !== 'undefined' ? window.location.href : 'server-side'
  }

  console.error('Supabase Error:', errorInfo)
  
  // In production, you could send this to a monitoring service
  if (import.meta.env.PROD) {
    // TODO: Send to error monitoring service (Sentry, LogRocket, etc.)
  }
}

// Types for our simplified schema
export interface ImportedItem {
  id: string
  title: string
  content: string
  content_type: 'character' | 'plot' | 'research' | 'chapter'
  word_count: number
  created_at: string
}

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  subscription_tier: 'free' | 'premium' | 'pro'
  ai_credits_remaining: number
  created_at: string
}

export interface ItemTag {
  id: string
  item_id: string
  tag_name: string
  created_at: string
}

export interface CanvasItem {
  id: string
  item_id: string
  position_x: number
  position_y: number
  created_at: string
}