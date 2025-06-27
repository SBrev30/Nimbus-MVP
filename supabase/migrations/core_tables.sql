/*
  # Core Tables Migration - Characters and Chapters
  
  This migration creates the missing core tables that are referenced
  by other migrations and application code.
  
  1. New Tables
    - `characters` - Character data for projects
    - `chapters` - Chapter content for projects
  
  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    
  3. Indexes
    - Create indexes for performance optimization
    
  Execute this migration in your Supabase database to resolve the
  "characters does not exist" error.
*/

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  personality_traits TEXT[] DEFAULT '{}',
  physical_description TEXT,
  backstory TEXT,
  role TEXT, -- protagonist, antagonist, supporting, etc.
  age INTEGER,
  occupation TEXT,
  completeness_score INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  character_data JSONB DEFAULT '{}', -- Flexible data storage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}', -- Rich text as JSON
  content_plain TEXT, -- Searchable plain text version
  word_count INTEGER DEFAULT 0,
  order_index INTEGER NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('outline', 'draft', 'revision', 'final')),
  characters_present UUID[] DEFAULT '{}',
  scene_count INTEGER DEFAULT 1,
  notes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, order_index)
);

-- Character relationships table (optional but useful)
CREATE TABLE IF NOT EXISTS character_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  character_a_id UUID REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
  character_b_id UUID REFERENCES characters(id) ON DELETE CASCADE NOT NULL,
  relationship_type TEXT NOT NULL, -- friend, enemy, family, romantic, etc.
  description TEXT,
  strength INTEGER DEFAULT 5 CHECK (strength BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(character_a_id, character_b_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS characters_project_id_idx ON characters(project_id);
CREATE INDEX IF NOT EXISTS characters_name_idx ON characters(name);
CREATE INDEX IF NOT EXISTS chapters_project_id_idx ON chapters(project_id);
CREATE INDEX IF NOT EXISTS chapters_order_idx ON chapters(project_id, order_index);
CREATE INDEX IF NOT EXISTS chapters_status_idx ON chapters(status);
CREATE INDEX IF NOT EXISTS character_relationships_project_idx ON character_relationships(project_id);

-- Enable Row Level Security
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_relationships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for characters
CREATE POLICY "Users can view characters from their projects" ON characters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = characters.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert characters in their projects" ON characters
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = characters.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update characters in their projects" ON characters
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = characters.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete characters from their projects" ON characters
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = characters.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for chapters
CREATE POLICY "Users can view chapters from their projects" ON chapters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = chapters.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert chapters in their projects" ON chapters
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = chapters.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update chapters in their projects" ON chapters
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = chapters.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete chapters from their projects" ON chapters
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = chapters.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for character_relationships
CREATE POLICY "Users can view character relationships from their projects" ON character_relationships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = character_relationships.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert character relationships in their projects" ON character_relationships
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = character_relationships.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update character relationships in their projects" ON character_relationships
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = character_relationships.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete character relationships from their projects" ON character_relationships
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = character_relationships.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Create triggers for updated_at (uses function from base_tables migration)
CREATE TRIGGER update_characters_updated_at
  BEFORE UPDATE ON characters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON chapters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON characters TO authenticated;
GRANT ALL ON chapters TO authenticated;
GRANT ALL ON character_relationships TO authenticated;
