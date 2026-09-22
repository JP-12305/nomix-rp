"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { 
  Shield, 
  Hourglass, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  FileText, 
  Layers, 
  BookOpen, 
  HelpCircle, 
  Newspaper, 
  Users, 
  ExternalLink,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { Application, ApplicationStatus } from "@/types";
import { formatDate, getStatusDetails } from "@/lib/utils";
import ApplicationReviewModal from "@/components/admin/ApplicationReviewModal";
import NewsManager from "@/components/admin/NewsManager";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AdminDashboardContent() {
  const { user, isStaff, isAdmin, loginWithDiscord } = useAuth();
  const searchParams = useSearchParams();
  const urlAppId = searchParams?.get("appId");

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [activeTab, setActiveTab] = useState<"applications" | "rules" | "faqs" | "news">("applications");

  const fetchApplications = () => {
    setLoading(true);
    fetch(`/api/admin/applications?status=${activeStatusFilter}&search=${encodeURIComponent(searchQuery)}&_t=${Date.now()}`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.applications)) {
          setApplications(data.applications);
        } else {
          setApplications([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setApplications([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchApplications();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchApplications();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [activeStatusFilter, searchQuery]);

  useEffect(() => {
    if (urlAppId && isStaff) {
      fetch(`/api/applications/status?id=${urlAppId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.application) {
            setSelectedApp(data.application);
          }
        })
        .catch((e) => console.error(e));
    }
  }, [urlAppId, isStaff]);

  // If user is not logged in or not staff
  if (!user || !isStaff) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-40 pb-24 text-center space-y-6">
        <div className="p-4 w-fit rounded-2xl bg-red-950/40 border border-red-500/40 text-red-400 mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="font-heading font-black text-3xl text-white">
          RESTRICTED STAFF PORTAL
        </h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          You must have verified Staff or Administrator credentials to view the visa queue and internal moderation tools.
        </p>

        {user ? (
          <div className="glass-panel p-6 rounded-2xl border border-red-500/30 max-w-md mx-auto space-y-3">
            <span className="text-xs text-slate-300 block">
              Signed in as: <strong className="text-white">{user.username}</strong> (<span className="text-cyan-400 capitalize">{user.role}</span>)
            </span>
            <p className="text-[11px] text-slate-400">
              Your account currently has <strong className="text-slate-200">{user.role}</strong> permissions. Please ask a Server Director to assign the <code className="text-cyan-300 font-mono">staff</code> or <code className="text-red-400 font-mono">admin</code> role to your profile.
            </p>
          </div>
        ) : (
          <button
            onClick={loginWithDiscord}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5865F2] text-white font-heading font-bold text-xs"
          >
            <Users className="w-4 h-4" /> LOGIN WITH DISCORD STAFF ACCOUNT
          </button>
        )}
      </div>
    );
  }

  // Calculate Metrics
  const pendingCount = applications.filter((a) => a.status === "PENDING").length;
  const underReviewCount = applications.filter((a) => a.status === "UNDER_REVIEW").length;
  const approvedCount = applications.filter((a) => a.status === "APPROVED").length;
  const rejectedCount = applications.filter((a) => a.status === "REJECTED").length;
  const totalCount = applications.length;
  const approvalRate = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-10">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-white">
            STAFF MANAGEMENT CONSOLE
          </h1>
          <p className="text-xs text-slate-400">
            Welcome back, <strong className="text-white">{user.username}</strong> ({user.role.toUpperCase()})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchApplications}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:border-cyan-400 text-xs font-bold transition-all shadow-md"
            title="Refresh applications queue"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            <span>Refresh Queue</span>
          </button>
          <div className="px-3 py-1.5 rounded-lg bg-surface-card border border-slate-800 text-xs font-mono text-cyan-300 hidden sm:block">
            LIVE SYNC
          </div>
        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Pending */}
        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[10px] font-mono uppercase font-bold">Pending Queue</span>
            <Hourglass className="w-4 h-4 animate-pulse" />
          </div>
          <div className="mt-3">
            <div className="font-mono font-black text-3xl text-amber-300">{pendingCount}</div>
            <span className="text-[10px] text-slate-500">Awaiting initial review</span>
          </div>
        </div>

        {/* Under Review */}
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-[10px] font-mono uppercase font-bold">Under Review</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="mt-3">
            <div className="font-mono font-black text-3xl text-cyan-300">{underReviewCount}</div>
            <span className="text-[10px] text-slate-500">Active recruiter evaluation</span>
          </div>
        </div>

        {/* Approved */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[10px] font-mono uppercase font-bold">Approved</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="mt-3">
            <div className="font-mono font-black text-3xl text-emerald-300">{approvedCount}</div>
            <span className="text-[10px] text-slate-500">Citizen roles granted</span>
          </div>
        </div>

        {/* Rejected */}
        <div className="glass-panel p-5 rounded-2xl border border-red-500/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-red-400">
            <span className="text-[10px] font-mono uppercase font-bold">Rejected</span>
            <XCircle className="w-4 h-4" />
          </div>
          <div className="mt-3">
            <div className="font-mono font-black text-3xl text-red-300">{rejectedCount}</div>
            <span className="text-[10px] text-slate-500">Cooldown active</span>
          </div>
        </div>

        {/* Total & Acceptance */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase font-bold">Total Processed</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3">
            <div className="font-mono font-black text-3xl text-white">{totalCount}</div>
            <span className="text-[10px] text-emerald-400 font-semibold">{approvalRate}% Acceptance Rate</span>
          </div>
        </div>

      </div>

      {/* Navigation Tabs (Applications / Content) */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("applications")}
          className={`px-4 py-2 rounded-xl text-xs font-heading font-bold tracking-wider transition-all flex items-center gap-2 ${
            activeTab === "applications"
              ? "bg-cyan-500 text-black shadow-neon-cyan-sm"
              : "bg-surface-card border border-slate-800 text-slate-400 hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4" /> VISA APPLICATIONS QUEUE
        </button>

        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab("rules")}
              className={`px-4 py-2 rounded-xl text-xs font-heading font-bold tracking-wider transition-all flex items-center gap-2 ${
                activeTab === "rules"
                  ? "bg-cyan-500 text-black shadow-neon-cyan-sm"
                  : "bg-surface-card border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4" /> RULES MANAGER
            </button>
            <button
              onClick={() => setActiveTab("faqs")}
              className={`px-4 py-2 rounded-xl text-xs font-heading font-bold tracking-wider transition-all flex items-center gap-2 ${
                activeTab === "faqs"
                  ? "bg-cyan-500 text-black shadow-neon-cyan-sm"
                  : "bg-surface-card border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <HelpCircle className="w-4 h-4" /> FAQ MANAGER
            </button>
            <button
              onClick={() => setActiveTab("news")}
              className={`px-4 py-2 rounded-xl text-xs font-heading font-bold tracking-wider transition-all flex items-center gap-2 ${
                activeTab === "news"
                  ? "bg-cyan-500 text-black shadow-neon-cyan-sm"
                  : "bg-surface-card border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <Newspaper className="w-4 h-4" /> NEWS DISPATCHES
            </button>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. APPLICATIONS QUEUE TAB */}
      {/* ========================================================================= */}
      {activeTab === "applications" && (
        <div className="space-y-6">
          
          {/* Filter & Search Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, Character, or Discord..."
                className="w-full bg-surface-card border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {(["ALL", "PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setActiveStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold tracking-wider transition-all ${
                    activeStatusFilter === st
                      ? "bg-cyan-500 text-black font-bold shadow-neon-cyan-sm"
                      : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

          </div>

          {/* Applications Data Table */}
          <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#090D14] border-b border-slate-800 text-slate-400 uppercase font-mono tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">App ID</th>
                    <th className="p-4">Applicant</th>
                    <th className="p-4">Character</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Submitted</th>
                    <th className="p-4">Reviewer</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        Loading queue...
                      </td>
                    </tr>
                  ) : applications.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No visa applications found matching current criteria.
                      </td>
                    </tr>
                  ) : (
                    applications.map((application) => {
                      const stDetails = getStatusDetails(application.status);
                      return (
                        <tr
                          key={application.id}
                          className="hover:bg-slate-900/40 transition-colors group cursor-pointer"
                          onClick={() => setSelectedApp(application)}
                        >
                          <td className="p-4 font-mono font-bold text-cyan-300">
                            {application.application_number}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-semibold">@{application.discord_username}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">{application.discord_id}</span>
                          </td>
                          <td className="p-4">
                            <strong className="text-white block">{application.character_name}</strong>
                            <span className="text-[10px] text-slate-400">{application.character_age} yrs • {application.character_gender}</span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${stDetails.badgeClass}`}>
                              {stDetails.label}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-slate-400 text-[11px]">
                            {formatDate(application.submitted_at)}
                          </td>
                          <td className="p-4 text-slate-300">
                            {application.reviewer_name ? (
                              <span className="text-cyan-400 font-semibold font-mono">@{application.reviewer_name}</span>
                            ) : (
                              <span className="text-slate-600 font-mono">Unassigned</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedApp(application);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500 hover:text-black font-heading font-bold text-[11px] transition-all"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. RULES MANAGER TAB */}
      {/* ========================================================================= */}
      {activeTab === "rules" && (
        <div className="glass-panel p-8 rounded-2xl border border-white/5 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="font-heading font-black text-2xl text-white">Rulebook Management</h2>
              <p className="text-xs text-slate-400">Create, edit, and toggle active server rules persisted in Supabase.</p>
            </div>
            <Link href="/rules" className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-cyan-400 font-bold hover:text-white">
              Preview Public View
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-surface-card border border-slate-800 text-xs text-slate-300 space-y-2">
            <span className="text-cyan-400 font-mono font-bold block">DATABASE RULES READY</span>
            <p>Rules and categories are driven by the <code>rules</code> and <code>rule_categories</code> Supabase tables with live search and severity tagging.</p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. FAQ MANAGER TAB */}
      {/* ========================================================================= */}
      {activeTab === "faqs" && (
        <div className="glass-panel p-8 rounded-2xl border border-white/5 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="font-heading font-black text-2xl text-white">FAQ Knowledgebase</h2>
              <p className="text-xs text-slate-400">Manage questions and answers available on the public support page.</p>
            </div>
            <Link href="/faq" className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-cyan-400 font-bold hover:text-white">
              Preview FAQ View
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-surface-card border border-slate-800 text-xs text-slate-300 space-y-2">
            <span className="text-cyan-400 font-mono font-bold block">FAQ REPOSITORY</span>
            <p>Connected to <code>faqs</code> and <code>faq_categories</code> tables with automated categorized accordions.</p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. NEWS DISPATCHES TAB */}
      {/* ========================================================================= */}
      {activeTab === "news" && (
        <NewsManager />
      )}

      {/* Application Review Modal */}
      {selectedApp && (
        <ApplicationReviewModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onRefresh={() => {
            fetchApplications();
            // refresh selectedApp if still open
            fetch(`/api/applications/status?id=${selectedApp.id}`)
              .then((res) => res.json())
              .then((d) => {
                if (d.application) setSelectedApp(d.application);
              });
          }}
        />
      )}

    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 pt-40 pb-24 text-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span className="text-xs font-mono text-slate-400">Loading Staff Dashboard...</span>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}
