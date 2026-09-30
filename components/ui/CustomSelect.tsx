"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: React.ReactNode;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  labelClassName?: string;
  id?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  label,
  required,
  error,
  disabled = false,
  className = "",
  buttonClassName = "",
  labelClassName = "text-xs sm:text-sm font-semibold text-slate-200 uppercase tracking-wider block",
  id,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = options.findIndex((o) => o.value === value);
        const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        onChange(options[nextIndex].value);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = options.findIndex((o) => o.value === value);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        onChange(options[prevIndex].value);
      }
    }
  };

  return (
    <div className={`relative space-y-1.5 ${className}`} ref={containerRef}>
      {label && (
        <label className={labelClassName}>
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          id={id}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
          className={`w-full bg-[#080D1A]/90 hover:bg-[#0C1427] border ${
            error
              ? "border-red-500/80 focus:border-red-400 ring-1 ring-red-500/30"
              : isOpen
              ? "border-cyan-400 shadow-[0_0_18px_rgba(0,240,255,0.2)] ring-1 ring-cyan-400/40"
              : "border-slate-800 hover:border-slate-700"
          } rounded-xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-left flex items-center justify-between transition-all duration-200 cursor-pointer outline-none ${buttonClassName}`}
        >
          <span
            className={`truncate flex items-center gap-2 ${
              selectedOption && selectedOption.value !== ""
                ? "text-white font-medium"
                : "text-slate-400"
            }`}
          >
            {selectedOption?.icon}
            {selectedOption && selectedOption.value !== ""
              ? selectedOption.label
              : placeholder}
          </span>
          <ChevronDown
            className={`w-4 h-4 ml-2 flex-shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-cyan-400" : "text-slate-400"
            }`}
          />
        </button>

        {isOpen && (
          <div
            role="listbox"
            className="absolute z-50 left-0 right-0 top-full mt-1.5 max-h-64 overflow-y-auto rounded-xl bg-[#080D1A]/98 backdrop-blur-xl border border-cyan-500/30 shadow-[0_16px_40px_rgba(0,0,0,0.85),0_0_20px_rgba(0,240,255,0.12)] p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs sm:text-sm flex items-center justify-between transition-all duration-150 group cursor-pointer ${
                    isSelected
                      ? "bg-cyan-500/20 text-cyan-300 font-semibold border-l-2 border-cyan-400 pl-4 shadow-[inset_0_0_12px_rgba(0,240,255,0.1)]"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white hover:pl-4"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {opt.icon}
                    <div>
                      <div className="truncate">{opt.label}</div>
                      {opt.description && (
                        <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                          {opt.description}
                        </div>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 ml-2 animate-in zoom-in duration-150" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
