/*
  # Enhanced Auto-Save System Migration
  
  This migration adds comprehensive auto-save functionality including:
  1. Auto-save specific columns to chapters table
  2. Auto-save sessions tracking table
  3. Content drafts table for version history
  4. Optimized functions for auto-save operations
  5. Automatic cleanup mechanisms
  6. Performance indexes and RLS policies
  
  Execute this migration after your base tables are created.
*/

-- Add auto-save specific columns to chapters table
ALTER TABLE chapters 
ADD COLUMN IF NOT EXISTS auto_saved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS manual_saved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS save_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_editor_id UUID REFERENCES auth.users(id);

-- Create auto-save sessions table for tracking user sessions
CREATE TABLE IF NOT EXISTS auto_save_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  session_start TIMESTAMPTZ DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  total_saves INTEGER DEFAULT 0,
  total_words_added INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create content_drafts table for version history and recovery
CREATE TABLE IF NOT EXISTS content_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  title TEXT,
  word_count INTEGER DEFAULT 0,
  save_type TEXT DEFAULT 'auto' CHECK (save_type IN ('auto', 'manual', 'backup')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS chapters_auto_saved_at_idx ON chapters(auto_saved_at);
CREATE INDEX IF NOT EXISTS chapters_manual_saved_at_idx ON chapters(manual_saved_at);
CREATE INDEX IF NOT EXISTS chapters_last_editor_idx ON chapters(last_editor_id);
CREATE INDEX IF NOT EXISTS chapters_save_count_idx ON chapters(save_count);

CREATE INDEX IF NOT EXISTS auto_save_sessions_user_id_idx ON auto_save_sessions(user_id);
CREATE INDEX IF NOT EXISTS auto_save_sessions_chapter_id_idx ON auto_save_sessions(chapter_id);
CREATE INDEX IF NOT EXISTS auto_save_sessions_project_id_idx ON auto_save_sessions(project_id);
CREATE INDEX IF NOT EXISTS auto_save_sessions_start_idx ON auto_save_sessions(session_start);

CREATE INDEX IF NOT EXISTS content_drafts_chapter_id_idx ON content_drafts(chapter_id);
CREATE INDEX IF NOT EXISTS content_drafts_user_id_idx ON content_drafts(user_id);
CREATE INDEX IF NOT EXISTS content_drafts_created_at_idx ON content_drafts(created_at);
CREATE INDEX IF NOT EXISTS content_drafts_save_type_idx ON content_drafts(save_type);
CREATE INDEX IF NOT EXISTS content_drafts_chapter_user_idx ON content_drafts(chapter_id, user_id);
CREATE INDEX IF NOT EXISTS chapters_project_updated_idx ON chapters(project_id, updated_at);

-- Enable RLS on new tables
ALTER TABLE auto_save_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_drafts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for auto_save_sessions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'auto_save_sessions' AND policyname = 'Users can view own auto-save sessions') THEN
    CREATE POLICY "Users can view own auto-save sessions" ON auto_save_sessions FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'auto_save_sessions' AND policyname = 'Users can insert own auto-save sessions') THEN
    CREATE POLICY "Users can insert own auto-save sessions" ON auto_save_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'auto_save_sessions' AND policyname = 'Users can update own auto-save sessions') THEN
    CREATE POLICY "Users can update own auto-save sessions" ON auto_save_sessions FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END
$$;

-- RLS Policies for content_drafts
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'content_drafts' AND policyname = 'Users can view own content drafts') THEN
    CREATE POLICY "Users can view own content drafts" ON content_drafts FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'content_drafts' AND policyname = 'Users can insert own content drafts') THEN
    CREATE POLICY "Users can insert own content drafts" ON content_drafts FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'content_drafts' AND policyname = 'Users can update own content drafts') THEN
    CREATE POLICY "Users can update own content drafts" ON content_drafts FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'content_drafts' AND policyname = 'Users can delete own content drafts') THEN
    CREATE POLICY "Users can delete own content drafts" ON content_drafts FOR DELETE USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Function to handle auto-save operations (main auto-save function)
