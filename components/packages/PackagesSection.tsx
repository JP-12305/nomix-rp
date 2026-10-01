"use client";

import React, { useState } from "react";
import { PREMIUM_PACKAGES } from "@/lib/packages";
import { PackageTierInfo } from "@/types";
import PackageOrderModal from "./PackageOrderModal";
import { Crown, CheckCircle2, ArrowRight } from "lucide-react";

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

  const getCardStyle = (id: string, popular?: boolean) => {
    if (id === "emerald") {
      return {
        cardBorder:
          "border border-emerald-500/50 hover:border-emerald-400 bg-gradient-to-b from-[#061E14]/95 via-[#06110D]/95 to-[#040609]/95 shadow-[0_0_35px_rgba(16,185,129,0.18)] hover:shadow-[0_0_45px_rgba(16,185,129,0.3)]",
        titleColor: "text-[#6EE7B7]",
        priceColor: "text-[#2DD4BF]",
        crownColor: "text-[#34D399]",
        checkColor: "text-[#2DD4BF]",
        buttonClass:
          "bg-gradient-to-r from-[#34D399] to-[#10B981] hover:from-[#6EE7B7] hover:to-[#34D399] text-black font-heading font-black shadow-[0_0_20px_rgba(16,185,129,0.45)]",
      };
    }
    if (id === "platinum") {
      return {
        cardBorder:
          "border border-purple-600/50 hover:border-purple-400 bg-gradient-to-b from-[#190A2E]/95 via-[#0E061A]/95 to-[#040609]/95 shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:shadow-[0_0_40px_rgba(168,85,247,0.28)]",
        titleColor: "text-[#E9D5FF]",
        priceColor: "text-[#C084FC]",
        crownColor: "text-[#C084FC]",
        checkColor: "text-[#C084FC]",
        buttonClass:
          "bg-gradient-to-r from-[#C084FC] to-[#A855F7] hover:from-[#E9D5FF] hover:to-[#C084FC] text-black font-heading font-bold shadow-[0_0_18px_rgba(168,85,247,0.4)]",
      };
    }
    if (id === "gold" || popular) {
      return {
        cardBorder:
          "border-2 border-[#F59E0B] hover:border-[#FBBF24] bg-gradient-to-b from-[#221A04]/95 via-[#120F05]/95 to-[#040609]/95 shadow-[0_0_40px_rgba(245,158,11,0.32)] hover:shadow-[0_0_55px_rgba(245,158,11,0.5)] ring-1 ring-[#F59E0B]/40",
        titleColor: "text-[#FACC15]",
        priceColor: "text-[#FACC15]",
        crownColor: "text-[#FACC15]",
        checkColor: "text-[#FACC15]",
        buttonClass:
          "bg-gradient-to-r from-[#FACC15] to-[#F59E0B] hover:from-[#FDE047] hover:to-[#FACC15] text-black font-heading font-black shadow-[0_0_22px_rgba(245,158,11,0.5)]",
      };
    }
    if (id === "silver") {
      return {
        cardBorder:
          "border border-sky-600/40 hover:border-sky-400 bg-gradient-to-b from-[#081524]/95 via-[#070E18]/95 to-[#040609]/95 shadow-[0_0_30px_rgba(56,189,248,0.12)] hover:shadow-[0_0_40px_rgba(56,189,248,0.25)]",
        titleColor: "text-[#F1F5F9]",
        priceColor: "text-[#38BDF8]",
        crownColor: "text-[#7DD3FC]",
        checkColor: "text-[#38BDF8]",
        buttonClass:
          "bg-gradient-to-r from-[#E0F2FE] to-[#BAE6FD] hover:from-white hover:to-[#E0F2FE] text-black font-heading font-bold shadow-[0_0_18px_rgba(56,189,248,0.35)]",
      };
    }
    // Bronze
    return {
      cardBorder:
        "border border-amber-600/40 hover:border-amber-500 bg-gradient-to-b from-[#1C0D06]/95 via-[#0C0806]/95 to-[#040609]/95 shadow-[0_0_30px_rgba(234,88,12,0.12)] hover:shadow-[0_0_40px_rgba(234,88,12,0.25)]",
      titleColor: "text-[#F97316]",
      priceColor: "text-[#F97316]",
      crownColor: "text-[#F97316]",
      checkColor: "text-[#F97316]",
      buttonClass:
        "bg-gradient-to-r from-[#D97706] to-[#EA580C] hover:from-[#F59E0B] hover:to-[#D97706] text-black font-heading font-black shadow-[0_0_18px_rgba(217,119,6,0.35)]",
    };
  };

  return (
    <section className={`relative z-10 max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 w-full ${className}`}>
      {showTitle && (
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
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

      {/* 5 Tiers Grid matching reference hierarchy */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 sm:gap-6 items-stretch">
        {PREMIUM_PACKAGES.map((pkg) => {
          const style = getCardStyle(pkg.id, pkg.popular);
          return (
            <div
              key={pkg.id}
              className={`relative rounded-[28px] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1.5 ${style.cardBorder}`}
            >
              {/* Top Banner Tag for Most Popular */}
              {pkg.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-[#FACC15] to-[#F59E0B] text-black font-mono font-black text-[10px] tracking-widest uppercase shadow-[0_0_20px_rgba(245,158,11,0.7)] whitespace-nowrap">
                  ★ MOST POPULAR ★
                </div>
              )}

              <div>
                {/* Header Badge & Crown */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${pkg.badge_color}`}
                  >
                    {pkg.rank_badge}
                  </span>
                  <Crown className={`w-5 h-5 ${style.crownColor}`} />
                </div>

                {/* Tier Name & Price */}
                <h3 className={`font-heading font-black text-2xl sm:text-3xl mb-1 tracking-wide ${style.titleColor}`}>
                  {pkg.name}
                </h3>
                <div className="flex items-baseline gap-1.5 mb-6">
                  <span className={`font-mono font-black text-3xl sm:text-4xl ${style.priceColor}`}>
                    {pkg.price}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">/ month</span>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-slate-800/80 mb-6" />

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  {pkg.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-[13px] text-slate-200">
                      <CheckCircle2
                        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${style.checkColor}`}
                      />
                      <span className="leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-white/5">
                <button
                  onClick={() => handleSelectPackage(pkg)}
                  className={`w-full py-3.5 rounded-xl text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all transform hover:scale-[1.02] ${style.buttonClass}`}
                >
                  <span>OPT IN FOR {pkg.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fair Play Notice */}
      <div className="mt-14 text-center">
        <p className="text-xs text-slate-400 font-mono bg-slate-900/80 border border-slate-800/80 py-3.5 px-6 rounded-2xl max-w-2xl mx-auto leading-relaxed">
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
