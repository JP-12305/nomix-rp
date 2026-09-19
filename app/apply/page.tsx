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
  Lock
} from "lucide-react";
import { Application } from "@/types";

export default function ApplyPage() {
  const { user, loginWithDiscord, isLoading } = useAuth();
  const [existingApp, setExistingApp] = useState<Application | null>(null);
  const [checkingApp, setCheckingApp] = useState(true);

  useEffect(() => {
    if (user) {
      // Check for user application
      fetch(`/api/applications/status?discord_id=${user.discord_id}`)
        .then((res) => {
          if (res.ok) return res.json();
          return null;
        })
        .then((data) => {
          if (data && data.application) {
            setExistingApp(data.application);
          }
          setCheckingApp(false);
        })
        .catch(() => setCheckingApp(false));
    } else {
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

  // 2. Active Application Already Exists
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

  // 3. User is authenticated and eligible to apply
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
