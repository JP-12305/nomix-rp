"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import ApplicationWizard from "@/components/application/ApplicationWizard";
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2,
  Lock,
  Play,
  AlertTriangle
} from "lucide-react";
import { Application } from "@/types";

export default function ApplyPage() {
  const { user, loginWithDiscord, isLoading } = useAuth();
  const [existingApp, setExistingApp] = useState<Application | null>(null);
  const [checkingApp, setCheckingApp] = useState(true);

  useEffect(() => {
    if (user) {
      // Check for user application with zero-cache
      fetch(`/api/applications/status?discord_id=${encodeURIComponent(user.discord_id)}&user_id=${encodeURIComponent(user.id)}&_t=${Date.now()}`, {
        cache: "no-store",
      })
        .then((res) => {
          if (res.ok) return res.json();
          return null;
        })
        .then((data) => {
          if (data && data.application) {
            setExistingApp(data.application);
          } else {
            setExistingApp(null);
          }
          setCheckingApp(false);
        })
        .catch(() => {
          setExistingApp(null);
          setCheckingApp(false);
        });
    } else {
      setExistingApp(null);
      setCheckingApp(false);
    }
  }, [user]);

  if (isLoading || checkingApp) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-40 pb-24 text-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span className="text-xs font-mono text-slate-400">Verifying Discord authentication & visa eligibility...</span>
      </div>
    );
  }

  // 1. Not Authenticated State
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-36 pb-24 text-center space-y-8">
        <div className="relative w-24 h-24 mx-auto">
          <Image
            src="/logo/logo.png"
            alt="NOMIX Logo"
            fill
            className="object-contain drop-shadow-[0_0_25px_rgba(0,240,255,0.4)]"
          />
        </div>

        <div className="space-y-3">
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-white">
            CITIZEN VISA APPLICATION
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            To prevent fraud and automatically sync your whitelisted Discord citizen role upon approval, you must authenticate with Discord before beginning.
          </p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-cyan-500/30 space-y-6 shadow-2xl">
          <div className="flex items-center justify-center gap-2 text-cyan-400 text-xs font-mono font-bold">
            <Lock className="w-4 h-4" />
            <span>DISCORD OAUTH VERIFICATION REQUIRED</span>
          </div>

          <button
            onClick={loginWithDiscord}
            className="w-full py-4 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-heading font-black text-sm tracking-wider transition-all transform hover:-translate-y-0.5 shadow-[0_0_20px_rgba(88,101,242,0.4)] flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            CONTINUE WITH DISCORD
          </button>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            We will only access your public Discord identifier, username, and avatar. We never access private messages or tokens.
          </p>
        </div>
      </div>
    );
  }

  // 2. Application is Approved
  if (existingApp && existingApp.status === "APPROVED") {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-36 pb-24 space-y-8 text-center">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-emerald-500/40 space-y-6 shadow-2xl">
          <div className="p-4 w-fit rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase text-emerald-400 tracking-wider">
              Visa Granted ({existingApp.application_number})
            </span>
            <h1 className="font-heading font-black text-3xl text-white">
              YOU ARE ALREADY AN APPROVED CITIZEN
            </h1>
            <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
              Your citizen application for character <strong>{existingApp.character_name}</strong> was approved. Your Discord account has the verified citizen role.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={process.env.NEXT_PUBLIC_FIVEM_CONNECT_URL || "fivem://connect/play.nomixroleplay.xyz"}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-400 text-black font-heading font-black text-xs tracking-wider hover:shadow-neon-cyan transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-black" /> CONNECT TO FIVEM SERVER
            </a>
            <Link
              href="/status"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-heading font-bold text-xs tracking-wider"
            >
              VIEW VISA STATUS
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Active Application Already Exists (Pending or Under Review)
  if (existingApp && (existingApp.status === "PENDING" || existingApp.status === "UNDER_REVIEW")) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-36 pb-24 space-y-8 text-center">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-amber-500/40 space-y-6 shadow-2xl">
          <div className="p-4 w-fit rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-400 mx-auto">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase text-amber-400 tracking-wider">
              Application In Progress ({existingApp.application_number})
            </span>
            <h1 className="font-heading font-black text-3xl text-white">
              YOUR VISA APPLICATION IS PENDING
            </h1>
            <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
              You already have an active visa application submitted for character <strong>{existingApp.character_name}</strong>. Our staff recruitment team is actively reviewing submissions.
            </p>
          </div>

          <div className="pt-4 flex justify-center gap-4">
            <Link
              href="/status"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-heading font-black text-xs tracking-wider hover:shadow-neon-cyan transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" /> VIEW APPLICATION STATUS
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Application was Rejected & Cooldown is active
  if (existingApp && existingApp.status === "REJECTED") {
    const cooldownDays = Number(process.env.REAPPLICATION_COOLDOWN_DAYS) || 3;
    const reviewTime = existingApp.reviewed_at ? new Date(existingApp.reviewed_at).getTime() : Date.now();
    const cooldownEndTime = reviewTime + cooldownDays * 24 * 60 * 60 * 1000;
    const isCooldownActive = Date.now() < cooldownEndTime;

    if (isCooldownActive) {
      return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-36 pb-24 space-y-8 text-center">
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-red-500/40 space-y-6 shadow-2xl">
            <div className="p-4 w-fit rounded-2xl bg-red-950/40 border border-red-500/30 text-red-400 mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-red-400 tracking-wider">
                Reapplication Cooldown Active ({existingApp.application_number})
              </span>
              <h1 className="font-heading font-black text-3xl text-white">
                REAPPLICATION COOLDOWN IN EFFECT
              </h1>
              <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                Your previous application was rejected. Please review our server guidelines before applying again.
              </p>
            </div>

            <div className="p-4 max-w-md mx-auto rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-300 text-left">
              <strong>Staff Reason:</strong> {existingApp.rejection_reason || "Did not meet requirements."}
            </div>

            <div className="text-xs text-red-400 font-mono">
              You can re-apply after: {new Date(cooldownEndTime).toLocaleDateString()} at {new Date(cooldownEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>

            <div className="pt-4 flex justify-center gap-4">
              <Link
                href="/status"
                className="px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-heading font-bold text-xs tracking-wider"
              >
                VIEW DETAILS ON STATUS PAGE
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  // 5. User is authenticated and eligible to apply
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-metallic">
          APPLY FOR CITIZEN VISA
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Please complete all 6 sections with high-effort answers. Applications with low-effort definitions or poor character backstories will be rejected.
        </p>
      </div>

      <ApplicationWizard />
    </div>
  );
}
