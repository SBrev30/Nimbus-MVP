-- Migration: Fix characters and chapters tables - add missing user_id columns
-- Date: 2024-12-30
-- Purpose: Resolve "characters does not exist" error in Bolt.new by adding user_id columns

-- Add user_id column to characters table if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'characters' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.characters 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add user_id column to chapters table if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'chapters' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.chapters 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Populate user_id for existing records based on project ownership
UPDATE public.characters 
SET user_id = (
    SELECT projects.user_id 
    FROM projects 
    WHERE projects.id = characters.project_id
)
WHERE user_id IS NULL AND project_id IS NOT NULL;

UPDATE public.chapters 
SET user_id = (
    SELECT projects.user_id 
    FROM projects 
    WHERE projects.id = chapters.project_id
)
WHERE user_id IS NULL AND project_id IS NOT NULL;

-- Ensure RLS is enabled (safe to run multiple times)
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON public.characters(user_id);
CREATE INDEX IF NOT EXISTS idx_chapters_user_id ON public.chapters(user_id);
