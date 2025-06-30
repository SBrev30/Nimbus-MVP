/*
  # Cleanup Migration - Remove Duplicate Core Tables Migration
  
  This migration cleans up duplicate policies and ensures that the character_relationships
  table policies don't conflict between different migration files.
  
  1. Drop and recreate policies with proper existence checks
  2. Ensure consistent policy names across all tables
  3. Clean up any potential conflicts from duplicate migrations
*/

-- First, let's ensure the character_relationships table exists before working with its policies
DO $$
BEGIN
  -- Only proceed if the table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'character_relationships') THEN
    
    -- Drop all existing policies for character_relationships to avoid conflicts
    DROP POLICY IF EXISTS "Users can view character relationships from their projects" ON character_relationships;
    DROP POLICY IF EXISTS "Users can insert character relationships in their projects" ON character_relationships;
    DROP POLICY IF EXISTS "Users can update character relationships in their projects" ON character_relationships;
    DROP POLICY IF EXISTS "Users can delete character relationships from their projects" ON character_relationships;
    
    -- Recreate policies with consistent naming
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
      
  END IF;
END
$$;

-- Ensure all tables have proper permissions
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'characters') THEN
    GRANT ALL ON characters TO authenticated;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chapters') THEN
    GRANT ALL ON chapters TO authenticated;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'character_relationships') THEN
    GRANT ALL ON character_relationships TO authenticated;
  END IF;
END
$$;
