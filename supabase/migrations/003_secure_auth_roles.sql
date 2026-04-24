-- =============================================================
-- Migration: 003_secure_auth_roles
-- Description: Closes critical privilege escalation vulnerabilities
-- by hardcoding the FARMER role on initial signup and preventing
-- FARMER users from upgrading themselves to ADMIN via manual updates.
-- =============================================================

-- =============================================================
-- 1. Fix Registration Vulnerability
-- =============================================================
-- We must drop the old trigger behavior and replace it so it DOES NOT 
-- trust the role embedded in the user's metadata from the client.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, email, phone, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'FARMER', -- HARDCODED: No one can register natively as an ADMIN anymore.
    'ACTIVE'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================================
-- 2. Fix Profile Update Vulnerability (RLS Bypassing)
-- =============================================================
-- Because the policy "Users can update their own profile" allows updating
-- ALL columns, a user could update their own role. This trigger intercepts it.
CREATE OR REPLACE FUNCTION public.protect_role_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If this query is run by a backend service/dashboard where auth.uid() is null, 
  -- or if they are mathematically already a verified admin: Let it pass.
  IF auth.uid() IS NULL OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- Otherwise, if the logged-in user tries to modify the 'role' column...
  IF (NEW.role IS DISTINCT FROM OLD.role) THEN
    RAISE EXCEPTION 'Security Exception: You do not have permission to elevate your role.';
  END IF;
  
  -- Prevent them from changing their suspension/pending status too!
  IF (NEW.status IS DISTINCT FROM OLD.status) THEN
    RAISE EXCEPTION 'Security Exception: You do not have permission to modify account status.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Safely attach the trigger to intercept UPDATES before they happen
DROP TRIGGER IF EXISTS protect_profile_fields ON public.profiles;
CREATE TRIGGER protect_profile_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_role_update();
