import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mcqhlvkzrqqphtbqbprk.supabase.co";
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_pvg6rn0O1yZQr66QiUkUaw_rP8hBoH-";

// Auto-correct if copy-pasted without trailing hyphen
if (supabaseAnonKey === "sb_publishable_pvg6rn0O1yZQr66QiUkUaw_rP8hBoH") {
  supabaseAnonKey = "sb_publishable_pvg6rn0O1yZQr66QiUkUaw_rP8hBoH-";
}

export const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || supabaseUrl;
  const key = supabaseAnonKey;
  return Boolean(
    url &&
    key &&
    !url.includes("placeholder-url")
  );
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

