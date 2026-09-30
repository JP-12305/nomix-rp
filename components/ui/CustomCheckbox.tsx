"use client";

import React, { forwardRef } from "react";
import { Check } from "lucide-react";

interface CustomCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  error?: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  containerClassName?: string;
}

export const CustomCheckbox = forwardRef<HTMLInputElement, CustomCheckboxProps>(
  (
    {
      label,
      subtitle,
      icon,
      error,
      checked = false,
      onChange,
      containerClassName = "",
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    return (
      <div className={`space-y-1.5 ${containerClassName}`}>
        <label
          className={`group relative flex items-start gap-3.5 p-4 sm:p-4.5 rounded-2xl border cursor-pointer select-none transition-all duration-200 ${
            checked
              ? "bg-[#0B1528]/80 border-cyan-500/50 shadow-[0_0_20px_rgba(0,240,255,0.08)] ring-1 ring-cyan-500/30"
              : "bg-[#080D1A]/60 border-slate-800 hover:border-slate-700 hover:bg-[#0C1427]/80"
          } ${className}`}
        >
          {/* Accessible hidden input */}
          <input
            type="checkbox"
            id={id}
            ref={ref}
            checked={checked}
            onChange={onChange}
            className="sr-only peer"
            {...props}
          />

          {/* Custom Cyberpunk Checkbox Box */}
          <div className="relative flex-shrink-0 mt-0.5">
            <div
              className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-200 ${
                checked
                  ? "border-cyan-400 bg-gradient-to-b from-cyan-400 to-cyan-500 shadow-[0_0_12px_rgba(0,240,255,0.5)] scale-105"
                  : "border-slate-700 bg-slate-950/90 group-hover:border-cyan-500/60 shadow-inner"
              }`}
            >
              <Check
                className={`w-3.5 h-3.5 text-slate-950 stroke-[3] transition-all duration-200 ${
                  checked ? "opacity-100 scale-100" : "opacity-0 scale-50"
                }`}
              />
            </div>
          </div>

          {/* Label text & Subtitle */}
          <div className="text-xs sm:text-sm text-slate-200 flex-1">
            <div className="text-white font-medium flex items-center gap-2 mb-0.5">
              {icon}
              <span className="leading-snug">{label}</span>
            </div>
            {subtitle && (
              <span className="text-xs text-slate-400 block leading-relaxed mt-0.5">
                {subtitle}
              </span>
            )}
          </div>
        </label>

        {error && (
          <p className="text-xs text-red-400 flex items-center gap-1 pl-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

CustomCheckbox.displayName = "CustomCheckbox";
