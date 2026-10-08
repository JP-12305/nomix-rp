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
  Loader2,
  Video,
  Check
} from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { CustomCheckbox } from "@/components/ui/CustomCheckbox";

const STEPS = [
  { step: 1, title: "Personal Info", desc: "Applicant & FiveM details", icon: User },
  { step: 2, title: "RP Experience", desc: "Past servers & hours", icon: Compass },
  { step: 3, title: "Character Concept", desc: "Identity & character goals", icon: Sparkles },
  { step: 4, title: "Scenarios", desc: "In-game roleplay tests", icon: Flame },
  { step: 5, title: "Agreements", desc: "Rulebook confirmation", icon: ShieldCheck },
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
      irl_name: "",
      ic_name: "",
      irl_sex: "" as unknown as "Male",
      native_language: "",
      age: "" as unknown as number,
      country: "",
      timezone: "",
      fivem_id: "",
      played_before: "yes_experienced",
      previous_servers: "",
      whitelist_experience: "",
      is_content_creator: false,
      creator_platform: "",
      creator_other_platform: "",
      creator_channel_url: "",
      char_name: "",
      char_age: "" as unknown as number,
      char_gender: "Male",
      char_goals: "",
      scenario_police_stop: "",
      scenario_hostage: "",
      scenario_loss: "",
      agree_rules: false as unknown as true,
      agree_nvl: false as unknown as true,
      agree_microphone: false as unknown as true,
    },
  });

  const isContentCreator = watch("is_content_creator");
  const selectedPlatform = watch("creator_platform");

  // Load saved draft on mount
  useEffect(() => {
    const saved = localStorage.getItem("nomix_app_draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Clean up legacy draft if irl_name was mistakenly stored as 21 or numeric
        if (parsed.irl_name === 21 || parsed.irl_name === "21") {
          delete parsed.irl_name;
        }
        Object.entries(parsed).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== "") {
            setValue(k as keyof ApplicationFormData, v as any);
          }
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
      setCurrentStep((prev) => Math.min(5, prev + 1));
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
            Step {currentStep} of 5
          </span>
          <span className="text-white font-bold font-heading">
            {STEPS[currentStep - 1].title}
          </span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-cyan-500 to-cyan-300 h-full rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 5) * 100}%` }}
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

                {s.step < 5 && (
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
                Step {currentStep} of 5 — {STEPS[currentStep - 1].desc}
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
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-200 uppercase tracking-wider block">
                  Discord Identity (Auto-Linked)
                </label>
                <div className="px-4 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-cyan-300 flex items-center justify-between">
                  <span>@{user?.username || "SpectreRider"} ({user?.discord_id || "789123456789012345"})</span>
                  <span className="text-emerald-400 text-xs font-bold">✓ VERIFIED</span>
                </div>
              </div>

              {/* IRL Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200 uppercase tracking-wider block">
                  IRL Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  {...register("irl_name")}
                  placeholder="e.g. Alex Mercer (Real Life Name)"
                  className="w-full bg-surface-card border border-slate-800 rounded-xl px-4 py-3.5 text-base text-white focus:outline-none focus:border-cyan-500/60"
                />
                {errors.irl_name && (
                  <p className="text-xs sm:text-sm text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4" /> {errors.irl_name.message}
                  </p>
                )}
              </div>

              {/* IC Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200 uppercase tracking-wider block">
                  IC Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  {...register("ic_name")}
                  placeholder="e.g. Marcus Vance (In-Game Name)"
                  className="w-full bg-surface-card border border-slate-800 rounded-xl px-4 py-3.5 text-base text-white focus:outline-none focus:border-cyan-500/60"
                />
                {errors.ic_name && (
                  <p className="text-xs sm:text-sm text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4" /> {errors.ic_name.message}
                  </p>
                )}
              </div>

              {/* IRL Sex Checkbox Selection */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-200 uppercase tracking-wider block">
                  IRL Sex <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(["Male", "Female", "Other"] as const).map((option) => {
                    const isSelected = watch("irl_sex") === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setValue("irl_sex", option, { shouldValidate: true })}
                        className={`flex items-center justify-center sm:justify-start gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "bg-[#0B1528] border-cyan-400/80 text-white shadow-[0_0_15px_rgba(0,240,255,0.15)] ring-1 ring-cyan-400/40"
                            : "bg-surface-card border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white hover:bg-slate-900/60"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                            isSelected
                              ? "border-cyan-400 bg-gradient-to-b from-cyan-400 to-cyan-500 shadow-[0_0_8px_rgba(0,240,255,0.6)]"
                              : "border-slate-700 bg-slate-950"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                        </div>
                        <span className="truncate">{option}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.irl_sex && (
                  <p className="text-xs sm:text-sm text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4" /> {errors.irl_sex.message}
                  </p>
                )}
              </div>

              {/* Native Language */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200 uppercase tracking-wider block">
                  Native Language <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  {...register("native_language")}
                  placeholder="e.g. English, Spanish, Hindi, German (Native Language)"
                  className="w-full bg-surface-card border border-slate-800 rounded-xl px-4 py-3.5 text-base text-white focus:outline-none focus:border-cyan-500/60"
                />
                {errors.native_language && (
                  <p className="text-xs sm:text-sm text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4" /> {errors.native_language.message}
                  </p>
                )}
              </div>

              {/* Real Age */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200 uppercase tracking-wider block">
                  Applicant Real Age <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  autoComplete="off"
                  {...register("age")}
                  placeholder="e.g. 21 (Must be 18+)"
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
                  autoComplete="off"
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
                  autoComplete="off"
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

              {/* FiveM Name */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-200 uppercase tracking-wider block">
                  FiveM Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  {...register("fivem_id")}
                  placeholder="e.g. Your FiveM Name"
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
          {/* STEP 2: ROLEPLAY EXPERIENCE & CONTENT CREATION */}
          {/* ================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <CustomSelect
                label="Have you played FiveM roleplay before?"
                required
                value={watch("played_before") || "yes_experienced"}
                onChange={(val) => setValue("played_before", val, { shouldValidate: true })}
                options={[
                  { value: "yes_experienced", label: "Yes, I have extensive roleplay experience (500+ hours)" },
                  { value: "yes_moderate", label: "Yes, moderate experience (100 - 500 hours)" },
                  { value: "yes_beginner", label: "Yes, beginner (< 100 hours)" },
                  { value: "no_new", label: "No, I am new to FiveM but understand text/voice RP" },
                ]}
                error={errors.played_before?.message}
              />

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

              {/* Content Creator / Streamer Checkbox Section */}
              <div className="pt-2 border-t border-slate-800/80 space-y-4">
                <CustomCheckbox
                  {...register("is_content_creator")}
                  checked={!!isContentCreator}
                  onChange={(e) =>
                    setValue("is_content_creator", e.target.checked, { shouldValidate: true })
                  }
                  icon={<Video className="w-4 h-4 text-cyan-400" />}
                  label="I am a Content Creator / Streamer (Twitch, YouTube, TikTok, Kick, etc.)"
                  subtitle="Check this box if you plan to broadcast live, record roleplay gameplay, or produce community content."
                />

                {/* Dynamic Streaming Details (Revealed only when checkbox is active) */}
                {isContentCreator && (
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" /> Content Creator Details
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Platform Dropdown */}
                      <CustomSelect
                        label="Primary Streaming / Video Platform"
                        required
                        value={selectedPlatform || ""}
                        onChange={(val) =>
                          setValue("creator_platform", val, { shouldValidate: true })
                        }
                        placeholder="Select Platform..."
                        options={[
                          { value: "Twitch", label: "Twitch" },
                          { value: "YouTube", label: "YouTube" },
                          { value: "TikTok", label: "TikTok" },
                          { value: "Kick", label: "Kick" },
                          { value: "Facebook Gaming", label: "Facebook Gaming" },
                          { value: "Other", label: "Other Platform" },
                        ]}
                        error={errors.creator_platform?.message}
                      />

                      {/* If 'Other' platform is selected */}
                      {selectedPlatform === "Other" && (
                        <div className="space-y-2 animate-in fade-in duration-200">
                          <label className="text-xs sm:text-sm font-semibold text-slate-200 uppercase tracking-wider block">
                            Specify Other Platform <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            {...register("creator_other_platform")}
                            placeholder="e.g. Trovo, Rumble, Custom Platform"
                            className="w-full bg-surface-card border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/60"
                          />
                          {errors.creator_other_platform && (
                            <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                              <AlertCircle className="w-3.5 h-3.5" /> {errors.creator_other_platform.message}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Channel Link */}
                      <div className={`space-y-2 ${selectedPlatform !== "Other" ? "sm:col-span-1" : "sm:col-span-2"}`}>
                        <label className="text-xs sm:text-sm font-semibold text-slate-200 uppercase tracking-wider block">
                          Channel / Profile Link <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          {...register("creator_channel_url")}
                          placeholder={
                            selectedPlatform === "Twitch"
                              ? "https://twitch.tv/yourchannel"
                              : selectedPlatform === "YouTube"
                              ? "https://youtube.com/@yourchannel"
                              : selectedPlatform === "TikTok"
                              ? "https://tiktok.com/@yourhandle"
                              : "https://... (Channel link or handle)"
                          }
                          className="w-full bg-surface-card border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500/60 font-mono"
                        />
                        {errors.creator_channel_url && (
                          <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {errors.creator_channel_url.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
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
                    autoComplete="off"
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
                    autoComplete="off"
                    {...register("char_age")}
                    placeholder="e.g. 25"
                    className="w-full bg-surface-card border border-slate-800 rounded-xl px-4 py-3.5 text-base text-white focus:outline-none focus:border-cyan-500/60"
                  />
                  {errors.char_age && (
                    <p className="text-xs sm:text-sm text-red-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-4 h-4" /> {errors.char_age.message}
                    </p>
                  )}
                </div>

                <CustomSelect
                  label="Gender"
                  required
                  value={watch("char_gender") || "Male"}
                  onChange={(val) => setValue("char_gender", val, { shouldValidate: true })}
                  options={[
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                    { value: "Non-Binary", label: "Non-Binary" },
                  ]}
                  error={errors.char_gender?.message}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200 uppercase tracking-wider block">
                  Short & Long Term Goals in the City <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={4}
                  {...register("char_goals")}
                  placeholder="What career, syndicate, or narrative storyline does your character plan to pursue in Los Santos?"
                  className="w-full bg-surface-card border border-slate-800 rounded-xl px-4 py-3.5 text-base text-white focus:outline-none focus:border-cyan-500/60 leading-relaxed"
                />
                {errors.char_goals && (
                  <p className="text-xs sm:text-sm text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-4 h-4" /> {errors.char_goals.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* STEP 4: ROLEPLAY SCENARIOS */}
          {/* ================================================================= */}
          {currentStep === 4 && (
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
          {/* STEP 5: RULES & AGREEMENT */}
          {/* ================================================================= */}
          {currentStep === 5 && (
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
                <CustomCheckbox
                  {...register("agree_rules")}
                  checked={!!watch("agree_rules")}
                  onChange={(e) =>
                    setValue("agree_rules", e.target.checked as unknown as true, {
                      shouldValidate: true,
                    })
                  }
                  label="I have read and agree to all server rules and regulations."
                  subtitle="I understand that claiming ignorance of rules is not an acceptable defense for violations."
                  error={errors.agree_rules?.message}
                />

                <CustomCheckbox
                  {...register("agree_nvl")}
                  checked={!!watch("agree_nvl")}
                  onChange={(e) =>
                    setValue("agree_nvl", e.target.checked as unknown as true, {
                      shouldValidate: true,
                    })
                  }
                  label="I agree to strictly value my character life (NVL)."
                  subtitle="I will not act recklessly or fail to fear weapons during hostile roleplay encounters."
                  error={errors.agree_nvl?.message}
                />

                <CustomCheckbox
                  {...register("agree_microphone")}
                  checked={!!watch("agree_microphone")}
                  onChange={(e) =>
                    setValue("agree_microphone", e.target.checked as unknown as true, {
                      shouldValidate: true,
                    })
                  }
                  label="I possess a working, clear microphone with zero static."
                  subtitle="I will stay in-character in voice at all times while connected to the server."
                  error={errors.agree_microphone?.message}
                />
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

            {currentStep < 5 ? (
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
