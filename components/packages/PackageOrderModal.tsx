"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useAuth } from "@/lib/auth/auth-context";
import { PackageTierInfo } from "@/types";
import { 
  X, 
  CheckCircle2, 
  Crown, 
  ShieldCheck, 
  Users, 
  Car, 
  Phone, 
  Tag, 
  Sparkles, 
  ArrowRight,
  AlertCircle
} from "lucide-react";

interface PackageOrderModalProps {
  packageInfo: PackageTierInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PackageOrderModal({
  packageInfo,
  isOpen,
  onClose,
}: PackageOrderModalProps) {
  const { user, loginWithDiscord } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  const [characterName, setCharacterName] = useState("");
  const [silverChoice, setSilverChoice] = useState<"plate" | "phone">("plate");
  const [customPlate1, setCustomPlate1] = useState("");
  const [customPlate2, setCustomPlate2] = useState("");
  const [customPhone, setCustomPhone] = useState("");
  const [vehiclePref, setVehiclePref] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !packageInfo || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!characterName.trim()) {
      setError("Please enter your in-game Character Name.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      let finalPlate = "";
      let finalPhone = "";

      if (packageInfo.id === "silver") {
        if (silverChoice === "plate") {
          finalPlate = customPlate1.trim();
        } else {
          finalPhone = customPhone.trim();
        }
      } else if (packageInfo.id === "gold") {
        finalPlate = customPlate1.trim();
        finalPhone = customPhone.trim();
      } else if (packageInfo.id === "emerald") {
        finalPlate = [customPlate1.trim(), customPlate2.trim()].filter(Boolean).join(", ");
        finalPhone = customPhone.trim();
      }

      const res = await fetch("/api/packages/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          discord_id: user.discord_id,
          discord_username: user.username,
          discord_avatar: user.avatar_url,
          package_tier: packageInfo.id,
          package_name: packageInfo.name,
          price: `${packageInfo.price} / mo`,
          character_name: characterName.trim(),
          custom_plate: finalPlate || undefined,
          custom_phone: finalPhone || undefined,
          choice_type: packageInfo.id === "silver" ? silverChoice : undefined,
          vehicle_preference: vehiclePref.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit package order");
      }

      setSubmittedOrder(data.order);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setSubmittedOrder(null);
    setError(null);
    setCharacterName("");
    setCustomPlate1("");
    setCustomPlate2("");
    setCustomPhone("");
    setVehiclePref("");
    setNotes("");
    onClose();
  };

  const getAccentGlow = () => {
    if (packageInfo.id === "emerald") return "border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.25),0_20px_60px_rgba(0,0,0,0.9)]";
    if (packageInfo.id === "gold") return "border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.25),0_20px_60px_rgba(0,0,0,0.9)]";
    return "border-slate-400/40 shadow-[0_0_50px_rgba(148,163,184,0.2),0_20px_60px_rgba(0,0,0,0.9)]";
  };

  const getAmbientLight = () => {
    if (packageInfo.id === "emerald") return "bg-emerald-500/15";
    if (packageInfo.id === "gold") return "bg-amber-500/15";
    return "bg-cyan-500/15";
  };

  const getTextColor = () => {
    if (packageInfo.id === "emerald") return "text-emerald-400";
    if (packageInfo.id === "gold") return "text-amber-400";
    return "text-slate-200";
  };

  const getButtonBg = () => {
    if (packageInfo.id === "emerald") return "bg-emerald-500 hover:bg-emerald-400 text-black";
    if (packageInfo.id === "gold") return "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black";
    return "bg-slate-200 hover:bg-white text-black";
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] overflow-y-auto bg-[#06080C]/80 backdrop-blur-xl p-4 sm:p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) resetAndClose();
      }}
    >
      <div className="min-h-full flex items-center justify-center py-4 sm:py-6">
        <div 
          className={`relative w-full max-w-2xl rounded-3xl bg-[#090D17] border ${getAccentGlow()} p-5 sm:p-6 space-y-4 transition-all animate-in fade-in zoom-in-95 duration-200 overflow-hidden my-auto`}
        >
          {/* Ambient Glass Glow Accent in Corner */}
          <div className={`absolute -top-16 -right-16 w-64 h-64 rounded-full ${getAmbientLight()} blur-3xl pointer-events-none`} />

