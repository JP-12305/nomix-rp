"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  applicationSchema, 
  ApplicationFormData, 
  stepFields 
} from "@/lib/validation/application-schema";
import { useAuth } from "@/lib/auth/auth-context";
import { 
  User, 
  Compass, 
  Sparkles, 
  HelpCircle, 
  Flame, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle,
  Save,
  Send,
  Loader2
} from "lucide-react";

const STEPS = [
  { step: 1, title: "Personal Info", desc: "Applicant & FiveM details", icon: User },
  { step: 2, title: "RP Experience", desc: "Past servers & hours", icon: Compass },
  { step: 3, title: "Character Concept", desc: "Identity & backstory", icon: Sparkles },
  { step: 4, title: "RP Knowledge", desc: "Core rule definitions", icon: HelpCircle },
  { step: 5, title: "Scenarios", desc: "In-game roleplay tests", icon: Flame },
  { step: 6, title: "Agreements", desc: "Rulebook confirmation", icon: ShieldCheck },
];

export default function ApplicationWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    mode: "onTouched",
    defaultValues: {
      age: 21,
      country: "",
      timezone: "",
      fivem_id: "",
      played_before: "yes_experienced",
      previous_servers: "",
      whitelist_experience: "",
      char_name: "",
      char_age: 25,
      char_gender: "Male",
      char_background: "",
      char_personality: "",
      char_goals: "",
      def_rdm: "",
      def_vdm: "",
      def_meta: "",
      def_power: "",
      def_failrp: "",
      scenario_police_stop: "",
      scenario_hostage: "",
      scenario_loss: "",
      agree_rules: false as unknown as true,
      agree_nvl: false as unknown as true,
      agree_microphone: false as unknown as true,
    },
  });

  // Load saved draft on mount
  useEffect(() => {
    const saved = localStorage.getItem("nomix_app_draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.entries(parsed).forEach(([k, v]) => {
          setValue(k as keyof ApplicationFormData, v as any);
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [setValue]);

  // Save draft
  const saveDraft = () => {
    const data = watch();
    localStorage.setItem("nomix_app_draft", JSON.stringify(data));
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2500);
  };

  const nextStep = async () => {
    const fields = stepFields[currentStep];
    const isStepValid = await trigger(fields);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(6, prev + 1));
      window.scrollTo({ top: 150, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 150, behavior: "smooth" });
  };

  const onSubmit: SubmitHandler<ApplicationFormData> = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        ...data,
        user_id: user?.id || "usr-demo-applicant",
        discord_id: user?.discord_id || "789123456789012345",
        discord_username: user?.username || "SpectreRider",
      };

      const res = await fetch("/api/applications/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        setSubmitError(json.error || "Failed to submit visa application.");
        setIsSubmitting(false);
        return;
      }

      // Clear draft
      localStorage.removeItem("nomix_app_draft");

      // Redirect to status page with application id
      const createdAppId = json.application?.id || json.application?.application_number;
      if (createdAppId) {
        router.push(`/status?id=${encodeURIComponent(createdAppId)}&submitted=true`);
      } else {
        router.push("/status?submitted=true");
      }
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* Mobile Compact Step Indicator (< sm screens) */}
      <div className="sm:hidden glass-panel p-4 rounded-2xl border border-cyan-500/30 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-cyan-400 font-bold uppercase tracking-wider">
            Step {currentStep} of 6
          </span>
          <span className="text-white font-bold font-heading">
            {STEPS[currentStep - 1].title}
          </span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-cyan-500 to-cyan-300 h-full rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop & Tablet Wizard Steps Header (sm+ screens) */}
      <div className="hidden sm:block glass-panel p-4 sm:p-6 rounded-2xl border border-cyan-500/20 shadow-xl overflow-x-auto">
        <div className="flex items-center justify-between min-w-[650px] gap-2">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;

            return (
              <div key={s.step} className="flex items-center flex-1 last:flex-none">
                <button
                  type="button"
                  onClick={async () => {
                    if (s.step < currentStep) {
                      setCurrentStep(s.step);
                    } else if (s.step > currentStep) {
                      const isValid = await trigger(stepFields[currentStep]);
                      if (isValid) setCurrentStep(s.step);
                    }
                  }}
                  className="flex items-center gap-3 text-left group"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-heading font-black text-sm transition-all ${
                      isCompleted
                        ? "bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                        : isCurrent
                        ? "bg-gradient-to-r from-cyan-500 to-cyan-400 text-black shadow-neon-cyan"
                        : "bg-slate-900 border border-slate-800 text-slate-500"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>

                  <div className="hidden sm:block">
                    <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                      Step 0{s.step}
                    </div>
                    <div
                      className={`text-sm font-heading font-bold ${
                        isCurrent ? "text-cyan-300" : isCompleted ? "text-white" : "text-slate-400"
                      }`}
                    >
                      {s.title}
                    </div>
                  </div>
                </button>

                {s.step < 6 && (
                  <div className="flex-1 h-[2px] mx-3 bg-slate-800">
                    <div
                      className="h-full bg-cyan-400 transition-all duration-300"
                      style={{ width: isCompleted ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Form Box */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="glass-panel p-5 sm:p-10 rounded-3xl border border-white/10 relative">
          
          {/* Step Header */}
          <div className="border-b border-slate-800 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs sm:text-sm font-mono text-cyan-400 uppercase tracking-widest font-bold">
                Step {currentStep} of 6 — {STEPS[currentStep - 1].desc}
              </span>
              <h2 className="font-heading font-black text-2xl sm:text-4xl text-white mt-1.5">
                {STEPS[currentStep - 1].title}
              </h2>
            </div>

            <button
              type="button"
              onClick={saveDraft}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-all self-start sm:self-auto"
            >
              <Save className="w-4 h-4 text-cyan-400" />
              <span>{draftSaved ? "Draft Saved!" : "Save Draft"}</span>
            </button>
          </div>

          {/* ================================================================= */}
          {/* STEP 1: PERSONAL INFORMATION */}
          {/* ================================================================= */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Prepopulated Discord ID */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200 uppercase tracking-wider block">
                  Discord Identity (Auto-Linked)
                </label>
                <div className="px-4 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-cyan-300 flex items-center justify-between">
                  <span>@{user?.username || "SpectreRider"} ({user?.discord_id || "789123456789012345"})</span>
                  <span className="text-emerald-400 text-xs font-bold">✓ VERIFIED</span>
                </div>
              </div>

              {/* Real Age */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200 uppercase tracking-wider block">
                  Applicant Real Age <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  {...register("age")}
                  placeholder="18"
                  className="w-full bg-surface-card border border-slate-800 rounded-xl px-4 py-3.5 text-base text-white focus:outline-none focus:border-cyan-500/60"
                />
                {errors.age && (
                  <p className="text-xs sm:text-sm text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4" /> {errors.age.message}
                  </p>
                )}
              </div>

              {/* Country */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200 uppercase tracking-wider block">
                  Country / Region <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  {...register("country")}
                  placeholder="e.g. United States, United Kingdom, Canada, India"
                  className="w-full bg-surface-card border border-slate-800 rounded-xl px-4 py-3.5 text-base text-white focus:outline-none focus:border-cyan-500/60"
                />
                {errors.country && (
                  <p className="text-xs sm:text-sm text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4" /> {errors.country.message}
                  </p>
                )}
              </div>

              {/* Timezone */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200 uppercase tracking-wider block">
                  Timezone <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  {...register("timezone")}
                  placeholder="e.g. EST (UTC-5), PST (UTC-8), GMT, IST (UTC+5:30)"
                  className="w-full bg-surface-card border border-slate-800 rounded-xl px-4 py-3.5 text-base text-white focus:outline-none focus:border-cyan-500/60"
                />
                {errors.timezone && (
                  <p className="text-xs sm:text-sm text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4" /> {errors.timezone.message}
                  </p>
                )}
              </div>

              {/* FiveM Identifier */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-200 uppercase tracking-wider block">
                  FiveM / Steam / Rockstar Identifier <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  {...register("fivem_id")}
                  placeholder="e.g. steam:1100001xxxxxxxx or FiveM username"
                  className="w-full bg-surface-card border border-slate-800 rounded-xl px-4 py-3.5 text-base text-white focus:outline-none focus:border-cyan-500/60"
                />
                <span className="text-xs sm:text-sm text-slate-400 block mt-1">
                  Used by our server bridge to whitelist your connection slot.
                </span>
                {errors.fivem_id && (
                  <p className="text-xs sm:text-sm text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4" /> {errors.fivem_id.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 2: ROLEPLAY EXPERIENCE */}
          {/* ================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200 uppercase tracking-wider block">
                  Have you played FiveM roleplay before? <span className="text-red-400">*</span>
                </label>
                <select
                  {...register("played_before")}
                  className="w-full bg-surface-card border border-slate-800 rounded-xl px-4 py-3.5 text-base text-white focus:outline-none focus:border-cyan-500/60"
                >
                  <option value="yes_experienced">Yes, I have extensive roleplay experience (500+ hours)</option>
                  <option value="yes_moderate">Yes, moderate experience (100 - 500 hours)</option>
                  <option value="yes_beginner">Yes, beginner (&lt; 100 hours)</option>
                  <option value="no_new">No, I am new to FiveM but understand text/voice RP</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200 uppercase tracking-wider block">
                  Previous Servers & Communities <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={4}
                  {...register("previous_servers")}
                  placeholder="Detail servers you have played on, character archetypes you played, and hours spent..."
                  className="w-full bg-surface-card border border-slate-800 rounded-xl px-4 py-3.5 text-base text-white focus:outline-none focus:border-cyan-500/60 leading-relaxed"
                />
                {errors.previous_servers && (
                  <p className="text-xs sm:text-sm text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4" /> {errors.previous_servers.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200 uppercase tracking-wider block">
                  Whitelisted Department Experience (Optional)
                </label>
                <textarea
                  rows={3}
                  {...register("whitelist_experience")}
                  placeholder="List any past positions held in Police, EMS, DOJ, or approved syndicate leadership..."
                  className="w-full bg-surface-card border border-slate-800 rounded-xl px-4 py-3.5 text-base text-white focus:outline-none focus:border-cyan-500/60 leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 3: CHARACTER INFORMATION */}
          {/* ================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-200 uppercase tracking-wider block">
                    Character Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("char_name")}
                    placeholder="e.g. Marcus Vance"
                    className="w-full bg-surface-card border border-slate-800 rounded-xl px-4 py-3.5 text-base text-white focus:outline-none focus:border-cyan-500/60"
                  />
                  {errors.char_name && (
                    <p className="text-xs sm:text-sm text-red-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-4 h-4" /> {errors.char_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-200 uppercase tracking-wider block">
                    Character Age <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    {...register("char_age")}
                    placeholder="28"
                    className="w-full bg-surface-card border border-slate-800 rounded-xl px-4 py-3.5 text-base text-white focus:outline-none focus:border-cyan-500/60"
                  />
                  {errors.char_age && (
                    <p className="text-xs sm:text-sm text-red-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-4 h-4" /> {errors.char_age.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-200 uppercase tracking-wider block">
                    Gender <span className="text-red-400">*</span>
                  </label>
                  <select
                    {...register("char_gender")}
                    className="w-full bg-surface-card border border-slate-800 rounded-xl px-4 py-3.5 text-base text-white focus:outline-none focus:border-cyan-500/60"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200 uppercase tracking-wider block">
                  Character Backstory & Origins (Min 60 chars) <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={5}
                  {...register("char_background")}
                  placeholder="Where was your character born? What formative events defined their youth, and what circumstances led them to move to Los Santos?"
                  className="w-full bg-surface-card border border-slate-800 rounded-xl px-4 py-3.5 text-base text-white focus:outline-none focus:border-cyan-500/60 leading-relaxed"
                />
                {errors.char_background && (
                  <p className="text-xs sm:text-sm text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4" /> {errors.char_background.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-200 uppercase tracking-wider block">
                    Personality Traits & Human Flaws <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    {...register("char_personality")}
                    placeholder="Describe their mannerisms, psychological weaknesses, or vices (e.g. quick-tempered, overly trusting, claustrophobic)..."
                    className="w-full bg-surface-card border border-slate-800 rounded-xl px-4 py-3.5 text-base text-white focus:outline-none focus:border-cyan-500/60 leading-relaxed"
                  />
                  {errors.char_personality && (
                    <p className="text-xs sm:text-sm text-red-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-4 h-4" /> {errors.char_personality.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-200 uppercase tracking-wider block">
                    Short & Long Term Goals <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    {...register("char_goals")}
                    placeholder="What does your character hope to accomplish in the next few weeks and over the next year in the city?"
                    className="w-full bg-surface-card border border-slate-800 rounded-xl px-4 py-3.5 text-base text-white focus:outline-none focus:border-cyan-500/60 leading-relaxed"
                  />
                  {errors.char_goals && (
                    <p className="text-xs sm:text-sm text-red-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-4 h-4" /> {errors.char_goals.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 4: ROLEPLAY KNOWLEDGE */}
          {/* ================================================================= */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm sm:text-base font-heading font-bold text-white block">
                  1. Define RDM (Random Deathmatch) & Give an Example <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={2}
                  {...register("def_rdm")}
                  placeholder="Explain RDM in your own words with an example..."
                  className="w-full bg-surface-card border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/60 leading-relaxed"
                />
                {errors.def_rdm && (
                  <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4" /> {errors.def_rdm.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm sm:text-base font-heading font-bold text-white block">
                  2. Define VDM (Vehicle Deathmatch) <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={2}
                  {...register("def_vdm")}
                  placeholder="Explain VDM and accidental collisions vs deliberate ramming..."
                  className="w-full bg-surface-card border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/60 leading-relaxed"
                />
                {errors.def_vdm && (
                  <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4" /> {errors.def_vdm.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm sm:text-base font-heading font-bold text-white block">
                  3. Define Metagaming & Stream Sniping <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={2}
                  {...register("def_meta")}
                  placeholder="Explain how external Discord DMs or Twitch streams must never be used in character..."
                  className="w-full bg-surface-card border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/60 leading-relaxed"
                />
                {errors.def_meta && (
                  <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4" /> {errors.def_meta.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm sm:text-base font-heading font-bold text-white block">
                  4. Define Powergaming <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={2}
                  {...register("def_power")}
                  placeholder="Explain powergaming and forcing actions on other players..."
                  className="w-full bg-surface-card border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/60 leading-relaxed"
                />
                {errors.def_power && (
                  <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4" /> {errors.def_power.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm sm:text-base font-heading font-bold text-white block">
                  5. Define Fail RP & Breaking Character <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={2}
                  {...register("def_failrp")}
                  placeholder="What should you do if an immersion glitch or rule violation happens during a live scene?"
                  className="w-full bg-surface-card border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/60 leading-relaxed"
                />
                {errors.def_failrp && (
                  <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4" /> {errors.def_failrp.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 5: ROLEPLAY SCENARIOS */}
          {/* ================================================================= */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm sm:text-base font-heading font-bold text-white block">
                  Scenario 1: High-Stakes Police Traffic Stop <span className="text-red-400">*</span>
                </label>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  You are pulled over for speeding while carrying unlicensed firearms and $40,000 in dirty money in your trunk. How do you handle the police interaction from start to finish?
                </p>
                <textarea
                  rows={4}
                  {...register("scenario_police_stop")}
                  placeholder="Detail your voice dialogue, actions, nervousness cues, and escalation choices..."
                  className="w-full bg-surface-card border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/60 leading-relaxed"
                />
                {errors.scenario_police_stop && (
                  <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4" /> {errors.scenario_police_stop.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm sm:text-base font-heading font-bold text-white block">
                  Scenario 2: Taken Hostage at Gunpoint <span className="text-red-400">*</span>
                </label>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  You are cornered in an alleyway by two masked criminals holding firearms to your head demanding you act as their hostage during a bank heist. How does your character react?
                </p>
                <textarea
                  rows={4}
                  {...register("scenario_hostage")}
                  placeholder="Detail how you value your character life (NVL) and roleplay the hostage scenario..."
                  className="w-full bg-surface-card border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/60 leading-relaxed"
                />
                {errors.scenario_hostage && (
                  <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4" /> {errors.scenario_hostage.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm sm:text-base font-heading font-bold text-white block">
                  Scenario 3: Narrative Loss & Defeat <span className="text-red-400">*</span>
                </label>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Your character is ambushed in a major heist, arrested, and loses all assets and vehicle impounded. How do you roleplay this loss?
                </p>
                <textarea
                  rows={3}
                  {...register("scenario_loss")}
                  placeholder="Explain how you turn loss into character development rather than venting out of character..."
                  className="w-full bg-surface-card border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/60 leading-relaxed"
                />
                {errors.scenario_loss && (
                  <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4" /> {errors.scenario_loss.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 6: RULES & AGREEMENT */}
          {/* ================================================================= */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-heading font-bold text-sm sm:text-base text-white">
                  NOMIX Community Oath
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  By submitting this visa application, you acknowledge that roleplay immersion, respect for fellow players, and upholding staff directives are mandatory conditions of remaining whitelisted on NOMIX.
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl bg-surface-card border border-slate-800 cursor-pointer hover:border-cyan-500/40 transition-colors">
                  <input
                    type="checkbox"
                    {...register("agree_rules")}
                    className="mt-1 w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-400 focus:ring-cyan-400"
                  />
                  <div className="text-xs sm:text-sm text-slate-200">
                    <strong className="text-white block mb-0.5">I have read and agree to all server rules and regulations.</strong>
                    <span className="text-xs text-slate-400">I understand that claiming ignorance of rules is not an acceptable defense for violations.</span>
                  </div>
                </label>
                {errors.agree_rules && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.agree_rules.message}
                  </p>
                )}

                <label className="flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl bg-surface-card border border-slate-800 cursor-pointer hover:border-cyan-500/40 transition-colors">
                  <input
                    type="checkbox"
                    {...register("agree_nvl")}
                    className="mt-1 w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-400 focus:ring-cyan-400"
                  />
                  <div className="text-xs sm:text-sm text-slate-200">
                    <strong className="text-white block mb-0.5">I agree to strictly value my character life (NVL).</strong>
                    <span className="text-xs text-slate-400">I will not act recklessly or fail to fear weapons during hostile roleplay encounters.</span>
                  </div>
                </label>
                {errors.agree_nvl && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.agree_nvl.message}
                  </p>
                )}

                <label className="flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl bg-surface-card border border-slate-800 cursor-pointer hover:border-cyan-500/40 transition-colors">
                  <input
                    type="checkbox"
                    {...register("agree_microphone")}
                    className="mt-1 w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-400 focus:ring-cyan-400"
                  />
                  <div className="text-xs sm:text-sm text-slate-200">
                    <strong className="text-white block mb-0.5">I possess a working, clear microphone with zero static.</strong>
                    <span className="text-xs text-slate-400">I will stay in-character in voice at all times while connected to the server.</span>
                  </div>
                </label>
                {errors.agree_microphone && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.agree_microphone.message}
                  </p>
                )}
              </div>

              {submitError && (
                <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-sm text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
            </div>
          )}

          {/* Wizard Action Bar */}
          <div className="mt-8 sm:mt-10 pt-6 border-t border-slate-800 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 sm:gap-4">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-heading font-bold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> PREVIOUS STEP
              </button>
            ) : (
              <div className="hidden sm:block" />
            )}

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={nextStep}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-heading font-black text-sm tracking-wider hover:shadow-neon-cyan transition-all flex items-center justify-center gap-2"
              >
                NEXT STEP <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-400 text-black font-heading font-black text-sm sm:text-base tracking-wider hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> SUBMITTING...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" /> SUBMIT VISA APPLICATION
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </form>

    </div>
  );
}
