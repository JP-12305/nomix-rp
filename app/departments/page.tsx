import { redirect } from "next/navigation";

// TEMPORARILY DISABLED: Redirect departments page to home
export default function DepartmentsPage() {
  redirect("/");
}

/*
// =========================================================================
// ORIGINAL DEPARTMENTS & FACTIONS PAGE (PRESERVED FOR FUTURE RE-ENABLING)
// =========================================================================
"use client";

import React from "react";
import Link from "next/link";
import { Shield, HeartPulse, Building2, Flame, Scale, ArrowRight } from "lucide-react";
import DepartmentCard from "@/components/cards/DepartmentCard";

export function ActiveDepartmentsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="font-heading font-black text-4xl sm:text-5xl text-metallic">
          WHITELISTED DEPARTMENTS
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm">
          Discover the premier government, emergency medical, legal, and criminal factions operating in NOMIX Roleplay.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DepartmentCard
          title="Los Santos Police Dept"
          category="Law Enforcement"
          description="Patrol, Highway Pursuit Interceptors, SWAT Special Weapons, and Air Support Divisions."
          image="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=600&auto=format&fit=crop"
          accent="blue"
          badge="LSPD / SASP"
        />
        <DepartmentCard
          title="San Andreas Medical"
          category="Emergency Services"
          description="Paramedic response, surgical triage, medevac flight operations, and trauma rehabilitation."
          image="https://images.unsplash.com/photo-1587745416684-47953f16f02f?q=80&w=600&auto=format&fit=crop"
          accent="red"
          badge="SAFR / EMS"
        />
        <DepartmentCard
          title="Department of Justice"
          category="Legal & Judiciary"
          description="Defense attorneys, district prosecutors, and judicial magistrates upholding legal realism."
          image="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=600&auto=format&fit=crop"
          accent="amber"
          badge="DOJ / COURTS"
        />
        <DepartmentCard
          title="Underground Syndicate"
          category="Organized Crime"
          description="Black market logistics, illegal street racing circuits, weapon smuggling, and turf wars."
          image="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=600&auto=format&fit=crop"
          accent="red"
          badge="SYN / CARTEL"
        />
      </div>

      <div className="glass-panel p-8 sm:p-10 rounded-2xl border border-cyan-500/20 text-center space-y-4">
        <h3 className="font-heading font-bold text-2xl text-white">
          Interested in Department Leadership?
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Approved citizens can apply for open academy recruitments and faction leadership in our Discord community.
        </p>
        <Link
          href="/apply"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-cyan-400 text-black font-heading font-bold text-sm hover:shadow-neon-cyan transition-all"
        >
          APPLY FOR CITIZEN VISA <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
*/
