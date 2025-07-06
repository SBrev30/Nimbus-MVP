/*
  # Imported Content System
  
  1. New Tables
    - `imported_items` - Stores imported document content
    - `item_tags` - Flat tagging system for organization
    - `canvas_items` - Links imported content to canvas positions
    - `ai_usage_simple` - Tracks AI feature usage
  
  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    
  3. Indexes
    - Create indexes for performance optimization
*/

-- Imported Content Storage
CREATE TABLE IF NOT EXISTS imported_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('character', 'plot', 'research', 'chapter')),
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tagging System
CREATE TABLE IF NOT EXISTS item_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES imported_items(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canvas Integration
CREATE TABLE IF NOT EXISTS canvas_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES imported_items(id) ON DELETE CASCADE,
  position_x REAL DEFAULT 0 NOT NULL,
  position_y REAL DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS imported_items_user_id_idx ON imported_items(user_id);
CREATE INDEX IF NOT EXISTS imported_items_content_type_idx ON imported_items(content_type);
CREATE INDEX IF NOT EXISTS imported_items_created_at_idx ON imported_items(created_at DESC);
CREATE INDEX IF NOT EXISTS imported_items_title_idx ON imported_items(title);
CREATE INDEX IF NOT EXISTS item_tags_item_id_idx ON item_tags(item_id);
CREATE INDEX IF NOT EXISTS item_tags_tag_name_idx ON item_tags(tag_name);
CREATE INDEX IF NOT EXISTS canvas_items_user_id_idx ON canvas_items(user_id);
CREATE INDEX IF NOT EXISTS canvas_items_item_id_idx ON canvas_items(item_id);

-- Enable Row Level Security
ALTER TABLE imported_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies with existence checks
DO $$
BEGIN
  -- Imported Items policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'imported_items' 
    AND policyname = 'Users can manage own imported items'
  ) THEN
    CREATE POLICY "Users can manage own imported items" ON imported_items
      FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- Item Tags policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'item_tags' 
    AND policyname = 'Users can manage tags for their items'
  ) THEN
    CREATE POLICY "Users can manage tags for their items" ON item_tags
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM imported_items
          WHERE imported_items.id = item_tags.item_id
          AND imported_items.user_id = auth.uid()
        )
      );
  END IF;

  -- Canvas Items policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'canvas_items' 
    AND policyname = 'Users can manage own canvas items'
  ) THEN
    CREATE POLICY "Users can manage own canvas items" ON canvas_items
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Create triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_imported_items_updated_at' 
    AND tgrelid = 'imported_items'::regclass
  ) THEN
    CREATE TRIGGER update_imported_items_updated_at
      BEFORE UPDATE ON imported_items
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_canvas_items_updated_at' 
    AND tgrelid = 'canvas_items'::regclass
  ) THEN
    CREATE TRIGGER update_canvas_items_updated_at
      BEFORE UPDATE ON canvas_items
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

-- Grant necessary permissions
GRANT ALL ON imported_items TO authenticated;
GRANT ALL ON item_tags TO authenticated;
GRANT ALL ON canvas_items TO authenticated;