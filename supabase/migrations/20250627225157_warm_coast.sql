/*
  # Import System Schema
  
  1. New Tables
    - `imported_items` - Stores imported document content
    - `item_tags` - Stores tags for imported items
    - `canvas_items` - Stores canvas positions for imported items
  
  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    
  3. Indexes
    - Create indexes for performance optimization
*/

-- Imported Content Storage
CREATE TABLE imported_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT CHECK (content_type IN ('character', 'plot', 'research', 'chapter')),
  word_count INTEGER DEFAULT 0,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tagging System
CREATE TABLE item_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES imported_items(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canvas Integration
CREATE TABLE canvas_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES imported_items(id) ON DELETE CASCADE,
  position_x REAL NOT NULL,
  position_y REAL NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trigger for updated_at
CREATE TRIGGER update_imported_items_updated_at
  BEFORE UPDATE ON imported_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_items_updated_at
  BEFORE UPDATE ON canvas_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_imported_items_user_id ON imported_items(user_id);
CREATE INDEX idx_imported_items_content_type ON imported_items(content_type);
CREATE INDEX idx_item_tags_item_id ON item_tags(item_id);
CREATE INDEX idx_canvas_items_item_id ON canvas_items(item_id);
CREATE INDEX idx_canvas_items_user_id ON canvas_items(user_id);

-- Enable Row Level Security
ALTER TABLE imported_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for imported_items
CREATE POLICY "Users can view own imported items" ON imported_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own imported items" ON imported_items
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own imported items" ON imported_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own imported items" ON imported_items
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

CREATE POLICY "Users can insert tags for their items" ON item_tags
  FOR INSERT WITH CHECK (
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
CREATE POLICY "Users can view own canvas items" ON canvas_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own canvas items" ON canvas_items
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own canvas items" ON canvas_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own canvas items" ON canvas_items
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to count words in text
CREATE OR REPLACE FUNCTION count_words(text_content TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  word_count INTEGER;
BEGIN
  -- Remove HTML tags and count words
  SELECT array_length(regexp_split_to_array(regexp_replace(text_content, '<[^>]*>', ' ', 'g'), '\s+'), 1) - 1
  INTO word_count;
  
  RETURN GREATEST(0, word_count);
END;
$$;

-- Create function to update word count on content change
CREATE OR REPLACE FUNCTION update_word_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.word_count := count_words(NEW.content);
  RETURN NEW;
END;
$$;

-- Create trigger to update word count
CREATE TRIGGER update_imported_items_word_count
  BEFORE INSERT OR UPDATE OF content ON imported_items
  FOR EACH ROW EXECUTE FUNCTION update_word_count();