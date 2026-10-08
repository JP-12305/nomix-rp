import { PackageOrder } from "@/types";

export async function sendDiscordApplicationEmbed(
  app: {
    id: string;
    application_number: string;
    discord_id: string;
    discord_username: string;
    character_name: string;
    character_age: number;
    character_gender: string;
    status: string;
    submitted_at?: string;
    created_at?: string;
  },
  details?: {
    irl_name?: string;
    ic_name?: string;
    irl_sex?: string;
    native_language?: string;
    age?: number;
    country?: string;
    timezone?: string;
    fivem_id?: string;
    is_content_creator?: boolean;
    creator_platform?: string;
  }
) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_APPLICATION_CHANNEL_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nomixrp.com";

  if (!token || !channelId || channelId.includes("your-") || token.includes("your-")) return;

  try {
    const rawDate = app.submitted_at || app.created_at || new Date().toISOString();
    const parsedTime = Math.floor(new Date(rawDate).getTime() / 1000) || Math.floor(Date.now() / 1000);

    const embedFields: Array<{ name: string; value: string; inline?: boolean }> = [
      { name: "👤 Applicant", value: `<@${app.discord_id}> (\`${app.discord_username}\`)`, inline: true },
      { name: "🆔 Application ID", value: `\`${app.application_number}\``, inline: true },
      { name: "📊 Status", value: "🟡 **PENDING REVIEW**", inline: true },
    ];

    if (details?.irl_name) {
      embedFields.push({ name: "🪪 IRL Name", value: `**${details.irl_name}**`, inline: true });
    }

    embedFields.push({
      name: "🎭 Character (IC)",
      value: `**${details?.ic_name || app.character_name}** (${details?.age || app.character_age} yrs, ${app.character_gender})`,
      inline: true,
    });

    if (details?.irl_sex || details?.native_language) {
      const parts = [];
      if (details.irl_sex) parts.push(`Sex: **${details.irl_sex}**`);
      if (details.native_language) parts.push(`Language: **${details.native_language}**`);
      embedFields.push({ name: "🗣️ IRL Details", value: parts.join(" • ") || "N/A", inline: true });
    }

    if (details?.country || details?.timezone) {
      embedFields.push({
        name: "📍 Location / Timezone",
        value: `${details.country || "N/A"} (${details.timezone || "N/A"})`,
        inline: true,
      });
    }

    if (details?.fivem_id) {
      embedFields.push({ name: "🎮 FiveM Name", value: `\`${details.fivem_id}\``, inline: true });
    }

    if (details?.is_content_creator) {
      embedFields.push({
        name: "🎥 Content Creator",
        value: `⭐ **${details.creator_platform || "Streamer"}**`,
        inline: true,
      });
    }

    embedFields.push({ name: "📅 Submitted", value: `<t:${parsedTime}:R>`, inline: true });

    const embed = {
      title: "━━━━━━━━━━━━━━━━━━━━━━━━\nNOMIX ROLEPLAY — VISA APPLICATION\n━━━━━━━━━━━━━━━━━━━━━━━━",
      description: "A new citizen visa application has been submitted on the website and is awaiting staff evaluation.",
      color: 0x00f0ff,
      fields: embedFields,
      footer: { text: "NOMIX RP • Automated Visa System" },
      timestamp: new Date().toISOString(),
    };

    // Use direct deep-link buttons to avoid Discord 3-second gateway interaction timeouts
    const components = [
      {
        type: 1, // ActionRow
        components: [
          {
            type: 2, // Button
            style: 5, // Link
            label: "📋 Review in Staff Dashboard",
            url: `${siteUrl}/admin?appId=${app.id}`,
          },
          {
            type: 2,
            style: 5,
            label: "📊 View Visa Status",
            url: `${siteUrl}/status`,
          },
        ],
      },
    ];

    const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [embed],
        components,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[DISCORD NOTIFY] Failed to post message:", res.status, errText);
    } else {
      console.log("[DISCORD NOTIFY] ✅ Posted application review embed to Discord channel!");
    }
  } catch (err) {
    console.error("[DISCORD NOTIFY ERROR]", err);
  }
}

