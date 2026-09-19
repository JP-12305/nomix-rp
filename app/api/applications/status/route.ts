import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/data/mock-db";
import { getAdminSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const discordId = searchParams.get("discord_id");
    const userId = searchParams.get("user_id");
    const appId = searchParams.get("id");

    if (isSupabaseConfigured()) {
      const supabase = getAdminSupabase();
      let query = supabase.from("applications").select("*, answers:application_answers(*), events:application_events(*)");

      if (appId) {
        query = query.or(`id.eq.${appId},application_number.eq.${appId}`);
      } else if (discordId) {
        query = query.eq("discord_id", discordId).order("created_at", { ascending: false });
      } else if (userId) {
        query = query.eq("user_id", userId).order("created_at", { ascending: false });
      } else {
        return NextResponse.json({ error: "Missing identifier parameter" }, { status: 400 });
      }

      const { data, error } = await query.limit(1).single();

      if (error || !data) {
        return NextResponse.json({ application: null });
      }

      return NextResponse.json({ application: data });
    } else {
      // Mock Data Store
      let app = null;
      if (appId) {
        app = mockDb.getApplicationById(appId);
      } else if (discordId) {
        app = mockDb.getApplicationByDiscordId(discordId);
      } else if (userId) {
        app = mockDb.getApplicationByUserId(userId);
      }

      // If still not found, return the top seed app for rich demo visualization
      if (!app && (discordId === "789123456789012345" || !discordId)) {
        app = mockDb.getApplications()[0] || null;
      }

      return NextResponse.json({ application: app });
    }
  } catch (err: any) {
    console.error("Status fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}
