-- =============================================================
-- Migration: 002_fix_auth_rls
-- Description: Adds secure RPC functions to allow unauthenticated
-- users to safely look up username availability and resolve 
-- usernames to emails for login without bypassing RLS for the whole table.
-- =============================================================

-- 1. Helper for Login: Get profile needed for signIn via username
-- Security Definer bypasses RLS so we can look up the user when not logged in.
CREATE OR REPLACE FUNCTION public.get_profile_by_username(p_username text)
RETURNS TABLE (
  id uuid,
  email text,
  username text,
  status text,
  role text,
  full_name text,
  phone text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id, p.email, p.username, p.status, p.role, p.full_name, p.phone
  FROM public.profiles p
  WHERE p.username ILIKE p_username
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Helper for Registration Check: Check if username exists
-- Returns true if username is already taken.
CREATE OR REPLACE FUNCTION public.check_username_exists(p_username text)
RETURNS boolean AS $$
DECLARE
  exists_flag boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    WHERE p.username ILIKE p_username
  ) INTO exists_flag;
  
  RETURN exists_flag;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
