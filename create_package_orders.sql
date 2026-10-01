-- ==============================================================================
-- NOMIX ROLEPLAY - PACKAGE ORDERS SCHEMA & ROW LEVEL SECURITY
-- ==============================================================================

-- 1. Create package_orders table
CREATE TABLE IF NOT EXISTS public.package_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    discord_id TEXT NOT NULL,
    discord_username TEXT NOT NULL,
    discord_avatar TEXT,
    package_tier TEXT NOT NULL CHECK (package_tier IN ('bronze', 'silver', 'gold', 'platinum', 'emerald')),
    package_name TEXT NOT NULL,
    price TEXT NOT NULL,
    character_name TEXT NOT NULL,
    custom_plate TEXT,
    custom_phone TEXT,
    choice_type TEXT,
    vehicle_preference TEXT,
    notes TEXT,
    staff_notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'delivered', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create indexes for instant query performance
CREATE INDEX IF NOT EXISTS idx_package_orders_status ON public.package_orders(status);
CREATE INDEX IF NOT EXISTS idx_package_orders_discord_id ON public.package_orders(discord_id);
CREATE INDEX IF NOT EXISTS idx_package_orders_created_at ON public.package_orders(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.package_orders ENABLE ROW LEVEL SECURITY;

-- 4. RLS Security Policies
CREATE POLICY "Users and Staff can view package orders"
    ON public.package_orders FOR SELECT
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role IN ('staff', 'admin')
        )
    );

CREATE POLICY "Allow inserting package orders"
    ON public.package_orders FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Staff and Admins can update package orders"
    ON public.package_orders FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role IN ('staff', 'admin')
        )
    );
