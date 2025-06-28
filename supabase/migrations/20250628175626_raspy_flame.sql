/*
  # Add unique constraint to canvas_data table

  1. Changes
    - Add unique constraint on user_id column to support upsert operations
    - This allows the ON CONFLICT clause to work properly in upsert operations

  2. Security
    - No changes to existing RLS policies
    - Maintains existing data integrity
*/

-- Add unique constraint to user_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'canvas_data_user_id_unique' 
    AND conrelid = 'canvas_data'::regclass
  ) THEN
    ALTER TABLE canvas_data 
    ADD CONSTRAINT canvas_data_user_id_unique UNIQUE (user_id);
  END IF;
END
$$;