/*
  # Projects Table Creation
  
  1. New Tables
    - `projects` - Stores user writing projects with metadata
  
  2. Security
    - Enable RLS on `projects` table
    - Add policies for users to manage their own projects
    
  3. Indexes
    - Create indexes for user_id and status for better query performance
*/

-- Create projects table
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(status);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (FIXED: Now checks if policies exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'Users can view own projects'
  ) THEN
    CREATE POLICY "Users can view own projects" ON projects
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'Users can insert own projects'
  ) THEN
    CREATE POLICY "Users can insert own projects" ON projects
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'Users can update own projects'
  ) THEN
    CREATE POLICY "Users can update own projects" ON projects
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;

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

-- Note: The trigger "update_projects_updated_at" is handled by other migrations
