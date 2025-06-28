# Supabase Signup Error Debugging Guide

This document outlines the debugging steps taken to resolve the "Database error saving new user" issue.

## Error Details
- **Status**: 500 Internal Server Error
- **Message**: "Database error saving new user"
- **Code**: "unexpected_failure"

## Root Cause Analysis

The error was traced to several potential issues:

1. **Environment Variables**: Missing or invalid Supabase configuration
2. **Database Trigger**: User profile creation trigger failing
3. **Error Handling**: Insufficient error handling in auth flow

## Solutions Implemented

### 1. Enhanced Supabase Configuration (`src/lib/supabase.ts`)
- Added environment variable validation
- Enhanced client configuration with better error handling
- Added database health check function
- Improved error logging with context

### 2. Improved Auth Context (`src/contexts/AuthContext.tsx`)
- Added pre-flight database health checks
- Enhanced error handling with user-friendly messages
- Added comprehensive logging for debugging
- Better input validation

### 3. Fixed Database Trigger (`supabase/migrations/20250628220000_fix_user_trigger.sql`)
- Recreated the `handle_new_user()` function with better error handling
- Added proper exception handling in the trigger
- Ensured proper permissions and constraints
- Added diagnostic functions

## Testing Steps

After applying these fixes:

1. **Check Environment Variables**:
   ```bash
   # Ensure these are set in your .env file:
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

2. **Run Database Migration**:
   ```bash
   supabase db push
   ```

3. **Test Database Connection**:
   - The app will now validate environment variables on startup
   - Database health checks run before auth operations

4. **Test Signup Flow**:
   - Try creating a new account
   - Check browser console for detailed error logs
   - Verify user profile creation in Supabase dashboard

## Diagnostic Queries

Run these in your Supabase SQL Editor to diagnose issues:

```sql
-- Check if user_profiles table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'user_profiles';

-- Check trigger exists
SELECT trigger_name FROM information_schema.triggers 
WHERE event_object_table = 'users' AND trigger_schema = 'auth';

-- Test user creation function
SELECT test_user_creation();

-- Check recent auth errors (if any)
SELECT * FROM auth.audit_log_entries 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

## Common Issues & Solutions

### Issue: "Missing Supabase environment variables"
**Solution**: Ensure `.env` file contains proper VITE_ prefixed variables

### Issue: "Database connection failed"
**Solution**: Check Supabase project status and database health

### Issue: "Auth schema validation failed"
**Solution**: Run the database migration to fix triggers

### Issue: User created but no profile
**Solution**: Check trigger execution and permissions

## Monitoring

The enhanced error logging will now capture:
- Context of where errors occur
- Detailed error information
- User-friendly error messages
- Database health status

## Next Steps

If issues persist:

1. Check Supabase project logs in the dashboard
2. Verify all migrations have been applied
3. Test with a fresh email address
4. Contact Supabase support if database-level issues persist