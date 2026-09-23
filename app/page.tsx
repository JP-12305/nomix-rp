"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Shield, 
  Zap, 
  Flame, 
  Car, 
  Briefcase, 
  Building, 
  Radio, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Terminal,
  FileText,
  Clock,
  ExternalLink,
  Crown,
  ChevronRight
} from "lucide-react";
import ServerStatusWidget from "@/components/server-status/ServerStatusWidget";
import FeatureCard from "@/components/cards/FeatureCard";
import PackagesSection from "@/components/packages/PackagesSection";
import { NewsArticle } from "@/types";
import { formatDate } from "@/lib/utils";

export default function HomePage() {
  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const watermarkVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Explicitly set muted property and trigger play to prevent browser autoplay block
    if (heroVideoRef.current) {
      heroVideoRef.current.muted = true;
      heroVideoRef.current.play().catch(() => {});
    }
    if (watermarkVideoRef.current) {
      watermarkVideoRef.current.muted = true;
      watermarkVideoRef.current.play().catch(() => {});
    }

    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLatestNews(data.slice(0, 3));
        }
      })
      .catch((err) => console.error(err));


    const handleScroll = () => {
      // Trigger background watermark only when 'YOUR CITY. YOUR STORY.' text reaches/touches the navbar (top <= 80px)
      if (headlineRef.current) {
        const rect = headlineRef.current.getBoundingClientRect();
        setIsScrolled(rect.top <= 80);
      } else {
        setIsScrolled(window.scrollY > 450);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative flex flex-col gap-24 pb-24 min-h-screen">
      
      {/* ========================================================================= */}
      {/* BACKGROUND GLASSMORPHIC WATERMARK (Appears only on scroll)                 */}
      {/* ========================================================================= */}
      <div 
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[440px] sm:max-w-[580px] md:max-w-[680px] aspect-[1280/1080] pointer-events-none z-0 select-none transition-all duration-700 ease-out ${
          isScrolled ? "opacity-30 blur-[0.5px] scale-100" : "opacity-0 scale-90"
        }`}
        aria-hidden="true"
      >
        <video
          ref={watermarkVideoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/logo/logo.png"
          className="w-full h-full object-contain drop-shadow-[0_0_80px_rgba(0,240,255,0.4)]"
        >
          <source src="/logo/logo.webm" type="video/webm" />
        </video>
      </div>

      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Layer 1: Logo first, followed by Text)                   */}
      {/* ========================================================================= */}
      <section className="relative z-10 flex flex-col items-center justify-center pt-20 sm:pt-24 pb-6 overflow-hidden">
        {/* Subtle background glow rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-2/3 right-1/4 w-[400px] h-[400px] bg-red-500/10 rounded-full blur-[160px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 flex flex-col items-center">

          {/* Official Animated Hero Logo (Single element with native poster fallback) */}
          <div className="relative w-full max-w-[320px] sm:max-w-[400px] md:max-w-[460px] aspect-[1280/1080] mb-8 sm:mb-12 transition-transform duration-500 hover:scale-105 flex items-center justify-center">
            <video
              ref={heroVideoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster="/logo/logo.png"
              className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(0,240,255,0.45)] pointer-events-none"
            >
              <source src="/logo/logo.webm" type="video/webm" />
            </video>
          </div>

          {/* Main Slogan Headline */}
          <h1 
            ref={headlineRef}
            className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-metallic max-w-5xl leading-[1.1] mb-6"
          >
            YOUR CITY. YOUR STORY. <br />
            <span className="text-glow-cyan text-cyan-400">YOUR LEGACY.</span>
          </h1>

          {/* Subheading */}
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed mb-10">
            Immerse yourself in a living, breathing cyber-urban metropolis. Build criminal empires, enforce the law, run player-driven businesses, and forge lasting stories in Los Santos.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/apply"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-heading font-black text-sm tracking-wider hover:shadow-neon-cyan transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              APPLY FOR VISA
            </Link>

            <a
              href="#server-status"
              className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel border border-slate-700 hover:border-cyan-500/40 text-white font-heading font-bold text-sm tracking-wider transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <Terminal className="w-4 h-4 text-cyan-400" />
              ENTER THE CITY
            </a>
          </div>

          {/* Key Stat Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-slate-900 w-full max-w-4xl">
            <div className="text-center p-3">
              <div className="font-mono font-black text-2xl sm:text-3xl text-cyan-400">200</div>
              <div className="text-xs sm:text-sm text-slate-300 font-semibold tracking-wider uppercase">Max Slots</div>
            </div>
            <div className="text-center p-3">
              <div className="font-mono font-black text-2xl sm:text-3xl text-emerald-400">&lt; 35ms</div>
              <div className="text-xs sm:text-sm text-slate-300 font-semibold tracking-wider uppercase">Average Ping</div>
            </div>
            <div className="text-center p-3">
              <div className="font-mono font-black text-2xl sm:text-3xl text-white">100%</div>
              <div className="text-xs sm:text-sm text-slate-300 font-semibold tracking-wider uppercase">Custom Framework</div>
            </div>
            <div className="text-center p-3">
              <div className="font-mono font-black text-2xl sm:text-3xl text-red-400">18+</div>
              <div className="text-xs sm:text-sm text-slate-300 font-semibold tracking-wider uppercase">Strict Whitelist</div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SERVER STATUS WIDGET SECTION */}
      {/* ========================================================================= */}
      <section id="server-status" className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full scroll-mt-28">
        <div className="text-center mb-8">
          <span className="text-xs sm:text-sm font-mono uppercase tracking-widest text-cyan-400 block mb-1">
            Real-Time Network Telemetry
          </span>
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-white">
            LIVE SERVER STATUS
          </h2>
        </div>

        <ServerStatusWidget />
      </section>

      {/* ========================================================================= */}
      {/* 3. WHY PLAY HERE? (CORE PILLARS) */}
      {/* ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs sm:text-sm font-mono uppercase tracking-widest text-cyan-400 block mb-2">
            The NOMIX Standard
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-metallic mb-4">
            WHY PLAY ON NOMIX ROLEPLAY?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            We prioritize deep character storytelling, balanced mechanics, and active community moderation over chaotic arcade gameplay.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-8 sm:p-9 rounded-2xl border border-white/5 space-y-4 hover:border-cyan-500/40 transition-all">
            <div className="p-3.5 w-fit rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400">
              <Shield className="w-7 h-7" />
            </div>
            <h3 className="font-heading font-bold text-xl sm:text-2xl text-white">
              Strict Quality & Anti-Toxicity
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every applicant undergoes a thorough review. Rules like NVL, RDM, VDM, and metagaming are vigorously enforced by active administrators.
            </p>
          </div>

          <div className="glass-panel p-8 sm:p-9 rounded-2xl border border-white/5 space-y-4 hover:border-red-500/40 transition-all">
            <div className="p-3.5 w-fit rounded-xl bg-red-950/40 border border-red-500/30 text-red-400">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="font-heading font-bold text-xl sm:text-2xl text-white">
              Dynamic Real-Time Economy
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Clean and dirty money laundering, fluctuating market trade, player-owned storefronts, vehicle depreciation, and multi-tier heist payouts.
            </p>
          </div>

          <div className="glass-panel p-8 sm:p-9 rounded-2xl border border-white/5 space-y-4 hover:border-emerald-500/40 transition-all">
            <div className="p-3.5 w-fit rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="font-heading font-bold text-xl sm:text-2xl text-white">
              Discord Bot Ecosystem
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Automated visa submission, interactive staff review buttons, instant Discord citizen role granting, and transparent status tracking.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SERVER FEATURES GRID */}
      {/* ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 block mb-1">
              Custom In-Game Mechanics
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-white">
              ENGINEERED FOR IMMERSION
            </h2>
          </div>
          <Link
            href="/features"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Explore All Features <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={Car}
            subtitle="Physics & Handling"
            title="Custom Vehicle Handling 3.0"
            description="Over 150 meticulously tuned import and lore-friendly vehicles featuring custom downforce, transmission ratios, and drift handling."
            tag="Vehicles"
            accentColor="cyan"
          />
          <FeatureCard
            icon={Briefcase}
            subtitle="Player Enterprises"
            title="Player-Owned Businesses"
            description="Manage auto dealerships, night clubs, mechanic garages, legal firms, and restaurants with custom inventory systems and staff payroll."
            tag="Economy"
            accentColor="emerald"
          />
          <FeatureCard
            icon={Flame}
            subtitle="Underground Syndicate"
            title="Multi-Stage Heists & Turf Wars"
            description="Progressive criminal progression from convenience store hold-ups to high-security Pacific Standard Vault thermal hacking."
            tag="Criminal"
            accentColor="red"
          />
          <FeatureCard
            icon={Building}
            subtitle="Modular Housing"
            title="Real Estate & Furnishing"
            description="Purchase apartments, mansions, or warehouses across San Andreas with over 1,200 modular props and private storage safes."
            tag="Housing"
            accentColor="amber"
          />
          <FeatureCard
            icon={Shield}
            subtitle="Law Enforcement"
            title="Next-Gen LSPD CAD / MDT"
            description="Integrated live MDT with automated warrants, vehicle plate readers, live GPS mapping, evidence lockers, and ballistic forensics."
            tag="Services"
            accentColor="cyan"
          />
          <FeatureCard
            icon={Radio}
            subtitle="Spatial Audio"
            title="3D Directional Radio & Phone"
            description="Crystal clear radio frequency encryption, customizable smartphone with social media, camera roll, and dark web marketplace."
            tag="Communication"
            accentColor="emerald"
          />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. COMMUNITY SUPPORTER TIERS & PACKAGES */}
      {/* ========================================================================= */}
      <PackagesSection />

      {/* ========================================================================= */}
      {/* 6. LATEST NEWS & CHANGELOGS */}
      {/* ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs sm:text-sm font-mono uppercase tracking-widest text-cyan-400 block mb-1">
              Transmissions & Changelogs
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-white">
              LATEST ANNOUNCEMENTS
            </h2>
          </div>
          <Link
            href="/news"
            className="inline-flex items-center gap-1.5 text-sm sm:text-base font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            View All Updates <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestNews.map((article) => (
            <Link
              key={article.id}
              href={`/news/${article.slug}`}
              className="glass-panel rounded-2xl overflow-hidden border border-white/5 hover:border-cyan-500/40 transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="relative h-44 w-full">
                <Image
                  src={article.cover_image || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600"}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/40 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-black/70 border border-white/10 text-cyan-400">
                    {article.category?.name || "Update"}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{formatDate(article.published_at)}</span>
                  </div>
                  <h3 className="font-heading font-bold text-lg text-white group-hover:text-cyan-300 transition-colors line-clamp-2 mb-2">
                    {article.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs sm:text-sm text-cyan-400 font-semibold">
                  <span>Read Article</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>



      {/* ========================================================================= */}
      {/* 7. RULES REMINDER CALLOUT */}
      {/* ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="glass-panel rounded-2xl p-8 sm:p-10 border border-slate-800/80 bg-gradient-to-r from-slate-950 via-[#0B0F17] to-cyan-950/20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs sm:text-sm font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-bold">
              <Shield className="w-4 h-4 text-amber-400" />
              COMMUNITY DIRECTIVE
            </span>
            <h3 className="font-heading font-bold text-2xl sm:text-3xl text-white">
              Familiarize Yourself with City Laws
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We require all applicants to review our rules on Value of Life, Random Deathmatch, and Metagaming prior to submitting a visa application.
            </p>
          </div>

          <Link
            href="/rules"
            className="w-full sm:w-auto flex-shrink-0 px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-white font-heading font-bold text-sm tracking-wider transition-all flex items-center justify-center gap-2 group"
          >
            <span>VIEW COMPLETE RULEBOOK</span>
            <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. VISA APPLICATION CTA BANNER */}
      {/* ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative rounded-3xl overflow-hidden glass-panel p-8 sm:p-14 lg:p-16 border border-cyan-500/30 text-center flex flex-col items-center bg-gradient-to-b from-[#0B0F17] to-[#040609] shadow-2xl">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-6">
            <Image
              src="/logo/logo.png"
              alt="NOMIX Logo"
              fill
              className="object-contain drop-shadow-[0_0_20px_rgba(0,240,255,0.6)]"
            />
          </div>

          <h2 className="font-heading font-black text-2xl sm:text-4xl lg:text-5xl text-metallic max-w-3xl mb-4 leading-tight">
            READY TO WRITE YOUR STORY IN LOS SANTOS?
          </h2>
          
          <p className="text-slate-300 text-xs sm:text-base max-w-xl mb-8 leading-relaxed">
            Our multi-step visa process ensures high-standard roleplay. Applications are reviewed promptly by our dedicated recruitment team.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
            <Link
              href="/apply"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-heading font-black text-sm tracking-wider hover:shadow-neon-cyan transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>START VISA APPLICATION</span>
            </Link>
            
            <Link
              href="/discord"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-heading font-bold text-sm tracking-wider transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(88,101,242,0.3)]"
            >
              <Users className="w-4 h-4" />
              <span>JOIN DISCORD COMMUNITY</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