export async function sendDiscordApprovalEmbed(app: {
  id: string;
  application_number: string;
  discord_id: string;
  discord_username: string;
  character_name: string;
  character_age: number;
  character_gender: string;
}, reviewerName: string) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_APPROVED_CHANNEL_ID || process.env.DISCORD_APPLICATION_CHANNEL_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nomixrp.com";
  const connectUrl = process.env.NEXT_PUBLIC_FIVEM_CONNECT_URL || "fivem://connect/play.nomixroleplay.xyz";

  if (!token || !channelId || channelId.includes("your-") || token.includes("your-")) return;

  try {
    const embed = {
      title: "━━━━━━━━━━━━━━━━━━━━━━━━\n🟢 CITIZEN VISA APPROVED\n━━━━━━━━━━━━━━━━━━━━━━━━",
      description: `Congratulations <@${app.discord_id}>! Your citizen visa application has been **APPROVED** by the NOMIX RP Staff Team.\n\nYou have been granted the official **Citizen** whitelist role in Discord and are authorized to enter the city.`,
      color: 0x10b981, // Emerald Green
      fields: [
        { name: "👤 Citizen", value: `<@${app.discord_id}> (\`${app.discord_username}\`)`, inline: true },
        { name: "🆔 Application ID", value: `\`${app.application_number}\``, inline: true },
        { name: "🎭 Character", value: `**${app.character_name}** (${app.character_age}, ${app.character_gender})`, inline: true },
        { name: "🛡️ Reviewed By", value: `**${reviewerName}**`, inline: true },
        { name: "🎮 FiveM Direct Connect", value: `\`${connectUrl}\``, inline: true },
        { name: "📋 City Rules", value: `[Read Guidelines](${siteUrl}/rules)`, inline: true },
      ],
      footer: { text: "NOMIX RP • Citizen Whitelist System" },
      timestamp: new Date().toISOString(),
    };

    const components = [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 5,
            label: "🌐 View Citizen Visa Status",
            url: `${siteUrl}/status`,
          },
          {
            type: 2,
            style: 5,
            label: "📖 Server Rules & Guidelines",
            url: `${siteUrl}/rules`,
          },
        ],
      },
    ];

    const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `🎉 Congratulations <@${app.discord_id}>, your citizen visa application has been approved!`,
        embeds: [embed],
        components,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[DISCORD APPROVAL NOTIFY] Failed:", res.status, errText);
    } else {
      console.log(`[DISCORD APPROVAL NOTIFY] ✅ Posted approval embed for ${app.discord_username}`);
    }
  } catch (err) {
    console.error("[DISCORD APPROVAL NOTIFY ERROR]", err);
  }
}

export async function sendDiscordRejectionEmbed(app: {
  id: string;
  application_number: string;
  discord_id: string;
  discord_username: string;
  character_name: string;
  character_age: number;
  character_gender: string;
}, reviewerName: string, rejectionReason: string, cooldownDays: number = 3) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_REJECTED_CHANNEL_ID || process.env.DISCORD_APPLICATION_CHANNEL_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nomixrp.com";

  if (!token || !channelId || channelId.includes("your-") || token.includes("your-")) return;

  try {
    const cooldownEnd = new Date(Date.now() + cooldownDays * 24 * 60 * 60 * 1000);
    const cooldownTimestamp = Math.floor(cooldownEnd.getTime() / 1000);

    const embed = {
      title: "━━━━━━━━━━━━━━━━━━━━━━━━\n🔴 CITIZEN VISA STATUS UPDATE\n━━━━━━━━━━━━━━━━━━━━━━━━",
      description: `Attention <@${app.discord_id}>, your citizen visa application has been evaluated by the staff team. Please review the constructive feedback below before reapplying.`,
      color: 0xef4444, // Red
      fields: [
        { name: "👤 Applicant", value: `<@${app.discord_id}> (\`${app.discord_username}\`)`, inline: true },
        { name: "🆔 Application ID", value: `\`${app.application_number}\``, inline: true },
        { name: "🎭 Character", value: `**${app.character_name}**`, inline: true },
        { name: "🛡️ Evaluated By", value: `**${reviewerName}**`, inline: true },
        { name: "⏳ Reapplication Available", value: `<t:${cooldownTimestamp}:R>`, inline: true },
        { name: "📝 Staff Feedback & Reason", value: `\`\`\`${rejectionReason}\`\`\``, inline: false },
      ],
      footer: { text: "NOMIX RP • Please review our server rules before reapplying" },
      timestamp: new Date().toISOString(),
    };

    const components = [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 5,
            label: "📖 Server Rules & Guidelines",
            url: `${siteUrl}/rules`,
          },
          {
            type: 2,
            style: 5,
            label: "📊 Check Visa Status",
            url: `${siteUrl}/status`,
          },
        ],
      },
    ];

    const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `⚠️ <@${app.discord_id}> Your visa application was evaluated. Please check the feedback below:`,
        embeds: [embed],
        components,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[DISCORD REJECTION NOTIFY] Failed:", res.status, errText);
    } else {
      console.log(`[DISCORD REJECTION NOTIFY] ✅ Posted rejection embed for ${app.discord_username}`);
    }
  } catch (err) {
    console.error("[DISCORD REJECTION NOTIFY ERROR]", err);
  }
}

