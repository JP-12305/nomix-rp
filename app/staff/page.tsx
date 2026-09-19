"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Shield, Sparkles, Crown, Terminal, MessageSquare } from "lucide-react";

const STAFF_ROSTER = [
  {
    name: "NomixDirector",
    role: "Project Director & Lead Developer",
    division: "Executive Management",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200",
    badgeColor: "border-red-500/40 text-red-400 bg-red-950/40",
  },
  {
    name: "NomixRecruiter",
    role: "Head of Whitelist & Recruitment",
    division: "Player Admissions",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
    badgeColor: "border-cyan-500/40 text-cyan-400 bg-cyan-950/40",
  },
  {
    name: "Chief_Vance",
    role: "Head of Community & Lore",
    division: "Story & Factions",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200",
    badgeColor: "border-emerald-500/40 text-emerald-400 bg-emerald-950/40",
  },
  {
    name: "AeroTech",
    role: "Lead Systems Architect",
    division: "Development & Framework",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    badgeColor: "border-amber-500/40 text-amber-400 bg-amber-950/40",
  },
];

export default function StaffPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-cyan-500/30 text-xs font-mono text-cyan-400">
          <Crown className="w-3.5 h-3.5" />
          <span>MANAGEMENT & RECRUITMENT</span>
        </div>
        <h1 className="font-heading font-black text-4xl sm:text-5xl text-metallic">
          NOMIX STAFF & LEADERSHIP
        </h1>
        <p className="text-slate-300 text-sm sm:text-base">
          Our team is committed to fair enforcement, transparent recruitment, and providing a stable platform.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STAFF_ROSTER.map((staff, i) => (
          <div
            key={i}
            className="glass-panel rounded-2xl p-6 border border-white/5 hover:border-cyan-500/40 transition-all text-center flex flex-col items-center justify-between"
          >
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-cyan-500/40 mb-4">
              <Image src={staff.avatar} alt={staff.name} fill className="object-cover" />
            </div>

            <div>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${staff.badgeColor} mb-2 inline-block`}>
                {staff.division}
              </span>
              <h3 className="font-heading font-bold text-lg text-white mb-1">
                {staff.name}
              </h3>
              <p className="text-xs text-slate-400">{staff.role}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-900 w-full text-[11px] text-slate-500 flex items-center justify-center gap-1">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Verified Staff</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
