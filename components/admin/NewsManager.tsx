"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Plus, 
  Trash2, 
  ExternalLink, 
  Sparkles, 
  Clock, 
  User, 
  Tag, 
  Image as ImageIcon, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  X,
  Loader2,
  RefreshCw,
  Send,
  SlidersHorizontal,
  Flame,
  Globe
} from "lucide-react";
import { NewsArticle, NewsCategory } from "@/types";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";

const IMAGE_PRESETS = [
  {
    name: "🌆 Cyber Skyline",
    url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80",
  },
  {
    name: "🏎️ Street Racers",
    url: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1200&auto=format&fit=crop&q=80",
  },
  {
    name: "🚔 Emergency Fleet",
    url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80",
  },
  {
    name: "🏙️ Downtown Heights",
    url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&auto=format&fit=crop&q=80",
  },
];

export default function NewsManager() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [authorName, setAuthorName] = useState(user?.username || "NOMIX Staff");
  const [coverImage, setCoverImage] = useState(IMAGE_PRESETS[0].url);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Auto-generate slug from title
  const computedSlug = customSlug || title.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-");

  const loadData = async () => {
    setLoading(true);
    try {
      const [newsRes, catRes] = await Promise.all([
        fetch(`/api/admin/news?_t=${Date.now()}`, { cache: "no-store" }),
        fetch(`/api/news/categories?_t=${Date.now()}`, { cache: "no-store" })
      ]);

      if (newsRes.ok) {
        const data = await newsRes.json();
        setArticles(data.articles || []);
      }

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData || []);
        if (catData && catData.length > 0 && !categoryId) {
          setCategoryId(catData[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to load news manager data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim() || !content.trim()) {
      setFormError("Please fill in Title, Excerpt, and Article Content.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch("/api/admin/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: customSlug || computedSlug,
          category_id: categoryId || (categories[0]?.id),
          author_name: authorName || user?.username || "NOMIX Staff",
          cover_image: coverImage,
          excerpt,
          content,
          is_published: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to publish article.");
        setIsSubmitting(false);
        return;
      }

      setPublishSuccess(true);
      setTimeout(() => {
        setPublishSuccess(false);
        setShowComposeModal(false);
        // Reset form
        setTitle("");
        setCustomSlug("");
        setExcerpt("");
        setContent("");
      }, 1500);

      loadData();
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this news dispatch?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (e) {
      console.error("Delete error:", e);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Actions Header */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
              <Globe className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-heading font-black text-xl text-white">News & Changelog Dispatches</h2>
              <p className="text-xs text-slate-400">Publish server patch notes, event announcements, and community news.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => loadData()}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title="Refresh articles"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          
          <Link
            href="/news"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Public Feed
          </Link>

          <button
            onClick={() => setShowComposeModal(true)}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-heading font-black text-xs tracking-wider flex items-center justify-center gap-2 hover:shadow-neon-cyan transition-all"
          >
            <Plus className="w-4 h-4" /> COMPOSE NEW DISPATCH
          </button>
        </div>
      </div>

      {/* Articles Grid / List */}
      {loading ? (
        <div className="glass-panel p-12 rounded-2xl border border-white/5 text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs font-mono text-slate-400">Loading published news transmissions...</span>
        </div>
      ) : articles.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-white/5 text-center space-y-4">
          <div className="p-4 w-fit rounded-2xl bg-slate-900 border border-slate-800 text-cyan-400 mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="font-heading font-bold text-lg text-white">No News Dispatches Published Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Your server news feed is currently empty. Compose your first announcement or patch note to keep the community informed.
          </p>
          <button
            onClick={() => setShowComposeModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 text-black font-heading font-bold text-xs hover:shadow-neon-cyan"
          >
            <Plus className="w-4 h-4" /> Publish First Article
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <div
              key={article.id}
              className="glass-panel rounded-2xl border border-white/5 overflow-hidden hover:border-cyan-500/30 transition-all flex flex-col group shadow-lg"
            >
              {/* Card Cover Header */}
              <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                {article.cover_image ? (
                  <Image
                    src={article.cover_image}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-900 to-[#0A0E17]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] via-[#0A0E17]/50 to-transparent" />
                
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/80 backdrop-blur-md border border-cyan-500/40 text-cyan-300">
                    {article.category?.name || "Dispatch"}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-mono uppercase bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                    Live
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-heading font-bold text-base text-white line-clamp-1 group-hover:text-cyan-300 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-slate-400">
                      <User className="w-3 h-3 text-cyan-400" /> @{article.author_name}
                    </span>
                    <span>•</span>
                    <span>{formatDate(article.published_at)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/news/${article.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-white"
                      title="View on site"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(article.id)}
                      disabled={deletingId === article.id}
                      className="p-1.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/40"
                      title="Delete article"
                    >
                      {deletingId === article.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* COMPOSE NEW DISPATCH MODAL */}
      {/* ========================================================================= */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl glass-panel rounded-3xl border border-cyan-500/30 shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 bg-[#090D14] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading font-black text-lg text-white">Compose News Transmission</h2>
                  <p className="text-xs text-slate-400">Publish live patch notes, changelogs, or community events.</p>
                </div>
              </div>

              <button
                onClick={() => setShowComposeModal(false)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handlePublish} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5 text-xs">
              
              {formError && (
                <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {publishSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Article published successfully! Redirecting...</span>
                </div>
              )}

              {/* Title & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold uppercase text-[10px] tracking-wider block">
                    Article Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Patch 2.5 — Custom Vehicles & Economy Overhaul"
                    className="w-full bg-surface-card border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500/60 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold uppercase text-[10px] tracking-wider block">
                    URL Slug (Auto-generated)
                  </label>
                  <input
                    type="text"
                    value={customSlug || computedSlug}
                    onChange={(e) => setCustomSlug(e.target.value)}
                    placeholder="patch-2-5-custom-vehicles"
                    className="w-full bg-surface-card border border-slate-800 rounded-xl p-3 text-cyan-300 font-mono focus:outline-none focus:border-cyan-500/60 text-xs"
                  />
                </div>
              </div>

              {/* Category & Author */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold uppercase text-[10px] tracking-wider block">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-surface-card border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500/60 text-xs"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-slate-900">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold uppercase text-[10px] tracking-wider block">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Head of Development"
                    className="w-full bg-surface-card border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500/60 text-xs"
                  />
                </div>
              </div>

              {/* Cover Image URL & Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold uppercase text-[10px] tracking-wider block">
                    Cover Banner Image URL
                  </label>
                  <span className="text-[10px] text-slate-500">Pick preset or paste custom URL</span>
                </div>

                <div className="flex flex-wrap gap-2 pb-1">
                  {IMAGE_PRESETS.map((p) => (
                    <button
                      type="button"
                      key={p.name}
                      onClick={() => setCoverImage(p.url)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border transition-all ${
                        coverImage === p.url
                          ? "bg-cyan-950/80 border-cyan-400 text-cyan-300 font-bold"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>

                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-surface-card border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500/60 text-xs font-mono"
                />
              </div>

              {/* Excerpt Summary */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold uppercase text-[10px] tracking-wider block">
                  Short Excerpt / Lead Summary <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A 1-2 sentence preview that appears on news cards and notifications..."
                  className="w-full bg-surface-card border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500/60 text-xs"
                />
              </div>

              {/* Full Content Body */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold uppercase text-[10px] tracking-wider block">
                    Full Article Content & Patch Notes <span className="text-red-400">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setContent((prev) => `${prev}\n\n### 🚀 New Additions\n- Item 1\n- Item 2`)}
                      className="text-[10px] text-cyan-400 hover:underline font-mono"
                    >
                      + Section
                    </button>
                    <button
                      type="button"
                      onClick={() => setContent((prev) => `${prev}\n- Fixed issue with `)}
                      className="text-[10px] text-cyan-400 hover:underline font-mono"
                    >
                      + Bullet
                    </button>
                  </div>
                </div>

                <textarea
                  rows={8}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`Write the full announcement here. Markdown headings (###), bullet points (-), and bold (**text**) are supported.\n\nExample:\n### 🚀 Major Highlights\n- Added 25+ new custom tuner vehicles at PDM.\n- Revamped police MDT system with live tracking.\n- Optimized city center FPS.`}
                  className="w-full bg-surface-card border border-slate-800 rounded-xl p-3.5 text-white font-mono leading-relaxed focus:outline-none focus:border-cyan-500/60 text-xs"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || publishSuccess}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-heading font-black text-xs tracking-wider flex items-center gap-2 hover:shadow-neon-cyan disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> PUBLISH DISPATCH
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
