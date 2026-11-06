-- Add missing delivery audit and staff columns to package_orders table
ALTER TABLE public.package_orders ADD COLUMN IF NOT EXISTS staff_notes TEXT;
ALTER TABLE public.package_orders ADD COLUMN IF NOT EXISTS discord_role_assigned BOOLEAN DEFAULT false;
ALTER TABLE public.package_orders ADD COLUMN IF NOT EXISTS delivered_by TEXT;
ALTER TABLE public.package_orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

