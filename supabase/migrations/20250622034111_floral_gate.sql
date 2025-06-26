/*
  # Chapter Management System

  1. New Tables
    - `chapters` - Stores chapter data for projects
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key to projects)
      - `title` (text)
      - `content` (text)
      - `summary` (text)
      - `word_count` (integer)
      - `order_index` (integer)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `chapters` table
    - Add policies for authenticated users to manage their own chapters
*/

-- Create chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  summary TEXT,
  word_count INTEGER DEFAULT 0,
  order_index INTEGER NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('outline', 'draft', 'revision', 'final')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_chapters_updated_at'
  ) THEN
    CREATE TRIGGER update_chapters_updated_at
      BEFORE UPDATE ON chapters
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

-- Create indexes for performance
CREATE INDEX chapters_project_id_idx ON chapters(project_id);
CREATE INDEX chapters_order_index_idx ON chapters(order_index);

-- Enable Row Level Security
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own chapters" ON chapters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = chapters.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own chapters" ON chapters
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = chapters.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own chapters" ON chapters
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = chapters.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own chapters" ON chapters
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = chapters.project_id
      AND projects.user_id = auth.uid()
    )
  );