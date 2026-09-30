"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Shield, ExternalLink, ArrowUpRight, Youtube, Instagram } from "lucide-react";

function TikTokIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.41a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.81 4.47 6.29 6.29 0 0 0 1.9-4.47V8.65a8.28 8.28 0 0 0 4.88 1.57V6.77c-.34-.02-.68-.05-1-.08z" />
    </svg>
  );
}

function DiscordIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="relative bg-[#040609] border-t border-slate-900/80 pt-16 pb-12 overflow-hidden z-10">
      {/* Decorative top cyan light streak */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      <div className="absolute top-0 left-1/4 w-32 h-[1px] bg-red-500/60 blur-[1px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-900">
          
          {/* Col 1 & 2: Branding & Slogan & Socials */}
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
                <span className="font-heading font-black text-2xl sm:text-3xl tracking-wider text-metallic">
                  NOMIX<span className="text-cyan-400">RP</span>
                </span>
                <span className="text-xs tracking-[0.2em] text-slate-400 uppercase font-semibold">
                  FiveM Roleplay Ecosystem
                </span>
              </div>
            </Link>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm">
              YOUR CITY. YOUR STORY. YOUR LEGACY. A premier FiveM roleplay experience built on custom economy mechanics, law enforcement realism, high-tier criminal progression, and living stories.
            </p>

            {/* Official Social Media Links */}
            <div className="pt-2">
              <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold block mb-3">
                Official Social Media
              </span>
              <div className="flex items-center gap-3">
                {/* TikTok */}
                <a
                  href="https://www.tiktok.com/@nomix.rp?_r=1&_t=ZG-9A8xiUMLWPR"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 transition-all flex items-center justify-center group shadow-md hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                  title="Follow us on TikTok"
                >
                  <TikTokIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                </a>

                {/* YouTube */}
                <a
                  href="https://youtube.com/@nomixrp?si=OYO3xlmnvNpcGHLL"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-red-500 hover:bg-red-500/20 hover:text-red-400 text-slate-300 transition-all flex items-center justify-center group shadow-md hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                  title="Subscribe on YouTube"
                >
                  <Youtube className="w-5 h-5 transition-transform group-hover:scale-110" />
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/nomix_roleplay?stkn=OXkzM2w4dnh4MTI4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-pink-500 hover:bg-pink-500/20 hover:text-pink-400 text-slate-300 transition-all flex items-center justify-center group shadow-md hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                  title="Follow on Instagram"
                >
                  <Instagram className="w-5 h-5 transition-transform group-hover:scale-110" />
                </a>

                {/* Discord */}
                <a
                  href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg/zDZNZT2RKq"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-[#5865F2] hover:bg-[#5865F2]/20 hover:text-[#5865F2] text-slate-300 transition-all flex items-center justify-center group shadow-md hover:shadow-[0_0_15px_rgba(88,101,242,0.3)]"
                  title="Join Official Discord"
                >
                  <DiscordIcon className="w-5 h-5 transition-transform group-hover:scale-110" />
                </a>
              </div>
            </div>

          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-4">
            <h3 className="text-sm font-heading font-bold text-cyan-300 tracking-wider uppercase">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-300">
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
          <div className="space-y-4">
            <h3 className="text-sm font-heading font-bold text-cyan-300 tracking-wider uppercase">
              Visa & Rules
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link href="/rules" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                  Server Rules & Regulations
                </Link>
              </li>
              <li>
                <Link href="/apply" className="hover:text-cyan-400 transition-colors flex items-center gap-1 text-cyan-300 font-semibold">
                  Apply for Citizen Visa <ArrowUpRight className="w-3.5 h-3.5" />
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

          {/* Col 5: Store & Staff */}
          <div className="space-y-4">
            <h3 className="text-sm font-heading font-bold text-cyan-300 tracking-wider uppercase">
              Store & Staff
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link href="/store" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                  Server Store & Packages
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-amber-400 transition-colors flex items-center gap-1 text-slate-300">
                  <Shield className="w-4 h-4 text-amber-400" />
                  Staff Review Dashboard
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar & Legal Notice */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-400">
          <p>
            &copy; 2026 NOMIX Roleplay. All rights reserved.
          </p>
          <p className="text-xs text-slate-400 max-w-md text-center md:text-right">
            NOMIX Roleplay is not affiliated with, endorsed by, or connected to Rockstar Games, Take-Two Interactive, or Cfx.re / FiveM.
          </p>
        </div>
      </div>
    </footer>
  );
}
