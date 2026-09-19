"use client";

import React, { useState, useEffect } from "react";
import { 
  Radio, 
  Activity, 
  Users, 
  Wifi, 
  Layers, 
  Play, 
  ShieldCheck 
} from "lucide-react";
import { ServerStatusData } from "@/types";

export default function ServerStatusWidget() {
  const [status, setStatus] = useState<ServerStatusData>({
    online: true,
    players: 0,
    max_players: 64,
    ping: 28,
    queue: 0,
    uptime: "99.9%",
    server_name: "NOMIX Roleplay",
    is_mock: false,
  });
  const [loading, setLoading] = useState(true);

  const serverIp = process.env.NEXT_PUBLIC_SERVER_IP || "play.nomixroleplay.xyz";
  const connectUrl = process.env.NEXT_PUBLIC_FIVEM_CONNECT_URL || `fivem://connect/${serverIp}`;

  const fetchStatus = () => {
    fetch("/api/server/status")
      .then((res) => res.json())
      .then((data) => {
        setStatus(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Status fetch error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStatus();

    // Auto-refresh live stats only when the browser tab is actively visible
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchStatus();
      }
    }, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchStatus();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const percentage = Math.min(100, Math.round((status.players / (status.max_players || 64)) * 100));

  return (
    <div className="relative glass-panel rounded-2xl p-6 sm:p-8 border border-cyan-500/20 shadow-2xl overflow-hidden group hover:border-cyan-500/40 transition-all">
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-black text-lg text-white tracking-wide">
                SERVER STATUS
              </h3>
              {status.online ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ONLINE
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  OFFLINE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {status.server_name}
            </p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className={`w-3.5 h-3.5 ${status.is_mock ? "text-amber-400" : "text-cyan-400"}`} />
          <span>{status.is_mock ? "CONNECTING TO FIVEM IP" : "FIVEM TELEMETRY LIVE"}</span>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
        
        {/* Players */}
        <div className="p-4 rounded-xl bg-surface-card border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Live Players</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-white">
              {status.players} <span className="text-xs text-slate-500 font-normal">/ {status.max_players}</span>
            </div>
            {/* Player capacity progress bar */}
            <div className="w-full bg-slate-900 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-cyan-300 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(percentage, status.players > 0 ? 4 : 0)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Latency */}
        <div className="p-4 rounded-xl bg-surface-card border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Latency</span>
            <Wifi className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-emerald-400">
              {status.ping} <span className="text-xs text-slate-500">ms</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Direct routing</span>
          </div>
        </div>

        {/* Queue */}
        <div className="p-4 rounded-xl bg-surface-card border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Queue</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-amber-400">
              {status.queue}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Priority queue active</span>
          </div>
        </div>

        {/* Uptime */}
        <div className="p-4 rounded-xl bg-surface-card border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Uptime</span>
            <Radio className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-cyan-300">
              {status.uptime}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Auto-restart schedule</span>
          </div>
        </div>

      </div>

      {/* Action Connect Button */}
      <div className="pt-2">
        <a
          href={connectUrl}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-heading font-black text-sm tracking-wider hover:shadow-neon-cyan transition-all transform hover:-translate-y-0.5"
        >
          <Play className="w-4 h-4 fill-black" />
          DIRECT FIVEM CONNECT
        </a>
      </div>
    </div>
  );
}
