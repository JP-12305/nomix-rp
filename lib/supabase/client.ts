import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Auto-correct if copy-pasted without trailing hyphen
if (supabaseAnonKey && supabaseAnonKey.endsWith("rP8hBoH")) {
  supabaseAnonKey = supabaseAnonKey + "-";
}

export const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || supabaseUrl;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || supabaseAnonKey;
  return Boolean(
    url &&
    key &&
    !url.includes("placeholder-url") &&
    !key.includes("placeholder")
  );
};

export const supabase = createClient(
  supabaseUrl || "https://placeholder-url.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