export async function sendDiscordActionRequiredEmbed(app: {
  id: string;
  application_number: string;
  discord_id: string;
  discord_username: string;
  character_name: string;
  character_age?: number;
  character_gender?: string;
}, reviewerName: string, reason: string, reapplyUrl: string = "https://nomixroleplay.xyz/apply") {
  const token = process.env.DISCORD_BOT_TOKEN;
  const channelId = 
    process.env.DISCORD_REVIEW_CHANNEL_ID || 
    process.env.DISCORD_ACTION_REQUIRED_CHANNEL_ID || 
    process.env.DISCORD_REJECTED_CHANNEL_ID || 
    process.env.DISCORD_APPLICATION_CHANNEL_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://nomixroleplay.xyz";

  if (!token || !channelId || channelId.includes("your-") || token.includes("your-")) return;

  try {
    const embed = {
      title: "━━━━━━━━━━━━━━━━━━━━━━━━\n⚠️ ACTION REQUIRED — REAPPLICATION REQUESTED\n━━━━━━━━━━━━━━━━━━━━━━━━",
      description: `Attention <@${app.discord_id}>! The NOMIX RP Administration has reviewed your application and requested revisions. Please review the admin instructions below and submit an updated application.`,
      color: 0xf59e0b, // Amber / Orange
      fields: [
        { name: "👤 Applicant", value: `<@${app.discord_id}> (\`${app.discord_username}\`)`, inline: true },
        { name: "🆔 Application ID", value: `\`${app.application_number}\``, inline: true },
        { name: "🎭 Character", value: `**${app.character_name}**`, inline: true },
        { name: "🛡️ Evaluated By", value: `**${reviewerName}**`, inline: true },
        { name: "⚡ Action Status", value: "🟠 **REAPPLICATION REQUIRED (NO COOLDOWN)**", inline: true },
        { name: "🔗 Reapply Link", value: `[Click Here to Reapply](${reapplyUrl})`, inline: true },
        { name: "📝 Admin Reason & Action Instructions", value: `\`\`\`${reason}\`\`\``, inline: false },
      ],
      footer: { text: "NOMIX RP • Action Required • You can reapply immediately" },
      timestamp: new Date().toISOString(),
    };

    const components = [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 5,
            label: "📝 Reapply Now",
            url: reapplyUrl,
          },
          {
            type: 2,
            style: 5,
            label: "📖 Server Rules & Guidelines",
            url: `${siteUrl}/rules`,
          },
          {
            type: 2,
            style: 5,
            label: "📊 Check Visa Status",
            url: `${siteUrl}/status`,
          },
        ],
      },
    ];

    const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `⚠️ **Action Required** <@${app.discord_id}>: The administration has requested revisions on your application. Please reapply using the link below:`,
        embeds: [embed],
        components,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[DISCORD ACTION REQUIRED NOTIFY] Failed:", res.status, errText);
    } else {
      console.log(`[DISCORD ACTION REQUIRED NOTIFY] ✅ Posted action required embed for ${app.discord_username}`);
    }
  } catch (err) {
    console.error("[DISCORD ACTION REQUIRED NOTIFY ERROR]", err);
  }
}

