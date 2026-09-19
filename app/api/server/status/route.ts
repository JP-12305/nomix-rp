import { NextResponse } from "next/server";
import { ServerStatusData } from "@/types";

export const dynamic = "force-dynamic";

// In-memory cache to prevent spamming the FiveM server
let cachedStatus: { data: ServerStatusData; timestamp: number } | null = null;
const CACHE_TTL_MS = 10000; // 10 seconds cache TTL

export async function GET() {
  const now = Date.now();

  // Return memory-cached response if valid
  if (cachedStatus && now - cachedStatus.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cachedStatus.data, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=20",
      },
    });
  }

  const rawIp = process.env.NEXT_PUBLIC_SERVER_IP || "play.nomixroleplay.xyz";
  const port = process.env.NEXT_PUBLIC_SERVER_PORT || "30120";
  const cfxCode = process.env.NEXT_PUBLIC_FIVEM_CFX_CODE || process.env.FIVEM_CFX_CODE;

  const host = rawIp.includes(":") ? rawIp : `${rawIp}:${port}`;

  // 1. First Priority: Direct FXServer Query (play.nomixroleplay.xyz:30120)
  try {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const [dynSettled, plySettled] = await Promise.allSettled([
      fetch(`http://${host}/dynamic.json`, {
        signal: controller.signal,
        cache: "no-store",
        headers: { "User-Agent": "NOMIX-RP-Web/1.0" },
      }),
      fetch(`http://${host}/players.json`, {
        signal: controller.signal,
        cache: "no-store",
        headers: { "User-Agent": "NOMIX-RP-Web/1.0" },
      }),
    ]);
    clearTimeout(timeoutId);

    let dynData: any = null;
    let plyCount: number | null = null;

    if (dynSettled.status === "fulfilled" && dynSettled.value.ok) {
      dynData = await dynSettled.value.json().catch(() => null);
    }

    if (plySettled.status === "fulfilled" && plySettled.value.ok) {
      const plyData = await plySettled.value.json().catch(() => null);
      if (Array.isArray(plyData)) {
        plyCount = plyData.length;
      }
    }

    if (dynData) {
      const latency = Date.now() - startTime;
      const players = typeof plyCount === "number" ? plyCount : (Number(dynData.clients) || 0);
      const maxPlayers = Number(dynData.sv_maxclients) || 64;
      const rawHostname = dynData.hostname || "NOMIX Roleplay | Serious RP | Multi Framework";
      const cleanHostname = rawHostname.replace(/\^[0-9]/g, "").trim();

      const payload: ServerStatusData = {
        online: true,
        players,
        max_players: maxPlayers,
        ping: Math.max(12, latency),
        queue: 0,
        uptime: "99.9%",
        server_name: cleanHostname,
        is_mock: false,
      };

      cachedStatus = { data: payload, timestamp: now };

      return NextResponse.json(payload, {
        headers: {
          "Cache-Control": "public, s-maxage=10, stale-while-revalidate=20",
        },
      });
    }
  } catch (err: any) {
    console.warn("[FIVEM QUERY WARNING] Direct host error:", err?.message);
  }

  // 2. Second Priority: Cfx.re Masterlist API (if Cfx Code is configured)
  if (cfxCode && !cfxCode.includes("your-")) {
    try {
      const cleanCode = cfxCode.replace(/.*join\//, "").trim();
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`https://servers-frontend.fivem.net/api/servers/single/${cleanCode}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const latency = Date.now() - startTime;
        const serverData = json.Data || json;

        const players = typeof serverData.clients === "number" ? serverData.clients : (serverData.players?.length || 0);
        const maxPlayers = Number(serverData.sv_maxclients) || 64;
        const rawHostname = serverData.hostname || "NOMIX Roleplay";
        const cleanHostname = rawHostname.replace(/\^[0-9]/g, "").trim();

        const payload: ServerStatusData = {
          online: true,
          players,
          max_players: maxPlayers,
          ping: Math.min(latency, 80),
          queue: 0,
          uptime: "99.9%",
          server_name: cleanHostname,
          is_mock: false,
        };

        cachedStatus = { data: payload, timestamp: now };

        return NextResponse.json(payload, {
          headers: {
            "Cache-Control": "public, s-maxage=10, stale-while-revalidate=20",
          },
        });
      }
    } catch (err: any) {
      console.warn("[FIVEM QUERY WARNING] Cfx.re API error:", err?.message);
    }
  }

  // 3. Fallback: Return offline if server cannot be reached
  const fallbackPayload: ServerStatusData = {
    online: false,
    players: 0,
    max_players: 64,
    ping: 0,
    queue: 0,
    uptime: "0%",
    server_name: "NOMIX Roleplay (Server Offline)",
    is_mock: false,
  };

  return NextResponse.json(fallbackPayload, {
    headers: {
      "Cache-Control": "public, s-maxage=5, stale-while-revalidate=10",
    },
  });
}
