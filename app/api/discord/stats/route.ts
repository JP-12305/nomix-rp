import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

let cachedDiscord: { data: any; timestamp: number } | null = null;
const CACHE_TTL_MS = 20000; // 20 seconds cache TTL

export async function GET() {
  const now = Date.now();

  if (cachedDiscord && now - cachedDiscord.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cachedDiscord.data, {
      headers: {
        "Cache-Control": "public, s-maxage=20, stale-while-revalidate=40",
      },
    });
  }

  const inviteUrl = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg/zDZNZT2RKq";
  const inviteCode = inviteUrl.replace(/.*discord\.gg\//, "").replace(/.*invite\//, "").trim() || "zDZNZT2RKq";
  const botToken = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;

  // 1. Try Discord Official Invite API with counts (Real-time live presence)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`, {
      headers: {
        "User-Agent": "NOMIX-RP-Web/1.0",
      },
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const payload = {
        total_members: data.approximate_member_count || 0,
        online_members: data.approximate_presence_count || 0,
        guild_name: data.guild?.name || "NOMIX ROLEPLAY",
        invite_url: inviteUrl,
        is_live: true,
      };

      cachedDiscord = { data: payload, timestamp: now };

      return NextResponse.json(payload, {
        headers: {
          "Cache-Control": "public, s-maxage=20, stale-while-revalidate=40",
        },
      });
    }
  } catch (err: any) {
    console.warn("[DISCORD STATS] Invite API query warning:", err?.message);
  }

  // 2. Try Discord Guild API with Bot Token
  if (botToken && guildId && !guildId.startsWith("your-")) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}?with_counts=true`, {
        headers: {
          Authorization: `Bot ${botToken}`,
          "User-Agent": "NOMIX-RP-Web/1.0",
        },
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const payload = {
          total_members: data.approximate_member_count || 0,
          online_members: data.approximate_presence_count || 0,
          guild_name: data.name || "NOMIX ROLEPLAY",
          invite_url: inviteUrl,
          is_live: true,
        };

        cachedDiscord = { data: payload, timestamp: now };

        return NextResponse.json(payload, {
          headers: {
            "Cache-Control": "public, s-maxage=20, stale-while-revalidate=40",
          },
        });
      }
    } catch (err: any) {
      console.warn("[DISCORD STATS] Guild API query warning:", err?.message);
    }
  }

  // 3. Fallback
  const fallbackPayload = {
    total_members: 0,
    online_members: 0,
    guild_name: "NOMIX ROLEPLAY",
    invite_url: inviteUrl,
    is_live: false,
  };

  return NextResponse.json(fallbackPayload, {
    headers: {
      "Cache-Control": "public, s-maxage=10, stale-while-revalidate=20",
    },
  });
}
