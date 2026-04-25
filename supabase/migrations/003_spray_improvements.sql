-- ============================================================
-- AgriTrack: New Tables Migration
-- Run this SQL in your Supabase SQL Editor
-- ============================================================

-- 1. SPRAY SCHEDULES
CREATE TABLE IF NOT EXISTS spray_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plot_id UUID NOT NULL REFERENCES plots(id) ON DELETE CASCADE,
  planned_date DATE NOT NULL,
  target_disease TEXT,
  target_pest TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'COMPLETED', 'CANCELLED')),
  converted_to_spray_id UUID REFERENCES spray_records(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE spray_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own spray_schedules"
  ON spray_schedules FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2. SPRAY PHOTOS
CREATE TABLE IF NOT EXISTS spray_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  spray_record_id UUID NOT NULL REFERENCES spray_records(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('BEFORE', 'AFTER')),
  storage_path TEXT NOT NULL,
  file_size_bytes BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE spray_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own spray_photos"
  ON spray_photos FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. SPRAY EFFECTIVENESS
CREATE TABLE IF NOT EXISTS spray_effectiveness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  spray_record_id UUID NOT NULL REFERENCES spray_records(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  effectiveness_notes TEXT,
  disease_controlled BOOLEAN NOT NULL DEFAULT false,
  reapplication_needed BOOLEAN NOT NULL DEFAULT false,
  rated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (spray_record_id, user_id)
);

ALTER TABLE spray_effectiveness ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own spray_effectiveness"
  ON spray_effectiveness FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Supabase Storage: spray-photos bucket
-- Run this in Supabase Dashboard → Storage → New Bucket
-- Name: spray-photos, Public: true

-- 5. Weather columns on spray_records (add if not already present)
ALTER TABLE spray_records
  ADD COLUMN IF NOT EXISTS weather_temperature NUMERIC,
  ADD COLUMN IF NOT EXISTS weather_humidity NUMERIC,
  ADD COLUMN IF NOT EXISTS weather_wind_speed NUMERIC,
  ADD COLUMN IF NOT EXISTS weather_location TEXT,
  ADD COLUMN IF NOT EXISTS weather_detected_at TIMESTAMPTZ;
