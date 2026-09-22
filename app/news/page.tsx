"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, User, ChevronRight, Search, Globe, Tag } from "lucide-react";
import { NewsArticle, NewsCategory } from "@/types";
import { formatDate } from "@/lib/utils";

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    Promise.all([
      fetch(`/api/news?_t=${Date.now()}`, { cache: "no-store" }),
      fetch(`/api/news/categories?_t=${Date.now()}`, { cache: "no-store" })
    ])
      .then(async ([newsRes, catRes]) => {
        if (newsRes.ok) {
          const newsData = await newsRes.json();
          const list = Array.isArray(newsData) ? newsData : (newsData.articles || []);
          setArticles(list);
        }
        if (catRes.ok) {
          const catData = await catRes.json();
          if (Array.isArray(catData)) setCategories(catData);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("News load error:", err);
        setLoading(false);
      });
  }, []);

  const filteredArticles = articles.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(search.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      art.content.toLowerCase().includes(search.toLowerCase());
      
    const matchesCat =
      selectedCategory === "all" ||
      art.category_id === selectedCategory ||
      art.category?.slug === selectedCategory;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="font-heading font-black text-4xl sm:text-5xl text-metallic">
          NEWS & ANNOUNCEMENTS
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm">
          Stay informed on major server updates, development patch notes, community events, and faction news.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search news & changelogs..."
            className="w-full bg-surface-card border border-slate-800 rounded-xl py-2 pl-10 pr-3.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold capitalize transition-all ${
              selectedCategory === "all"
                ? "bg-cyan-500 text-black font-bold shadow-neon-cyan-sm"
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            All Dispatches
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug || cat.id)}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold capitalize transition-all ${
                selectedCategory === cat.slug || selectedCategory === cat.id
                  ? "bg-cyan-500 text-black font-bold shadow-neon-cyan-sm"
                  : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs sm:text-sm font-mono text-slate-300">Loading articles...</span>
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl border border-slate-800 space-y-3">
          <Globe className="w-8 h-8 text-cyan-400 mx-auto" />
          <h3 className="font-heading font-bold text-white text-lg">No News Articles Found</h3>
          <p className="text-xs sm:text-sm text-slate-300">There are currently no published dispatches matching your filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <Link
              key={article.id}
              href={`/news/${article.slug}`}
              className="glass-panel rounded-2xl overflow-hidden border border-white/10 hover:border-cyan-500/50 transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="relative h-56 w-full bg-slate-950 overflow-hidden">
                <Image
                  src={article.cover_image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80"}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/40 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded text-xs font-mono font-bold bg-black/85 backdrop-blur-md border border-white/15 text-cyan-400">
                    {article.category?.name || "Dispatch"}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300 mb-2.5">
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

                  <h3 className="font-heading font-bold text-xl sm:text-2xl text-white group-hover:text-cyan-300 transition-colors mb-2.5 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs sm:text-sm font-semibold text-cyan-400">
                  <span>Read Full Story</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}
