"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  tag?: string;
  accentColor?: "cyan" | "red" | "emerald" | "amber";
}

export default function FeatureCard({
  icon: Icon,
  title,
  subtitle,
  description,
  tag,
  accentColor = "cyan",
}: FeatureCardProps) {
  const isRed = accentColor === "red";
  const isEmerald = accentColor === "emerald";
  const isAmber = accentColor === "amber";

  return (
    <div className="relative glass-panel rounded-2xl p-6 sm:p-7 border border-white/5 transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-500/40 hover:shadow-glass-panel group overflow-hidden">
      {/* Glow accent corner */}
      <div
        className={`absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl transition-opacity opacity-20 group-hover:opacity-60 ${
          isRed ? "bg-red-500" : isEmerald ? "bg-emerald-500" : isAmber ? "bg-amber-500" : "bg-cyan-500"
        }`}
      />

      {/* Top Tag & Icon */}
      <div className="flex items-center justify-between mb-5">
        <div
          className={`p-3 rounded-xl border transition-all duration-300 ${
            isRed
              ? "bg-red-950/40 border-red-500/30 text-red-400 group-hover:border-red-500/60"
              : isEmerald
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-400 group-hover:border-emerald-500/60"
              : isAmber
              ? "bg-amber-950/40 border-amber-500/30 text-amber-400 group-hover:border-amber-500/60"
              : "bg-cyan-950/40 border-cyan-500/30 text-cyan-400 group-hover:border-cyan-500/60 group-hover:shadow-neon-cyan-sm"
          }`}
        >
          <Icon className="w-6 h-6" />
        </div>

        {tag && (
          <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-cyan-300 transition-colors">
            {tag}
          </span>
        )}
      </div>

      {/* Title & Subtitle */}
      <div className="space-y-1 mb-3">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest block">
          {subtitle}
        </span>
        <h3 className="font-heading font-bold text-lg text-white group-hover:text-cyan-300 transition-colors">
          {title}
        </h3>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 leading-relaxed">
        {description}
      </p>

      {/* Bottom subtle accent streak */}
      <div className="mt-5 pt-4 border-t border-slate-900/60 flex items-center justify-between text-[11px] text-slate-500 group-hover:text-slate-400">
        <span>NOMIX Custom Engine</span>
        <span className="text-cyan-400 font-mono text-[10px]">● LIVE</span>
      </div>
    </div>
  );
}
