"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Shield, Target, Compass, Users, CheckCircle2, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-20">
      
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="font-heading font-black text-4xl sm:text-5xl text-metallic">
          CRAFTING STORIES WITHOUT LIMITS
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Founded by dedicated roleplay veterans, NOMIX Roleplay was born from a desire to create a balanced, immersive, and visually stunning FiveM environment where narrative quality comes first.
        </p>
      </div>

      {/* Core Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-panel p-8 sm:p-9 rounded-2xl border border-white/5 space-y-4">
          <div className="p-3.5 w-fit rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400">
            <Target className="w-7 h-7" />
          </div>
          <h2 className="font-heading font-bold text-2xl text-white">Our Mission</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            To provide an unparalleled FiveM roleplay experience where players are empowered to create meaningful storylines, build legitimate or underground dynasties, and forge memories with a welcoming and mature community.
          </p>
        </div>

        <div className="glass-panel p-8 sm:p-9 rounded-2xl border border-white/5 space-y-4">
          <div className="p-3.5 w-fit rounded-xl bg-red-950/40 border border-red-500/30 text-red-400">
            <Compass className="w-7 h-7" />
          </div>
          <h2 className="font-heading font-bold text-2xl text-white">Our Standards</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            We hold strict standards against “win-mentality” and toxic gaming culture. Loss in roleplay is viewed as narrative progress. Value of Life, character realism, and mutual respect form the pillar of every scenario in NOMIX.
          </p>
        </div>
      </div>

      {/* Lore Section */}
      <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-cyan-500/20 bg-gradient-to-r from-[#0B0F17] via-[#0B0F17] to-cyan-950/20 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-400">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white">
            The City of Los Santos: A New Dawn
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The year is 2026. The metropolitan streets of Los Santos pulse with neon lights, high-performance engines, and towering skyscraper silhouettes. While the Mayor’s Office and the San Andreas State Police fight to clean up downtown corruption, underground cartels and independent syndicates orchestrate lucrative smuggling rings beneath the shadows of Vinewood Hills.
        </p>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Whether you choose to arrive as a humble civilian striving to build a five-star culinary establishment, an ambitious surgeon at Mount Zonah, or a fearless criminal mastermind, your choices will echo throughout the city.
        </p>
      </div>

      {/* CTA Box */}
      <div className="text-center space-y-6 pt-6">
        <h3 className="font-heading font-bold text-2xl sm:text-3xl text-white">
          Begin Your Journey on NOMIX RP
        </h3>
        <div className="flex justify-center gap-4">
          <Link
            href="/apply"
            className="px-8 py-3.5 rounded-xl bg-cyan-400 text-black font-heading font-bold text-sm tracking-wider hover:shadow-neon-cyan transition-all flex items-center gap-2"
          >
            APPLY FOR CITIZEN VISA <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </div>
  );
}
