"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, MessageSquare, ArrowRight } from "lucide-react";
import { FAQCategory, FAQItem } from "@/types";

export default function FAQPage() {
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaqs, setOpenFaqs] = useState<Record<string, boolean>>({ "faq-1": true, "faq-2": true });

  useEffect(() => {
    fetch("/api/faq")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const toggleFaq = (id: string) => {
    setOpenFaqs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-cyan-500/30 text-xs font-mono text-cyan-400">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>HELP & SUPPORT DIRECTORY</span>
        </div>
        <h1 className="font-heading font-black text-4xl sm:text-5xl text-metallic">
          FREQUENTLY ASKED QUESTIONS
        </h1>
        <p className="text-slate-300 text-sm sm:text-base">
          Find instant answers to common questions about server whitelist, rules, FiveM connectivity, and community support.
        </p>
      </div>

      {/* Accordion FAQ Groups */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs font-mono text-slate-400">Loading FAQ knowledgebase...</span>
        </div>
      ) : (
        <div className="space-y-10">
          {categories.map((category) => (
            <div key={category.id} className="space-y-4">
              <h2 className="font-heading font-bold text-xl text-cyan-300 border-b border-slate-800 pb-2">
                {category.name}
              </h2>

              <div className="space-y-3">
                {category.faqs?.map((faq) => {
                  const isOpen = !!openFaqs[faq.id];
                  return (
                    <div
                      key={faq.id}
                      className="glass-panel rounded-xl border border-white/5 overflow-hidden transition-all hover:border-slate-700"
                    >
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full p-5 text-left flex items-center justify-between gap-4 font-heading font-bold text-sm sm:text-base text-white hover:text-cyan-300 transition-colors"
                      >
                        <span>{faq.question}</span>
                        <div className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 flex-shrink-0">
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-900/60 bg-slate-950/30">
                          <p>{faq.answer}</p>
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

      {/* Still need help callout */}
      <div className="glass-panel rounded-2xl p-8 border border-cyan-500/20 text-center space-y-4">
        <h3 className="font-heading font-bold text-xl text-white">
          Still Have Unanswered Questions?
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Our support staff is available 24/7 on Discord. Open a ticket in our #support channel for direct assistance.
        </p>
        <Link
          href="/discord"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-heading font-bold text-xs tracking-wider transition-all shadow-[0_0_15px_rgba(88,101,242,0.3)]"
        >
          <MessageSquare className="w-4 h-4" />
          JOIN DISCORD SUPPORT
        </Link>
      </div>

    </div>
  );
}
