import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { getBotSupabase } from "../database/supabaseClient";
import { config } from "../config";

export const visaStatusCommand = {
  data: new SlashCommandBuilder()
    .setName("visa-status")
    .setDescription("Check your current NOMIX Roleplay visa application status"),
    
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    
    const supabase = getBotSupabase();
    if (!supabase) {
      return interaction.editReply({
        content: `🌐 **NOMIX Visa Status Portal**: View your live status at ${config.websiteUrl}/status`,
      });
    }

    const { data: app } = await supabase
      .from("applications")
      .select("*")
      .eq("discord_id", interaction.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!app) {
      return interaction.editReply({
        content: `❓ You have not submitted a visa application yet. Head over to **${config.websiteUrl}/apply** to start your whitelist process!`,
      });
    }

    const isActionRequired = app.status === "REJECTED" && app.rejection_reason?.includes("[ACTION REQUIRED");
    const color = app.status === "APPROVED" 
      ? 0x10B981 
      : isActionRequired 
      ? 0xF59E0B 
      : app.status === "REJECTED" 
      ? 0xEF4444 
      : 0x00F0FF;

    const statusLabel = app.status === "APPROVED"
      ? "🟢 APPROVED"
      : isActionRequired
      ? "🟠 ACTION REQUIRED (REAPPLY)"
      : app.status === "REJECTED"
      ? "🔴 REJECTED"
      : "🟡 PENDING REVIEW";

    const embed = new EmbedBuilder()
      .setTitle(`NOMIX VISA STATUS — ${app.application_number}`)
      .setColor(color)
      .addFields(
        { name: "Character Name", value: app.character_name, inline: true },
        { name: "Current Status", value: statusLabel, inline: true },
        { name: "Submitted", value: `<t:${Math.floor(new Date(app.submitted_at || app.created_at).getTime() / 1000)}:R>`, inline: true }
      );

    if (app.status === "REJECTED" && app.rejection_reason) {
      if (isActionRequired) {
        const cleanReason = app.rejection_reason.replace(/^\[ACTION REQUIRED(: REAPPLY)?\]\s*/i, "").trim();
        embed.addFields(
          { name: "📝 Admin Revision Instructions", value: `\`\`\`${cleanReason}\`\`\`` },
          { name: "🔗 Direct Reapply Link", value: "[Click here to reapply (No Cooldown)](https://nomixroleplay.xyz/apply)" }
        );
      } else {
        embed.addFields({ name: "Feedback", value: app.rejection_reason });
      }
    }

    return interaction.editReply({ embeds: [embed] });
  },
};
