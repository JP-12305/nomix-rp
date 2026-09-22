import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/data/mock-db";
import { getAdminSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { note, staff } = body as {
      note: string;
      staff: { id: string; name: string };
    };

    if (!note || note.trim().length === 0) {
      return NextResponse.json({ error: "Note cannot be empty." }, { status: 400 });
    }

    if (!staff?.name) {
      return NextResponse.json({ error: "Staff identity required." }, { status: 401 });
    }

    if (isSupabaseConfigured()) {
      const supabase = getAdminSupabase();

      // Look up application safely avoiding UUID cast error
      const isParamUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id);
      let appQuery = supabase.from("applications").select("id");
      if (isParamUUID) {
        appQuery = appQuery.or(`id.eq.${params.id},application_number.eq.${params.id}`);
      } else {
        appQuery = appQuery.eq("application_number", params.id);
      }
      const { data: app, error: fetchErr } = await appQuery.single();

      if (fetchErr || !app) {
        return NextResponse.json({ error: "Application not found." }, { status: 404 });
      }

      const isValidStaffUUID = staff.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(staff.id);
      const finalStaffId = isValidStaffUUID ? staff.id : null;

      const { data: insertedNote, error: noteErr } = await supabase
        .from("staff_notes")
        .insert({
          application_id: app.id,
          staff_id: finalStaffId,
          staff_name: staff.name,
          note,
        })
        .select()
        .single();

      if (noteErr) {
        return NextResponse.json({ error: noteErr.message }, { status: 500 });
      }

      await supabase.from("application_events").insert({
        application_id: app.id,
        actor_id: finalStaffId,
        actor_name: staff.name,
        event_type: "STAFF_NOTE_ADDED",
        metadata: { note_id: insertedNote.id },
      });

      return NextResponse.json({ success: true, note: insertedNote });
    } else {
      const newNote = mockDb.addStaffNote(params.id, staff, note);
      if (!newNote) {
        return NextResponse.json({ error: "Application not found." }, { status: 404 });
      }
      return NextResponse.json({ success: true, note: newNote });
    }
  } catch (err: any) {
    console.error("Staff note error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