          {/* Close Button */}
          <button
            onClick={resetAndClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900/80 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="relative flex items-center gap-3.5 border-b border-white/10 pb-3.5">
            <div className={`p-2.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/10 ${getTextColor()}`}>
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className={`font-heading font-black text-xl sm:text-2xl ${getTextColor()}`}>
                  {packageInfo.name} TIER
                </h2>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${packageInfo.badge_color}`}>
                  {packageInfo.rank_badge}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-lg sm:text-xl font-black text-white">
                  {packageInfo.price} <span className="text-xs text-slate-400 font-sans font-normal">/ month</span>
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-slate-300">Automatic Discord Role Sync</span>
              </div>
            </div>
          </div>

          {/* Success Confirmation State */}
          {submittedOrder ? (
            <div className="relative text-center py-5 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h3 className="font-heading font-black text-xl sm:text-2xl text-white">
                  PACKAGE REQUEST SUBMITTED!
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Thank you for supporting NOMIX Roleplay! Your order reference is{" "}
                  <strong className="text-cyan-400 font-mono">{submittedOrder.id.slice(0, 8).toUpperCase()}</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-white/10 text-left text-xs text-slate-300 space-y-1.5 max-w-lg mx-auto bg-slate-900/60 backdrop-blur-md shadow-inner">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Discord Account:</span>
                  <span className="text-white font-semibold">{user?.username}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Tier:</span>
                  <span className={`font-bold ${getTextColor()}`}>{packageInfo.name} ({packageInfo.price}/mo)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400">Character:</span>
                  <span className="text-white font-semibold">{submittedOrder.character_name}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Order Status:</span>
                  <span className="text-amber-400 font-mono font-bold uppercase">Pending Staff Delivery</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Staff has been notified in Discord. Your Discord role and in-game deliveries will be processed shortly.
              </p>

              <button
                onClick={resetAndClose}
                className="px-8 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-heading font-bold text-xs sm:text-sm tracking-wider transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)]"
              >
                DONE & RETURN
              </button>
            </div>
          ) : !user ? (
            /* Unauthenticated State */
            <div className="relative text-center py-5 space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#5865F2] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(88,101,242,0.25)]">
                <Users className="w-6 h-6" />
              </div>
              
              <div className="space-y-1.5">
                <h3 className="font-heading font-bold text-lg text-white">
                  DISCORD AUTHENTICATION REQUIRED
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  To link your supporter role in our Discord and ensure staff can identify your account, please log in with Discord.
                </p>
              </div>

              <button
                onClick={loginWithDiscord}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-heading font-black text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 mx-auto shadow-[0_0_20px_rgba(88,101,242,0.4)] transition-all"
              >
                <Users className="w-4 h-4" />
                CONTINUE WITH DISCORD
              </button>
            </div>
          ) : (
            /* Opt-In Form */
            <form onSubmit={handleSubmit} className="relative space-y-3.5">
              {/* Authenticated User Banner */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-7 h-7 rounded-full overflow-hidden border border-cyan-500/40">
                    <Image
                      src={user.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                      alt={user.username}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-tight">{user.username}</div>
                    <div className="text-[10px] font-mono text-cyan-400">ID: {user.discord_id}</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                  DISCORD LINKED
                </span>
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-red-950/60 backdrop-blur-md border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* In-Game Character Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                  In-Game Character Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder="e.g. Marcus Vance"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 backdrop-blur-sm border border-slate-800/90 text-white text-xs sm:text-sm focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/30 focus:outline-none transition-all placeholder:text-slate-500"
                />
              </div>

              {/* Tier-Specific Perk Customizations */}
              {packageInfo.id === "silver" && (
                <div className="space-y-2 p-3 rounded-xl bg-slate-900/40 backdrop-blur-md border border-white/10">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                      Select Customization Option:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSilverChoice("plate")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                          silverChoice === "plate"
                            ? "bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.2)]"
                            : "bg-slate-900/60 border border-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        <Tag className="w-3.5 h-3.5" /> Plate
                      </button>
                      <button
                        type="button"
                        onClick={() => setSilverChoice("phone")}
                        className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                          silverChoice === "phone"
                            ? "bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.2)]"
                            : "bg-slate-900/60 border border-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        <Phone className="w-3.5 h-3.5" /> Phone #
                      </button>
                    </div>
                  </div>

                  {silverChoice === "plate" ? (
                    <div>
                      <input
                        type="text"
                        maxLength={8}
                        value={customPlate1}
                        onChange={(e) => setCustomPlate1(e.target.value.toUpperCase())}
                        placeholder="Requested Plate Text (Max 8 Chars, e.g. NOMIX1)"
                        className="w-full px-3.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-white text-xs uppercase font-mono tracking-widest focus:border-cyan-400 focus:outline-none placeholder:normal-case placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-500"
                      />
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        value={customPhone}
                        onChange={(e) => setCustomPhone(e.target.value)}
                        placeholder="Requested Phone Number (e.g. 555-0199)"
                        className="w-full px-3.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-white text-xs font-mono focus:border-cyan-400 focus:outline-none placeholder:text-slate-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {packageInfo.id === "gold" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-900/40 backdrop-blur-md border border-white/10">
                  <div>
                    <label className="text-[10px] text-slate-300 block mb-0.5 font-semibold">1x Custom Plate (Max 8):</label>
                    <input
                      type="text"
                      maxLength={8}
                      value={customPlate1}
                      onChange={(e) => setCustomPlate1(e.target.value.toUpperCase())}
                      placeholder="e.g. GOLDEN"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-white text-xs uppercase font-mono tracking-widest focus:border-amber-400 focus:outline-none placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-300 block mb-0.5 font-semibold">Custom Phone Number:</label>
                    <input
                      type="text"
                      value={customPhone}
                      onChange={(e) => setCustomPhone(e.target.value)}
                      placeholder="e.g. 555-0777"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-white text-xs font-mono focus:border-amber-400 focus:outline-none placeholder:text-slate-500"
                    />
                  </div>
                </div>
              )}

              {packageInfo.id === "emerald" && (
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/40 backdrop-blur-md border border-emerald-500/25">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 flex items-center justify-between">
                    <span>Emerald Customizations Included:</span>
                    <span className="text-[9px] text-emerald-400/80 font-mono">2 Plates + 1 Phone</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-300 block mb-0.5 font-semibold">Plate #1 (Max 8):</label>
                      <input
                        type="text"
                        maxLength={8}
                        value={customPlate1}
                        onChange={(e) => setCustomPlate1(e.target.value.toUpperCase())}
                        placeholder="EMERALD1"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-white text-xs uppercase font-mono tracking-widest focus:border-emerald-400 focus:outline-none placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-300 block mb-0.5 font-semibold">Plate #2 (Max 8):</label>
                      <input
                        type="text"
                        maxLength={8}
                        value={customPlate2}
                        onChange={(e) => setCustomPlate2(e.target.value.toUpperCase())}
                        placeholder="BOSS"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-white text-xs uppercase font-mono tracking-widest focus:border-emerald-400 focus:outline-none placeholder:text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-300 block mb-0.5 font-semibold">Phone #:</label>
                      <input
                        type="text"
                        value={customPhone}
                        onChange={(e) => setCustomPhone(e.target.value)}
                        placeholder="555-9999"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-white text-xs font-mono focus:border-emerald-400 focus:outline-none placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Vehicle Preference & Extra Notes */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                  Vehicle Preference or Staff Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={vehiclePref}
                  onChange={(e) => setVehiclePref(e.target.value)}
                  placeholder="Preferred vehicle category or any instructions for server staff..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950/70 backdrop-blur-sm border border-slate-800/90 text-white text-xs focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/30 focus:outline-none resize-none transition-all placeholder:text-slate-500"
                />
              </div>

              {/* Submit Action */}
              <div className="pt-1 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-4 py-2 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white hover:border-white/20 text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-6 py-2 rounded-xl font-heading font-black text-xs tracking-wider transition-all transform hover:scale-[1.02] flex items-center gap-2 ${getButtonBg()} ${
                    submitting ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>TRANSMITTING...</span>
                    </>
                  ) : (
                    <>
                      <span>CONFIRM & REQUEST {packageInfo.name}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
