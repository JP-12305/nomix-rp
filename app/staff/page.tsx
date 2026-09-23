import { redirect } from "next/navigation";

// TEMPORARILY DISABLED: Redirect staff roster page to home
export default function StaffPage() {
  redirect("/");
}

/*
// =========================================================================
// ORIGINAL STAFF & LEADERSHIP PAGE (PRESERVED FOR FUTURE RE-ENABLING)
// =========================================================================
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Shield } from "lucide-react";

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

export function ActiveStaffPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="font-heading font-black text-4xl sm:text-5xl text-metallic">
          NOMIX STAFF & LEADERSHIP
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm">
          Our team is committed to fair enforcement, transparent recruitment, and providing a stable platform.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {STAFF_ROSTER.map((staff, i) => (
          <div
            key={i}
            className="glass-panel rounded-2xl p-6 sm:p-7 border border-white/10 hover:border-cyan-500/50 transition-all text-center flex flex-col items-center justify-between"
          >
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-cyan-500/40 mb-5 shadow-lg">
              <Image src={staff.avatar} alt={staff.name} fill className="object-cover" />
            </div>

            <div>
              <span className={`px-3 py-1 rounded text-xs font-mono font-bold uppercase border ${staff.badgeColor} mb-2.5 inline-block`}>
                {staff.division}
              </span>
              <h3 className="font-heading font-bold text-lg sm:text-xl text-white mb-1.5">
                {staff.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-snug">{staff.role}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 w-full text-xs font-semibold text-slate-400 flex items-center justify-center gap-1.5">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Verified Staff</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
*/
