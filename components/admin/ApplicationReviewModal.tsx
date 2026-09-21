"use client";

import React, { useState } from "react";
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
  const { user } = useAuth();
  const [app, setApp] = useState<Application>(initialApp);
  const [activeTab, setActiveTab] = useState<"answers" | "notes" | "audit">("answers");
  const [noteInput, setNoteInput] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  
  // Rejection modal prompt
  const [showRejectPrompt, setShowRejectPrompt] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingAction, setProcessingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const reviewerInfo = {
    id: user?.id || "usr-demo-staff",
    name: user?.username || "NomixStaff",
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
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || "Failed to approve application.");
        setProcessingAction(false);
        return;
      }

      setApp(data.application);
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
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || "Failed to reject application.");
        setProcessingAction(false);
        return;
      }

      setApp(data.application);
      setShowRejectPrompt(false);
      setProcessingAction(false);
      onRefresh();
    } catch (err: any) {
      setActionError(err.message || "Failed to reject.");
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
      if (res.ok) {
        setApp(data.application);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl glass-panel rounded-3xl border border-cyan-500/30 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-[#090D14] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-xl text-white">
                  {app.character_name}
                </h2>
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${statusInfo.badgeClass}`}>
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {app.application_number} • Discord: @{app.discord_username} ({app.discord_id})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => setActiveTab("answers")}
            className={`px-4 py-2.5 text-xs font-heading font-bold tracking-wider rounded-t-lg transition-all ${
              activeTab === "answers"
                ? "bg-surface-card text-cyan-300 border-t-2 border-cyan-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Applicant Questionnaire ({app.answers?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`px-4 py-2.5 text-xs font-heading font-bold tracking-wider rounded-t-lg transition-all flex items-center gap-1.5 ${
              activeTab === "notes"
                ? "bg-surface-card text-cyan-300 border-t-2 border-cyan-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Private Staff Notes ({app.notes?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2.5 text-xs font-heading font-bold tracking-wider rounded-t-lg transition-all ${
              activeTab === "audit"
                ? "bg-surface-card text-cyan-300 border-t-2 border-cyan-400"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Audit History ({app.events?.length || 0})
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-xs text-slate-300">
          
          {actionError && (
            <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>{actionError}</span>
            </div>
          )}

          {/* TAB 1: FULL QUESTIONNAIRE */}
          {activeTab === "answers" && (
            <div className="space-y-8">
              
              {/* Section 1: Demographics */}
              <div className="space-y-3">
                <h3 className="font-heading font-bold text-sm text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                  1. Personal & FiveM Credentials
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-surface-card border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Real Age</span>
                    <strong className="text-white">{answersMap.age || app.character_age}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-card border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Location</span>
                    <strong className="text-white">{answersMap.country || "N/A"}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-card border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Timezone</span>
                    <strong className="text-white">{answersMap.timezone || "N/A"}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-card border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">FiveM ID</span>
                    <strong className="text-cyan-300 font-mono">{answersMap.fivem_id || "N/A"}</strong>
                  </div>
                </div>
              </div>

              {/* Section 2: RP Experience */}
              <div className="space-y-3">
                <h3 className="font-heading font-bold text-sm text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                  2. Roleplay Background
                </h3>
                <div className="p-4 rounded-xl bg-surface-card border border-slate-800 space-y-2">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Previous Servers & Hours:</span>
                  <p className="text-slate-200 whitespace-pre-line">{answersMap.previous_servers || "No servers listed."}</p>
                </div>
                {answersMap.whitelist_experience && (
                  <div className="p-4 rounded-xl bg-surface-card border border-slate-800 space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Whitelisted Experience:</span>
                    <p className="text-slate-200 whitespace-pre-line">{answersMap.whitelist_experience}</p>
                  </div>
                )}
              </div>

              {/* Section 3: Character Concept */}
              <div className="space-y-3">
                <h3 className="font-heading font-bold text-sm text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                  3. Character Profile ({app.character_name}, {app.character_age} yrs, {app.character_gender})
                </h3>
                <div className="p-4 rounded-xl bg-surface-card border border-slate-800 space-y-2">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Backstory & Origins:</span>
                  <p className="text-slate-200 leading-relaxed whitespace-pre-line">{answersMap.char_background || "No backstory provided."}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-surface-card border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Personality & Flaws:</span>
                    <p className="text-slate-200">{answersMap.char_personality || "N/A"}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-card border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Character Goals:</span>
                    <p className="text-slate-200">{answersMap.char_goals || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Section 4: RP Knowledge */}
              <div className="space-y-3">
                <h3 className="font-heading font-bold text-sm text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                  4. Rule Definitions & Understanding
                </h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-surface-card border border-slate-800">
                    <span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">RDM:</span>
                    <p className="text-slate-200">{answersMap.def_rdm || "N/A"}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-card border border-slate-800">
                    <span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">VDM:</span>
                    <p className="text-slate-200">{answersMap.def_vdm || "N/A"}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-card border border-slate-800">
                    <span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">Metagaming:</span>
                    <p className="text-slate-200">{answersMap.def_meta || "N/A"}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-card border border-slate-800">
                    <span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">Powergaming:</span>
                    <p className="text-slate-200">{answersMap.def_power || "N/A"}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-card border border-slate-800">
                    <span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">Fail RP:</span>
                    <p className="text-slate-200">{answersMap.def_failrp || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Section 5: Scenario Responses */}
              <div className="space-y-3">
                <h3 className="font-heading font-bold text-sm text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                  5. In-Game Roleplay Scenario Responses
                </h3>
                <div className="p-4 rounded-xl bg-surface-card border border-slate-800 space-y-2">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase">Scenario 1: High-Stakes Traffic Stop</span>
                  <p className="text-slate-200 leading-relaxed whitespace-pre-line">{answersMap.scenario_police_stop || "N/A"}</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-card border border-slate-800 space-y-2">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase">Scenario 2: Hostage at Gunpoint</span>
                  <p className="text-slate-200 leading-relaxed whitespace-pre-line">{answersMap.scenario_hostage || "N/A"}</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-card border border-slate-800 space-y-2">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase">Scenario 3: Narrative Loss</span>
                  <p className="text-slate-200 leading-relaxed whitespace-pre-line">{answersMap.scenario_loss || "N/A"}</p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: STAFF NOTES (Private) */}
          {activeTab === "notes" && (
            <div className="space-y-6">
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Confidential: Staff notes are strictly internal and never visible to the applicant.</span>
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-3">
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
              <div className="space-y-3">
                {(!app.notes || app.notes.length === 0) ? (
                  <p className="text-slate-500 text-center py-6">No staff notes recorded yet.</p>
                ) : (
                  app.notes.map((note) => (
                    <div key={note.id} className="p-4 rounded-xl bg-surface-card border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <strong className="text-amber-400 font-mono">@{note.staff_name}</strong>
                        <span className="text-slate-500">{formatDate(note.created_at)}</span>
                      </div>
                      <p className="text-slate-200 whitespace-pre-line">{note.note}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT TIMELINE */}
          {activeTab === "audit" && (
            <div className="space-y-3">
              {(!app.events || app.events.length === 0) ? (
                <p className="text-slate-500 text-center py-6">No audit history recorded.</p>
              ) : (
                app.events.map((evt) => (
                  <div key={evt.id} className="p-3.5 rounded-xl bg-surface-card border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block">
                        {evt.event_type}
                      </span>
                      <span className="text-slate-300">By: {evt.actor_name || "System"}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {formatDate(evt.created_at)}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Modal Action Bar */}
        <div className="p-6 border-t border-slate-800 bg-[#090D14] flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-400 font-mono">
            Current Status: <strong className="text-white">{app.status}</strong>
          </div>

          <div className="flex items-center gap-3">
            {app.status === "APPROVED" && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-mono text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Finalized: Approved & Citizen Role Assigned</span>
              </div>
            )}

            {app.status === "REJECTED" && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400 font-mono text-xs">
                <XCircle className="w-4 h-4" />
                <span>Finalized: Rejected (Feedback Dispatched)</span>
              </div>
            )}

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

        {/* Nested Reject Modal Reason Prompt */}
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

      </div>
    </div>
  );
}
