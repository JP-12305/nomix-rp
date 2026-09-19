"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Flame, HeartPulse, Building2 } from "lucide-react";

interface DepartmentCardProps {
  title: string;
  category: string;
  description: string;
  image: string;
  accent: "blue" | "red" | "emerald" | "amber";
  badge: string;
}

export default function DepartmentCard({
  title,
  category,
  description,
  image,
  accent,
  badge,
}: DepartmentCardProps) {
  return (
    <div className="group relative rounded-2xl overflow-hidden glass-panel border border-white/5 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between">
      {/* Cover Image with gradient overlay */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/60 to-transparent" />
        
        {/* Top Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300">
            {badge}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
            {category}
          </span>
          <h3 className="font-heading font-bold text-xl text-white group-hover:text-cyan-300 transition-colors mb-2">
            {title}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">Whitelisted Career</span>
          <Link
            href="/apply"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors"
          >
            Apply Now <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
