import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/data/mock-db";
import { getAdminSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { ApplicationStatus } from "@/types";
import { assignDiscordCitizenRole } from "@/lib/discord/discord-notify";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, rejection_reason, reviewer } = body as {
      status: ApplicationStatus;
      rejection_reason?: string;
      reviewer: { id: string; name: string };
    };

    if (!status || !["APPROVED", "REJECTED", "UNDER_REVIEW"].includes(status)) {
      return NextResponse.json({ error: "Invalid status transition." }, { status: 400 });
    }

    if (!reviewer?.name) {
      return NextResponse.json({ error: "Reviewer information required." }, { status: 401 });
    }

    if (status === "REJECTED" && (!rejection_reason || rejection_reason.trim().length < 5)) {
      return NextResponse.json(
        { error: "A constructive rejection reason is mandatory." },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured()) {
      const supabase = getAdminSupabase();

      // Check current state
      const { data: app, error: fetchErr } = await supabase
        .from("applications")
        .select("*")
        .or(`id.eq.${params.id},application_number.eq.${params.id}`)
        .single();

      if (fetchErr || !app) {
        return NextResponse.json({ error: "Application not found." }, { status: 404 });
      }

      if (app.status === "APPROVED" && status === "APPROVED") {
        return NextResponse.json(
          { error: "This application has already been approved." },
          { status: 400 }
        );
      }

      const isValidReviewerUUID = reviewer.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reviewer.id);
      let finalReviewerId: string | null = isValidReviewerUUID ? reviewer.id : null;

      const now = new Date().toISOString();
      const updatePayload: Record<string, any> = {
        status,
        reviewer_id: finalReviewerId,
        reviewed_at: now,
        updated_at: now,
      };

      if (status === "REJECTED") {
        updatePayload.rejection_reason = rejection_reason;
      } else if (status === "APPROVED") {
        updatePayload.rejection_reason = null;
      }

      const { data: updatedApp, error: updateErr } = await supabase
        .from("applications")
        .update(updatePayload)
        .eq("id", app.id)
        .select()
        .single();

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      // Record audit event
      const eventType = status === "APPROVED" ? "APPLICATION_APPROVED" : status === "REJECTED" ? "APPLICATION_REJECTED" : "APPLICATION_REVIEW_STARTED";
      await supabase.from("application_events").insert({
        application_id: app.id,
        actor_id: finalReviewerId,
        actor_name: reviewer.name,
        event_type: eventType,
        metadata: { status, rejection_reason },
      });

      // If approved, trigger Discord citizen role assignment
      if (status === "APPROVED" && app.discord_id) {
        const guildId = process.env.DISCORD_GUILD_ID;
        const roleId = process.env.DISCORD_VERIFIED_ROLE_ID;
        if (guildId && roleId) {
          await assignDiscordCitizenRole(guildId, app.discord_id, roleId);
        }
      }

      return NextResponse.json({ success: true, application: updatedApp });
    } else {
      // Mock / Dev Store
      const result = mockDb.updateApplicationStatus(params.id, status, reviewer, rejection_reason);
      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, application: result.application });
    }
  } catch (err: any) {
    console.error("Review action error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
