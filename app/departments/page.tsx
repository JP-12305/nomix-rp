"use client";

import React from "react";
import Link from "next/link";
import { Shield, HeartPulse, Building2, Flame, Scale, ArrowRight, Sparkles } from "lucide-react";
import DepartmentCard from "@/components/cards/DepartmentCard";

export default function DepartmentsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-cyan-500/30 text-xs font-mono text-cyan-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>CITY FACTIONS & PUBLIC SERVICES</span>
        </div>
        <h1 className="font-heading font-black text-4xl sm:text-5xl text-metallic">
          WHITELISTED DEPARTMENTS
        </h1>
        <p className="text-slate-300 text-sm sm:text-base">
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

      <div className="glass-panel p-8 rounded-2xl border border-cyan-500/20 text-center space-y-4">
        <h3 className="font-heading font-bold text-xl text-white">
          Interested in Department Leadership?
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Approved citizens can apply for open academy recruitments in our Discord community.
        </p>
        <Link
          href="/apply"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-400 text-black font-heading font-bold text-xs hover:shadow-neon-cyan"
        >
          APPLY FOR CITIZEN VISA <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