export async function assignDiscordCitizenRole(guildId: string, discordUserId: string, roleId: string) {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token || !guildId || !discordUserId || !roleId || roleId.includes("your-") || token.includes("your-")) return;

  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}/roles/${roleId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      console.log(`[DISCORD ROLE] ✅ Assigned citizen role ${roleId} to user ${discordUserId}`);
    } else {
      const errText = await res.text();
      if (res.status === 403) {
        console.warn(`[DISCORD ROLE] ⚠️ 403 Missing Permissions: Please open Discord Server Settings -> Roles, and drag the "NOMIX RP" bot role ABOVE the Citizen role.`);
      } else {
        console.warn(`[DISCORD ROLE] ⚠️ Role assign warning (${res.status}):`, errText);
      }
    }
  } catch (err) {
    console.error("[DISCORD ROLE ERROR]", err);
  }
}

export async function removeDiscordCitizenRole(guildId: string, discordUserId: string, roleId: string) {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token || !guildId || !discordUserId || !roleId || roleId.includes("your-") || token.includes("your-")) return;

  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}/roles/${roleId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (res.ok || res.status === 204) {
      console.log(`[DISCORD ROLE] ✅ Removed citizen role ${roleId} from user ${discordUserId}`);
    } else {
      const errText = await res.text();
      console.warn(`[DISCORD ROLE] ⚠️ Role remove warning (${res.status}):`, errText);
    }
  } catch (err) {
    console.error("[DISCORD ROLE REMOVE ERROR]", err);
  }
}

export async function sendDiscordRevocationEmbed(app: {
  id: string;
  application_number: string;
  discord_id: string;
  discord_username: string;
  character_name: string;
}, adminName: string, revocationReason: string) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_REJECTED_CHANNEL_ID || process.env.DISCORD_APPLICATION_CHANNEL_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nomixrp.com";

  if (!token || !channelId || channelId.includes("your-") || token.includes("your-")) return;

  try {
    const embed = {
      title: "━━━━━━━━━━━━━━━━━━━━━━━━\n⚠️ CITIZEN VISA REVOKED BY ADMINISTRATION\n━━━━━━━━━━━━━━━━━━━━━━━━",
      description: `Attention <@${app.discord_id}>, your previously approved citizen visa has been **REVOKED** by an Administrator. Your Citizen whitelist role has been de-provisioned.\n\nPlease review the administrative reason below.`,
      color: 0xf59e0b, // Amber / Gold
      fields: [
        { name: "👤 Citizen", value: `<@${app.discord_id}> (\`${app.discord_username}\`)`, inline: true },
        { name: "🆔 Application ID", value: `\`${app.application_number}\``, inline: true },
        { name: "🎭 Character", value: `**${app.character_name}**`, inline: true },
        { name: "🛡️ Revoked By", value: `**${adminName}** (Administrator)`, inline: true },
        { name: "📝 Reason for Revocation", value: `\`\`\`${revocationReason}\`\`\``, inline: false },
      ],
      footer: { text: "NOMIX RP • Administrative Decision" },
      timestamp: new Date().toISOString(),
    };

    const components = [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 5,
            label: "📖 Server Rules & Guidelines",
            url: `${siteUrl}/rules`,
          },
          {
            type: 2,
            style: 5,
            label: "📊 Check Visa Status",
            url: `${siteUrl}/status`,
          },
        ],
      },
    ];

    const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `⚠️ <@${app.discord_id}> Your citizen visa was revoked by an administrator. Check details below:`,
        embeds: [embed],
        components,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[DISCORD REVOKE NOTIFY] Failed:", res.status, errText);
    } else {
      console.log(`[DISCORD REVOKE NOTIFY] ✅ Posted revocation embed for ${app.discord_username}`);
    }
  } catch (err) {
    console.error("[DISCORD REVOKE NOTIFY ERROR]", err);
  }
}

/**
 * Sends a notification embed to the Admin/Staff "New Orders" Discord channel
 * when a user submits a supporter package order.
 */
