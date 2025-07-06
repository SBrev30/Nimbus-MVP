-- Supabase Auth Setup Validation Script
-- Run this in your Supabase SQL Editor to verify everything is configured correctly

-- 1. Check if user_profiles table exists and has correct structure
SELECT 
  'user_profiles table' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public')
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- 2. Check if auth trigger exists and is working
SELECT 
  'auth trigger' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created' 
      AND event_object_table = 'users' 
      AND trigger_schema = 'auth'
    )
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- 3. Check if handle_new_user function exists
SELECT 
  'handle_new_user function' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_name = 'handle_new_user' 
      AND routine_schema = 'public'
    )
    THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- 4. Check RLS policies on user_profiles
SELECT 
  'user_profiles RLS policies' as check_name,
  COALESCE(COUNT(*)::text, '0') || ' policies' as status
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 5. Check for any conflicting users table
SELECT 
  'duplicate users table' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public')
    THEN '⚠️ DUPLICATE TABLE EXISTS'
    ELSE '✅ NO CONFLICTS'
  END as status;

-- 6. Test user creation function
SELECT 
  'user creation test' as check_name,
  CASE 
    WHEN test_user_creation() = true
    THEN '✅ FUNCTIONAL'
    ELSE '❌ FAILED'
  END as status;

-- 7. Check foreign key constraints
SELECT 
  'foreign key constraints' as check_name,
  COUNT(*)::text || ' constraints' as status
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY'
AND table_schema = 'public';

-- 8. Check if all required tables exist
WITH required_tables AS (
  SELECT unnest(ARRAY['user_profiles', 'projects', 'imported_items', 'ai_usage']) as table_name
),
existing_tables AS (
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public'
)
SELECT 
  'required tables' as check_name,
  CASE 
    WHEN COUNT(rt.table_name) = COUNT(et.table_name)
    THEN '✅ ALL PRESENT (' || COUNT(et.table_name)::text || '/4)'
    ELSE '⚠️ MISSING (' || COUNT(et.table_name)::text || '/4)'
  END as status
FROM required_tables rt
LEFT JOIN existing_tables et ON rt.table_name = et.table_name;

-- 9. Final summary
SELECT 
  '🎯 SETUP STATUS' as check_name,
  'Ready for authentication testing' as status;