CREATE OR REPLACE FUNCTION handle_auto_save(
  p_chapter_id UUID,
  p_content TEXT,
  p_title TEXT,
  p_word_count INTEGER,
  p_save_type TEXT DEFAULT 'auto'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_project_id UUID;
  v_result JSONB;
  v_old_word_count INTEGER;
BEGIN
  -- Get user ID from auth
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN '{"success": false, "error": "Authentication required"}'::JSONB;
  END IF;
  
  -- Get project ID and current word count from chapter
  SELECT project_id, word_count INTO v_project_id, v_old_word_count
  FROM chapters 
  WHERE id = p_chapter_id AND EXISTS (
    SELECT 1 FROM projects 
    WHERE id = chapters.project_id 
    AND user_id = v_user_id
  );
  
  IF v_project_id IS NULL THEN
    RETURN '{"success": false, "error": "Chapter not found or access denied"}'::JSONB;
  END IF;
  
  -- Update chapter content
  UPDATE chapters SET
    content = p_content,
    title = p_title,
    word_count = p_word_count,
    auto_saved_at = CASE WHEN p_save_type = 'auto' THEN NOW() ELSE auto_saved_at END,
    manual_saved_at = CASE WHEN p_save_type = 'manual' THEN NOW() ELSE manual_saved_at END,
    save_count = save_count + 1,
    last_editor_id = v_user_id,
    updated_at = NOW()
  WHERE id = p_chapter_id;
  
  -- Create draft backup
  INSERT INTO content_drafts (chapter_id, user_id, content, title, word_count, save_type)
  VALUES (p_chapter_id, v_user_id, p_content, p_title, p_word_count, p_save_type);
  
  -- Update project word count
  UPDATE projects SET
    word_count_current = (
      SELECT COALESCE(SUM(word_count), 0) 
      FROM chapters 
      WHERE project_id = v_project_id
    ),
    updated_at = NOW()
  WHERE id = v_project_id;
  
  -- Return success with metadata
  v_result := jsonb_build_object(
    'success', true,
    'saved_at', NOW(),
    'save_type', p_save_type,
    'word_count', p_word_count,
    'word_count_change', p_word_count - COALESCE(v_old_word_count, 0)
  );
  
  RETURN v_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Function to cleanup old drafts (keep last 50 per chapter)
CREATE OR REPLACE FUNCTION cleanup_old_drafts()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Keep only the 50 most recent drafts per chapter
  WITH drafts_to_delete AS (
    SELECT id FROM (
      SELECT id,
        ROW_NUMBER() OVER (
          PARTITION BY chapter_id 
          ORDER BY created_at DESC
        ) as rn
      FROM content_drafts
    ) ranked
    WHERE rn > 50
  )
  DELETE FROM content_drafts
  WHERE id IN (SELECT id FROM drafts_to_delete);
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', true,
    'deleted_count', v_deleted_count
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Function to get chapter drafts for recovery
CREATE OR REPLACE FUNCTION get_chapter_drafts(
  p_chapter_id UUID,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  title TEXT,
  word_count INTEGER,
  save_type TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has access to this chapter
  IF NOT EXISTS (
    SELECT 1 FROM chapters c
    JOIN projects p ON c.project_id = p.id
    WHERE c.id = p_chapter_id AND p.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Chapter not found or access denied';
  END IF;
  
  RETURN QUERY
  SELECT 
    cd.id,
    cd.content,
    cd.title,
    cd.word_count,
    cd.save_type,
    cd.created_at
  FROM content_drafts cd
  WHERE cd.chapter_id = p_chapter_id
    AND cd.user_id = auth.uid()
  ORDER BY cd.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Function to recover from a specific draft
CREATE OR REPLACE FUNCTION recover_from_draft(p_draft_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_draft_content TEXT;
  v_draft_title TEXT;
  v_chapter_id UUID;
BEGIN
  -- Get draft content and verify ownership
  SELECT content, title, chapter_id 
  INTO v_draft_content, v_draft_title, v_chapter_id
  FROM content_drafts cd
  WHERE cd.id = p_draft_id AND cd.user_id = auth.uid();
  
  IF v_draft_content IS NULL THEN
    RETURN '{"success": false, "error": "Draft not found or access denied"}'::JSONB;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'content', v_draft_content,
    'title', v_draft_title,
    'chapter_id', v_chapter_id
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Create trigger to auto-cleanup drafts (runs 1% of the time)
CREATE OR REPLACE FUNCTION trigger_cleanup_drafts()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Randomly cleanup drafts (1% chance per insert)
  IF random() < 0.01 THEN
    PERFORM cleanup_old_drafts();
  END IF;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'auto_cleanup_drafts') THEN
    CREATE TRIGGER auto_cleanup_drafts
      AFTER INSERT ON content_drafts
      FOR EACH ROW EXECUTE FUNCTION trigger_cleanup_drafts();
  END IF;
END
$$;

-- Create updated_at trigger for new tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_auto_save_sessions_updated_at') THEN
    CREATE TRIGGER update_auto_save_sessions_updated_at
      BEFORE UPDATE ON auto_save_sessions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

-- Create view for latest drafts per chapter
CREATE OR REPLACE VIEW latest_chapter_drafts AS
SELECT DISTINCT ON (chapter_id) 
  id,
  chapter_id,
  user_id,
  content,
  title,
  word_count,
  save_type,
  created_at
FROM content_drafts
ORDER BY chapter_id, created_at DESC;

-- Grant access to the view
GRANT SELECT ON latest_chapter_drafts TO authenticated;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION handle_auto_save TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_drafts TO authenticated;
GRANT EXECUTE ON FUNCTION get_chapter_drafts TO authenticated;
GRANT EXECUTE ON FUNCTION recover_from_draft TO authenticated;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Enhanced auto-save system migration completed successfully!';
END
$$;
