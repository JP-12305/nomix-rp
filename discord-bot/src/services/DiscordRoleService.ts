import { Guild, GuildMember, PermissionsBitField } from "discord.js";
import { config } from "../config";

export class DiscordRoleService {
  static isStaff(member: GuildMember): boolean {
    if (!member) return false;

    // Always allow server administrators or guild owners
    if (member.permissions.has(PermissionsBitField.Flags.Administrator) || member.guild.ownerId === member.id) {
      return true;
    }

    const hasConfiguredStaffRole = Boolean(config.staffRoleId && !config.staffRoleId.startsWith("your-"));
    const hasConfiguredAdminRole = Boolean(config.adminRoleId && !config.adminRoleId.startsWith("your-"));

    if (!hasConfiguredStaffRole && !hasConfiguredAdminRole) {
      // If staff roles are not specifically configured yet, allow users with Manage Guild/Roles permission
      return member.permissions.has(PermissionsBitField.Flags.ManageGuild) ||
             member.permissions.has(PermissionsBitField.Flags.ManageRoles);
    }

    return (
      (hasConfiguredStaffRole && member.roles.cache.has(config.staffRoleId)) ||
      (hasConfiguredAdminRole && member.roles.cache.has(config.adminRoleId))
    );
  }

  static async assignVerifiedRole(guild: Guild, targetDiscordId: string): Promise<{ success: boolean; error?: string }> {
    if (!config.verifiedRoleId || config.verifiedRoleId.startsWith("your-")) {
      return { success: false, error: "DISCORD_VERIFIED_ROLE_ID is not configured." };
    }

    try {
      const member = await guild.members.fetch(targetDiscordId).catch(() => null);
      if (!member) {
        return { success: false, error: "Applicant is not in the Discord server." };
      }

      const role = await guild.roles.fetch(config.verifiedRoleId).catch(() => null);
      if (!role) {
        return { success: false, error: `Verified role ID (${config.verifiedRoleId}) not found on Discord server.` };
      }

      const botMember = guild.members.me;
      if (!botMember) {
        return { success: false, error: "Bot member information unavailable." };
      }

      if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        return { success: false, error: "Bot lacks 'Manage Roles' permission in server." };
      }

      if (botMember.roles.highest.position <= role.position) {
        return { 
          success: false, 
          error: `Bot's highest role is lower than or equal to '@${role.name}'. Please drag the Bot's role above '@${role.name}' in Discord Server Settings -> Roles.` 
        };
      }

      await member.roles.add(role);
      return { success: true };
    } catch (err: any) {
      console.error("[ROLE ERROR] Failed to assign citizen role:", err);
      return { success: false, error: err.message || "Failed to assign role." };
    }
  }

  static async assignPackageRole(
    guild: Guild, 
    targetDiscordId: string, 
    tier: string
  ): Promise<{ success: boolean; roleName?: string; error?: string }> {
    const normalizedTier = tier.toLowerCase();
    let roleId = "";
    let roleName = "Supporter";

    if (normalizedTier === "silver") {
      roleId = config.silverRoleId;
      roleName = "Silver Supporter";
    } else if (normalizedTier === "gold") {
      roleId = config.goldRoleId;
      roleName = "Gold Supporter";
    } else if (normalizedTier === "emerald") {
      roleId = config.emeraldRoleId;
      roleName = "Emerald Supporter";
    }

    if (!roleId || roleId.startsWith("your-")) {
      return { success: false, error: `Role ID for ${roleName} is not configured in .env.` };
    }

    try {
      const member = await guild.members.fetch(targetDiscordId).catch(() => null);
      if (!member) {
        return { success: false, error: "Supporter is not in the Discord server." };
      }

      const role = await guild.roles.fetch(roleId).catch(() => null);
      if (!role) {
        return { success: false, error: `Role ID (${roleId}) not found on Discord server.` };
      }

      const botMember = guild.members.me;
      if (!botMember || !botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
        return { success: false, error: "Bot lacks 'Manage Roles' permission in server." };
      }

      if (botMember.roles.highest.position <= role.position) {
        return { 
          success: false, 
          error: `Bot's role position is lower than or equal to '@${role.name}'.` 
        };
      }

      await member.roles.add(role);
      return { success: true, roleName };
    } catch (err: any) {
      console.error(`[ROLE ERROR] Failed to assign ${roleName}:`, err);
      return { success: false, error: err.message || "Failed to assign role." };
    }
  }
}
