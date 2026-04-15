-- =============================================================
-- GrapesFarmApp — Complete Supabase Schema
-- Run this entire file in the Supabase SQL Editor (once)
-- =============================================================

-- Enable UUID extension (already enabled in Supabase by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- 1. PROFILES (extends auth.users)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text NOT NULL,
  username    text UNIQUE NOT NULL,
  email       text UNIQUE NOT NULL DEFAULT '',
  phone       text NOT NULL DEFAULT '',
  role        text NOT NULL DEFAULT 'FARMER' CHECK (role IN ('FARMER', 'ADMIN')),
  status      text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'PENDING')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Auto-create profile when a user registers via Supabase Auth
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
    COALESCE(NEW.raw_user_meta_data->>'role', 'FARMER'),
    'ACTIVE'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Helper: check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admin can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- =============================================================
-- 2. FARMS
-- =============================================================
CREATE TABLE IF NOT EXISTS public.farms (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name        text NOT NULL,
  owner_name  text NOT NULL DEFAULT '',
  total_acres numeric(10, 2) NOT NULL DEFAULT 0,
  location    text NOT NULL DEFAULT '',
  phone       text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers see own farm"
  ON public.farms FOR SELECT
  USING (auth.uid() = owner_id OR public.is_admin());

CREATE POLICY "Farmers insert own farm"
  ON public.farms FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Farmers update own farm"
  ON public.farms FOR UPDATE
  USING (auth.uid() = owner_id OR public.is_admin());

CREATE POLICY "Farmers delete own farm"
  ON public.farms FOR DELETE
  USING (auth.uid() = owner_id OR public.is_admin());

-- =============================================================
-- 3. PLOTS
-- =============================================================
CREATE TABLE IF NOT EXISTS public.plots (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id        uuid NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  user_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name           text NOT NULL,
  area_acres     numeric(10, 2) NOT NULL DEFAULT 0,
  grape_variety  text NOT NULL DEFAULT '',
  planting_year  text NOT NULL DEFAULT '',
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.plots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plots: farmer sees own"
  ON public.plots FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Plots: farmer inserts own"
  ON public.plots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Plots: farmer updates own"
  ON public.plots FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Plots: farmer deletes own"
  ON public.plots FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- =============================================================
-- 4. PESTICIDES
-- =============================================================
CREATE TABLE IF NOT EXISTS public.pesticides (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name                  text NOT NULL,
  company_name          text NOT NULL DEFAULT '',
  unit_type             text NOT NULL CHECK (unit_type IN ('ml', 'gram', 'litre', 'kg')),
  price_per_unit        numeric(10, 2) NOT NULL DEFAULT 0,
  stock_quantity        numeric(10, 2) NOT NULL DEFAULT 0,
  low_stock_alert_level numeric(10, 2) NOT NULL DEFAULT 0,
  is_active             boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pesticides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pesticides: farmer sees own"
  ON public.pesticides FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Pesticides: farmer inserts own"
  ON public.pesticides FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pesticides: farmer updates own"
  ON public.pesticides FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Pesticides: farmer deletes own"
  ON public.pesticides FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- =============================================================
-- 5. LABOURERS
-- =============================================================
CREATE TABLE IF NOT EXISTS public.labourers (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name            text NOT NULL,
  gender          text NOT NULL CHECK (gender IN ('Male', 'Female')),
  phone           text NOT NULL DEFAULT '',
  per_day_salary  numeric(10, 2) NOT NULL DEFAULT 0,
  skill_type      text NOT NULL CHECK (skill_type IN ('Spraying', 'Cutting', 'General', 'Multi-skill')),
  is_active       boolean NOT NULL DEFAULT true,
  joining_date    date NOT NULL DEFAULT CURRENT_DATE,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.labourers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Labourers: farmer sees own"
  ON public.labourers FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Labourers: farmer inserts own"
  ON public.labourers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Labourers: farmer updates own"
  ON public.labourers FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Labourers: farmer deletes own"
  ON public.labourers FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- =============================================================
-- 6. SPRAY RECORDS
-- =============================================================
CREATE TABLE IF NOT EXISTS public.spray_records (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plot_id              uuid NOT NULL REFERENCES public.plots(id) ON DELETE CASCADE,
  spray_date           date NOT NULL,
  crop_stage           text NOT NULL CHECK (crop_stage IN ('Flowering', 'Fruiting', 'Growth', 'Dormant')),
  weather_condition    text NOT NULL CHECK (weather_condition IN ('Sunny', 'Rainy', 'Cloudy', 'Windy')),
  spray_reason         text NOT NULL CHECK (spray_reason IN ('Disease', 'Pest', 'Preventive', 'Growth')),
  reason_detail        text,
  water_mixed_litres   numeric(10, 2) NOT NULL DEFAULT 0,
  labour_used          boolean NOT NULL DEFAULT false,
  labour_count         integer NOT NULL DEFAULT 0,
  labour_cost          numeric(10, 2) NOT NULL DEFAULT 0,
  total_pesticide_cost numeric(10, 2) NOT NULL DEFAULT 0,
  total_spray_cost     numeric(10, 2) NOT NULL DEFAULT 0,
  notes                text,
  created_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.spray_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Spray: farmer sees own"
  ON public.spray_records FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Spray: farmer inserts own"
  ON public.spray_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Spray: farmer updates own"
  ON public.spray_records FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Spray: farmer deletes own"
  ON public.spray_records FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- =============================================================
-- 7. SPRAY PESTICIDE USAGES (junction for PesticideUsage[])
-- =============================================================
CREATE TABLE IF NOT EXISTS public.spray_pesticide_usages (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  spray_record_id  uuid NOT NULL REFERENCES public.spray_records(id) ON DELETE CASCADE,
  pesticide_id     uuid NOT NULL REFERENCES public.pesticides(id) ON DELETE RESTRICT,
  quantity_used    numeric(10, 2) NOT NULL DEFAULT 0,
  price_at_time    numeric(10, 2) NOT NULL DEFAULT 0,
  cost             numeric(10, 2) NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.spray_pesticide_usages ENABLE ROW LEVEL SECURITY;

-- Access inherited through spray_records (join)
CREATE POLICY "SprayUsage: see via spray owner"
  ON public.spray_pesticide_usages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.spray_records sr
      WHERE sr.id = spray_record_id
        AND (sr.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "SprayUsage: insert via spray owner"
  ON public.spray_pesticide_usages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.spray_records sr
      WHERE sr.id = spray_record_id AND sr.user_id = auth.uid()
    )
  );

CREATE POLICY "SprayUsage: update via spray owner"
  ON public.spray_pesticide_usages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.spray_records sr
      WHERE sr.id = spray_record_id
        AND (sr.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "SprayUsage: delete via spray owner"
  ON public.spray_pesticide_usages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.spray_records sr
      WHERE sr.id = spray_record_id
        AND (sr.user_id = auth.uid() OR public.is_admin())
    )
  );

-- =============================================================
-- 8. CUTTING RECORDS
-- =============================================================
CREATE TABLE IF NOT EXISTS public.cutting_records (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plot_id             uuid NOT NULL REFERENCES public.plots(id) ON DELETE CASCADE,
  cutting_date        date NOT NULL,
  cutting_type        text NOT NULL CHECK (cutting_type IN ('1st_Cutting', '2nd_Cutting', 'Summer_Pruning', 'Winter_Pruning', 'Thinning')),
  labour_count        integer NOT NULL DEFAULT 0,
  male_labour_count   integer NOT NULL DEFAULT 0,
  female_labour_count integer NOT NULL DEFAULT 0,
  per_day_salary      numeric(10, 2) NOT NULL DEFAULT 0,
  day_type            text NOT NULL CHECK (day_type IN ('Full_Day', 'Half_Day')),
  effective_salary    numeric(10, 2) NOT NULL DEFAULT 0,
  total_labour_cost   numeric(10, 2) NOT NULL DEFAULT 0,
  notes               text,
  created_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cutting_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cutting: farmer sees own"
  ON public.cutting_records FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Cutting: farmer inserts own"
  ON public.cutting_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Cutting: farmer updates own"
  ON public.cutting_records FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Cutting: farmer deletes own"
  ON public.cutting_records FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- =============================================================
-- 9. LABOUR WORK
-- =============================================================
CREATE TABLE IF NOT EXISTS public.labour_work (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  labour_id       uuid NOT NULL REFERENCES public.labourers(id) ON DELETE CASCADE,
  work_date       date NOT NULL,
  work_type       text NOT NULL CHECK (work_type IN ('Spray', 'Cutting', 'Cleaning', 'Harvesting', 'General', 'Other')),
  day_type        text NOT NULL CHECK (day_type IN ('Full_Day', 'Half_Day')),
  amount          numeric(10, 2) NOT NULL DEFAULT 0,
  payment_status  text NOT NULL DEFAULT 'Not_Paid' CHECK (payment_status IN ('Paid', 'Not_Paid', 'Pending')),
  payment_date    date,
  payment_mode    text CHECK (payment_mode IN ('Cash', 'UPI', 'Bank_Transfer', 'Cheque')),
  reference_id    text,  -- links to spray/cutting record if auto-generated
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.labour_work ENABLE ROW LEVEL SECURITY;

CREATE POLICY "LabourWork: farmer sees own"
  ON public.labour_work FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "LabourWork: farmer inserts own"
  ON public.labour_work FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "LabourWork: farmer updates own"
  ON public.labour_work FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "LabourWork: farmer deletes own"
  ON public.labour_work FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- =============================================================
-- 10. OTHER EXPENSES
-- =============================================================
CREATE TABLE IF NOT EXISTS public.other_expenses (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  expense_date    date NOT NULL,
  category        text NOT NULL CHECK (category IN ('Fuel', 'Fertilizer', 'Tools', 'Equipment', 'Transport', 'Maintenance', 'Other')),
  description     text NOT NULL DEFAULT '',
  amount          numeric(10, 2) NOT NULL DEFAULT 0,
  payment_status  text NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Paid', 'Not_Paid', 'Pending')),
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.other_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Expenses: farmer sees own"
  ON public.other_expenses FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Expenses: farmer inserts own"
  ON public.other_expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Expenses: farmer updates own"
  ON public.other_expenses FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Expenses: farmer deletes own"
  ON public.other_expenses FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- =============================================================
-- 11. PAYMENTS
-- =============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payee_type       text NOT NULL CHECK (payee_type IN ('Labour', 'Vendor', 'Other')),
  payee_id         uuid,  -- references labourers.id if payee_type = 'Labour'
  payee_name       text NOT NULL,
  payment_date     date NOT NULL,
  amount           numeric(10, 2) NOT NULL DEFAULT 0,
  payment_mode     text NOT NULL CHECK (payment_mode IN ('Cash', 'UPI', 'Bank_Transfer', 'Cheque')),
  reference_number text,
  purpose          text NOT NULL DEFAULT '',
  linked_work_ids  uuid[] NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Payments: farmer sees own"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Payments: farmer inserts own"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Payments: farmer updates own"
  ON public.payments FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Payments: farmer deletes own"
  ON public.payments FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

-- =============================================================
-- INDEXES for performance
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_farms_owner_id         ON public.farms(owner_id);
CREATE INDEX IF NOT EXISTS idx_plots_user_id          ON public.plots(user_id);
CREATE INDEX IF NOT EXISTS idx_plots_farm_id          ON public.plots(farm_id);
CREATE INDEX IF NOT EXISTS idx_pesticides_user_id     ON public.pesticides(user_id);
CREATE INDEX IF NOT EXISTS idx_labourers_user_id      ON public.labourers(user_id);
CREATE INDEX IF NOT EXISTS idx_spray_records_user_id  ON public.spray_records(user_id);
CREATE INDEX IF NOT EXISTS idx_spray_records_plot_id  ON public.spray_records(plot_id);
CREATE INDEX IF NOT EXISTS idx_spray_records_date     ON public.spray_records(spray_date);
CREATE INDEX IF NOT EXISTS idx_spray_usages_spray_id  ON public.spray_pesticide_usages(spray_record_id);
CREATE INDEX IF NOT EXISTS idx_cutting_user_id        ON public.cutting_records(user_id);
CREATE INDEX IF NOT EXISTS idx_cutting_date           ON public.cutting_records(cutting_date);
CREATE INDEX IF NOT EXISTS idx_labour_work_user_id    ON public.labour_work(user_id);
CREATE INDEX IF NOT EXISTS idx_labour_work_date       ON public.labour_work(work_date);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id       ON public.other_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date          ON public.other_expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_payments_user_id       ON public.payments(user_id);
