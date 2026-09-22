"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  ShieldAlert, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  Info, 
  ArrowRight,
  ShieldCheck,
  Heart
} from "lucide-react";
import { RuleCategory, Rule, RuleSeverity } from "@/types";
import { getSeverityBadge } from "@/lib/utils";

export default function RulesPage() {
  const [categories, setCategories] = useState<RuleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedRules, setExpandedRules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/rules")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          // Pre-expand first few rules in the first category
          const initialExpanded: Record<string, boolean> = {};
          if (data[0] && data[0].rules) {
            data[0].rules.forEach((r: Rule) => {
              initialExpanded[r.id] = true;
            });
          }
          setExpandedRules(initialExpanded);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const toggleRule = (ruleId: string) => {
    setExpandedRules((prev) => ({
      ...prev,
      [ruleId]: !prev[ruleId],
    }));
  };

  const expandAll = () => {
    const allExp: Record<string, boolean> = {};
    categories.forEach((cat) => {
      cat.rules?.forEach((r) => {
        allExp[r.id] = true;
      });
    });
    setExpandedRules(allExp);
  };

  const collapseAll = () => {
    setExpandedRules({});
  };

  // Filtered categories and rules based on category selection and search query
  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return categories
      .filter((cat) => (selectedCategory === "all" ? true : cat.id === selectedCategory || cat.slug === selectedCategory))
      .map((cat) => {
        const matchingRules = (cat.rules || []).filter((rule) => {
          if (!q) return true;
          return (
            rule.rule_number.toLowerCase().includes(q) ||
            rule.title.toLowerCase().includes(q) ||
            rule.description.toLowerCase().includes(q) ||
            (rule.content && rule.content.toLowerCase().includes(q)) ||
            rule.severity.toLowerCase().includes(q)
          );
        });

        return {
          ...cat,
          rules: matchingRules,
        };
      })
      .filter((cat) => cat.rules && cat.rules.length > 0);
  }, [categories, selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-12">
      
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="font-heading font-black text-4xl sm:text-5xl text-metallic">
          COMMUNITY RULES & REGULATIONS
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          No Mix RP is a serious GTA V roleplay community built around immersive, realistic, and enjoyable interactions. By joining our Discord or FiveM server, you agree to uphold these standards.
        </p>

        {/* Server Ethos Callout */}
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/20 via-[#0B0F17] to-red-950/20 text-slate-200 max-w-2xl mx-auto space-y-2">
          <span className="font-mono text-cyan-400 font-bold uppercase tracking-wider block text-xs sm:text-sm">
            ROLEPLAY WITH PURPOSE:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-200 font-medium">
            <div>• Every civilian has a story.</div>
            <div>• Every criminal has a reason.</div>
            <div>• Every officer has a responsibility.</div>
            <div>• Every medic has a purpose.</div>
          </div>
          <p className="text-cyan-300 font-semibold pt-1 text-xs sm:text-sm">
            Every interaction creates RP. Respect the RP. Respect the community.
          </p>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-white/5 space-y-4 shadow-xl">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all 17 rule sections by keyword (e.g. 3.3, RDM, VDM, Fear RP, NLR, Cop Baiting, Exploits, 17)..."
            className="w-full bg-surface-card border border-slate-800 rounded-xl py-3.5 pl-12 pr-20 text-base text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/60 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filter Buttons */}
        <div className="pt-2 border-t border-slate-900 flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span className="font-mono uppercase font-bold text-xs text-cyan-400">
              Select Category Filter:
            </span>
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              <button onClick={expandAll} className="text-cyan-400 hover:underline">
                Expand All
              </button>
              <span>•</span>
              <button onClick={collapseAll} className="text-slate-400 hover:underline">
                Collapse All
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 max-h-48 overflow-y-auto pr-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold tracking-wider transition-all ${
                selectedCategory === "all"
                  ? "bg-cyan-500 text-black font-bold shadow-neon-cyan-sm"
                  : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              All Categories ({categories.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold tracking-wider transition-all truncate max-w-xs ${
                  selectedCategory === cat.id
                    ? "bg-cyan-500 text-black font-bold shadow-neon-cyan-sm"
                    : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rules Categories & Item Cards */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-sm font-mono text-slate-400">Loading No Mix RP official rules from database...</span>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl border border-slate-800">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h3 className="font-heading font-bold text-xl text-white">No Matching Rules Found</h3>
          <p className="text-sm text-slate-300 mt-1">
            Try adjusting your search query or clicking "All Categories".
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {filteredCategories.map((category) => (
            <div key={category.id} className="space-y-4">
              
              {/* Category Heading */}
              <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div>
                  <h2 className="font-heading font-black text-2xl sm:text-3xl text-cyan-400 tracking-wide">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-xs sm:text-sm text-slate-300 mt-1">{category.description}</p>
                  )}
                </div>
                <span className="text-xs sm:text-sm font-mono text-slate-400">
                  {category.rules?.length || 0} Sub-rules
                </span>
              </div>

              {/* Rules List */}
              <div className="space-y-3">
                {category.rules?.map((rule) => {
                  const isExpanded = !expandedRules[rule.id];
                  const badge = getSeverityBadge(rule.severity);

                  return (
                    <div
                      key={rule.id}
                      className="glass-panel rounded-xl border border-white/5 hover:border-slate-700 transition-all overflow-hidden"
                    >
                      {/* Rule Accordion Trigger */}
                      <button
                        onClick={() => toggleRule(rule.id)}
                        className="w-full text-left p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start sm:items-center gap-4">
                          {/* Rule Number Badge */}
                          <div className="flex-shrink-0 w-14 h-11 rounded-lg bg-surface-card border border-cyan-500/30 flex items-center justify-center font-mono font-black text-sm text-cyan-400">
                            {rule.rule_number}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="font-heading font-bold text-lg sm:text-xl text-white hover:text-cyan-300 transition-colors">
                                {rule.title}
                              </h3>
                              <span
                                className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase border ${badge.className}`}
                              >
                                {badge.label}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                              {rule.description}
                            </p>
                          </div>
                        </div>

                        <div className="p-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 flex-shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </button>

                      {/* Rule Full Content (Expandable) */}
                      {isExpanded && rule.content && (
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-200 leading-relaxed border-t border-slate-900 bg-slate-950/40">
                          <div className="p-4 sm:p-5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
                            <span className="text-xs font-mono uppercase font-bold text-cyan-400 block">
                              OFFICIAL RULE SPECIFICATION:
                            </span>
                            <p className="whitespace-pre-line text-slate-100 text-xs sm:text-sm leading-relaxed">
                              {rule.content}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Bottom Visa CTA */}
      <div className="glass-panel p-8 sm:p-10 rounded-2xl border border-cyan-500/20 text-center space-y-4">
        <h3 className="font-heading font-bold text-2xl text-white">
          Understood the Rules?
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
          Knowledge of these rules is tested during our 6-step visa questionnaire. Start your whitelist application today.
        </p>
        <Link
          href="/apply"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-cyan-400 text-black font-heading font-bold text-sm tracking-wider hover:shadow-neon-cyan transition-all"
        >
          PROCEED TO APPLICATION <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
