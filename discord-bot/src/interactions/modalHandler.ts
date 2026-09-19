import { ModalSubmitInteraction, GuildMember } from "discord.js";
import { ApplicationService } from "../services/ApplicationService";
import { DiscordRoleService } from "../services/DiscordRoleService";
import { NotificationService } from "../services/NotificationService";
import { AuditService } from "../services/AuditService";

export async function handleModalSubmit(interaction: ModalSubmitInteraction) {
  const customId = interaction.customId;

  if (customId.startsWith("modal_reject_")) {
    const appId = customId.replace("modal_reject_", "");
    const reason = interaction.fields.getTextInputValue("rejection_reason");

    await interaction.deferReply({ ephemeral: true });

    const member = interaction.member as GuildMember;
    if (!DiscordRoleService.isStaff(member)) {
      return interaction.editReply({
        content: "⛔ **Access Denied**: Staff privileges required.",
      });
    }

    const app = await ApplicationService.getApplication(appId);
    if (!app) {
      return interaction.editReply({ content: "❌ Application not found." });
    }

    // Update Supabase
    const updateResult = await ApplicationService.updateApplicationStatus(
      app.id,
      "REJECTED",
      interaction.user.id,
      interaction.user.tag,
      reason
    );

    if (!updateResult.success) {
      return interaction.editReply({ content: `❌ Failed to update database: ${updateResult.error}` });
    }

    const updatedApp = {
      ...app,
      status: "REJECTED" as const,
      rejection_reason: reason,
      reviewer_name: interaction.user.tag,
    };

    // Update original review message embed if present
    if (interaction.message) {
      const updatedEmbed = ApplicationService.createApplicationEmbed(updatedApp);
      const updatedButtons = ApplicationService.createApplicationButtons(app.id, "REJECTED");
      try {
        await interaction.message.edit({
          embeds: [updatedEmbed],
          components: [updatedButtons],
        });
      } catch (e) {
        console.error("Failed to update original message after rejection:", e);
      }
    }

    // Send Rejection Notification
    await NotificationService.sendRejectionNotification(
      interaction.client,
      updatedApp,
      `<@${interaction.user.id}>`,
      reason
    );

    // Audit Log
    await AuditService.logEvent(
      app.id,
      interaction.user.id,
      interaction.user.tag,
      "APPLICATION_REJECTED",
      { reason }
    );

    return interaction.editReply({
      content: `❌ **Visa Application Rejected** for **${app.character_name}** (<@${app.discord_id}>).\n**Reason**: \`${reason}\``,
    });
  }
}
