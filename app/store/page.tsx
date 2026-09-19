"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Crown, CheckCircle2, Shield, ArrowRight, ExternalLink } from "lucide-react";

const PACKAGES = [
  {
    name: "Tier 1: Supporter",
    price: "$10 / mo",
    badge: "Community Supporter",
    features: [
      "Discord Supporter Role & Color",
      "Priority Queue Pass (+1 Tier)",
      "Access to Supporter Lounge Channels",
      "Custom Discord Forum Badge",
    ],
    highlight: false,
  },
  {
    name: "Tier 2: Citizen Elite",
    price: "$25 / mo",
    badge: "MOST POPULAR",
    features: [
      "All Tier 1 Supporter Perks",
      "Priority Queue Pass (+2 Tiers)",
      "Custom License Plate Creation (x1)",
      "1x Custom Phone Number Voucher",
      "Early Access to Community Event Tickets",
    ],
    highlight: true,
  },
  {
    name: "Tier 3: Executive Patron",
    price: "$50 / mo",
    badge: "PATRON",
    features: [
      "All Tier 2 Elite Perks",
      "Highest Queue Priority (+3 Tiers)",
      "Exclusive Patron Discord Voice Channel",
      "Custom Ped Aesthetic Skin Consultation",
      "Direct Dev Townhall Participation",
    ],
    highlight: false,
  },
];

export default function StorePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-cyan-500/30 text-xs font-mono text-cyan-400">
          <Crown className="w-3.5 h-3.5" />
          <span>COMMUNITY SUPPORT & PERKS</span>
        </div>
        <h1 className="font-heading font-black text-4xl sm:text-5xl text-metallic">
          COMMUNITY STORE
        </h1>
        <p className="text-slate-300 text-sm sm:text-base">
          All contributions go directly toward dedicated server hosting, DDoS mitigation, custom development, and FiveM asset licensing.
        </p>
        <p className="text-[11px] text-amber-400 font-mono bg-amber-950/30 border border-amber-500/30 p-2 rounded-lg max-w-lg mx-auto">
          ⚠️ STRICT NO PAY-TO-WIN POLICY: Purchases are cosmetic or queue perks only. In-game money, weapons, and vehicles cannot be purchased.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PACKAGES.map((pkg, i) => (
          <div
            key={i}
            className={`glass-panel rounded-3xl p-8 border transition-all duration-300 flex flex-col justify-between ${
              pkg.highlight
                ? "border-cyan-500/60 shadow-[0_0_30px_rgba(0,240,255,0.15)] relative bg-gradient-to-b from-cyan-950/20 to-[#0B0F17]"
                : "border-white/5 hover:border-slate-700"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded ${
                    pkg.highlight
                      ? "bg-cyan-500 text-black shadow-neon-cyan-sm"
                      : "bg-slate-900 text-slate-400 border border-slate-800"
                  }`}
                >
                  {pkg.badge}
                </span>
                <Crown className={`w-5 h-5 ${pkg.highlight ? "text-cyan-400" : "text-slate-500"}`} />
              </div>

              <h2 className="font-heading font-bold text-2xl text-white mb-2">{pkg.name}</h2>
              <div className="font-mono font-black text-3xl text-cyan-400 mb-6">{pkg.price}</div>

              <div className="space-y-3 mb-8">
                {pkg.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <a
              href="https://discord.gg/nomixrp"
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full py-3.5 rounded-xl font-heading font-bold text-xs tracking-wider text-center flex items-center justify-center gap-2 transition-all ${
                pkg.highlight
                  ? "bg-gradient-to-r from-cyan-500 to-cyan-400 text-black hover:shadow-neon-cyan"
                  : "bg-slate-900 border border-slate-700 text-white hover:border-cyan-500/40"
              }`}
            >
              PURCHASE VIA TEBEX / DISCORD <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
