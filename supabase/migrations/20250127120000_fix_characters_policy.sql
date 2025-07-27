-- Migration: Fix Characters RLS Policy
-- Date: 2025-01-27
-- Purpose: Safely create characters RLS policy without conflicts
-- Fixes error: policy "Users can manage their characters" for table "characters" already exists

-- Ensure RLS is enabled on characters table
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- Create policy only if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'characters' 
        AND policyname = 'Users can manage their characters'
    ) THEN
        CREATE POLICY "Users can manage their characters" ON characters
        FOR ALL USING (user_id = auth.uid());
        RAISE NOTICE 'Created policy: Users can manage their characters';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can manage their characters';
    END IF;
END $$;
