"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Users, Shield, Bell, ExternalLink, ShieldCheck, Activity } from "lucide-react";

interface DiscordStats {
  total_members: number;
  online_members: number;
  guild_name: string;
  invite_url: string;
  is_live: boolean;
}

export default function DiscordPage() {
  const [stats, setStats] = useState<DiscordStats>({
    total_members: 41,
    online_members: 20,
    guild_name: "NOMIX Roleplay",
    invite_url: "https://discord.gg/zDZNZT2RKq",
    is_live: true,
  });
  const [loading, setLoading] = useState(true);

  const fetchDiscordStats = () => {
    fetch("/api/discord/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.total_members === "number") {
          setStats(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Discord stats fetch error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDiscordStats();

    // Auto-refresh real-time Discord presence every 30 seconds only if tab is visible
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchDiscordStats();
      }
    }, 30000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchDiscordStats();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-16">

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="font-heading font-black text-4xl sm:text-5xl text-metallic">
          JOIN THE NOMIX COMMUNITY
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
          The NOMIX Discord server is the central hub for server announcements, department recruitment, ticket support, and automated visa approvals.
        </p>
      </div>

      {/* Main Discord Hub Card */}
      <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-[#5865F2]/30 bg-gradient-to-b from-[#5865F2]/10 to-transparent text-center space-y-8 shadow-2xl relative overflow-hidden">
        
        {/* Live Sync Badge */}
        <div className="absolute top-6 right-6 text-xs font-mono px-3.5 py-1.5 rounded-full bg-slate-900/95 border border-slate-800 text-slate-200 flex items-center gap-2 shadow-md">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-emerald-400 font-bold">LIVE DISCORD SYNC</span>
        </div>

        <div className="relative w-24 h-24 mx-auto">
          <Image
            src="/logo/logo.png"
            alt="NOMIX Logo"
            fill
            className="object-contain drop-shadow-[0_0_25px_rgba(88,101,242,0.6)]"
          />
        </div>

        <div className="space-y-3">
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-white">
            {stats.guild_name || "NOMIX Roleplay"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Automated Visa Notifications • 24/7 Staff Support • Faction Hubs
          </p>
        </div>

        {/* Real-Time Discord Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
          {/* Total Members */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-center">
            <div className="font-mono font-black text-2xl sm:text-3xl text-emerald-400">
              {stats.total_members.toLocaleString()}
            </div>
            <div className="text-xs text-slate-300 uppercase font-semibold tracking-wider mt-1.5">
              Total Members
            </div>
          </div>

          {/* Online Members */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-center">
            <div className="font-mono font-black text-2xl sm:text-3xl text-[#5865F2] flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              {stats.online_members.toLocaleString()}
            </div>
            <div className="text-xs text-slate-300 uppercase font-semibold tracking-wider mt-1.5">
              Online Now
            </div>
          </div>

          {/* Support */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-center">
            <div className="font-mono font-black text-2xl sm:text-3xl text-cyan-400">
              &lt; 15m
            </div>
            <div className="text-xs text-slate-300 uppercase font-semibold tracking-wider mt-1.5">
              Support Response
            </div>
          </div>
        </div>

        {/* Join CTA */}
        <div className="pt-3">
          <a
            href={stats.invite_url || "https://discord.gg/zDZNZT2RKq"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-heading font-black text-sm tracking-wider transition-all transform hover:-translate-y-1 shadow-[0_0_25px_rgba(88,101,242,0.4)]"
          >
            <Users className="w-5 h-5" />
            CONNECT TO DISCORD GUILD
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Guidelines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        <div className="glass-panel p-7 sm:p-8 rounded-2xl border border-white/10 space-y-3">
          <div className="p-3 w-fit rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-lg sm:text-xl text-white">Live Visa Alerts</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Receive automated real-time mentions when your application is approved or requires clarification.
          </p>
        </div>

        <div className="glass-panel p-7 sm:p-8 rounded-2xl border border-white/10 space-y-3">
          <div className="p-3 w-fit rounded-xl bg-red-950/40 border border-red-500/30 text-red-400">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-lg sm:text-xl text-white">24/7 Player Tickets</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Report rulebreaks, request player compensation, or seek technical assistance directly from staff.
          </p>
        </div>

        <div className="glass-panel p-7 sm:p-8 rounded-2xl border border-white/10 space-y-3">
          <div className="p-3 w-fit rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-lg sm:text-xl text-white">Department Recruitment</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Apply for LSPD, SASP, San Andreas EMS, DOJ, and approved gang organization rosters.
          </p>
        </div>
      </div>

    </div>
  );
}
