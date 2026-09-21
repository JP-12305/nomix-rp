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

    const components = [
      {
        type: 1, // ActionRow
        components: [
          {
            type: 2, // Button
            style: 5, // Link
            label: "📋 Staff Dashboard",
            url: `${siteUrl}/admin`,
          },
          {
            type: 2,
            style: 3, // Success
            label: "🟢 Approve Visa",
            custom_id: `approve_app_${app.id}`,
          },
          {
            type: 2,
            style: 4, // Danger
            label: "🔴 Reject Visa",
            custom_id: `reject_app_${app.id}`,
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

export async function assignDiscordCitizenRole(guildId: string, discordUserId: string, roleId: string) {
  const token = process.env.DISCORD_BOT_TOKEN;
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
      console.warn(`[DISCORD ROLE] ⚠️ Role assign warning (${res.status}):`, errText);
    }
  } catch (err) {
    console.error("[DISCORD ROLE ERROR]", err);
  }
}
