-- Add missing columns to plot_events table
-- This migration adds the required columns that the frontend expects

-- Add project_id column to plot_events table
ALTER TABLE plot_events
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

-- Add user_id column to plot_events table  
ALTER TABLE plot_events
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add chapter_id column to plot_events table
ALTER TABLE plot_events
ADD COLUMN IF NOT EXISTS chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL;

-- Update existing plot_events with project_id and user_id from their associated plot_threads
UPDATE plot_events pe
SET
    project_id = pt.project_id,
    user_id = pt.user_id
FROM plot_threads pt
WHERE pe.thread_id = pt.id
AND pe.project_id IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_plot_events_project_id ON plot_events(project_id);
CREATE INDEX IF NOT EXISTS idx_plot_events_user_id ON plot_events(user_id);
CREATE INDEX IF NOT EXISTS idx_plot_events_chapter_id ON plot_events(chapter_id);

-- Update RLS policies for plot_events to include proper access control
DROP POLICY IF EXISTS "Users can manage plot events for their threads" ON plot_events;

CREATE POLICY "Users can view plot events for their projects" ON plot_events
  FOR SELECT USING (
    user_id = auth.uid() OR
    thread_id IN (
      SELECT id FROM plot_threads WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert plot events for their projects" ON plot_events
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    (project_id IS NULL OR project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can update plot events for their projects" ON plot_events
  FOR UPDATE USING (
    user_id = auth.uid() OR
    thread_id IN (
      SELECT id FROM plot_threads WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete plot events for their projects" ON plot_events
  FOR DELETE USING (
    user_id = auth.uid() OR
    thread_id IN (
      SELECT id FROM plot_threads WHERE user_id = auth.uid()
    )
  );