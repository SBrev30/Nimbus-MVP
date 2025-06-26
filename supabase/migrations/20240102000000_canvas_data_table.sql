-- Add canvas_data table for useCloudStorage hook compatibility
-- This migration adds the simple canvas_data table that your current useCloudStorage hook expects

CREATE TABLE IF NOT EXISTS canvas_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  canvas_data JSONB NOT NULL DEFAULT '{}',
  last_modified TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS canvas_data_user_id_idx ON canvas_data(user_id);
CREATE INDEX IF NOT EXISTS canvas_data_updated_at_idx ON canvas_data(updated_at DESC);

-- Enable RLS
ALTER TABLE canvas_data ENABLE ROW LEVEL SECURITY;

-- RLS policies
DROP POLICY IF EXISTS "Users can view own canvas data" ON canvas_data;
CREATE POLICY "Users can view own canvas data" ON canvas_data
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own canvas data" ON canvas_data;
CREATE POLICY "Users can insert own canvas data" ON canvas_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own canvas data" ON canvas_data;
CREATE POLICY "Users can update own canvas data" ON canvas_data
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own canvas data" ON canvas_data;
CREATE POLICY "Users can delete own canvas data" ON canvas_data
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at (only if function exists)
DO 
$$ 
BEGIN 
-- Checks for a *schema-qualified* function with an exact signature 
IF to_regproc('public.update_updated_at_column()') IS NOT NULL THEN 
DROP TRIGGER IF EXISTS update_canvas_data_updated_at ON canvas_data; 
CREATE TRIGGER update_canvas_data_updated_at 
BEFORE UPDATE ON canvas_data 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); 
END IF; 
END; 
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON canvas_data TO authenticated;
