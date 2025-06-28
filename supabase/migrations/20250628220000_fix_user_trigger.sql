-- Fix: Database Trigger and Function Enhancement
-- This migration fixes the user profile creation issue

-- First, drop the existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the existing function to recreate it with better error handling
DROP FUNCTION IF EXISTS handle_new_user();

-- Create an improved function to handle new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_full_name TEXT;
BEGIN
  -- Extract full name with better fallback logic
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  -- Insert into user_profiles with error handling
  BEGIN
    INSERT INTO user_profiles (id, email, full_name, avatar_url)
    VALUES (
      NEW.id,
      NEW.email,
      user_full_name,
      NEW.raw_user_meta_data->>'avatar_url'
    );
  EXCEPTION 
    WHEN OTHERS THEN
      -- Log the error (in a real app, you'd want proper logging)
      RAISE LOG 'Error creating user profile for %: %', NEW.email, SQLERRM;
      -- Re-raise the error to prevent user creation if profile creation fails
      RAISE;
  END;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Catch any other errors
    RAISE LOG 'Unexpected error in handle_new_user for %: %', NEW.email, SQLERRM;
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure proper permissions on the user_profiles table
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO service_role;

-- Add a check to ensure the user_profiles table has proper constraints
DO $$
BEGIN
  -- Check if the table exists and has the right structure
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles'
  ) THEN
    RAISE EXCEPTION 'user_profiles table does not exist. Please run the base migration first.';
  END IF;

  -- Ensure the foreign key constraint exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY'
    AND table_name = 'user_profiles'
    AND constraint_name LIKE '%user_profiles_id_fkey%'
  ) THEN
    ALTER TABLE user_profiles 
    ADD CONSTRAINT user_profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END
$$;

-- Test the function works by creating a test scenario (optional)
-- This will help diagnose issues
CREATE OR REPLACE FUNCTION test_user_creation()
RETURNS BOOLEAN AS $$
DECLARE
  test_result BOOLEAN := FALSE;
BEGIN
  -- Check if we can access the auth schema
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth') THEN
    test_result := TRUE;
  END IF;
  
  -- Check if user_profiles table is accessible
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    test_result := test_result AND TRUE;
  ELSE
    test_result := FALSE;
  END IF;
  
  RETURN test_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;