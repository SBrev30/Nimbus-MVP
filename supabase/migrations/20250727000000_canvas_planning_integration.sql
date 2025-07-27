/*
  # Complete Canvas Planning Integration Migration
  
  This migration implements all required database updates for the Canvas Planning Integration system.
  It safely adds missing tables and enhances existing ones without breaking current data.
  
  Tables Created/Enhanced:
  - Enhanced characters table with Canvas Planning Integration fields
  - plot_threads table for advanced plot management
  - plot_events table for detailed plot event tracking
  - world_elements table for comprehensive world building
  - locations table for Canvas Planning Integration location nodes
  - Enhanced chapters table with Canvas Planning Integration fields
  
  Security:
  - Row Level Security policies for all tables
  - Storage bucket and policies for world building images
  
  Performance:
  - Optimized indexes for all new tables
  - Update triggers for timestamp management
*/

-- =====================================================
-- 1. ENHANCE EXISTING CHARACTERS TABLE
-- =====================================================

-- Add missing Canvas Planning Integration fields to characters table
DO $$
BEGIN
  -- Add user_id if it doesn't exist (critical for RLS)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'characters' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE characters ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    
    -- Backfill user_id from project ownership (if projects table has user_id)
    UPDATE characters 
    SET user_id = projects.user_id 
    FROM projects 
    WHERE characters.project_id = projects.id 
    AND characters.user_id IS NULL;
    
    -- Make user_id NOT NULL after backfill
    ALTER TABLE characters ALTER COLUMN user_id SET NOT NULL;
  END IF;

  -- Add Canvas Planning Integration fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'background') THEN
    ALTER TABLE characters ADD COLUMN background TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'traits') THEN
    ALTER TABLE characters ADD COLUMN traits TEXT[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'motivation') THEN
    ALTER TABLE characters ADD COLUMN motivation TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'appearance') THEN
    ALTER TABLE characters ADD COLUMN appearance TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'personality') THEN
    ALTER TABLE characters ADD COLUMN personality TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'fantasy_class') THEN
    ALTER TABLE characters ADD COLUMN fantasy_class TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'traits_jsonb') THEN
    ALTER TABLE characters ADD COLUMN traits_jsonb JSONB DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'relationships') THEN
    ALTER TABLE characters ADD COLUMN relationships JSONB DEFAULT '{}';
  END IF;
END $$;

-- Update role constraint to include 'other' for compatibility
ALTER TABLE characters DROP CONSTRAINT IF EXISTS characters_role_check;
ALTER TABLE characters ADD CONSTRAINT characters_role_check 
CHECK (role IN ('protagonist', 'antagonist', 'supporting', 'minor', 'other'));

-- =====================================================
-- 2. CREATE PLOT MANAGEMENT TABLES
-- =====================================================

-- Plot threads table for advanced plot management
CREATE TABLE IF NOT EXISTS plot_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  thread_type TEXT NOT NULL DEFAULT 'main' CHECK (thread_type IN ('main', 'subplot', 'character_arc', 'side_story')),
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'completed', 'on_hold')),
  color TEXT DEFAULT '#3B82F6',
  start_tension INTEGER DEFAULT 1 CHECK (start_tension BETWEEN 1 AND 10),
  peak_tension INTEGER DEFAULT 7 CHECK (peak_tension BETWEEN 1 AND 10),
  end_tension INTEGER DEFAULT 2 CHECK (end_tension BETWEEN 1 AND 10),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  connected_character_ids UUID[] DEFAULT '{}',
  connected_thread_ids UUID[] DEFAULT '{}',
  tension_curve JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plot events table for detailed plot event tracking
