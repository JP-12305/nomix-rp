export async function sendDiscordApplicationEmbed(app: {
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
}) {
  const token = process.env.DISCORD_BOT_TOKEN || "MTU1MDgwMDIyOTgzMjU5MzQxOA.Gf1ckU.qCvsraCBadi_zx6ybfGqdHqjPrZa4O7OPopfFk";
  const channelId = process.env.DISCORD_APPLICATION_CHANNEL_ID || "1550802258646798417";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nomix-rp.vercel.app";

  if (!token || !channelId || channelId.includes("your-")) return;

  try {
    const rawDate = app.submitted_at || app.created_at || new Date().toISOString();
    const parsedTime = Math.floor(new Date(rawDate).getTime() / 1000) || Math.floor(Date.now() / 1000);

    const embed = {
      title: "━━━━━━━━━━━━━━━━━━━━━━━━\nNOMIX ROLEPLAY — VISA APPLICATION\n━━━━━━━━━━━━━━━━━━━━━━━━",
      description: "A new citizen visa application has been submitted on the website and is awaiting staff evaluation.",
      color: 0x00f0ff,
      fields: [
        { name: "👤 Applicant", value: `<@${app.discord_id}> (${app.discord_username})`, inline: true },
        { name: "🆔 Application ID", value: `\`${app.application_number}\``, inline: true },
        { name: "🎭 Character", value: `**${app.character_name}** (${app.character_age}, ${app.character_gender})`, inline: true },
        { name: "📊 Status", value: "🟡 **PENDING REVIEW**", inline: true },
        { name: "📅 Submitted", value: `<t:${parsedTime}:R>`, inline: true },
      ],
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
  const token = process.env.DISCORD_BOT_TOKEN || "MTU1MDgwMDIyOTgzMjU5MzQxOA.Gf1ckU.qCvsraCBadi_zx6ybfGqdHqjPrZa4O7OPopfFk";
  const channelId = process.env.DISCORD_APPROVED_CHANNEL_ID || process.env.DISCORD_APPLICATION_CHANNEL_ID || "1550802258646798417";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nomix-rp.vercel.app";
  const connectUrl = process.env.NEXT_PUBLIC_FIVEM_CONNECT_URL || "fivem://connect/play.nomixroleplay.xyz";

  if (!token || !channelId || channelId.includes("your-")) return;

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
  const token = process.env.DISCORD_BOT_TOKEN || "MTU1MDgwMDIyOTgzMjU5MzQxOA.Gf1ckU.qCvsraCBadi_zx6ybfGqdHqjPrZa4O7OPopfFk";
  const channelId = process.env.DISCORD_REJECTED_CHANNEL_ID || process.env.DISCORD_APPLICATION_CHANNEL_ID || "1550802258646798417";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nomix-rp.vercel.app";

  if (!token || !channelId || channelId.includes("your-")) return;

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

export async function assignDiscordCitizenRole(guildId: string, discordUserId: string, roleId: string) {
  const token = process.env.DISCORD_BOT_TOKEN || "MTU1MDgwMDIyOTgzMjU5MzQxOA.Gf1ckU.qCvsraCBadi_zx6ybfGqdHqjPrZa4O7OPopfFk";
  if (!token || !guildId || !discordUserId || !roleId || roleId.includes("your-")) return;

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
