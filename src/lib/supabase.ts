import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

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
