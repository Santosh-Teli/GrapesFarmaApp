-- =============================================================
-- GrapesFarmApp — Admin Seed Script
-- Run this in Supabase SQL Editor AFTER running 001_schema.sql
-- and AFTER disabling email confirmations in Auth settings
-- =============================================================

-- ⚠️ NOTE: You cannot create auth.users directly from the SQL editor with
-- a plain INSERT because Supabase Auth hashes passwords internally.
--
-- STEP-BY-STEP to create the Admin user:
--
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" → "Create New User"
-- 3. Enter:
--      Email    : admin@agritrack.com
--      Password : Kingkohli1@
-- 4. Confirm creation. Supabase will auto-create the profile via trigger.
-- 5. Then run the UPDATE below to set the admin role:

-- After creating the admin user via the dashboard, run:
UPDATE public.profiles
SET 
  role = 'ADMIN',
  username = 'AdminKing',
  full_name = 'Master Administrator',
  phone = '7654321098'
WHERE email = 'admin@agritrack.com';

-- =============================================================
-- Optional: Create demo farmer users (run AFTER adding them via Dashboard)
-- =============================================================

-- Farmer 1: rahul_sharma / Test@1234
-- 1. Create in Auth dashboard: email=rahul@example.com, pass=Test@1234
-- 2. Then:
UPDATE public.profiles
SET username = 'rahul_sharma', full_name = 'Rahul Sharma', phone = '9876543210'
WHERE email = 'rahul@example.com';

-- Farmer 2: suresh_farmer / Farm@5678
-- 1. Create in Auth dashboard: email=suresh@farm.com, pass=Farm@5678
-- 2. Then:
UPDATE public.profiles
SET username = 'suresh_farmer', full_name = 'Suresh Patil', phone = '8765432109'
WHERE email = 'suresh@farm.com';

-- Farmer 3: basavaraj_farmer / Grapes@1234
-- 1. Create in Auth dashboard: email=basavaraj@farm.com, pass=Grapes@1234
-- 2. Then:
UPDATE public.profiles
SET username = 'basavaraj_farmer', full_name = 'Basavaraj Teli', phone = '6543210987'
WHERE email = 'basavaraj@farm.com';
