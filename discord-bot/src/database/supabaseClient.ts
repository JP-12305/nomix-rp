import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "../config";
import WebSocket from "ws";

let botSupabaseInstance: SupabaseClient | null = null;

export const getBotSupabase = () => {
  if (!config.supabaseUrl || !config.supabaseServiceKey) {
    return null;
  }

  if (!botSupabaseInstance) {
    botSupabaseInstance = createClient(config.supabaseUrl, config.supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      realtime: {
        transport: WebSocket as any,
      },
    });
  }

  return botSupabaseInstance;
};
