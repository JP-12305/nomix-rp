import { PackageOrder } from "@/types";

export interface DiscordRoleResult {
  success: boolean;
  roleId?: string;
  roleName?: string;
  error?: string;
  skipped?: boolean;
  details?: string;
}

/**
 * Maps package tier to corresponding Discord Role ID from environment variables.
 */
export function getTierRoleId(tier: string): string | null {
  const normalizedTier = tier.toLowerCase().trim();
  
  if (normalizedTier === "silver") {
    return process.env.DISCORD_SILVER_ROLE_ID || process.env.DISCORD_SUPPORTER_ROLE_ID || null;
  }
  if (normalizedTier === "gold") {
    return process.env.DISCORD_GOLD_ROLE_ID || process.env.DISCORD_SUPPORTER_ROLE_ID || null;
  }
  if (normalizedTier === "emerald") {
    return process.env.DISCORD_EMERALD_ROLE_ID || process.env.DISCORD_SUPPORTER_ROLE_ID || null;
  }

  return process.env.DISCORD_SUPPORTER_ROLE_ID || null;
}

export function getTierDisplayName(tier: string): string {
  const normalizedTier = tier.toLowerCase().trim();
  if (normalizedTier === "emerald") return "Emerald Supporter";
  if (normalizedTier === "gold") return "Gold Supporter";
  if (normalizedTier === "silver") return "Silver Supporter";
  return "Supporter";
}

/**
 * Grants a supporter role to a Discord member using the Discord REST API v10.
 */
export async function grantDiscordSupporterRole(
  discordId: string,
  tier: string
): Promise<DiscordRoleResult> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  const roleId = getTierRoleId(tier);
  const roleName = getTierDisplayName(tier);

  if (!botToken || botToken === "your-discord-bot-token" || !guildId || guildId === "your-discord-guild-id") {
    return {
      success: false,
      skipped: true,
      roleName,
      details: "Discord Bot Token or Guild ID is not configured in .env. Role assignment skipped.",
    };
  }

  if (!roleId || roleId.startsWith("your-")) {
    return {
      success: false,
      skipped: true,
      roleName,
      details: `Discord Role ID for ${roleName} is not configured in .env (DISCORD_${tier.toUpperCase()}_ROLE_ID).`,
    };
  }

  if (!discordId) {
    return {
      success: false,
      roleName,
      error: "No Discord ID provided for this user.",
    };
  }

  try {
    const url = `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}/roles/${roleId}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
        "X-Audit-Log-Reason": `Automated Package Delivery: ${roleName} granted via NOMIX Staff Console`,
      },
    });

    if (response.status === 204) {
      return {
        success: true,
        roleId,
        roleName,
        details: `Successfully assigned @${roleName} role to Discord user <@${discordId}>.`,
      };
    }

    if (response.status === 404) {
      return {
        success: false,
        roleId,
        roleName,
        error: `Discord user <@${discordId}> is not in the NOMIX Discord server.`,
      };
    }

    if (response.status === 403) {
      return {
        success: false,
        roleId,
        roleName,
        error: `Bot lacks 'Manage Roles' permission or the Bot's highest role is lower than '@${roleName}' in Server Settings -> Roles.`,
      };
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      success: false,
      roleId,
      roleName,
      error: errorData.message || `Discord API returned status ${response.status}`,
    };
  } catch (error: any) {
    console.error("[DISCORD ROLE GRANT ERROR]", error);
    return {
      success: false,
      roleId,
      roleName,
      error: error.message || "Network error while contacting Discord API.",
    };
  }
}

/**
 * Revokes a supporter role from a Discord member if needed (e.g. refund or expiration).
 */
export async function removeDiscordSupporterRole(
  discordId: string,
  tier: string
): Promise<DiscordRoleResult> {
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  const roleId = getTierRoleId(tier);
  const roleName = getTierDisplayName(tier);

  if (!botToken || !guildId || !roleId || !discordId) {
    return { success: false, skipped: true };
  }

  try {
    const url = `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}/roles/${roleId}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bot ${botToken}`,
        "X-Audit-Log-Reason": `Package Expired/Cancelled: ${roleName} removed via NOMIX Staff Console`,
      },
    });

    return {
      success: response.status === 204,
      roleId,
      roleName,
    };
  } catch (error: any) {
    console.error("[DISCORD ROLE REMOVE ERROR]", error);
    return { success: false, error: error.message };
  }
}

/**
 * Sends a Discord delivery notification embed to staff/announcement channel.
 */
export async function sendDiscordDeliveryWebhook(
  order: PackageOrder,
  staffName?: string
): Promise<boolean> {
  const webhookUrl = 
    process.env.DISCORD_DELIVERY_WEBHOOK_URL || 
    process.env.DISCORD_PACKAGE_DELIVERY_WEBHOOK_URL || 
    process.env.DISCORD_PACKAGE_ORDERS_WEBHOOK_URL;

  if (!webhookUrl || webhookUrl.startsWith("your-")) {
    return false;
  }

  try {
    const color = 
      order.package_tier === "emerald" ? 0x10B981 :
      order.package_tier === "gold" ? 0xF59E0B : 
      0x94A3B8;

    const embed = {
      title: `📦 Package Delivered: ${order.package_name.toUpperCase()} TIER`,
      description: `Thank you for supporting **NOMIX Roleplay**! Your package perks have been fulfilled and delivered.`,
      color,
      fields: [
        {
          name: "👤 Supporter",
          value: `<@${order.discord_id}> (${order.discord_username})`,
          inline: true,
        },
        {
          name: "🎮 Character Name",
          value: `**${order.character_name}**`,
          inline: true,
        },
        {
          name: "⭐ Package Tier",
          value: `**${order.package_name}** (${order.price})`,
          inline: true,
        },
        ...(order.custom_plate ? [{
          name: "🚗 Custom License Plate",
          value: `\`${order.custom_plate}\``,
          inline: true,
        }] : []),
        ...(order.custom_phone ? [{
          name: "📱 Custom Phone Number",
          value: `\`${order.custom_phone}\``,
          inline: true,
        }] : []),
        {
          name: "🛡️ Delivered By",
          value: staffName || "Server Staff",
          inline: true,
        },
      ],
      footer: {
        text: `NOMIX RP Supporter System • Order Ref: ${order.id.slice(0, 8).toUpperCase()}`,
      },
      timestamp: new Date().toISOString(),
    };

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "NOMIX Delivery Dispatcher",
        avatar_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200",
        embeds: [embed],
      }),
    });

    return res.ok;
  } catch (err) {
    console.warn("[DISCORD WEBHOOK ERROR] Delivery broadcast failed:", err);
    return false;
  }
}
