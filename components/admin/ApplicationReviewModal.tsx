"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageSquare, 
  ShieldCheck, 
  User, 
  FileText, 
  Sparkles, 
  Flame, 
  AlertTriangle,
  Send,
  Loader2
} from "lucide-react";
import { Application, StaffNote, ApplicationEvent } from "@/types";
import { formatDate, getStatusDetails } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";

interface ApplicationReviewModalProps {
  application: Application;
  onClose: () => void;
  onRefresh: () => void;
}

export default function ApplicationReviewModal({
  application: initialApp,
  onClose,
  onRefresh,
}: ApplicationReviewModalProps) {
  const { user, isAdmin } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [app, setApp] = useState<Application>(initialApp);
  const [activeTab, setActiveTab] = useState<"answers" | "notes" | "audit">("answers");
  const [noteInput, setNoteInput] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    if (initialApp) {
      setApp((prev) => ({
        ...prev,
        ...initialApp,
        answers: (initialApp.answers && initialApp.answers.length > 0) ? initialApp.answers : prev.answers,
        notes: (initialApp.notes && initialApp.notes.length > 0) ? initialApp.notes : prev.notes,
        events: (initialApp.events && initialApp.events.length > 0) ? initialApp.events : prev.events,
      }));
    }
  }, [initialApp]);

  const updateAppSafely = (newAppData: Partial<Application>) => {
    if (!newAppData) return;
    setApp((prev) => ({
      ...prev,
      ...newAppData,
      answers: (newAppData.answers && newAppData.answers.length > 0) ? newAppData.answers : prev.answers,
      notes: (newAppData.notes && newAppData.notes.length > 0) ? newAppData.notes : prev.notes,
      events: (newAppData.events && newAppData.events.length > 0) ? newAppData.events : prev.events,
    }));
  };
  
  // Rejection modal prompt (initial review)
  const [showRejectPrompt, setShowRejectPrompt] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Admin Override Prompts
  const [showRevokePrompt, setShowRevokePrompt] = useState(false);
  const [revocationReason, setRevocationReason] = useState("");
  const [showOverrulePrompt, setShowOverrulePrompt] = useState(false);

  const [processingAction, setProcessingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const reviewerInfo = {
    id: user?.id || "usr-demo-staff",
    name: user?.username || "NomixStaff",
    role: user?.role || "staff",
  };

  const handleApprove = async () => {
    setProcessingAction(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/applications/${app.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "APPROVED",
          reviewer: reviewerInfo,
          is_admin_override: isAdmin,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || "Failed to approve application.");
        setProcessingAction(false);
        return;
      }

      updateAppSafely(data.application);
      setProcessingAction(false);
      onRefresh();
    } catch (err: any) {
      setActionError(err.message || "Failed to approve.");
      setProcessingAction(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason || rejectionReason.trim().length < 5) {
      setActionError("Please provide a constructive rejection reason (min 5 characters).");
      return;
    }

    setProcessingAction(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/applications/${app.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "REJECTED",
          rejection_reason: rejectionReason,
          reviewer: reviewerInfo,
          is_admin_override: isAdmin,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || "Failed to reject application.");
        setProcessingAction(false);
        return;
      }

      updateAppSafely(data.application);
      setShowRejectPrompt(false);
      setProcessingAction(false);
      onRefresh();
    } catch (err: any) {
      setActionError(err.message || "Failed to reject.");
      setProcessingAction(false);
    }
  };

  const handleRevokeVisa = async () => {
    if (!revocationReason || revocationReason.trim().length < 5) {
      setActionError("Please provide an administrative reason for revoking the visa (min 5 characters).");
      return;
    }

    setProcessingAction(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/applications/${app.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "REJECTED",
          rejection_reason: revocationReason,
          reviewer: reviewerInfo,
          is_admin_override: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || "Failed to revoke citizen visa.");
        setProcessingAction(false);
        return;
      }

      updateAppSafely(data.application);
      setShowRevokePrompt(false);
      setRevocationReason("");
      setProcessingAction(false);
      onRefresh();
    } catch (err: any) {
      setActionError(err.message || "Failed to revoke visa.");
      setProcessingAction(false);
    }
  };

  const handleOverruleRejection = async () => {
    setProcessingAction(true);
    setActionError(null);

    try {
      const res = await fetch(`/api/applications/${app.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "APPROVED",
          reviewer: reviewerInfo,
          is_admin_override: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || "Failed to overrule application.");
        setProcessingAction(false);
        return;
      }

      updateAppSafely(data.application);
      setShowOverrulePrompt(false);
      setProcessingAction(false);
      onRefresh();
    } catch (err: any) {
      setActionError(err.message || "Failed to overrule rejection.");
      setProcessingAction(false);
    }
  };

  const handleSetUnderReview = async () => {
    setProcessingAction(true);
    try {
      const res = await fetch(`/api/applications/${app.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "UNDER_REVIEW",
          reviewer: reviewerInfo,
        }),
      });
      const data = await res.json();
      if (res.ok && data.application) {
        updateAppSafely(data.application);
        onRefresh();
      }
      setProcessingAction(false);
    } catch (err) {
      setProcessingAction(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;

    setAddingNote(true);
    try {
      const res = await fetch(`/api/applications/${app.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note: noteInput,
          staff: reviewerInfo,
        }),
      });

      const data = await res.json();
      if (res.ok && data.note) {
        const updatedNotes = [...(app.notes || []), data.note];
        setApp({ ...app, notes: updatedNotes });
        setNoteInput("");
      }
      setAddingNote(false);
    } catch (e) {
      setAddingNote(false);
    }
  };

  const statusInfo = getStatusDetails(app.status);

  // Group answers by key
  const answersMap = (app.answers || []).reduce<Record<string, string>>((acc, item) => {
    acc[item.question_key] = item.answer_text;
    return acc;
  }, {});

  if (!mounted) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] overflow-y-auto bg-[#06080C]/85 backdrop-blur-xl p-4 sm:p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="min-h-full flex items-center justify-center py-6 sm:py-8">
        <div className="relative w-full max-w-4xl rounded-3xl bg-[#090D17] border border-cyan-500/35 shadow-[0_0_60px_rgba(0,240,255,0.2),0_30px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[88vh] my-auto animate-in fade-in zoom-in-95 duration-200">
          
          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-white/10 bg-[#0A0E18] flex items-center justify-between gap-4 flex-shrink-0">
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <div className="p-3 rounded-2xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-heading font-black text-xl sm:text-2xl text-white tracking-wide truncate">
                    {app.character_name}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border flex-shrink-0 ${statusInfo.badgeClass}`}>
                    {statusInfo.label}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                  <span className="text-cyan-400 font-semibold">{app.application_number}</span> • Discord: <span className="text-slate-200">@{app.discord_username}</span> ({app.discord_id})
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-400 hover:text-white transition-all cursor-pointer flex-shrink-0"
              title="Close Review"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Navigation Tabs */}
          <div className="flex items-center gap-2 px-6 pt-3.5 border-b border-white/10 bg-slate-950/60 flex-shrink-0 overflow-x-auto [scrollbar-width:none]">
            <button
              type="button"
              onClick={() => setActiveTab("answers")}
              className={`px-4 py-2.5 text-xs font-heading font-bold tracking-wider rounded-t-xl transition-all flex-shrink-0 ${
                activeTab === "answers"
                  ? "bg-[#090D17] text-cyan-300 border-t-2 border-cyan-400 border-x border-white/10 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Applicant Questionnaire ({app.answers?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("notes")}
              className={`px-4 py-2.5 text-xs font-heading font-bold tracking-wider rounded-t-xl transition-all flex items-center gap-1.5 flex-shrink-0 ${
                activeTab === "notes"
                  ? "bg-[#090D17] text-cyan-300 border-t-2 border-cyan-400 border-x border-white/10 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Private Staff Notes ({app.notes?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("audit")}
              className={`px-4 py-2.5 text-xs font-heading font-bold tracking-wider rounded-t-xl transition-all flex-shrink-0 ${
                activeTab === "audit"
                  ? "bg-[#090D17] text-cyan-300 border-t-2 border-cyan-400 border-x border-white/10 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Audit History ({app.events?.length || 0})
            </button>
          </div>

          {/* Modal Scrollable Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 sm:p-8 space-y-6 text-xs text-slate-300 [scrollbar-width:thin] min-w-0">
          
          {actionError && (
            <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 flex items-center gap-2 min-w-0 overflow-hidden">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="break-words [overflow-wrap:anywhere]">{actionError}</span>
            </div>
          )}

          {/* TAB 1: FULL QUESTIONNAIRE */}
          {activeTab === "answers" && (
            <div className="space-y-8 min-w-0">
              
              {/* Section 1: Demographics */}
              <div className="space-y-3 min-w-0">
                <h3 className="font-heading font-bold text-sm text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                  1. Personal & FiveM Credentials
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 min-w-0">
                  <div className="p-3 rounded-lg bg-surface-card border border-slate-800 min-w-0 overflow-hidden">
                    <span className="text-slate-500 text-[10px] block">Real Age</span>
                    <strong className="text-white break-words [overflow-wrap:anywhere] [word-break:break-word] block">{answersMap.age || app.character_age}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-card border border-slate-800 min-w-0 overflow-hidden">
                    <span className="text-slate-500 text-[10px] block">Location</span>
                    <strong className="text-white break-words [overflow-wrap:anywhere] [word-break:break-word] block">{answersMap.country || "N/A"}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-card border border-slate-800 min-w-0 overflow-hidden">
                    <span className="text-slate-500 text-[10px] block">Timezone</span>
                    <strong className="text-white break-words [overflow-wrap:anywhere] [word-break:break-word] block">{answersMap.timezone || "N/A"}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-card border border-slate-800 min-w-0 overflow-hidden">
                    <span className="text-slate-500 text-[10px] block">FiveM Name</span>
                    <strong className="text-cyan-300 font-mono break-words [overflow-wrap:anywhere] [word-break:break-word] block">{answersMap.fivem_id || "N/A"}</strong>
                  </div>
                </div>
              </div>

              {/* Section 2: RP Experience */}
              <div className="space-y-3 min-w-0">
                <h3 className="font-heading font-bold text-sm text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                  2. Roleplay Background
                </h3>
                <div className="p-4 rounded-xl bg-surface-card border border-slate-800 space-y-2 min-w-0 overflow-hidden">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Previous Servers & Hours:</span>
                  <p className="text-slate-200 whitespace-pre-line break-words [overflow-wrap:anywhere] [word-break:break-word]">{answersMap.previous_servers || "No servers listed."}</p>
                </div>
                {answersMap.whitelist_experience && (
                  <div className="p-4 rounded-xl bg-surface-card border border-slate-800 space-y-2 min-w-0 overflow-hidden">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Whitelisted Experience:</span>
                    <p className="text-slate-200 whitespace-pre-line break-words [overflow-wrap:anywhere] [word-break:break-word]">{answersMap.whitelist_experience}</p>
                  </div>
                )}
              </div>

              {/* Section 3: Character Concept */}
              <div className="space-y-3 min-w-0">
                <h3 className="font-heading font-bold text-sm text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                  3. Character Profile ({app.character_name}, {app.character_age} yrs, {app.character_gender})
                </h3>
                <div className="p-4 rounded-xl bg-surface-card border border-slate-800 space-y-2 min-w-0 overflow-hidden">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Backstory & Origins:</span>
                  <p className="text-slate-200 leading-relaxed whitespace-pre-line break-words [overflow-wrap:anywhere] [word-break:break-word]">{answersMap.char_background || "No backstory provided."}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
                  <div className="p-4 rounded-xl bg-surface-card border border-slate-800 space-y-1 min-w-0 overflow-hidden">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Personality & Flaws:</span>
                    <p className="text-slate-200 whitespace-pre-line break-words [overflow-wrap:anywhere] [word-break:break-word]">{answersMap.char_personality || "N/A"}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-card border border-slate-800 space-y-1 min-w-0 overflow-hidden">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Character Goals:</span>
                    <p className="text-slate-200 whitespace-pre-line break-words [overflow-wrap:anywhere] [word-break:break-word]">{answersMap.char_goals || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Section 4: RP Knowledge */}
              <div className="space-y-3 min-w-0">
                <h3 className="font-heading font-bold text-sm text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                  4. Rule Definitions & Understanding
                </h3>
                <div className="space-y-3 min-w-0">
                  <div className="p-3.5 rounded-lg bg-surface-card border border-slate-800 min-w-0 overflow-hidden">
                    <span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">RDM:</span>
                    <p className="text-slate-200 whitespace-pre-line break-words [overflow-wrap:anywhere] [word-break:break-word]">{answersMap.def_rdm || "N/A"}</p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-surface-card border border-slate-800 min-w-0 overflow-hidden">
                    <span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">VDM:</span>
                    <p className="text-slate-200 whitespace-pre-line break-words [overflow-wrap:anywhere] [word-break:break-word]">{answersMap.def_vdm || "N/A"}</p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-surface-card border border-slate-800 min-w-0 overflow-hidden">
                    <span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">Metagaming:</span>
                    <p className="text-slate-200 whitespace-pre-line break-words [overflow-wrap:anywhere] [word-break:break-word]">{answersMap.def_meta || "N/A"}</p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-surface-card border border-slate-800 min-w-0 overflow-hidden">
                    <span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">Powergaming:</span>
                    <p className="text-slate-200 whitespace-pre-line break-words [overflow-wrap:anywhere] [word-break:break-word]">{answersMap.def_power || "N/A"}</p>
                  </div>
                  <div className="p-3.5 rounded-lg bg-surface-card border border-slate-800 min-w-0 overflow-hidden">
                    <span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">Fail RP:</span>
                    <p className="text-slate-200 whitespace-pre-line break-words [overflow-wrap:anywhere] [word-break:break-word]">{answersMap.def_failrp || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Section 5: Scenario Responses */}
              <div className="space-y-3 min-w-0">
                <h3 className="font-heading font-bold text-sm text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                  5. In-Game Roleplay Scenario Responses
                </h3>
                <div className="p-4 rounded-xl bg-surface-card border border-slate-800 space-y-2 min-w-0 overflow-hidden">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase block">Scenario 1: High-Stakes Traffic Stop</span>
                  <p className="text-slate-200 leading-relaxed whitespace-pre-line break-words [overflow-wrap:anywhere] [word-break:break-word]">{answersMap.scenario_police_stop || "N/A"}</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-card border border-slate-800 space-y-2 min-w-0 overflow-hidden">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase block">Scenario 2: Hostage at Gunpoint</span>
                  <p className="text-slate-200 leading-relaxed whitespace-pre-line break-words [overflow-wrap:anywhere] [word-break:break-word]">{answersMap.scenario_hostage || "N/A"}</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-card border border-slate-800 space-y-2 min-w-0 overflow-hidden">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase block">Scenario 3: Narrative Loss</span>
                  <p className="text-slate-200 leading-relaxed whitespace-pre-line break-words [overflow-wrap:anywhere] [word-break:break-word]">{answersMap.scenario_loss || "N/A"}</p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: STAFF NOTES (Private) */}
          {activeTab === "notes" && (
            <div className="space-y-6 min-w-0">
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 min-w-0 overflow-hidden">
                <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="break-words [overflow-wrap:anywhere]">Confidential: Staff notes are strictly internal and never visible to the applicant.</span>
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-3 min-w-0">
                <textarea
                  rows={3}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Add an internal observation (e.g. Backstory lacks detail, verify voice mic in interview)..."
                  className="w-full bg-surface-card border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500/60"
                />
                <button
                  type="submit"
                  disabled={addingNote || !noteInput.trim()}
                  className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-heading font-bold text-xs flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> Post Staff Note
                </button>
              </form>

              {/* Existing Notes */}
              <div className="space-y-3 min-w-0">
                {(!app.notes || app.notes.length === 0) ? (
                  <p className="text-slate-500 text-center py-6">No staff notes recorded yet.</p>
                ) : (
                  app.notes.map((note) => (
                    <div key={note.id} className="p-4 rounded-xl bg-surface-card border border-slate-800 space-y-1 min-w-0 overflow-hidden">
                      <div className="flex items-center justify-between text-[11px] gap-2">
                        <strong className="text-amber-400 font-mono truncate">@{note.staff_name}</strong>
                        <span className="text-slate-500 flex-shrink-0">{formatDate(note.created_at)}</span>
                      </div>
                      <p className="text-slate-200 whitespace-pre-line break-words [overflow-wrap:anywhere] [word-break:break-word]">{note.note}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT TIMELINE */}
          {activeTab === "audit" && (
            <div className="space-y-3 min-w-0">
              {(!app.events || app.events.length === 0) ? (
                <p className="text-slate-500 text-center py-6">No audit history recorded.</p>
              ) : (
                app.events.map((evt) => {
                  const isRevokedEvt = evt.event_type === "VISA_REVOKED_BY_ADMIN";
                  const isOverruleEvt = evt.event_type === "VISA_OVERRULED_BY_ADMIN";
                  const isApprovedEvt = evt.event_type === "APPLICATION_APPROVED";
                  const isRejectedEvt = evt.event_type === "APPLICATION_REJECTED";

                  return (
                    <div 
                      key={evt.id} 
                      className={`p-3.5 rounded-xl bg-surface-card border flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0 overflow-hidden ${
                        isRevokedEvt 
                          ? "border-amber-500/50 bg-amber-950/20" 
                          : isOverruleEvt 
                          ? "border-emerald-500/50 bg-emerald-950/20"
                          : "border-slate-800"
                      }`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded flex-shrink-0 ${
                            isRevokedEvt
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : isOverruleEvt
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : isApprovedEvt
                              ? "bg-emerald-500/10 text-emerald-400"
                              : isRejectedEvt
                              ? "bg-red-500/10 text-red-400"
                              : "text-cyan-400"
                          }`}>
                            {evt.event_type}
                          </span>
                        </div>
                        <span className="text-slate-300 text-xs block truncate">
                          Actor: <strong className="text-white">{evt.actor_name || "System"}</strong>
                        </span>
                        {evt.metadata?.reason && (
                          <p className="text-[11px] text-slate-400 font-mono italic break-words [overflow-wrap:anywhere] [word-break:break-word]">
                            Reason: "{evt.metadata.reason}"
                          </p>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono flex-shrink-0">
                        {formatDate(evt.created_at)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>

        {/* Modal Action Bar */}
        <div className="p-5 sm:p-6 border-t border-white/10 bg-[#0A0E18] flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
          <div className="text-xs text-slate-400 font-mono">
            Current Status: <strong className="text-white">{app.status}</strong>
            {app.rejection_reason?.includes("[REVOKED BY ADMIN]") && (
              <span className="ml-2 text-amber-400 font-bold">(REVOKED)</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* APPROVED STATE */}
            {app.status === "APPROVED" && (
              <>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-mono text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approved Citizen</span>
                </div>

                {isAdmin ? (
                  <button
                    type="button"
                    onClick={() => setShowRevokePrompt(true)}
                    disabled={processingAction}
                    className="px-4 py-2.5 rounded-xl bg-amber-950/70 border border-amber-500/50 text-amber-400 hover:bg-amber-900/70 font-heading font-bold text-xs flex items-center gap-1.5 transition-all shadow-md hover:shadow-amber-500/20"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Revoke Citizen Visa (Admin Override)
                  </button>
                ) : (
                  <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 font-mono text-[11px]">
                    Locked (Staff Finalized)
                  </div>
                )}
              </>
            )}

            {/* REJECTED STATE */}
            {app.status === "REJECTED" && (
              <>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400 font-mono text-xs">
                  <XCircle className="w-4 h-4" />
                  <span>{app.rejection_reason?.includes("[REVOKED BY ADMIN]") ? "Visa Revoked" : "Rejected"}</span>
                </div>

                {isAdmin ? (
                  <button
                    type="button"
                    onClick={() => setShowOverrulePrompt(true)}
                    disabled={processingAction}
                    className="px-4 py-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/70 font-heading font-black text-xs flex items-center gap-1.5 transition-all shadow-md hover:shadow-emerald-500/20"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Overrule Rejection & Grant Visa (Admin Override)
                  </button>
                ) : (
                  <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 font-mono text-[11px]">
                    Locked (Staff Finalized)
                  </div>
                )}
              </>
            )}

            {/* PENDING / UNDER_REVIEW STATE */}
            {(app.status === "PENDING" || app.status === "UNDER_REVIEW") && (
              <>
                {app.status === "PENDING" && (
                  <button
                    type="button"
                    onClick={handleSetUnderReview}
                    disabled={processingAction}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-heading font-bold text-cyan-300 hover:border-cyan-500/50 transition-all"
                  >
                    Mark Under Review
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowRejectPrompt(true)}
                  disabled={processingAction}
                  className="px-5 py-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400 hover:bg-red-900/60 font-heading font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <XCircle className="w-4 h-4" /> Reject Visa
                </button>

                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={processingAction}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-400 text-black font-heading font-black text-xs tracking-wider hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center gap-1.5 disabled:opacity-50 transition-all"
                >
                  {processingAction ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  APPROVE VISA
                </button>
              </>
            )}
          </div>
        </div>

        {/* Modal 1: Initial Reject Prompt */}
        {showRejectPrompt && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md p-6 flex flex-col justify-center items-center">
            <div className="max-w-md w-full glass-panel p-6 rounded-2xl border border-red-500/40 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-400" />
                  Reject Visa Application
                </h3>
                <button onClick={() => setShowRejectPrompt(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-300">
                Please provide constructive feedback explaining which answers did not meet roleplay standards. This explanation will be displayed to the applicant.
              </p>

              <textarea
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Your NVL scenario answer does not reflect proper value of life, and your character backstory is too brief..."
                className="w-full bg-surface-card border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500/60"
              />

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectPrompt(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 text-xs hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={processingAction}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-heading font-bold text-xs flex items-center gap-2"
                >
                  {processingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 2: Admin Revoke Visa Prompt */}
        {showRevokePrompt && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md p-6 flex flex-col justify-center items-center">
            <div className="max-w-md w-full glass-panel p-6 rounded-2xl border border-amber-500/50 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  Revoke Citizen Visa (Admin Override)
                </h3>
                <button onClick={() => setShowRevokePrompt(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                <strong>⚠️ Administrative Warning:</strong>
                <p>
                  Revoking this visa will immediately strip the <strong>Citizen role</strong> from @{app.discord_username} on Discord, post an administrative notice in the rejected channel, and lock in-game whitelist access.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Administrative Revocation Reason (Required):
                </label>
                <textarea
                  rows={4}
                  value={revocationReason}
                  onChange={(e) => setRevocationReason(e.target.value)}
                  placeholder="Enter administrative reason (e.g. Visa revoked due to repeated serious server rule violations / severe FailRP)..."
                  className="w-full bg-surface-card border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRevokePrompt(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 text-xs hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRevokeVisa}
                  disabled={processingAction || !revocationReason.trim()}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-black font-heading font-black text-xs flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {processingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Visa Revocation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 3: Admin Overrule Rejection Prompt */}
        {showOverrulePrompt && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md p-6 flex flex-col justify-center items-center">
            <div className="max-w-md w-full glass-panel p-6 rounded-2xl border border-emerald-500/50 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Overrule Rejection & Grant Visa
                </h3>
                <button onClick={() => setShowOverrulePrompt(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs space-y-1">
                <strong>🛡️ Administrative Overrule:</strong>
                <p>
                  You are about to overrule the rejection for character <strong>{app.character_name}</strong> (@{app.discord_username}).
                </p>
                <ul className="list-disc list-inside text-[11px] text-slate-300 pt-1 space-y-0.5">
                  <li>Assigns the <strong>Citizen Role</strong> in Discord</li>
                  <li>Dispatches official approval announcement to approved channel</li>
                  <li>Unlocks full status and direct server connect credentials</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOverrulePrompt(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 text-xs hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleOverruleRejection}
                  disabled={processingAction}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-400 text-black font-heading font-black text-xs flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {processingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Overrule & Grant Visa
                </button>
              </div>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
