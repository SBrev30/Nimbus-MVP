/*
  # Imported Content & AI Features Migration
  
  This migration creates the missing tables and functions for:
  1. Imported content management (imported_items, item_tags, canvas_items)
  2. AI analysis features and rate limiting
  3. Database functions for the edge function
  
  Execute this migration to resolve the "imported_items does not exist" errors.
*/

-- Create imported_items table (main content storage)
CREATE TABLE IF NOT EXISTS imported_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('character', 'plot', 'research', 'chapter')),
  word_count INTEGER DEFAULT 0,
  
  -- AI Analysis fields
  ai_insights JSONB DEFAULT '[]',
  ai_status TEXT DEFAULT 'pending' CHECK (ai_status IN ('pending', 'analyzing', 'good', 'needs_attention', 'conflicts', 'error')),
  last_analyzed TIMESTAMPTZ,
  analysis_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create item_tags table (for tagging imported content)
CREATE TABLE IF NOT EXISTS item_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES imported_items(id) ON DELETE CASCADE NOT NULL,
  tag_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_id, tag_name)
);

-- Create canvas_items table (for canvas positioning)
CREATE TABLE IF NOT EXISTS canvas_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES imported_items(id) ON DELETE CASCADE NOT NULL,
  position_x REAL NOT NULL DEFAULT 0,
  position_y REAL NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_id) -- Each imported item can only be on canvas once
);

-- Create ai_usage_tracking table (for rate limiting)
CREATE TABLE IF NOT EXISTS ai_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  usage_date DATE DEFAULT CURRENT_DATE,
  analysis_count INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, usage_date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS imported_items_user_id_idx ON imported_items(user_id);
CREATE INDEX IF NOT EXISTS imported_items_content_type_idx ON imported_items(content_type);
CREATE INDEX IF NOT EXISTS imported_items_ai_status_idx ON imported_items(ai_status);
CREATE INDEX IF NOT EXISTS imported_items_created_at_idx ON imported_items(created_at DESC);

CREATE INDEX IF NOT EXISTS item_tags_item_id_idx ON item_tags(item_id);
CREATE INDEX IF NOT EXISTS item_tags_tag_name_idx ON item_tags(tag_name);

CREATE INDEX IF NOT EXISTS canvas_items_user_id_idx ON canvas_items(user_id);
CREATE INDEX IF NOT EXISTS canvas_items_item_id_idx ON canvas_items(item_id);

CREATE INDEX IF NOT EXISTS ai_usage_tracking_user_date_idx ON ai_usage_tracking(user_id, usage_date);

-- Enable Row Level Security
ALTER TABLE imported_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for imported_items
CREATE POLICY "Users can view their own imported items" ON imported_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own imported items" ON imported_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own imported items" ON imported_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own imported items" ON imported_items
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for item_tags
CREATE POLICY "Users can view tags for their items" ON item_tags
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM imported_items 
      WHERE imported_items.id = item_tags.item_id 
      AND imported_items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tags for their items" ON item_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM imported_items 
      WHERE imported_items.id = item_tags.item_id 
      AND imported_items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tags for their items" ON item_tags
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM imported_items 
      WHERE imported_items.id = item_tags.item_id 
      AND imported_items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tags for their items" ON item_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM imported_items 
      WHERE imported_items.id = item_tags.item_id 
      AND imported_items.user_id = auth.uid()
    )
  );

-- RLS Policies for canvas_items
CREATE POLICY "Users can view their own canvas items" ON canvas_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own canvas items" ON canvas_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own canvas items" ON canvas_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own canvas items" ON canvas_items
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for ai_usage_tracking
CREATE POLICY "Users can view their own AI usage" ON ai_usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI usage" ON ai_usage_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI usage" ON ai_usage_tracking
  FOR UPDATE USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_imported_items_updated_at
  BEFORE UPDATE ON imported_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_items_updated_at
  BEFORE UPDATE ON canvas_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_usage_tracking_updated_at
  BEFORE UPDATE ON ai_usage_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create AI rate limiting function (used by edge function)
CREATE OR REPLACE FUNCTION check_ai_usage_limit(user_uuid UUID, daily_limit INTEGER DEFAULT 10)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  usage_count INTEGER;
BEGIN
  -- Get today's usage count for the user
  SELECT COALESCE(analysis_count, 0) INTO usage_count
  FROM ai_usage_tracking
  WHERE user_id = user_uuid AND usage_date = CURRENT_DATE;
  
  -- Return true if under limit, false if over
  RETURN COALESCE(usage_count, 0) < daily_limit;
END;
$$;

-- Create function to increment AI usage (used by edge function)
CREATE OR REPLACE FUNCTION increment_ai_usage(user_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update today's usage count
  INSERT INTO ai_usage_tracking (user_id, usage_date, analysis_count, tokens_used)
  VALUES (user_uuid, CURRENT_DATE, 1, 0)
  ON CONFLICT (user_id, usage_date)
  DO UPDATE SET
    analysis_count = ai_usage_tracking.analysis_count + 1,
    updated_at = NOW();
END;
$$;

-- Create function to get AI usage stats
CREATE OR REPLACE FUNCTION get_ai_usage_stats(user_uuid UUID)
RETURNS TABLE(
  today_count INTEGER,
  this_week_count INTEGER,
  this_month_count INTEGER,
  total_tokens INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE((
      SELECT analysis_count 
      FROM ai_usage_tracking 
      WHERE user_id = user_uuid AND usage_date = CURRENT_DATE
    ), 0) as today_count,
    
    COALESCE((
      SELECT SUM(analysis_count)::INTEGER 
      FROM ai_usage_tracking 
      WHERE user_id = user_uuid 
      AND usage_date >= CURRENT_DATE - INTERVAL '7 days'
    ), 0) as this_week_count,
    
    COALESCE((
      SELECT SUM(analysis_count)::INTEGER 
      FROM ai_usage_tracking 
      WHERE user_id = user_uuid 
      AND usage_date >= CURRENT_DATE - INTERVAL '30 days'
    ), 0) as this_month_count,
    
    COALESCE((
      SELECT SUM(tokens_used)::INTEGER 
      FROM ai_usage_tracking 
      WHERE user_id = user_uuid
    ), 0) as total_tokens;
END;
$$;

-- Grant permissions
GRANT ALL ON imported_items TO authenticated;
GRANT ALL ON item_tags TO authenticated;
GRANT ALL ON canvas_items TO authenticated;
GRANT ALL ON ai_usage_tracking TO authenticated;

GRANT EXECUTE ON FUNCTION check_ai_usage_limit(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_ai_usage(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_ai_usage_stats(UUID) TO authenticated;