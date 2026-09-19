import { 
  ButtonInteraction, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle, 
  ActionRowBuilder, 
  GuildMember 
} from "discord.js";
import { ApplicationService } from "../services/ApplicationService";
import { DiscordRoleService } from "../services/DiscordRoleService";
import { NotificationService } from "../services/NotificationService";
import { AuditService } from "../services/AuditService";
import { config } from "../config";

export async function handleButtonInteraction(interaction: ButtonInteraction) {
  const customId = interaction.customId;

  // 1. Check Staff Permissions
  const member = interaction.member as GuildMember;
  if (!DiscordRoleService.isStaff(member)) {
    return interaction.reply({
      content: "⛔ **Access Denied**: You do not have the required staff roles to process visa applications.",
      ephemeral: true,
    });
  }

  // 2. VIEW APPLICATION
  if (customId.startsWith("view_app_")) {
    const appId = customId.replace("view_app_", "");
    const app = await ApplicationService.getApplication(appId);

    const targetUrl = `${config.websiteUrl}/admin?id=${appId}`;

    return interaction.reply({
      content: `📋 **Secure Staff Portal**: [Click here to review ${app?.character_name || "Applicant"}'s full application answers and history](${targetUrl})\n*Application ID: \`${app?.application_number || appId}\`*`,
      ephemeral: true,
    });
  }

  // 3. APPROVE VISA
  if (customId.startsWith("approve_app_")) {
    const appId = customId.replace("approve_app_", "");
    await interaction.deferReply({ ephemeral: true });

    const app = await ApplicationService.getApplication(appId);
    if (!app) {
      return interaction.editReply({ content: "❌ Application not found in Supabase database." });
    }

    if (app.status === "APPROVED") {
      return interaction.editReply({ content: "⚠️ This application is already approved." });
    }

    if (!interaction.guild) {
      return interaction.editReply({ content: "❌ Guild context not available." });
    }

    // Step A: Assign Citizen Discord Role
    const roleResult = await DiscordRoleService.assignVerifiedRole(interaction.guild, app.discord_id);
    if (!roleResult.success) {
      console.warn(`[WARN] Role assignment warning for applicant ${app.discord_id}: ${roleResult.error}`);
    }

    // Step B: Update Supabase Application Status
    const updateResult = await ApplicationService.updateApplicationStatus(
      app.id,
      "APPROVED",
      interaction.user.id,
      interaction.user.tag
    );

    if (!updateResult.success) {
      return interaction.editReply({
        content: `❌ Failed to update database status: ${updateResult.error}`,
      });
    }

    // Step C: Update original message embed in Discord review channel
    const updatedApp = {
      ...app,
      status: "APPROVED" as const,
      reviewer_name: interaction.user.tag,
    };
    const updatedEmbed = ApplicationService.createApplicationEmbed(updatedApp);
    const updatedButtons = ApplicationService.createApplicationButtons(app.id, "APPROVED");

    try {
      await interaction.message.edit({
        embeds: [updatedEmbed],
        components: [updatedButtons],
      });
    } catch (e) {
      console.error("Failed to update original message embed:", e);
    }

    // Step D: Send Approval Notification
    await NotificationService.sendApprovalNotification(
      interaction.client,
      updatedApp,
      `<@${interaction.user.id}>`
    );

    // Step E: Record Audit
    await AuditService.logEvent(
      app.id,
      interaction.user.id,
      interaction.user.tag,
      "APPLICATION_APPROVED",
      { role_assigned: roleResult.success, role_error: roleResult.error }
    );

    return interaction.editReply({
      content: `✅ **Visa Approved Successfully** for **${app.character_name}** (<@${app.discord_id}>)! ${
        roleResult.success ? "Citizen role assigned." : `⚠️ Note: ${roleResult.error}`
      }`,
    });
  }

  // 4. REJECT VISA (Open Modal for required feedback reason)
  if (customId.startsWith("reject_app_")) {
    const appId = customId.replace("reject_app_", "");
    
    const modal = new ModalBuilder()
      .setCustomId(`modal_reject_${appId}`)
      .setTitle("Reject Visa Application");

    const reasonInput = new TextInputBuilder()
      .setCustomId("rejection_reason")
      .setLabel("Constructive Reason for Rejection")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Explain which answers fell short (e.g. NVL definition, character backstory depth)...")
      .setRequired(true)
      .setMinLength(10)
      .setMaxLength(1000);

    const row = new ActionRowBuilder<TextInputBuilder>().addComponents(reasonInput);
    modal.addComponents(row);

    return interaction.showModal(modal);
  }
}
