-- ==============================================================================
-- NOMIX ROLEPLAY SCHEMA DEFINITION & ROW LEVEL SECURITY
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    discord_id TEXT UNIQUE,
    username TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'applicant' CHECK (role IN ('applicant', 'staff', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. APPLICATION QUESTIONS
CREATE TABLE IF NOT EXISTS public.application_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_number INTEGER NOT NULL,
    field_key TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    description TEXT,
    question_type TEXT NOT NULL CHECK (question_type IN ('text', 'textarea', 'number', 'select', 'radio', 'checkbox')),
    options JSONB,
    placeholder TEXT,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    min_length INTEGER,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    discord_id TEXT NOT NULL,
    discord_username TEXT NOT NULL,
    character_name TEXT NOT NULL,
    character_age INTEGER NOT NULL,
    character_gender TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED')),
    rejection_reason TEXT,
    reviewer_id UUID REFERENCES public.profiles(id),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. APPLICATION ANSWERS
CREATE TABLE IF NOT EXISTS public.application_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.application_questions(id),
    question_key TEXT NOT NULL,
    answer_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. APPLICATION REVIEWS
CREATE TABLE IF NOT EXISTS public.application_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.profiles(id),
    reviewer_name TEXT,
    decision TEXT NOT NULL CHECK (decision IN ('APPROVED', 'REJECTED', 'UNDER_REVIEW')),
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. STAFF NOTES (Private to staff only)
CREATE TABLE IF NOT EXISTS public.staff_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.profiles(id),
    staff_name TEXT NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. APPLICATION EVENTS (Audit logging)
CREATE TABLE IF NOT EXISTS public.application_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    actor_id UUID,
    actor_name TEXT,
    event_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. RULE CATEGORIES
CREATE TABLE IF NOT EXISTS public.rule_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. RULES
CREATE TABLE IF NOT EXISTS public.rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.rule_categories(id) ON DELETE CASCADE,
    rule_number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    content TEXT,
    severity TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. FAQ CATEGORIES & FAQS
CREATE TABLE IF NOT EXISTS public.faq_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.faq_categories(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. NEWS CATEGORIES & ARTICLES
CREATE TABLE IF NOT EXISTS public.news_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    color TEXT NOT NULL DEFAULT '#00F0FF',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.news_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    cover_image TEXT,
    category_id UUID REFERENCES public.news_categories(id),
    author_name TEXT NOT NULL DEFAULT 'NOMIX Staff',
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. SERVER SETTINGS
CREATE TABLE IF NOT EXISTS public.server_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR OPTIMAL QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_applications_discord_id ON public.applications(discord_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_number ON public.applications(application_number);
CREATE INDEX IF NOT EXISTS idx_application_answers_app_id ON public.application_answers(application_id);
CREATE INDEX IF NOT EXISTS idx_staff_notes_app_id ON public.staff_notes(application_id);
CREATE INDEX IF NOT EXISTS idx_application_events_app_id ON public.application_events(application_id);
CREATE INDEX IF NOT EXISTS idx_rules_category_id ON public.rules(category_id);
CREATE INDEX IF NOT EXISTS idx_news_articles_slug ON public.news_articles(slug);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rule_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_settings ENABLE ROW LEVEL SECURITY;

-- Helper functions for user roles
CREATE OR REPLACE FUNCTION public.is_staff(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_uuid AND role IN ('staff', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_uuid AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Public Read for Content (Rules, FAQ, News, Active Questions)
CREATE POLICY "Public can view active rule categories" 
    ON public.rule_categories FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active rules" 
    ON public.rules FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view faq categories" 
    ON public.faq_categories FOR SELECT USING (true);

CREATE POLICY "Public can view active faqs" 
    ON public.faqs FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view news categories" 
    ON public.news_categories FOR SELECT USING (true);

CREATE POLICY "Public can view published news" 
    ON public.news_articles FOR SELECT USING (is_published = true);

CREATE POLICY "Public can view active questions" 
    ON public.application_questions FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view settings" 
    ON public.server_settings FOR SELECT USING (true);

-- 3. Application Policies (Applicants can view/create own; Staff can view/edit all)
CREATE POLICY "Users can view own applications" 
    ON public.applications FOR SELECT 
    USING (auth.uid() = user_id OR public.is_staff(auth.uid()));

CREATE POLICY "Authenticated users can submit applications" 
    ON public.applications FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can update applications" 
    ON public.applications FOR UPDATE 
    USING (public.is_staff(auth.uid()));

CREATE POLICY "Users can view own answers" 
    ON public.application_answers FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.applications 
            WHERE applications.id = application_answers.application_id 
            AND (applications.user_id = auth.uid() OR public.is_staff(auth.uid()))
        )
    );

CREATE POLICY "Users can insert answers for own application" 
    ON public.application_answers FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.applications 
            WHERE applications.id = application_answers.application_id 
            AND applications.user_id = auth.uid()
        )
    );

-- 4. Staff Notes: STRICTLY Staff Only
CREATE POLICY "Staff can view staff notes" 
    ON public.staff_notes FOR SELECT 
    USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can insert staff notes" 
    ON public.staff_notes FOR INSERT 
    WITH CHECK (public.is_staff(auth.uid()));

-- 5. Application Events (Audit)
CREATE POLICY "Users can view own events, staff view all" 
    ON public.application_events FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.applications 
            WHERE applications.id = application_events.application_id 
            AND (applications.user_id = auth.uid() OR public.is_staff(auth.uid()))
        )
    );

CREATE POLICY "Staff and system can insert audit events" 
    ON public.application_events FOR INSERT 
    WITH CHECK (true);

-- 6. Admin Management Policies
CREATE POLICY "Admins can manage rules" 
    ON public.rules FOR ALL 
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage rule categories" 
    ON public.rule_categories FOR ALL 
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage faqs" 
    ON public.faqs FOR ALL 
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage news" 
    ON public.news_articles FOR ALL 
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage questions" 
    ON public.application_questions FOR ALL 
    USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage settings" 
    ON public.server_settings FOR ALL 
    USING (public.is_admin(auth.uid()));
