-- Supabase Schema for Gallery Management System
-- Run this in Supabase SQL Editor

--
-- RESET (safe to run first)
--
-- If you want to start from scratch, run this entire file.
-- The DROP statements below ensure the schema can be applied cleanly.

DROP VIEW IF EXISTS gallery_dashboard_stats;

DROP TABLE IF EXISTS gallery_audit_log CASCADE;
DROP TABLE IF EXISTS exhibition_submissions CASCADE;
DROP TABLE IF EXISTS gallery_managers CASCADE;
DROP TABLE IF EXISTS galleries CASCADE;

DROP FUNCTION IF EXISTS update_updated_at_column();

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Galleries table (linked to Sanity via sanity_gallery_id)
CREATE TABLE IF NOT EXISTS galleries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery managers (for multi-user galleries)
CREATE TABLE IF NOT EXISTS gallery_managers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'manager', 'editor')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gallery_id, user_id)
);

-- Exhibition submissions (before Sanity sync)
CREATE TABLE IF NOT EXISTS exhibition_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
  sanity_exhibition_id TEXT, -- NULL until synced to Sanity
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL, -- Changed to TIMESTAMPTZ for full date-time support
  end_date TIMESTAMPTZ NOT NULL,   -- Changed to TIMESTAMPTZ for full date-time support
  artists TEXT[], -- Array of artist names/IDs
  curators TEXT[], -- Array of curator names (changed from single curator)
  image_url TEXT,
  -- Ticketing structured fields (matching Sanity structure)
  ticketing_access TEXT DEFAULT 'free' CHECK (ticketing_access IN ('free', 'ticketed')),
  ticketing_price TEXT, -- e.g., "$10", "€15", "Free"
  ticketing_link TEXT,
  ticketing_cta_label TEXT, -- Custom CTA label
  venue_override TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'published', 'rejected')),
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ, -- When submitted for review
  approved_at TIMESTAMPTZ,  -- When approved
  published_at TIMESTAMPTZ, -- When synced to Sanity
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Constraint to ensure end_date is after start_date
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- Audit log for gallery actions
CREATE TABLE IF NOT EXISTS gallery_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id UUID REFERENCES galleries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'exhibition_created', 'gallery_updated', etc.
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security Policies

-- Galleries: users can only see/edit galleries they manage
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own galleries"
  ON galleries FOR SELECT
  USING (
    owner_user_id = auth.uid() 
    OR id IN (
      SELECT gallery_id FROM gallery_managers 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own galleries"
  ON galleries FOR UPDATE
  USING (
    owner_user_id = auth.uid() 
    OR id IN (
      SELECT gallery_id FROM gallery_managers 
      WHERE user_id = auth.uid() AND role IN ('owner', 'manager', 'editor')
    )
  );

-- Gallery managers
ALTER TABLE gallery_managers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gallery staff can view their team"
  ON gallery_managers FOR SELECT
  USING (
    gallery_id IN (
      SELECT id FROM galleries
      WHERE owner_user_id = auth.uid()
    )
    OR gallery_id IN (
      SELECT gallery_id FROM gallery_managers
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Gallery owners can add team members"
  ON gallery_managers FOR INSERT
  WITH CHECK (
    gallery_id IN (
      SELECT id FROM galleries
      WHERE owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Gallery owners can update team members"
  ON gallery_managers FOR UPDATE
  USING (
    gallery_id IN (
      SELECT id FROM galleries
      WHERE owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    gallery_id IN (
      SELECT id FROM galleries
      WHERE owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Gallery owners can remove team members"
  ON gallery_managers FOR DELETE
  USING (
    gallery_id IN (
      SELECT id FROM galleries
      WHERE owner_user_id = auth.uid()
    )
  );

-- Exhibition submissions
ALTER TABLE exhibition_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gallery staff can view their submissions"
  ON exhibition_submissions FOR SELECT
  USING (
    gallery_id IN (
      SELECT id FROM galleries WHERE owner_user_id = auth.uid()
      UNION
      SELECT gallery_id FROM gallery_managers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Gallery editors can create submissions"
  ON exhibition_submissions FOR INSERT
  WITH CHECK (
    gallery_id IN (
      SELECT id FROM galleries WHERE owner_user_id = auth.uid()
      UNION
      SELECT gallery_id FROM gallery_managers 
      WHERE user_id = auth.uid() AND role IN ('owner', 'manager', 'editor')
    )
  );

CREATE POLICY "Gallery editors can update their submissions"
  ON exhibition_submissions FOR UPDATE
  USING (
    gallery_id IN (
      SELECT id FROM galleries WHERE owner_user_id = auth.uid()
      UNION
      SELECT gallery_id FROM gallery_managers 
      WHERE user_id = auth.uid() AND role IN ('owner', 'manager', 'editor')
    )
  );

-- Audit log (read-only for gallery staff)
ALTER TABLE gallery_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gallery staff can view their audit log"
  ON gallery_audit_log FOR SELECT
  USING (
    gallery_id IN (
      SELECT id FROM galleries WHERE owner_user_id = auth.uid()
      UNION
      SELECT gallery_id FROM gallery_managers WHERE user_id = auth.uid()
    )
  );

-- Functions and Triggers

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_galleries_updated_at
  BEFORE UPDATE ON galleries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exhibition_submissions_updated_at
  BEFORE UPDATE ON exhibition_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_galleries_owner_user_id ON galleries(owner_user_id);
CREATE INDEX idx_gallery_managers_gallery_id ON gallery_managers(gallery_id);
CREATE INDEX idx_gallery_managers_user_id ON gallery_managers(user_id);
CREATE INDEX idx_exhibition_submissions_gallery_id ON exhibition_submissions(gallery_id);
CREATE INDEX idx_exhibition_submissions_status ON exhibition_submissions(status);
CREATE INDEX idx_audit_log_gallery_id ON gallery_audit_log(gallery_id);
CREATE INDEX idx_audit_log_created_at ON gallery_audit_log(created_at DESC);

-- Views for common queries

-- Gallery dashboard stats
CREATE OR REPLACE VIEW gallery_dashboard_stats AS
SELECT 
  g.id as gallery_id,
  g.name as gallery_name,
  COUNT(DISTINCT es.id) FILTER (WHERE es.status = 'draft') as draft_exhibitions,
  COUNT(DISTINCT es.id) FILTER (WHERE es.status = 'pending_review') as pending_exhibitions,
  COUNT(DISTINCT es.id) FILTER (WHERE es.status = 'published') as published_exhibitions,
  COUNT(DISTINCT gm.id) as team_members,
  MAX(es.created_at) as last_exhibition_created
FROM galleries g
LEFT JOIN exhibition_submissions es ON es.gallery_id = g.id
LEFT JOIN gallery_managers gm ON gm.gallery_id = g.id
GROUP BY g.id, g.name;
