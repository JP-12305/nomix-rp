import { 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle 
} from "discord.js";
import { config } from "../config";
import { getBotSupabase } from "../database/supabaseClient";

export interface ApplicationRecord {
  id: string;
  application_number: string;
  discord_id: string;
  discord_username: string;
  character_name: string;
  character_age: number;
  character_gender: string;
  status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  rejection_reason?: string;
  reviewer_name?: string;
  submitted_at: string;
}

export class ApplicationService {
  static createApplicationEmbed(app: ApplicationRecord): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle(`━━━━━━━━━━━━━━━━━━━━━━━━\nNOMIX ROLEPLAY — VISA APPLICATION\n━━━━━━━━━━━━━━━━━━━━━━━━`)
      .setDescription(`A new citizen visa application has been submitted and is awaiting staff evaluation.`)
      .setColor(app.status === "APPROVED" ? 0x10B981 : app.status === "REJECTED" ? 0xEF4444 : 0x00F0FF)
      .addFields(
        { name: "👤 Applicant", value: `<@${app.discord_id}> (${app.discord_username})`, inline: true },
        { name: "🆔 Application ID", value: `\`${app.application_number}\``, inline: true },
        { name: "🎭 Character", value: `**${app.character_name}** (${app.character_age}, ${app.character_gender})`, inline: true },
        { 
          name: "📊 Status", 
          value: app.status === "APPROVED" ? "🟢 **APPROVED**" : app.status === "REJECTED" ? "🔴 **REJECTED**" : "🟡 **PENDING REVIEW**", 
          inline: true 
        },
        { name: "📅 Submitted At", value: `<t:${Math.floor(new Date(app.submitted_at).getTime() / 1000)}:R>`, inline: true }
      )
      .setFooter({ text: "NOMIX RP • Automated Visa System" })
      .setTimestamp();

    if (app.status === "REJECTED" && app.rejection_reason) {
      embed.addFields({ name: "❌ Rejection Reason", value: `\`\`\`${app.rejection_reason}\`\`\`` });
    }

    if (app.reviewer_name) {
      embed.addFields({ name: "👮 Reviewed By", value: app.reviewer_name, inline: true });
    }

    return embed;
  }

  static createApplicationButtons(appId: string, status: string): ActionRowBuilder<ButtonBuilder> {
    const row = new ActionRowBuilder<ButtonBuilder>();

    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`view_app_${appId}`)
        .setLabel("📋 View Application")
        .setStyle(ButtonStyle.Primary)
    );

    if (status === "PENDING" || status === "UNDER_REVIEW") {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`approve_app_${appId}`)
          .setLabel("🟢 Approve Visa")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`reject_app_${appId}`)
          .setLabel("🔴 Reject Visa")
          .setStyle(ButtonStyle.Danger)
      );
    } else {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`processed_${appId}`)
          .setLabel(`Status: ${status}`)
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true)
      );
    }

    return row;
  }

  static async getApplication(idOrNumber: string): Promise<ApplicationRecord | null> {
    const supabase = getBotSupabase();
    if (!supabase) return null;

    const { data } = await supabase
      .from("applications")
      .select("*")
      .or(`id.eq.${idOrNumber},application_number.eq.${idOrNumber}`)
      .single();

    return data || null;
  }

  static async updateApplicationStatus(
    id: string,
    status: "APPROVED" | "REJECTED",
    reviewerDiscordId: string,
    reviewerName: string,
    rejectionReason?: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = getBotSupabase();
    if (!supabase) {
      return { success: true };
    }

    // Resolve or upsert staff reviewer UUID in public.profiles
    let finalReviewerUUID: string | null = null;
    const isValidUUID = reviewerDiscordId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reviewerDiscordId);

    if (isValidUUID) {
      finalReviewerUUID = reviewerDiscordId;
    } else if (reviewerDiscordId) {
      const { data: staffProfile } = await supabase
        .from("profiles")
        .upsert({
          discord_id: reviewerDiscordId,
          username: reviewerName || "StaffMember",
          display_name: reviewerName || "Staff Member",
          role: "staff",
        }, { onConflict: "discord_id" })
        .select("id")
        .maybeSingle();

      finalReviewerUUID = staffProfile?.id || null;
    }

    const updatePayload: any = {
      status,
      reviewer_id: finalReviewerUUID,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (status === "REJECTED") {
      updatePayload.rejection_reason = rejectionReason;
    }

    const { error } = await supabase
      .from("applications")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  }
}
