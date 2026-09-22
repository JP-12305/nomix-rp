import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ApplicationStatus, RuleSeverity } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getStatusDetails(status: ApplicationStatus, rejectionReason?: string) {
  if (status === "REJECTED" && rejectionReason?.includes("[REVOKED BY ADMIN]")) {
    return {
      label: "VISA REVOKED",
      badgeClass: "bg-amber-500/15 text-amber-400 border-amber-500/40",
      glowClass: "shadow-[0_0_15px_rgba(245,158,11,0.3)]",
      icon: "AlertTriangle",
      dotColor: "bg-amber-400",
      description: "Your citizen visa has been revoked by server administration.",
    };
  }

  switch (status) {
    case "APPROVED":
      return {
        label: "APPROVED",
        badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        glowClass: "shadow-[0_0_15px_rgba(16,185,129,0.3)]",
        icon: "CheckCircle2",
        dotColor: "bg-emerald-400",
        description: "Your citizen visa has been granted. Citizen Discord role assigned.",
      };
    case "REJECTED":
      return {
        label: "REJECTED",
        badgeClass: "bg-red-500/10 text-red-400 border-red-500/30",
        glowClass: "shadow-[0_0_15px_rgba(239,68,68,0.3)]",
        icon: "XCircle",
        dotColor: "bg-red-400",
        description: "Your application did not meet our roleplay standards. Check staff feedback below.",
      };
    case "UNDER_REVIEW":
      return {
        label: "UNDER REVIEW",
        badgeClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
        glowClass: "shadow-[0_0_15px_rgba(0,240,255,0.3)]",
        icon: "Clock",
        dotColor: "bg-cyan-400",
        description: "A recruitment staff member is actively evaluating your responses.",
      };
    case "PENDING":
    default:
      return {
        label: "PENDING",
        badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        glowClass: "shadow-[0_0_15px_rgba(245,158,11,0.2)]",
        icon: "Hourglass",
        dotColor: "bg-amber-400",
        description: "Your application is queued for staff review.",
      };
  }
}

export function getSeverityBadge(severity: RuleSeverity) {
  switch (severity) {
    case "CRITICAL":
      return {
        label: "CRITICAL BAN",
        className: "bg-red-500/15 text-red-400 border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.2)]",
      };
    case "HIGH":
      return {
        label: "STRICT / BAN",
        className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      };
    case "MEDIUM":
      return {
        label: "WARNING / STRIKE",
        className: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
      };
    case "LOW":
    default:
      return {
        label: "ADVISORY",
        className: "bg-slate-500/15 text-slate-300 border-slate-500/30",
      };
  }
}
