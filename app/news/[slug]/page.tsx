"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Clock, User, ArrowLeft, Tag, Share2 } from "lucide-react";
import { NewsArticle } from "@/types";
import { formatDate } from "@/lib/utils";

export default function SingleNewsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/news?_t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((articles: NewsArticle[]) => {
        const found = articles.find((a) => a.slug === slug);
        if (found) {
          setArticle(found);
        }
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-40 pb-24 text-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span className="text-xs font-mono text-slate-400">Loading announcement transmission...</span>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-40 pb-24 text-center space-y-4">
        <h1 className="font-heading font-black text-2xl text-white">Article Not Found</h1>
        <p className="text-xs text-slate-400">The requested announcement could not be located.</p>
        <Link href="/news" className="inline-flex items-center gap-2 text-cyan-400 text-xs font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to all news
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-8">
      
      {/* Back Link */}
      <Link
        href="/news"
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-cyan-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to News & Announcements
      </Link>

      {/* Header Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
            {article.category?.name || "Server Dispatch"}
          </span>
        </div>

        <h1 className="font-heading font-black text-3xl sm:text-5xl md:text-6xl text-metallic leading-tight">
          {article.title}
        </h1>

        <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-300 border-y border-slate-800/80 py-3">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-400" />
            {formatDate(article.published_at)}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-slate-300" />
            {article.author_name}
          </span>
        </div>
      </div>

      {/* Cover Image */}
      {article.cover_image && (
        <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden glass-panel border border-cyan-500/20 shadow-2xl">
          <Image
            src={article.cover_image}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Article Content */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-5 text-sm sm:text-base text-slate-200 leading-relaxed">
        <p className="text-base sm:text-lg text-cyan-200/95 font-medium leading-relaxed border-l-2 border-cyan-400 pl-4">
          {article.excerpt}
        </p>

        <div className="whitespace-pre-line text-slate-300 space-y-4 pt-4 border-t border-slate-800/80 text-sm sm:text-base leading-relaxed">
          {article.content}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="pt-8 border-t border-slate-900 flex items-center justify-between">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-sm font-bold text-cyan-400 hover:text-cyan-300"
        >
          <ArrowLeft className="w-4 h-4" /> Return to News Feed
        </Link>
        <Link
          href="/apply"
          className="px-6 py-3 rounded-xl bg-cyan-400 text-black font-heading font-bold text-sm hover:shadow-neon-cyan transition-all"
        >
          Apply for Visa
        </Link>
      </div>

    </article>
  );
}
