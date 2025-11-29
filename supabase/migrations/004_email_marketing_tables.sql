-- =====================================================
-- MIGRATION: Email Marketing & Communication Tables
-- Created: 2025-11-28
-- Description: Tables pour système de marketing email,
--              contact, feedback et bug reports
-- =====================================================

-- =====================================================
-- 1. EMAIL CAMPAIGNS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Campaign details
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  template_name TEXT NOT NULL, -- 'newsletter', 'promotion', 'announcement', 're-engagement'
  template_data JSONB NOT NULL DEFAULT '{}', -- Dynamic template props

  -- Targeting
  audience_id TEXT, -- Resend audience ID (optional, can send to specific users)
  recipient_count INTEGER DEFAULT 0,

  -- Scheduling
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'failed'
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,

  -- Analytics
  opens INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  bounces INTEGER DEFAULT 0,

  -- Metadata
  created_by TEXT, -- Admin user ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_status CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  CONSTRAINT valid_template CHECK (template_name IN ('newsletter', 'promotion', 'announcement', 're-engagement'))
);

-- Index for filtering campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled ON public.email_campaigns(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_created ON public.email_campaigns(created_at DESC);

-- =====================================================
-- 2. CONTACTS TABLE (User contact form submissions)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Contact details
  user_id TEXT, -- If authenticated user
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'new', -- 'new', 'in_progress', 'resolved'
  assigned_to TEXT, -- Admin user ID

  -- Response
  response TEXT,
  responded_at TIMESTAMPTZ,
  responded_by TEXT, -- Admin user ID

  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_contact_status CHECK (status IN ('new', 'in_progress', 'resolved'))
);

-- Indexes for contact management
CREATE INDEX IF NOT EXISTS idx_contacts_status ON public.contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_user ON public.contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_created ON public.contacts(created_at DESC);

-- =====================================================
-- 3. FEEDBACK TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Feedback details
  user_id TEXT NOT NULL, -- REFERENCES users(id)
  type TEXT NOT NULL, -- 'feature_request', 'improvement', 'praise', 'other'
  category TEXT, -- 'ui', 'ai', 'performance', 'documentation', etc.
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  rating INTEGER, -- 1-5 stars (optional)

  -- Status
  status TEXT NOT NULL DEFAULT 'submitted', -- 'submitted', 'reviewing', 'planned', 'implemented', 'rejected'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'

  -- Admin response
  admin_notes TEXT,
  reviewed_by TEXT, -- Admin user ID
  reviewed_at TIMESTAMPTZ,

  -- Metadata
  page_url TEXT, -- Where feedback was submitted
  browser_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_feedback_type CHECK (type IN ('feature_request', 'improvement', 'praise', 'other')),
  CONSTRAINT valid_feedback_status CHECK (status IN ('submitted', 'reviewing', 'planned', 'implemented', 'rejected')),
  CONSTRAINT valid_feedback_priority CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT valid_rating CHECK (rating >= 1 AND rating <= 5)
);

-- Indexes for feedback management
CREATE INDEX IF NOT EXISTS idx_feedback_user ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON public.feedback(type);
CREATE INDEX IF NOT EXISTS idx_feedback_priority ON public.feedback(priority);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON public.feedback(created_at DESC);

-- =====================================================
-- 4. BUG REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bug_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Bug details
  user_id TEXT NOT NULL, -- REFERENCES users(id)
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  steps_to_reproduce TEXT,
  expected_behavior TEXT,
  actual_behavior TEXT,

  -- Severity & Status
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  status TEXT NOT NULL DEFAULT 'open', -- 'open', 'investigating', 'in_progress', 'fixed', 'wont_fix'

  -- Technical details
  browser TEXT,
  os TEXT,
  screen_resolution TEXT,
  error_message TEXT,
  stack_trace TEXT,
  console_logs TEXT,
  screenshot_url TEXT,

  -- Assignment
  assigned_to TEXT, -- Admin/developer user ID
  assigned_at TIMESTAMPTZ,

  -- Resolution
  fixed_in_version TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT, -- Admin user ID
  resolution_notes TEXT,

  -- Metadata
  page_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_bug_severity CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  CONSTRAINT valid_bug_status CHECK (status IN ('open', 'investigating', 'in_progress', 'fixed', 'wont_fix'))
);

-- Indexes for bug tracking
CREATE INDEX IF NOT EXISTS idx_bugs_user ON public.bug_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_bugs_status ON public.bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bugs_severity ON public.bug_reports(severity);
CREATE INDEX IF NOT EXISTS idx_bugs_assigned ON public.bug_reports(assigned_to);
CREATE INDEX IF NOT EXISTS idx_bugs_created ON public.bug_reports(created_at DESC);

-- =====================================================
-- 5. NEWSLETTERS TABLE (Archive des newsletters envoyées)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.newsletters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Newsletter details
  campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL, -- Structured content sections

  -- Publication
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published'
  published_at TIMESTAMPTZ,
  published_by TEXT, -- Admin user ID

  -- Archive URL (if published on website)
  archive_url TEXT,

  -- Analytics
  recipients INTEGER DEFAULT 0,
  opens INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_newsletter_status CHECK (status IN ('draft', 'published'))
);

-- Index for newsletters
CREATE INDEX IF NOT EXISTS idx_newsletters_status ON public.newsletters(status);
CREATE INDEX IF NOT EXISTS idx_newsletters_published ON public.newsletters(published_at DESC);

-- =====================================================
-- 6. UPDATE TRIGGERS (updated_at auto-update)
-- =====================================================

-- Trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at
  BEFORE UPDATE ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bug_reports_updated_at
  BEFORE UPDATE ON public.bug_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletters_updated_at
  BEFORE UPDATE ON public.newsletters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. COMMENTS
-- =====================================================

COMMENT ON TABLE public.email_campaigns IS 'Email marketing campaigns (newsletters, promotions, announcements)';
COMMENT ON TABLE public.contacts IS 'User contact form submissions';
COMMENT ON TABLE public.feedback IS 'User feedback and feature requests';
COMMENT ON TABLE public.bug_reports IS 'Bug reports from users';
COMMENT ON TABLE public.newsletters IS 'Archive of published newsletters';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
