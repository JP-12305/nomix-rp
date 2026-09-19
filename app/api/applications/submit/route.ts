import { NextRequest, NextResponse } from "next/server";
import { applicationSchema } from "@/lib/validation/application-schema";
import { mockDb } from "@/lib/data/mock-db";
import { getAdminSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { sendDiscordApplicationEmbed } from "@/lib/discord/discord-notify";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, discord_id, discord_username, ...formData } = body;

    const safeDiscordId = discord_id || "789123456789012345";
    const safeUsername = discord_username || "Applicant";

    // 1. Zod Server-Side Validation
    const validationResult = applicationSchema.safeParse(formData);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Form validation failed.", 
          details: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // 2. Check for duplicate pending/under-review application or cooldown
    if (isSupabaseConfigured()) {
      const supabase = getAdminSupabase();

      // Check existing active application by discord_id
      const { data: existingApps } = await supabase
        .from("applications")
        .select("*")
        .eq("discord_id", safeDiscordId)
        .order("created_at", { ascending: false });

      if (existingApps && existingApps.length > 0) {
        const latest = existingApps[0];
        if (latest.status === "PENDING" || latest.status === "UNDER_REVIEW") {
          return NextResponse.json(
            { error: `You already have an active application (${latest.application_number}) pending staff review.` },
            { status: 409 }
          );
        }
        if (latest.status === "APPROVED") {
          return NextResponse.json(
            { error: "Your visa application has already been approved! Join the city directly." },
            { status: 409 }
          );
        }
        if (latest.status === "REJECTED") {
          const rejectedDate = new Date(latest.reviewed_at || latest.updated_at);
          const cooldownDays = Number(process.env.REAPPLICATION_COOLDOWN_DAYS) || 3;
          const cooldownEnd = new Date(rejectedDate.getTime() + cooldownDays * 24 * 60 * 60 * 1000);
          if (new Date() < cooldownEnd) {
            return NextResponse.json(
              { 
                error: `Reapplication cooldown is active. You may re-apply after ${cooldownEnd.toLocaleDateString()} at ${cooldownEnd.toLocaleTimeString()}.` 
              },
              { status: 429 }
            );
          }
        }
      }

      // Ensure a valid profile exists for user_id / discord_id
      let finalUserId: string | null = null;
      const isValidUUID = user_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user_id);

      // Check existing profile in database
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("discord_id", safeDiscordId)
        .maybeSingle();

      if (existingProfile) {
        finalUserId = existingProfile.id;
      } else {
        // Upsert profile to obtain a valid UUID
        const newProfilePayload: any = {
          discord_id: safeDiscordId,
          username: safeUsername,
          display_name: safeUsername,
          role: "applicant",
        };
        if (isValidUUID) {
          newProfilePayload.id = user_id;
        }

        const { data: createdProfile } = await supabase
          .from("profiles")
          .upsert(newProfilePayload, { onConflict: "discord_id" })
          .select("id")
          .maybeSingle();

        finalUserId = createdProfile?.id || null;
      }

      // Generate sequential application number
      const { count } = await supabase.from("applications").select("*", { count: "exact", head: true });
      const appNumber = `NMX-${String((count || 0) + 1045).padStart(5, "0")}`;

      const { data: insertedApp, error: appError } = await supabase
        .from("applications")
        .insert({
          application_number: appNumber,
          user_id: finalUserId,
          discord_id: safeDiscordId,
          discord_username: safeUsername,
          character_name: data.char_name,
          character_age: data.char_age,
          character_gender: data.char_gender,
          status: "PENDING",
        })
        .select()
        .single();

      if (appError) {
        console.error("Database insert error:", appError);
        return NextResponse.json({ error: appError.message }, { status: 500 });
      }

      // Insert questionnaire answers
      const answersToInsert = Object.entries(data).map(([key, val]) => ({
        application_id: insertedApp.id,
        question_key: key,
        answer_text: String(val),
      }));

      await supabase.from("application_answers").insert(answersToInsert);

      // Log application event
      await supabase.from("application_events").insert({
        application_id: insertedApp.id,
        actor_name: safeUsername,
        event_type: "APPLICATION_SUBMITTED",
        metadata: { app_number: appNumber },
      });

      // Post notification embed to Discord staff channel
      await sendDiscordApplicationEmbed(insertedApp);

      return NextResponse.json({ success: true, application: insertedApp });
    } else {
      // Mock / Local Dev Mode
      const existing = mockDb.getApplicationByDiscordId(safeDiscordId);
      if (existing && (existing.status === "PENDING" || existing.status === "UNDER_REVIEW")) {
        return NextResponse.json(
          { error: `You already have an active application (${existing.application_number}) pending staff review.` },
          { status: 409 }
        );
      }

      const newApp = mockDb.createApplication({
        user_id: user_id || "usr-demo-applicant",
        discord_id: safeDiscordId,
        discord_username: safeUsername,
        character_name: data.char_name,
        character_age: data.char_age,
        character_gender: data.char_gender,
        answers: Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, String(v)])
        ),
      });

      return NextResponse.json({ success: true, application: newApp });
    }
  } catch (err: any) {
    console.error("Application submission error:", err);
    return NextResponse.json({ error: err.message || "Internal server error." }, { status: 500 });
  }
}
