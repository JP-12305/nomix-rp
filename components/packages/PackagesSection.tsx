"use client";

import React, { useState } from "react";
import { PREMIUM_PACKAGES } from "@/lib/packages";
import { PackageTierInfo } from "@/types";
import PackageOrderModal from "./PackageOrderModal";
import { 
  Crown, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Car, 
  Phone, 
  Tag, 
  Gift 
} from "lucide-react";

interface PackagesSectionProps {
  showTitle?: boolean;
  className?: string;
}

export default function PackagesSection({
  showTitle = true,
  className = "",
}: PackagesSectionProps) {
  const [selectedPkg, setSelectedPkg] = useState<PackageTierInfo | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSelectPackage = (pkg: PackageTierInfo) => {
    setSelectedPkg(pkg);
    setModalOpen(true);
  };

  const getCardBorder = (id: string, popular?: boolean) => {
    if (id === "emerald") {
      return "border-emerald-500/40 hover:border-emerald-400/80 bg-gradient-to-b from-[#081512] via-[#080C14] to-[#040609] shadow-[0_0_30px_rgba(16,185,129,0.15)]";
    }
    if (id === "gold" || popular) {
      return "border-amber-500/50 hover:border-amber-400/80 bg-gradient-to-b from-[#181206] via-[#080C14] to-[#040609] shadow-[0_0_35px_rgba(245,158,11,0.2)]";
    }
    return "border-slate-700 hover:border-slate-500 bg-gradient-to-b from-[#0F141C] via-[#080C14] to-[#040609] shadow-xl";
  };

  const getTitleColor = (id: string) => {
    if (id === "emerald") return "text-emerald-300";
    if (id === "gold") return "text-amber-300";
    return "text-slate-200";
  };

  const getPriceColor = (id: string) => {
    if (id === "emerald") return "text-emerald-400";
    if (id === "gold") return "text-amber-400";
    return "text-cyan-400";
  };

  const getButtonClass = (id: string) => {
    if (id === "emerald") {
      return "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]";
    }
    if (id === "gold") {
      return "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] font-black";
    }
    return "bg-slate-200 hover:bg-white text-black font-bold shadow-md";
  };

  return (
    <section className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full ${className}`}>
      {showTitle && (
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs sm:text-sm font-mono uppercase tracking-widest text-cyan-400 block">
            Community Supporter Tiers
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-5xl text-metallic">
            PREMIUM PACKAGES & PERKS
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Support dedicated server infrastructure, high-end vehicle development, and DDoS mitigation while receiving verified supporter roles and unique customization rewards in Los Santos.
          </p>
        </div>
      )}

      {/* 3 Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {PREMIUM_PACKAGES.map((pkg) => {
          return (
            <div
              key={pkg.id}
              className={`relative rounded-3xl p-8 sm:p-9 border flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1.5 ${getCardBorder(
                pkg.id,
                pkg.popular
              )}`}
            >
              {/* Top Banner Tag for Most Popular */}
              {pkg.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-black font-mono font-black text-[10px] tracking-widest uppercase shadow-[0_0_15px_rgba(245,158,11,0.6)]">
                  ★ MOST POPULAR ★
                </div>
              )}

              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${pkg.badge_color}`}
                  >
                    {pkg.rank_badge}
                  </span>
                  <Crown className={`w-5 h-5 ${getTitleColor(pkg.id)}`} />
                </div>

                {/* Tier Name & Price */}
                <h3 className={`font-heading font-black text-3xl sm:text-4xl mb-2 ${getTitleColor(pkg.id)}`}>
                  {pkg.name}
                </h3>
                <div className="flex items-baseline gap-1.5 mb-6">
                  <span className={`font-mono font-black text-4xl sm:text-5xl ${getPriceColor(pkg.id)}`}>
                    {pkg.price}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/ month</span>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-slate-800/80 mb-6" />

                {/* Features List */}
                <div className="space-y-3.5 mb-8">
                  {pkg.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
                      <CheckCircle2
                        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          pkg.id === "emerald"
                            ? "text-emerald-400"
                            : pkg.id === "gold"
                            ? "text-amber-400"
                            : "text-cyan-400"
                        }`}
                      />
                      <span className="leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div>
                <button
                  onClick={() => handleSelectPackage(pkg)}
                  className={`w-full py-3.5 rounded-xl font-heading text-xs tracking-wider flex items-center justify-center gap-2 transition-all ${getButtonClass(
                    pkg.id
                  )}`}
                >
                  <span>OPT IN FOR {pkg.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fair Play Notice */}
      <div className="mt-12 text-center">
        <p className="text-xs text-slate-400 font-mono bg-slate-900/80 border border-slate-800/80 py-3 px-6 rounded-2xl max-w-2xl mx-auto leading-relaxed">
          🛡️ <strong className="text-white">COMMUNITY FAIR PLAY GUARANTEE:</strong> Supporter contributions strictly fund infrastructure and cosmetic customizations. In-game money, weapons, and mechanical advantages are never sold.
        </p>
      </div>

      {/* Interactive Opt-In Modal */}
      <PackageOrderModal
        packageInfo={selectedPkg}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  );
}
