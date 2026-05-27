-- Supabase SQL Database Schema Setup for Startup Validation (Damusia)

-- 1. Create interested_users table
CREATE TABLE IF NOT EXISTS interested_users (
  id BIGSERIAL PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  gender TEXT NOT NULL,
  dob DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- Enforce unique constraint per project to prevent duplicate signups
  CONSTRAINT unique_project_phone UNIQUE (project_id, phone)
);

-- 2. Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id BIGSERIAL PRIMARY KEY,
  project_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  clicked_join BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE interested_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies to allow anonymous public insertions
CREATE POLICY "Allow public insert to interested_users"
  ON interested_users
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public insert to analytics"
  ON analytics
  FOR INSERT
  WITH CHECK (true);

-- 5. Create Policies to allow anonymous public read of interest count
CREATE POLICY "Allow public read of interest counts"
  ON interested_users
  FOR SELECT
  USING (true);

-- 6. Add indexes to optimize queries
CREATE INDEX IF NOT EXISTS idx_interested_users_project_phone ON interested_users (project_id, phone);
CREATE INDEX IF NOT EXISTS idx_analytics_project_id ON analytics (project_id);
