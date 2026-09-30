import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/data/mock-db";
import { getAdminSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { ApplicationStatus } from "@/types";
import { 
  assignDiscordCitizenRole, 
  removeDiscordCitizenRole,
  sendDiscordApprovalEmbed, 
  sendDiscordRejectionEmbed,
  sendDiscordRevocationEmbed,
  sendDiscordActionRequiredEmbed
} from "@/lib/discord/discord-notify";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, rejection_reason, reviewer, is_admin_override, action } = body as {
      status: ApplicationStatus;
      rejection_reason?: string;
      reviewer: { id: string; name: string; role?: string };
      is_admin_override?: boolean;
      action?: string;
    };

    const isActionRequired = action === "ACTION_REQUIRED" || status === ("ACTION_REQUIRED" as any) || rejection_reason?.startsWith("[ACTION REQUIRED");

    const effectiveStatus: ApplicationStatus = isActionRequired ? "REJECTED" : status;

    if (!effectiveStatus || !["APPROVED", "REJECTED", "UNDER_REVIEW"].includes(effectiveStatus)) {
      return NextResponse.json({ error: "Invalid status transition." }, { status: 400 });
    }

    if (!reviewer?.name) {
      return NextResponse.json({ error: "Reviewer information required." }, { status: 401 });
    }

    if (isSupabaseConfigured()) {
      const supabase = getAdminSupabase();

      // Check current state safely avoiding UUID cast errors
      const isParamUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id);
      let appQuery = supabase.from("applications").select("*");
      if (isParamUUID) {
        appQuery = appQuery.or(`id.eq.${params.id},application_number.eq.${params.id}`);
      } else {
        appQuery = appQuery.eq("application_number", params.id);
      }
      const { data: app, error: fetchErr } = await appQuery.single();

      if (fetchErr || !app) {
        return NextResponse.json({ error: "Application not found." }, { status: 404 });
      }

      // Determine if reviewer has admin role
      let isReviewerAdmin = reviewer.role === "admin" || is_admin_override === true;
      if (reviewer.id) {
        const isReviewerIdUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reviewer.id);
        let profileQuery = supabase.from("profiles").select("role");
        if (isReviewerIdUUID) {
          profileQuery = profileQuery.or(`id.eq.${reviewer.id},discord_id.eq.${reviewer.id}`);
        } else {
          profileQuery = profileQuery.eq("discord_id", reviewer.id);
        }
        const { data: profile } = await profileQuery.single();
        if (profile?.role === "admin") {
          isReviewerAdmin = true;
        }
      }

      const isValidReviewerUUID = reviewer.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reviewer.id);
      const finalReviewerId: string | null = isValidReviewerUUID ? reviewer.id : null;
      const now = new Date().toISOString();
      const guildId = process.env.DISCORD_GUILD_ID || "1459096221129113680";
      const citizenRoleId = process.env.DISCORD_VERIFIED_ROLE_ID || "1550803618653937714";
      const specificReapplyLink = "https://nomixroleplay.xyz/apply";

      // -------------------------------------------------------------
      // SPECIAL CASE: ACTION REQUIRED / REAPPLY REQUESTED
      // -------------------------------------------------------------
      if (isActionRequired) {
        const rawReason = rejection_reason?.replace(/^\[ACTION REQUIRED(: REAPPLY)?\]\s*/i, "").trim();
        if (!rawReason || rawReason.length < 5) {
          return NextResponse.json(
            { error: "Please provide a constructive reason explaining what actions/corrections the applicant must take (min 5 characters)." },
            { status: 400 }
          );
        }

        const finalReason = `[ACTION REQUIRED: REAPPLY] ${rawReason}`;

        // If previously approved, ensure admin authority and strip citizen role
        if (app.status === "APPROVED") {
          if (!isReviewerAdmin) {
            return NextResponse.json(
              { error: "Only Administrators can request reapplication on an approved citizen visa." },
              { status: 403 }
            );
          }
          try {
            if (app.discord_id && guildId && citizenRoleId) {
              await removeDiscordCitizenRole(guildId, app.discord_id, citizenRoleId);
            }
          } catch (e) {
            console.error("Citizen role removal error:", e);
          }
        }

        const { data: updatedApp, error: updateErr } = await supabase
          .from("applications")
          .update({
            status: "REJECTED",
            rejection_reason: finalReason,
            reviewer_id: finalReviewerId,
            reviewed_at: now,
            updated_at: now,
          })
          .eq("id", app.id)
          .select()
          .single();

        if (updateErr) {
          return NextResponse.json({ error: updateErr.message }, { status: 500 });
        }

        // Insert audit event
        await supabase.from("application_events").insert({
          application_id: app.id,
          actor_id: finalReviewerId,
          actor_name: reviewer.name,
          event_type: "ACTION_REQUIRED_REQUESTED",
          metadata: { 
            previous_status: app.status, 
            status: "ACTION_REQUIRED", 
            reason: rawReason,
            admin_name: reviewer.name,
            reapply_url: specificReapplyLink
          },
        });

        // Dispatch Discord Action Required Embed
        try {
          await sendDiscordActionRequiredEmbed(updatedApp, reviewer.name, rawReason, specificReapplyLink);
        } catch (discordErr) {
          console.error("Discord action required notify error (non-fatal):", discordErr);
        }

        // Fetch full updated application record with answers, notes, and audit events
        const { data: fullApp } = await supabase
          .from("applications")
          .select("*, answers:application_answers(*), notes:staff_notes(*), events:application_events(*)")
          .eq("id", app.id)
          .single();

        return NextResponse.json({ success: true, application: fullApp || updatedApp, action: "ACTION_REQUIRED" });
      }

      // -------------------------------------------------------------
      // CASE 1: Previously APPROVED Application
      // -------------------------------------------------------------
      if (app.status === "APPROVED") {
        if (effectiveStatus === "APPROVED") {
          return NextResponse.json(
            { error: "This application is already approved." },
            { status: 400 }
          );
        }

        if (effectiveStatus === "REJECTED") {
          // ADMIN OVERRIDE: Revoke Visa
          if (!isReviewerAdmin) {
            return NextResponse.json(
              { error: "Permission Denied: Only Administrators have authority to revoke an approved citizen visa." },
              { status: 403 }
            );
          }

          if (!rejection_reason || rejection_reason.trim().length < 5) {
            return NextResponse.json(
              { error: "An administrative reason is mandatory when revoking an approved visa (min 5 characters)." },
              { status: 400 }
            );
          }

          const rawReason = rejection_reason.trim();
          const finalReason = rawReason.startsWith("[REVOKED BY ADMIN]") 
            ? rawReason 
            : `[REVOKED BY ADMIN] ${rawReason}`;

          const { data: updatedApp, error: updateErr } = await supabase
            .from("applications")
            .update({
              status: "REJECTED",
              rejection_reason: finalReason,
              reviewer_id: finalReviewerId,
              reviewed_at: now,
              updated_at: now,
            })
            .eq("id", app.id)
            .select()
            .single();

          if (updateErr) {
            return NextResponse.json({ error: updateErr.message }, { status: 500 });
          }

          // Insert audit event
          await supabase.from("application_events").insert({
            application_id: app.id,
            actor_id: finalReviewerId,
            actor_name: reviewer.name,
            event_type: "VISA_REVOKED_BY_ADMIN",
            metadata: { 
              previous_status: "APPROVED", 
              status: "REJECTED", 
              reason: rawReason,
              admin_name: reviewer.name
            },
          });

          // Discord Automation: Remove Citizen Role & Dispatch Revocation Notice
          try {
            if (app.discord_id && guildId && citizenRoleId) {
              await removeDiscordCitizenRole(guildId, app.discord_id, citizenRoleId);
            }
            await sendDiscordRevocationEmbed(updatedApp, reviewer.name, rawReason);
          } catch (discordErr) {
            console.error("Discord revocation dispatch error (non-fatal):", discordErr);
          }

          // Fetch full updated application record with answers, notes, and audit events to prevent UI state resets
          const { data: fullApp } = await supabase
            .from("applications")
            .select("*, answers:application_answers(*), notes:staff_notes(*), events:application_events(*)")
            .eq("id", app.id)
            .single();

          return NextResponse.json({ success: true, application: fullApp || updatedApp, action: "REVOKED" });
        }

        // Any other transition from APPROVED requires admin
        if (!isReviewerAdmin) {
          return NextResponse.json(
            { error: "Only Administrators can modify an approved application." },
            { status: 403 }
          );
        }
      }

      // -------------------------------------------------------------
      // CASE 2: Previously REJECTED Application
      // -------------------------------------------------------------
      if (app.status === "REJECTED") {
        if (effectiveStatus === "REJECTED") {
          return NextResponse.json(
            { error: "This application has already been rejected." },
            { status: 400 }
          );
        }

        if (effectiveStatus === "APPROVED") {
          // ADMIN OVERRIDE: Overrule Rejection & Grant Visa
          if (!isReviewerAdmin) {
            return NextResponse.json(
              { error: "Permission Denied: Only Administrators have authority to overrule a rejected application." },
              { status: 403 }
            );
          }

          const { data: updatedApp, error: updateErr } = await supabase
            .from("applications")
            .update({
              status: "APPROVED",
              rejection_reason: null,
              reviewer_id: finalReviewerId,
              reviewed_at: now,
              updated_at: now,
            })
            .eq("id", app.id)
            .select()
            .single();

          if (updateErr) {
            return NextResponse.json({ error: updateErr.message }, { status: 500 });
          }

          // Insert audit event
          await supabase.from("application_events").insert({
            application_id: app.id,
            actor_id: finalReviewerId,
            actor_name: reviewer.name,
            event_type: "VISA_OVERRULED_BY_ADMIN",
            metadata: { 
              previous_status: "REJECTED", 
              status: "APPROVED", 
              admin_name: reviewer.name 
            },
          });

          // Discord Automation: Assign Citizen Role & Dispatch Approval Announcement
          try {
            if (app.discord_id && guildId && citizenRoleId) {
              await assignDiscordCitizenRole(guildId, app.discord_id, citizenRoleId);
            }
            await sendDiscordApprovalEmbed(updatedApp, `${reviewer.name} (Admin Override)`);
          } catch (discordErr) {
            console.error("Discord approval dispatch error (non-fatal):", discordErr);
          }

          // Fetch full updated application record with answers, notes, and audit events
          const { data: fullApp } = await supabase
            .from("applications")
            .select("*, answers:application_answers(*), notes:staff_notes(*), events:application_events(*)")
            .eq("id", app.id)
            .single();

          return NextResponse.json({ success: true, application: fullApp || updatedApp, action: "OVERRULED_APPROVED" });
        }

        if (!isReviewerAdmin) {
          return NextResponse.json(
            { error: "Only Administrators can modify a finalized rejected application." },
            { status: 403 }
          );
        }
      }

      // -------------------------------------------------------------
      // CASE 3: Initial Review (PENDING or UNDER_REVIEW)
      // -------------------------------------------------------------
      if (effectiveStatus === "REJECTED" && (!rejection_reason || rejection_reason.trim().length < 5)) {
        return NextResponse.json(
          { error: "A constructive rejection reason is mandatory (min 5 characters)." },
          { status: 400 }
        );
      }

      const updatePayload: Record<string, any> = {
        status: effectiveStatus,
        reviewer_id: finalReviewerId,
        reviewed_at: now,
        updated_at: now,
      };

      if (effectiveStatus === "REJECTED") {
        updatePayload.rejection_reason = rejection_reason?.trim();
      } else if (effectiveStatus === "APPROVED") {
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

      // Record standard audit event
      const eventType = effectiveStatus === "APPROVED" 
        ? "APPLICATION_APPROVED" 
        : effectiveStatus === "REJECTED" 
        ? "APPLICATION_REJECTED" 
        : "APPLICATION_REVIEW_STARTED";

      await supabase.from("application_events").insert({
        application_id: app.id,
        actor_id: finalReviewerId,
        actor_name: reviewer.name,
        event_type: eventType,
        metadata: { status: effectiveStatus, rejection_reason },
      });

      // Automated Discord Actions (non-blocking)
      if (effectiveStatus === "APPROVED") {
        try {
          if (app.discord_id && guildId && citizenRoleId) {
            await assignDiscordCitizenRole(guildId, app.discord_id, citizenRoleId);
          }
          await sendDiscordApprovalEmbed(updatedApp, reviewer.name);
        } catch (discordErr) {
          console.error("Discord approval dispatch error (non-fatal):", discordErr);
        }
      } else if (effectiveStatus === "REJECTED") {
        try {
          const cooldownDays = Number(process.env.REAPPLICATION_COOLDOWN_DAYS) || 3;
          await sendDiscordRejectionEmbed(updatedApp, reviewer.name, rejection_reason || "Application did not meet standards.", cooldownDays);
        } catch (discordErr) {
          console.error("Discord rejection dispatch error (non-fatal):", discordErr);
        }
      }

      // Fetch full updated application record with answers, notes, and audit events
      const { data: fullApp } = await supabase
        .from("applications")
        .select("*, answers:application_answers(*), notes:staff_notes(*), events:application_events(*)")
        .eq("id", app.id)
        .single();

      return NextResponse.json({ success: true, application: fullApp || updatedApp });
    } else {
      // Mock / Dev Store
      const result = mockDb.updateApplicationStatus(
        params.id, 
        status, 
        reviewer, 
        rejection_reason, 
        is_admin_override || reviewer.role === "admin"
      );
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