export async function sendDiscordNewOrderNotification(order: PackageOrder) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const channelId = 
    process.env.DISCORD_NEW_ORDERS_CHANNEL_ID || 
    process.env.DISCORD_STAFF_CHANNEL_ID;
  const webhookUrl = 
    process.env.DISCORD_NEW_ORDERS_WEBHOOK_URL || 
    process.env.DISCORD_STAFF_WEBHOOK_URL || 
    process.env.DISCORD_DONOR_WEBHOOK_URL || 
    process.env.DISCORD_WEBHOOK_URL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nomixrp.com";

  const tierColor = 
    order.package_tier === "emerald" ? 0x10b981 : 
    order.package_tier === "platinum" ? 0xa855f7 : 
    order.package_tier === "gold" ? 0xf59e0b : 
    order.package_tier === "silver" ? 0x38bdf8 : 
    0xd97706; // bronze

  const embedFields = [
    { name: "👤 Supporter", value: `<@${order.discord_id}> (\`${order.discord_username}\`)`, inline: true },
    { name: "🎭 Character Name", value: `**${order.character_name}**`, inline: true },
    { name: "💎 Package Tier", value: `**${order.package_name}** (${order.price})`, inline: true },
  ];

  if (order.custom_plate) {
    embedFields.push({ name: "🏷️ Custom Plate(s)", value: `\`${order.custom_plate}\``, inline: true });
  }
  if (order.custom_phone) {
    embedFields.push({ name: "📱 Custom Phone", value: `\`${order.custom_phone}\``, inline: true });
  }
  if (order.vehicle_preference) {
    embedFields.push({ name: "🏎️ Vehicle Preference", value: order.vehicle_preference, inline: true });
  }
  if (order.notes) {
    embedFields.push({ name: "📝 Notes", value: order.notes, inline: false });
  }

  embedFields.push({
    name: "⚡ Admin Action Required",
    value: "Open the `/admin` portal -> **Supporter Orders** tab to deliver in-game perks and verify Discord Supporter role.",
    inline: false,
  });

  const embed = {
    title: `━━━━━━━━━━━━━━━━━━━━━━━━\n📦 NEW SUPPORTER ORDER: ${order.package_name.toUpperCase()} TIER\n━━━━━━━━━━━━━━━━━━━━━━━━`,
    description: `A new supporter package order has been received from **${order.discord_username}** and is awaiting admin approval/delivery.`,
    color: tierColor,
    fields: embedFields,
    footer: { text: `Order ID: ${order.id} • NOMIX RP Store` },
    timestamp: new Date().toISOString(),
  };

  const components = [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 5,
          label: "🛡️ Open Supporter Orders (Admin)",
          url: `${siteUrl}/admin`,
        },
      ],
    },
  ];

  // 1. Try Bot Channel REST API first
  if (token && channelId && !token.includes("your-") && !channelId.includes("your-")) {
    try {
      const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bot ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          embeds: [embed],
          components,
        }),
      });
      if (res.ok) {
        console.log(`[DISCORD NOTIFY] ✅ Posted new order embed to channel ${channelId}`);
        return true;
      }
    } catch (botErr) {
      console.error("[DISCORD BOT POST ERROR]", botErr);
    }
  }

  // 2. Fallback to Webhook
  if (webhookUrl && !webhookUrl.includes("your-")) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "NOMIX Orders Dispatcher",
          avatar_url: "https://play.nomixroleplay.xyz/logo/logo.png",
          embeds: [embed],
        }),
      });
      if (res.ok) {
        console.log("[DISCORD NOTIFY] ✅ Posted new order embed via webhook");
        return true;
      }
    } catch (whErr) {
      console.error("[DISCORD WEBHOOK POST ERROR]", whErr);
    }
  }

  return false;
}

/**
 * Pushes a notification to the "Donations" channel tagging the specific user
 * when an admin approves/delivers the donation in the /admin portal.
 */
