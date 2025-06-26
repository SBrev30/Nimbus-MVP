/*
  # Create projects table with policy checks
  
  1. New Tables
    - `projects` - Stores user writing projects
  2. Changes
    - Creates indexes for performance
    - Enables RLS
    - Adds policies with existence checks
*/

-- Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  genre TEXT,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'writing', 'editing', 'complete', 'published')),
  word_count_target INTEGER DEFAULT 50000,
  word_count_current INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance if they don't exist
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(status);

-- Enable Row Level Security if not already enabled
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies with existence checks
DO $$
BEGIN
  -- Check if the SELECT policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'Users can view own projects'
  ) THEN
    CREATE POLICY "Users can view own projects" ON projects
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  -- Check if the INSERT policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'Users can insert own projects'
  ) THEN
    CREATE POLICY "Users can insert own projects" ON projects
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  -- Check if the UPDATE policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'Users can update own projects'
  ) THEN
    CREATE POLICY "Users can update own projects" ON projects
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  -- Check if the DELETE policy exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'Users can delete own projects'
  ) THEN
    CREATE POLICY "Users can delete own projects" ON projects
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END
$$;