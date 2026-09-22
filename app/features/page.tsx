"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Car, 
  DollarSign, 
  Flame, 
  ShieldCheck, 
  Home, 
  Briefcase, 
  Phone, 
  ArrowRight,
  Layers,
  Cpu,
  Radio
} from "lucide-react";

const CATEGORIES = [
  { id: "all", name: "All Features" },
  { id: "economy", name: "Economy & Jobs" },
  { id: "vehicles", name: "Vehicles & Physics" },
  { id: "crime", name: "Crime & Heists" },
  { id: "police", name: "LSPD & Medical" },
  { id: "housing", name: "Real Estate" },
];

const FEATURES_LIST = [
  {
    category: "economy",
    title: "Dual Currency & Money Laundering",
    icon: DollarSign,
    description: "Earn clean income through player-owned businesses and freelance jobs, or risk moving bags of dirty cash through high-stakes underground laundering brokers.",
    tags: ["Banking", "Laundering", "Crypto"],
  },
  {
    category: "vehicles",
    title: "Custom Physics Engine 3.0",
    icon: Car,
    description: "Realistic handling models with drivetrain loss, turbo boost lag, tire wear, dynamic brake fade, and realistic manual clutch engagement for tuner enthusiasts.",
    tags: ["150+ Vehicles", "Engine Swaps", "Drift Mode"],
  },
  {
    category: "crime",
    title: "Multi-Tier Underground Heists",
    icon: Flame,
    description: "Heists require planning, equipment crafting, thermal lances, signal jammers, and hacking tools to break into Fleeca, Paleto Bank, and Pacific Standard Vaults.",
    tags: ["Bank Vaults", "Thermal Lances", "Turf Wars"],
  },
  {
    category: "police",
    title: "Live Law Enforcement CAD / MDT",
    icon: ShieldCheck,
    description: "Real-time dispatch, automatic license plate recognition, evidence tagging, ballistics forensics, and comprehensive warrant filing systems.",
    tags: ["Live GPS", "Evidence Lockers", "Interceptors"],
  },
  {
    category: "housing",
    title: "Modular Furnishing & Real Estate",
    icon: Home,
    description: "Over 1,200 modular furniture pieces, persistent stash storage, customizable access permissions, and lockable private vaults.",
    tags: ["Persistent", "1200+ Props", "Key Sharing"],
  },
  {
    category: "economy",
    title: "Civilian Career Tree",
    icon: Briefcase,
    description: "Engage in multi-tier civilian jobs including deep-sea diving, industrial logistics trucking, agriculture harvesting, and municipal sanitation.",
    tags: ["Logistics", "Diving", "Agriculture"],
  },
  {
    category: "police",
    title: "Advanced Medical Damage & Treatment",
    icon: Radio,
    description: "Realistic bone fractures, bleeding wounds, trauma surgeries, wheelchair mechanics, and patient vital monitoring by San Andreas EMS.",
    tags: ["Mount Zonah", "Medevac", "Surgery"],
  },
  {
    category: "vehicles",
    title: "Performance Tuning & Dyno Testing",
    icon: Cpu,
    description: "Dyno tune vehicle ECUs, tweak transmission gear ratios, customize exhaust notes, and install nitrous oxide systems with heat gauges.",
    tags: ["Dyno Tuning", "Nitrous", "Bodykits"],
  },
];

export default function FeaturesPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredFeatures = activeCategory === "all"
    ? FEATURES_LIST
    : FEATURES_LIST.filter((f) => f.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="font-heading font-black text-4xl sm:text-5xl text-metallic">
          NEXT-GEN FIVEM FEATURES
        </h1>
        <p className="text-slate-300 text-sm sm:text-base">
          Explore the custom-engineered systems that power every interaction in NOMIX Roleplay.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wider transition-all ${
              activeCategory === cat.id
                ? "bg-cyan-500 text-black shadow-neon-cyan font-bold"
                : "bg-surface-card border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFeatures.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="glass-panel p-6 sm:p-7 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 group-hover:border-cyan-500/60">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {item.tags.map((t, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-900 border border-slate-800 text-slate-400"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <h3 className="font-heading font-bold text-lg sm:text-xl text-white group-hover:text-cyan-300 transition-colors mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 text-[11px] text-cyan-400 font-mono flex items-center justify-between">
                <span>CUSTOM ENGINE</span>
                <span>● FULLY INTEGRATED</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Footer */}
      <div className="text-center pt-8">
        <Link
          href="/apply"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-heading font-black text-sm tracking-wider hover:shadow-neon-cyan transition-all"
        >
          EXPERIENCE THESE FEATURES IN-GAME <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