CREATE TABLE IF NOT EXISTS plot_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES plot_threads(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
  tension_level INTEGER DEFAULT 5 CHECK (tension_level BETWEEN 1 AND 10),
  event_type TEXT DEFAULT 'scene' CHECK (event_type IN ('setup', 'conflict', 'climax', 'resolution', 'scene', 'revelation')),
  order_index INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. CREATE WORLD BUILDING TABLES
-- =====================================================

-- World elements table for comprehensive world building
CREATE TABLE IF NOT EXISTS world_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('location', 'culture', 'technology', 'economy', 'hierarchy')),
  description TEXT NOT NULL,
  details TEXT,
  tags TEXT[] DEFAULT '{}',
  image_urls TEXT[] DEFAULT '{}',
  connections JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locations table for Canvas Planning Integration location nodes
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  geography TEXT,
  culture TEXT,
  climate TEXT,
  population TEXT,
  government TEXT,
  economy TEXT,
  connected_character_ids UUID[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. ENHANCE EXISTING CHAPTERS TABLE
-- =====================================================

-- Add Canvas Planning Integration fields to chapters
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chapters' AND column_name = 'type') THEN
    ALTER TABLE chapters ADD COLUMN type TEXT CHECK (type IN ('event', 'twist', 'climax', 'resolution', 'rising_action', 'falling_action'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chapters' AND column_name = 'significance') THEN
    ALTER TABLE chapters ADD COLUMN significance TEXT CHECK (significance IN ('low', 'medium', 'high', 'critical'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chapters' AND column_name = 'chapter_number') THEN
    ALTER TABLE chapters ADD COLUMN chapter_number INTEGER;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chapters' AND column_name = 'description') THEN
    ALTER TABLE chapters ADD COLUMN description TEXT;
  END IF;
  
  -- Add "order" column (quoted because it's a reserved word)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chapters' AND column_name = 'order') THEN
    ALTER TABLE chapters ADD COLUMN "order" INTEGER;
  END IF;
END $$;

-- =====================================================
-- 5. CREATE PERFORMANCE INDEXES
-- =====================================================

-- Plot threads indexes
CREATE INDEX IF NOT EXISTS plot_threads_project_id_idx ON plot_threads(project_id);
CREATE INDEX IF NOT EXISTS plot_threads_user_id_idx ON plot_threads(user_id);
CREATE INDEX IF NOT EXISTS plot_threads_type_idx ON plot_threads(thread_type);
CREATE INDEX IF NOT EXISTS plot_threads_status_idx ON plot_threads(status);

-- Plot events indexes
CREATE INDEX IF NOT EXISTS plot_events_thread_id_idx ON plot_events(thread_id);
CREATE INDEX IF NOT EXISTS plot_events_project_id_idx ON plot_events(project_id);
CREATE INDEX IF NOT EXISTS plot_events_user_id_idx ON plot_events(user_id);
CREATE INDEX IF NOT EXISTS plot_events_chapter_id_idx ON plot_events(chapter_id);
CREATE INDEX IF NOT EXISTS plot_events_order_idx ON plot_events(thread_id, order_index);

-- World elements indexes
CREATE INDEX IF NOT EXISTS world_elements_project_id_idx ON world_elements(project_id);
CREATE INDEX IF NOT EXISTS world_elements_user_id_idx ON world_elements(user_id);
CREATE INDEX IF NOT EXISTS world_elements_category_idx ON world_elements(category);
CREATE INDEX IF NOT EXISTS world_elements_title_idx ON world_elements(title);

-- Locations indexes
CREATE INDEX IF NOT EXISTS locations_project_id_idx ON locations(project_id);
CREATE INDEX IF NOT EXISTS locations_user_id_idx ON locations(user_id);
CREATE INDEX IF NOT EXISTS locations_name_idx ON locations(name);

-- Enhanced character indexes
CREATE INDEX IF NOT EXISTS characters_user_id_idx ON characters(user_id);
CREATE INDEX IF NOT EXISTS characters_role_idx ON characters(role);

-- =====================================================
-- 6. ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE plot_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE plot_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. CREATE RLS POLICIES
-- =====================================================

-- Plot threads policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'plot_threads' AND policyname = 'Users can manage their plot threads') THEN
    CREATE POLICY "Users can manage their plot threads" ON plot_threads
      FOR ALL USING (user_id = auth.uid());
  END IF;
END $$;

-- Plot events policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'plot_events' AND policyname = 'Users can manage their plot events') THEN
    CREATE POLICY "Users can manage their plot events" ON plot_events
      FOR ALL USING (user_id = auth.uid());
  END IF;
END $$;

-- World elements policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'world_elements' AND policyname = 'Users can manage their world elements') THEN
    CREATE POLICY "Users can manage their world elements" ON world_elements
      FOR ALL USING (user_id = auth.uid());
  END IF;
END $$;

-- Locations policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'locations' AND policyname = 'Users can manage their locations') THEN
    CREATE POLICY "Users can manage their locations" ON locations
      FOR ALL USING (user_id = auth.uid());
  END IF;
END $$;

-- Update characters RLS policies to use user_id if needed
DO $$
BEGIN
  -- Drop existing policies if they exist and recreate with user_id
  DROP POLICY IF EXISTS "Users can view characters from their projects" ON characters;
  DROP POLICY IF EXISTS "Users can insert characters in their projects" ON characters;
  DROP POLICY IF EXISTS "Users can update characters in their projects" ON characters;
  DROP POLICY IF EXISTS "Users can delete characters from their projects" ON characters;
  
  -- Create simplified user_id based policies
  CREATE POLICY "Users can manage their characters" ON characters
    FOR ALL USING (user_id = auth.uid());
END $$;

-- =====================================================
-- 8. CREATE UPDATE TRIGGERS
-- =====================================================

-- Ensure update_updated_at_column function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create update triggers for new tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_plot_threads_updated_at') THEN
    CREATE TRIGGER update_plot_threads_updated_at
      BEFORE UPDATE ON plot_threads
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_plot_events_updated_at') THEN
    CREATE TRIGGER update_plot_events_updated_at
      BEFORE UPDATE ON plot_events
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_world_elements_updated_at') THEN
    CREATE TRIGGER update_world_elements_updated_at
      BEFORE UPDATE ON world_elements
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_locations_updated_at') THEN
    CREATE TRIGGER update_locations_updated_at
      BEFORE UPDATE ON locations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- =====================================================
-- 9. STORAGE BUCKET FOR WORLD BUILDING IMAGES
-- =====================================================

-- Create storage bucket for world building images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'world-building-images', 
  'world-building-images', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for world building images
DO $$
BEGIN
  -- Users can upload their own images
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can upload world building images') THEN
    CREATE POLICY "Users can upload world building images" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'world-building-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  -- Users can view all world building images (public bucket)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can view world building images') THEN
    CREATE POLICY "Users can view world building images" ON storage.objects
      FOR SELECT USING (bucket_id = 'world-building-images');
  END IF;

  -- Users can delete their own images
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can delete their world building images') THEN
    CREATE POLICY "Users can delete their world building images" ON storage.objects
      FOR DELETE USING (
        bucket_id = 'world-building-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;

-- =====================================================
-- 10. GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT ALL ON plot_threads TO authenticated;
GRANT ALL ON plot_events TO authenticated;
GRANT ALL ON world_elements TO authenticated;
GRANT ALL ON locations TO authenticated;

-- Grant usage on sequences if they exist
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- 11. CREATE HELPER FUNCTIONS (OPTIONAL)
-- =====================================================

-- Function to calculate character completeness score
CREATE OR REPLACE FUNCTION calculate_character_completeness(character_row characters)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  -- Basic info (40% of total score)
  IF character_row.name IS NOT NULL AND trim(character_row.name) != '' THEN
    score := score + 15;
  END IF;
  
  IF character_row.description IS NOT NULL AND length(trim(character_row.description)) > 20 THEN
    score := score + 15;
  END IF;
  
  IF character_row.role IS NOT NULL THEN
    score := score + 10;
  END IF;

  -- Extended info (40% of total score)
  IF character_row.background IS NOT NULL AND length(trim(character_row.background)) > 50 THEN
    score := score + 20;
  END IF;
  
  IF character_row.traits IS NOT NULL AND array_length(character_row.traits, 1) > 0 THEN
    score := score + 20;
  END IF;

  -- Tags and organization (20% of total score)
  IF character_row.tags IS NOT NULL AND array_length(character_row.tags, 1) > 0 THEN
    score := score + 20;
  END IF;

  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- Function to update character completeness score
CREATE OR REPLACE FUNCTION update_character_completeness()
RETURNS TRIGGER AS $$
BEGIN
  NEW.completeness_score := calculate_character_completeness(NEW);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update completeness score
DROP TRIGGER IF EXISTS character_completeness_trigger ON characters;
CREATE TRIGGER character_completeness_trigger
  BEFORE INSERT OR UPDATE ON characters
  FOR EACH ROW EXECUTE FUNCTION update_character_completeness();

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

/*
  Migration Summary:
  
  ✅ Enhanced characters table with Canvas Planning Integration fields
  ✅ Created plot_threads table for advanced plot management
  ✅ Created plot_events table for detailed plot event tracking
  ✅ Created world_elements table for comprehensive world building
  ✅ Created locations table for Canvas Planning Integration
  ✅ Enhanced chapters table with Canvas Planning Integration fields
  ✅ Created performance indexes for all tables
  ✅ Enabled Row Level Security with proper policies
  ✅ Created storage bucket for world building images
  ✅ Added update triggers for timestamp management
  ✅ Granted proper permissions to authenticated users
  ✅ Added helper functions for character completeness scoring
  
  Your Canvas Planning Integration system is now fully supported!
*/