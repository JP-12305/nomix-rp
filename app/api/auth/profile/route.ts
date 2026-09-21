import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const discordId = searchParams.get("discord_id");

    if (!id && !discordId) {
      return NextResponse.json({ error: "Missing identifier" }, { status: 400 });
    }

    const supabase = getAdminSupabase();
    let query = supabase.from("profiles").select("*");

    if (id) {
      query = query.eq("id", id);
    } else if (discordId) {
      query = query.eq("discord_id", discordId);
    }

    const { data: profile, error } = await query.maybeSingle();

    if (error) {
      console.error("Profile query error:", error);
      return NextResponse.json({ profile: null, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (err: any) {
    console.error("Profile GET route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, discord_id, username, display_name, avatar_url } = body;

    if (!id && !discord_id) {
      return NextResponse.json({ error: "Missing user identity" }, { status: 400 });
    }

    const supabase = getAdminSupabase();

    // 1. Look up existing profile by ID or discord_id
    let existingProfile = null;
    if (id) {
      const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
      existingProfile = data;
    }
    if (!existingProfile && discord_id) {
      const { data } = await supabase.from("profiles").select("*").eq("discord_id", discord_id).maybeSingle();
      existingProfile = data;
    }

    if (existingProfile) {
      // Update metadata while keeping their existing role intact
      const { data: updated } = await supabase
        .from("profiles")
        .update({
          username: username || existingProfile.username,
          display_name: display_name || existingProfile.display_name,
          avatar_url: avatar_url || existingProfile.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingProfile.id)
        .select()
        .maybeSingle();

      return NextResponse.json({ profile: updated || existingProfile });
    }

    // 2. Insert new profile with default role 'applicant'
    const newRecord: any = {
      discord_id: discord_id || null,
      username: username || "User",
      display_name: display_name || username || "User",
      avatar_url: avatar_url || null,
      role: "applicant",
    };

    if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      newRecord.id = id;
    } else {
      newRecord.id = crypto.randomUUID();
    }

    const { data: created, error: insertErr } = await supabase
      .from("profiles")
      .upsert(newRecord, { onConflict: discord_id ? "discord_id" : "id" })
      .select()
      .maybeSingle();

    if (insertErr) {
      console.error("Profile insert error:", insertErr);
      return NextResponse.json({ profile: newRecord, warning: insertErr.message });
    }

    return NextResponse.json({ profile: created || newRecord });
  } catch (err: any) {
    console.error("Profile POST route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
