import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/data/mock-db";
import { getAdminSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    if (isSupabaseConfigured()) {
      const supabase = getAdminSupabase();
      let query = supabase
        .from("applications")
        .select("*, answers:application_answers(*), notes:staff_notes(*), events:application_events(*)")
        .order("created_at", { ascending: false });

      if (status && status !== "ALL") {
        query = query.eq("status", status);
      }

      if (search) {
        query = query.or(`application_number.ilike.%${search}%,character_name.ilike.%${search}%,discord_username.ilike.%${search}%,discord_id.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(
        { applications: data || [] },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
            "Pragma": "no-cache",
            "Expires": "0",
          },
        }
      );
    } else {
      let apps = mockDb.getApplications();

      if (status && status !== "ALL") {
        apps = apps.filter((a) => a.status === status);
      }

      if (search) {
        const q = search.toLowerCase();
        apps = apps.filter(
          (a) =>
            a.application_number.toLowerCase().includes(q) ||
            a.character_name.toLowerCase().includes(q) ||
            a.discord_username.toLowerCase().includes(q) ||
            a.discord_id.toLowerCase().includes(q)
        );
      }

      return NextResponse.json({ applications: apps });
    }
  } catch (err: any) {
    console.error("Admin applications error:", err);
    return NextResponse.json({ error: "Failed to fetch applications." }, { status: 500 });
  }
}
