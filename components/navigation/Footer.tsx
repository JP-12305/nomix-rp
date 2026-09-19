"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Shield, ExternalLink, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-[#040609] border-t border-slate-900/80 pt-16 pb-12 overflow-hidden z-10">
      {/* Decorative top cyan light streak */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      <div className="absolute top-0 left-1/4 w-32 h-[1px] bg-red-500/60 blur-[1px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-900">
          
          {/* Col 1 & 2: Branding & Slogan */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-12 h-12">
                <Image
                  src="/logo/logo.png"
                  alt="NOMIX Logo"
                  fill
                  className="object-contain drop-shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-black text-2xl tracking-wider text-metallic">
                  NOMIX<span className="text-cyan-400">RP</span>
                </span>
                <span className="text-[10px] tracking-[0.25em] text-slate-400 uppercase font-semibold">
                  FiveM Roleplay Ecosystem
                </span>
              </div>
            </Link>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              YOUR CITY. YOUR STORY. YOUR LEGACY. A premier FiveM roleplay experience built on custom economy mechanics, law enforcement realism, high-tier criminal progression, and living stories.
            </p>

          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-3">
            <h3 className="text-xs font-heading font-bold text-cyan-300 tracking-wider uppercase">
              Navigation
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                  About Server
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                  Server Features
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                  Announcements
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                  FAQ & Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Visa & Guidelines */}
          <div className="space-y-3">
            <h3 className="text-xs font-heading font-bold text-cyan-300 tracking-wider uppercase">
              Visa & Rules
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/rules" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                  Server Rules & Regulations
                </Link>
              </li>
              <li>
                <Link href="/apply" className="hover:text-cyan-400 transition-colors flex items-center gap-1 text-cyan-300 font-semibold">
                  Apply for Citizen Visa <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link href="/status" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                  Track Visa Status
                </Link>
              </li>
              <li>
                <Link href="/discord" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                  Official Discord Hub
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Departments & Staff */}
          <div className="space-y-3">
            <h3 className="text-xs font-heading font-bold text-cyan-300 tracking-wider uppercase">
              Departments & Staff
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/departments" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                  LSPD & Emergency Services
                </Link>
              </li>
              <li>
                <Link href="/staff" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                  Staff & Management Team
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-amber-400 transition-colors flex items-center gap-1 text-slate-400">
                  <Shield className="w-3 h-3 text-amber-400" />
                  Staff Review Dashboard
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar & Legal Notice */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; 2026 NOMIX Roleplay. All rights reserved.
          </p>
          <p className="text-[11px] text-slate-600 max-w-md text-center md:text-right">
            NOMIX Roleplay is not affiliated with, endorsed by, or connected to Rockstar Games, Take-Two Interactive, or Cfx.re / FiveM.
          </p>
        </div>
      </div>
    </footer>
  );
}
