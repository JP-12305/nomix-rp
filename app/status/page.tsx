"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth/auth-context";
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Hourglass, 
  ShieldCheck, 
  FileText, 
  Terminal, 
  ArrowRight, 
  Sparkles,
  AlertTriangle,
  Play,
  RotateCcw,
  Users,
  RefreshCw
} from "lucide-react";
import { Application } from "@/types";
import { formatDate, getStatusDetails } from "@/lib/utils";

export default function StatusPage() {
  const { user, loginWithDiscord } = useAuth();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStatus = async (isManual = false) => {
    if (!user) return;
    if (isManual) setRefreshing(true);

    try {
      const res = await fetch(`/api/applications/status?discord_id=${user.discord_id}&user_id=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.application) {
          setApp(data.application);
        } else {
          setApp(null);
        }
      }
    } catch (e) {
      console.error("Status fetch error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadStatus();
      // Auto-poll status every 12 seconds if pending or under review
      const interval = setInterval(() => {
        if (document.visibilityState === "visible") {
          loadStatus();
        }
      }, 12000);

      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-36 pb-24 text-center space-y-6">
        <h1 className="font-heading font-black text-3xl text-white">
          TRACK YOUR VISA APPLICATION
        </h1>
        <p className="text-xs text-slate-400">
          Sign in with your Discord account to view your application status and staff review progress.
        </p>
        <button
          onClick={loginWithDiscord}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-heading font-bold text-xs tracking-wider transition-all"
        >
          <Users className="w-4 h-4" />
          LOGIN WITH DISCORD
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-40 pb-24 text-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span className="text-xs font-mono text-slate-400">Retrieving application history from database...</span>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-36 pb-24 text-center space-y-6">
        <div className="p-4 w-fit rounded-2xl bg-slate-900 border border-slate-800 text-cyan-400 mx-auto">
          <FileText className="w-8 h-8" />
        </div>
        <h1 className="font-heading font-black text-2xl text-white">
          No Application on Record
        </h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          We couldn’t find an active visa application linked to your Discord account ({user.username}).
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/apply"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-400 text-black font-heading font-bold text-xs tracking-wider hover:shadow-neon-cyan"
          >
            START VISA APPLICATION <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={() => loadStatus(true)}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const details = getStatusDetails(app.status);
  const isApproved = app.status === "APPROVED";
  const isRejected = app.status === "REJECTED";
  const isUnderReview = app.status === "UNDER_REVIEW";
  const isPending = app.status === "PENDING";

  // Reapplication Cooldown Calculation
  const cooldownDays = 3;
  const reviewTime = app.reviewed_at ? new Date(app.reviewed_at).getTime() : Date.now();
  const cooldownEndTime = reviewTime + cooldownDays * 24 * 60 * 60 * 1000;
  const isCooldownActive = isRejected && Date.now() < cooldownEndTime;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-10">
      
      {/* Top Banner Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-cyan-500/30 text-xs font-mono text-cyan-400">
          <FileText className="w-3.5 h-3.5" />
          <span>VISA REGISTRATION PORTAL</span>
        </div>
        <h1 className="font-heading font-black text-3xl sm:text-5xl text-metallic">
          APPLICATION STATUS
        </h1>
        <div className="flex items-center justify-center gap-3 text-xs text-slate-400">
          <span>Application Reference: <strong className="text-white font-mono">{app.application_number}</strong></span>
          <span>•</span>
          <button
            onClick={() => loadStatus(true)}
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Status
          </button>
        </div>
      </div>

      {/* Main Status Showcase Card */}
      <div
        className={`glass-panel rounded-3xl p-8 sm:p-10 border transition-all duration-500 shadow-2xl relative overflow-hidden ${
          isApproved
            ? "border-emerald-500/50 bg-gradient-to-b from-emerald-950/20 to-[#0B0F17] shadow-[0_0_40px_rgba(16,185,129,0.15)]"
            : isRejected
            ? "border-red-500/50 bg-gradient-to-b from-red-950/20 to-[#0B0F17] shadow-[0_0_40px_rgba(239,68,68,0.15)]"
            : "border-cyan-500/30 bg-gradient-to-b from-cyan-950/20 to-[#0B0F17]"
        }`}
      >
        
        {/* Status Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-8 border-b border-slate-800">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div
              className={`p-4 rounded-2xl border ${
                isApproved
                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-400"
                  : isRejected
                  ? "bg-red-950/60 border-red-500/40 text-red-400"
                  : "bg-cyan-950/60 border-cyan-500/40 text-cyan-400"
              }`}
            >
              {isApproved ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : isRejected ? (
                <XCircle className="w-8 h-8" />
              ) : (
                <Hourglass className="w-8 h-8 animate-pulse" />
              )}
            </div>

            <div>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${details.badgeClass}`}>
                {details.label}
              </span>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-white mt-1">
                {isApproved
                  ? "VISA APPROVED — WELCOME CITIZEN"
                  : isRejected
                  ? "APPLICATION REJECTED"
                  : isUnderReview
                  ? "UNDER ACTIVE RECRUITMENT REVIEW"
                  : "APPLICATION QUEUED"}
              </h2>
              <p className="text-xs text-slate-400 mt-1">{details.description}</p>
            </div>
          </div>

          <div className="text-right font-mono text-xs text-slate-400 hidden sm:block">
            <div>Submitted: <span className="text-white">{formatDate(app.submitted_at || app.created_at)}</span></div>
            {app.reviewed_at && (
              <div>Reviewed: <span className="text-white">{formatDate(app.reviewed_at)}</span></div>
            )}
          </div>
        </div>

        {/* Interactive Progress Step Timeline */}
        <div className="my-8 py-4">
          <div className="grid grid-cols-3 gap-2 relative">
            {/* Step 1 */}
            <div className="text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-black font-bold flex items-center justify-center mx-auto text-xs shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                ✓
              </div>
              <div className="text-xs font-heading font-bold text-white">1. Submitted</div>
              <div className="text-[10px] text-slate-500 font-mono">Form persisted</div>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-2">
              <div
                className={`w-10 h-10 rounded-full font-bold flex items-center justify-center mx-auto text-xs ${
                  isApproved || isRejected || isUnderReview
                    ? "bg-cyan-400 text-black shadow-neon-cyan"
                    : "bg-slate-900 border border-slate-800 text-slate-500"
                }`}
              >
                {isApproved || isRejected ? "✓" : "2"}
              </div>
              <div className={`text-xs font-heading font-bold ${isUnderReview ? "text-cyan-300" : "text-slate-300"}`}>
                2. Staff Review
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {isUnderReview ? "In evaluation" : isPending ? "Waiting queue" : "Completed"}
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-2">
              <div
                className={`w-10 h-10 rounded-full font-bold flex items-center justify-center mx-auto text-xs ${
                  isApproved
                    ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.6)]"
                    : isRejected
                    ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.6)]"
                    : "bg-slate-900 border border-slate-800 text-slate-500"
                }`}
              >
                {isApproved ? "✓" : isRejected ? "✕" : "3"}
              </div>
              <div className={`text-xs font-heading font-bold ${isApproved ? "text-emerald-400" : isRejected ? "text-red-400" : "text-slate-500"}`}>
                3. Final Decision
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {isApproved ? "Citizen Role Granted" : isRejected ? "Feedback Issued" : "Pending decision"}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Feedback & Next Actions */}
        {isApproved && (
          <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-4">
            <h3 className="font-heading font-bold text-lg text-emerald-300 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              You are Ready to Fly into Los Santos!
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your application has been approved. Your Discord account has been granted the <strong>Citizen Role</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <a
                href={process.env.NEXT_PUBLIC_FIVEM_CONNECT_URL || "fivem://connect/play.nomixroleplay.xyz"}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-400 text-black font-heading font-black text-xs tracking-wider flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              >
                <Play className="w-4 h-4 fill-black" /> CONNECT TO FIVEM SERVER
              </a>
              <Link
                href="/discord"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-heading font-bold text-xs tracking-wider text-center"
              >
                OPEN DISCORD
              </Link>
            </div>
          </div>
        )}

        {isRejected && (
          <div className="p-6 rounded-2xl bg-red-950/40 border border-red-500/30 space-y-4">
            <h3 className="font-heading font-bold text-lg text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Staff Reviewer Feedback
            </h3>
            
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-line">
              {app.rejection_reason || "Application did not meet minimum roleplay detail standards."}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <p className="text-slate-400">
                You may review our server guidelines on our <Link href="/rules" className="text-cyan-400 underline">Rules Page</Link>.
              </p>
              {isCooldownActive ? (
                <div className="px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-500/30 text-red-300 text-xs font-mono">
                  Cooldown ends: {new Date(cooldownEndTime).toLocaleDateString()} at {new Date(cooldownEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              ) : (
                <Link
                  href="/apply"
                  className="px-4 py-2 rounded-lg bg-cyan-400 text-black font-bold text-xs tracking-wider hover:shadow-neon-cyan"
                >
                  RE-APPLY NOW
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Applicant Summary Metadata */}
        <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 uppercase text-[10px] block font-semibold">Character</span>
            <strong className="text-white">{app.character_name}</strong>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] block font-semibold">Age & Gender</span>
            <strong className="text-white">{app.character_age} yrs, {app.character_gender}</strong>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] block font-semibold">Discord Account</span>
            <strong className="text-cyan-400 font-mono">@{app.discord_username}</strong>
          </div>
          <div>
            <span className="text-slate-500 uppercase text-[10px] block font-semibold">Server Reference</span>
            <strong className="text-slate-300 font-mono">{app.application_number}</strong>
          </div>
        </div>

      </div>

    </div>
  );
}
