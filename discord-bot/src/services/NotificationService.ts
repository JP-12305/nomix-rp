import { Client, EmbedBuilder, TextChannel } from "discord.js";
import { config } from "../config";
import { ApplicationRecord } from "./ApplicationService";

export class NotificationService {
  static async sendApprovalNotification(
    client: Client,
    app: ApplicationRecord,
    staffTag: string
  ): Promise<void> {
    if (!config.approvedChannelId) return;

    try {
      const channel = await client.channels.fetch(config.approvedChannelId) as TextChannel;
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setTitle("🎉 VISA APPROVED — WELCOME TO NOMIX")
        .setDescription(`Congratulations <@${app.discord_id}>! Your citizen visa application has been officially approved by the staff team.`)
        .setColor(0x10B981)
        .addFields(
          { name: "👤 Citizen", value: `<@${app.discord_id}>`, inline: true },
          { name: "🎭 Character", value: `**${app.character_name}**`, inline: true },
          { name: "🆔 Application", value: `\`${app.application_number}\``, inline: true },
          { name: "👮 Approved By", value: staffTag, inline: true },
          { name: "⚡ Discord Role", value: "✓ Citizen Role Assigned", inline: true },
          { name: "🌐 FiveM Server", value: "Ready for connection", inline: true }
        )
        .setFooter({ text: "NOMIX Roleplay • Welcome to the City" })
        .setTimestamp();

      await channel.send({ content: `<@${app.discord_id}>`, embeds: [embed] });
    } catch (err) {
      console.error("[NOTIFICATION ERROR] Failed to send approval notification:", err);
    }
  }

  static async sendRejectionNotification(
    client: Client,
    app: ApplicationRecord,
    staffTag: string,
    reason: string
  ): Promise<void> {
    if (!config.rejectedChannelId) return;

    try {
      const channel = await client.channels.fetch(config.rejectedChannelId) as TextChannel;
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setTitle("❌ VISA APPLICATION REJECTED")
        .setDescription(`Hello <@${app.discord_id}>, your visa application did not meet our roleplay standards at this time.`)
        .setColor(0xEF4444)
        .addFields(
          { name: "👤 Applicant", value: `<@${app.discord_id}>`, inline: true },
          { name: "🆔 Application", value: `\`${app.application_number}\``, inline: true },
          { name: "👮 Reviewed By", value: staffTag, inline: true },
          { name: "📝 Reason / Feedback", value: `\`\`\`${reason}\`\`\`` },
          { name: "⏳ Reapplication", value: "You may re-apply once your 3-day cooldown expires." }
        )
        .setFooter({ text: "NOMIX Roleplay • Recruitment Team" })
        .setTimestamp();

      await channel.send({ content: `<@${app.discord_id}>`, embeds: [embed] });
    } catch (err) {
      console.error("[NOTIFICATION ERROR] Failed to send rejection notification:", err);
    }
  }
}
