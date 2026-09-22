"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { 
  Menu, 
  X, 
  ChevronDown, 
  User, 
  FileText, 
  ShieldAlert, 
  LogOut, 
  Radio, 
  ExternalLink,
  Sparkles,
  Users
} from "lucide-react";
import { ServerStatusData } from "@/types";

const NAV_LINKS = [
  { name: "HOME", href: "/" },
  { name: "ABOUT", href: "/about" },
  { name: "FEATURES", href: "/features" },
  { name: "RULES", href: "/rules" },
  { name: "APPLICATION", href: "/apply" },
  { name: "STATUS", href: "/status" },
  { name: "NEWS", href: "/news" },
  { name: "FAQ", href: "/faq" },
  { name: "DISCORD", href: "/discord" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, loginWithDiscord, logout, isStaff } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [serverStatus, setServerStatus] = useState<ServerStatusData | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    const loadStatus = () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      fetch("/api/server/status")
        .then((res) => res.json())
        .then((data) => setServerStatus(data))
        .catch((err) => console.error(err));
    };

    loadStatus();
    const interval = setInterval(loadStatus, 30000);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        loadStatus();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#06080C]/90 backdrop-blur-xl border-b border-cyan-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
          : "bg-transparent border-b border-white/5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/logo/logo.png"
                alt="NOMIX Roleplay Logo"
                fill
                className="object-contain drop-shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-black text-xl tracking-wider text-metallic group-hover:text-cyan-400 transition-colors">
                NOMIX<span className="text-cyan-400">RP</span>
              </span>
              <span className="text-[10px] tracking-[0.25em] text-slate-400 uppercase font-semibold">
                FiveM Community
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-1.5 text-xs font-semibold tracking-wider transition-colors duration-150 rounded-lg relative group border outline-none focus:outline-none focus-visible:outline-none focus:ring-0 select-none ${
                    isActive
                      ? "text-cyan-300 bg-cyan-950/40 border-cyan-500/40 shadow-[0_0_12px_rgba(0,240,255,0.15)]"
                      : "text-slate-300 hover:text-white hover:bg-white/5 border-transparent hover:border-slate-800/80"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Live Server Status Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              </span>
              <span className="font-mono text-emerald-400 font-semibold">
                {serverStatus ? `${serverStatus.players}/${serverStatus.max_players}` : "142/200"}
              </span>
              <span className="text-slate-500">PLAYERS</span>
            </div>

            {/* User Profile / Discord Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-lg bg-surface-card border border-slate-800 hover:border-cyan-500/40 transition-all text-left"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-cyan-500/50">
                    <Image
                      src={user.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                      alt={user.username}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white truncate max-w-[100px]">
                      {user.display_name || user.username}
                    </span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${
                      user.role === "admin" ? "text-red-400" : user.role === "staff" ? "text-cyan-400" : "text-slate-400"
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass-panel rounded-xl py-2 shadow-2xl border border-cyan-500/30 z-50">
                    <div className="px-4 py-2 border-b border-slate-800 text-xs text-slate-400">
                      Signed in as <strong className="text-white block truncate">{user.username}</strong>
                    </div>

                    <Link
                      href="/status"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-300 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-cyan-400" />
                      My Visa Application
                    </Link>

                    {isStaff && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-amber-300 hover:bg-amber-500/10 transition-colors font-semibold"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        Staff / Admin Portal
                      </Link>
                    )}

                    <div className="border-t border-slate-800 pt-1 mt-1">
                      <button
                        onClick={logout}
                        className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={loginWithDiscord}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-bold tracking-wider transition-all shadow-[0_0_15px_rgba(88,101,242,0.3)]"
              >
                <Users className="w-4 h-4" />
                LOGIN WITH DISCORD
              </button>
            )}

            {/* Fast Apply CTA Button */}
            <Link
              href="/apply"
              className="relative group px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-heading font-black text-xs tracking-wider transition-all hover:shadow-neon-cyan hover:scale-[1.02]"
            >
              APPLY FOR VISA
            </Link>
          </div>

          {/* Mobile Hamburger Menu Toggle */}
          <div className="flex lg:hidden items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Animated Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-panel border-b border-cyan-500/30 px-4 pt-2 pb-6 space-y-3">
          <nav className="grid grid-cols-2 gap-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors border outline-none focus:outline-none ${
                  pathname === link.href
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm"
                    : "bg-slate-900/60 text-slate-300 hover:text-white border-transparent"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {user ? (
              <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-cyan-500/50">
                    <Image
                      src={user.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                      alt={user.username}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-white">{user.username}</div>
                    <div className="text-cyan-400 capitalize">{user.role}</div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="text-xs text-red-400 hover:underline flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            ) : (
              <button
                onClick={loginWithDiscord}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#5865F2] text-white text-xs font-bold"
              >
                LOGIN WITH DISCORD
              </button>
            )}

            <Link
              href="/apply"
              className="w-full text-center py-2.5 rounded-lg bg-cyan-400 text-black font-heading font-black text-xs tracking-wider"
            >
              APPLY FOR VISA
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
