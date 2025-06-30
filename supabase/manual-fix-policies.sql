-- MANUAL FIX for Supabase Policy Conflict Error
-- Run this script in your Supabase SQL Editor if migrations are still failing

-- Step 1: Drop all existing policies for character_relationships to clear conflicts
DROP POLICY IF EXISTS "Users can view character relationships from their projects" ON character_relationships;
DROP POLICY IF EXISTS "Users can insert character relationships in their projects" ON character_relationships;
DROP POLICY IF EXISTS "Users can update character relationships in their projects" ON character_relationships;
DROP POLICY IF EXISTS "Users can delete character relationships from their projects" ON character_relationships;

-- Step 2: Recreate the policies cleanly
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

-- Step 3: Ensure all tables have proper permissions
GRANT ALL ON characters TO authenticated;
GRANT ALL ON chapters TO authenticated;
GRANT ALL ON character_relationships TO authenticated;

-- Step 4: Verify the fix by checking policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('characters', 'chapters', 'character_relationships')
ORDER BY tablename, policyname;
