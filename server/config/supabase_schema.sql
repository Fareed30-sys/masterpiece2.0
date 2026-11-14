-- ========================================================
-- OmniPulse AI - Supabase Database Schema
-- Run this in your Supabase Project: SQL Editor -> New Query -> Run
-- ========================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    password_hash TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'agent')),
    company_name TEXT DEFAULT 'CloudScale Inc.',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Knowledge Items Table
CREATE TABLE IF NOT EXISTS public.knowledge_items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tickets Table
CREATE TABLE IF NOT EXISTS public.tickets (
    id TEXT PRIMARY KEY,
    ticket_number TEXT UNIQUE NOT NULL,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
    assigned_agent_id TEXT,
    is_voice_message BOOLEAN DEFAULT FALSE,
    audio_duration INTEGER DEFAULT 0,
    ai_analysis JSONB DEFAULT '{}'::jsonb,
    messages JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Insight Reports Table
CREATE TABLE IF NOT EXISTS public.insight_reports (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    tickets_analyzed_count INTEGER DEFAULT 0,
    overall_health_score INTEGER DEFAULT 80,
    executive_summary TEXT,
    top_pain_points JSONB DEFAULT '[]'::jsonb,
    churn_drivers JSONB DEFAULT '[]'::jsonb,
    recommendations JSONB DEFAULT '[]'::jsonb,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) and permissive access for demo API
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insight_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write for OmniPulse API" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write for OmniPulse API" ON public.tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write for OmniPulse API" ON public.knowledge_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write for OmniPulse API" ON public.insight_reports FOR ALL USING (true) WITH CHECK (true);

-- Seed Demo Users
INSERT INTO public.users (id, name, email, password, role, company_name)
VALUES
    ('user_1', 'Sarah Connor', 'agent@omnipulse.ai', 'password123', 'agent', 'OmniPulse CX Operations'),
    ('user_2', 'Alex Rivera', 'alex.rivera@techcorp.io', 'password123', 'customer', 'TechCorp Solutions'),
    ('user_3', 'Elena Rostova', 'elena@novaworks.com', 'password123', 'customer', 'NovaWorks LLC')
ON CONFLICT (email) DO NOTHING;

-- Seed Knowledge Base
INSERT INTO public.knowledge_items (id, title, category, content, tags)
VALUES
    ('kb_1', 'Webhook Integration & Retry Policies', 'Technical Issue', 'OmniPulse dispatches webhooks via HTTPS POST with exponential backoff retrying up to 5 times (1s, 5s, 25s, 2m, 10m).', ARRAY['webhooks', 'api', 'retries']),
    ('kb_2', 'Billing Cycle & Credit Card Updates', 'Billing', 'Billing invoices are generated on the 1st of every calendar month. Update payment methods via Account Settings -> Payment Methods.', ARRAY['billing', 'invoices', 'credit-card']),
    ('kb_3', 'Role-Based Access Control (RBAC)', 'Account', 'OmniPulse supports Owner, Admin, Agent, and Viewer roles. Enterprise plans include custom SSO via SAML/OIDC.', ARRAY['rbac', 'roles', 'security', 'sso'])
ON CONFLICT (id) DO NOTHING;