export async function sendDiscordDonationApprovedNotification(
  order: PackageOrder,
  staffName?: string
) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const channelId = 
    process.env.DISCORD_DONATIONS_CHANNEL_ID || 
    process.env.DISCORD_DELIVERY_CHANNEL_ID || 
    process.env.DISCORD_APPROVED_CHANNEL_ID;
  const webhookUrl = 
    process.env.DISCORD_DONATIONS_WEBHOOK_URL || 
    process.env.DISCORD_DELIVERY_WEBHOOK_URL || 
    process.env.DISCORD_PACKAGE_DELIVERY_WEBHOOK_URL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nomixrp.com";

  const tierColor = 
    order.package_tier === "emerald" ? 0x10b981 : 
    order.package_tier === "platinum" ? 0xa855f7 : 
    order.package_tier === "gold" ? 0xf59e0b : 
    order.package_tier === "silver" ? 0x38bdf8 : 
    0xd97706; // bronze

  // Pings and tags the specific user directly in Discord message content!
  const pingMessage = `🎉 **DONATION APPROVED & ACTIVATED!** <@${order.discord_id}> — Thank you for supporting **NOMIX Roleplay**! Your **${order.package_name}** Supporter Perks are now active in-game!`;

  const embedFields = [
    { name: "👑 Supporter", value: `<@${order.discord_id}> (\`${order.discord_username}\`)`, inline: true },
    { name: "💎 Supporter Tier", value: `**${order.package_name}** (${order.price})`, inline: true },
    { name: "🎭 Character Name", value: `**${order.character_name}**`, inline: true },
  ];

  if (order.custom_plate) {
    embedFields.push({ name: "🚗 Custom Plate(s)", value: `\`${order.custom_plate}\``, inline: true });
  }
  if (order.custom_phone) {
    embedFields.push({ name: "📱 Custom Phone", value: `\`${order.custom_phone}\``, inline: true });
  }
  if (order.vehicle_preference) {
    embedFields.push({ name: "🏎️ Vehicle Delivery", value: order.vehicle_preference, inline: true });
  }

  embedFields.push({
    name: "🛡️ Approved & Delivered By",
    value: staffName || "NOMIX Administration",
    inline: true,
  });

  const embed = {
    title: `━━━━━━━━━━━━━━━━━━━━━━━━\n💎 SUPPORTER PACK DELIVERED & APPROVED\n━━━━━━━━━━━━━━━━━━━━━━━━`,
    description: `A special thank you to <@${order.discord_id}> for contributing to NOMIX server development, custom vehicle handling, and dedicated infrastructure!`,
    color: tierColor,
    fields: embedFields,
    footer: { text: `NOMIX RP Supporter Perks • Ref: ${order.id.slice(0, 8).toUpperCase()}` },
    timestamp: new Date().toISOString(),
  };

  const components = [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 5,
          label: "🛍️ View Supporter Packages",
          url: `${siteUrl}/store`,
        },
        {
          type: 2,
          style: 5,
          label: "🎮 Connect to Server",
          url: process.env.NEXT_PUBLIC_FIVEM_CONNECT_URL || "fivem://connect/play.nomixroleplay.xyz",
        },
      ],
    },
  ];

  // 1. Try Bot Channel REST API first
  if (token && channelId && !token.includes("your-") && !channelId.includes("your-")) {
    try {
      const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bot ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: pingMessage,
          embeds: [embed],
          components,
        }),
      });
      if (res.ok) {
        console.log(`[DISCORD NOTIFY] ✅ Posted donation approval ping to channel for ${order.discord_username}`);
        return true;
      }
    } catch (botErr) {
      console.error("[DISCORD BOT POST ERROR]", botErr);
    }
  }

  // 2. Fallback to Webhook
  if (webhookUrl && !webhookUrl.includes("your-")) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: pingMessage,
          username: "NOMIX Supporter Broadcast",
          avatar_url: "https://play.nomixroleplay.xyz/logo/logo.png",
          embeds: [embed],
        }),
      });
      if (res.ok) {
        console.log(`[DISCORD NOTIFY] ✅ Posted donation approval ping via webhook for ${order.discord_username}`);
        return true;
      }
    } catch (whErr) {
      console.error("[DISCORD WEBHOOK POST ERROR]", whErr);
    }
  }

  return false;
}

