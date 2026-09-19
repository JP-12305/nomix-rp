"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, Play, Sparkles, ExternalLink } from "lucide-react";

const MEDIA_GALLERY = [
  {
    title: "Vinewood Night Drive",
    category: "Vehicles",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800",
  },
  {
    title: "Downtown LSPD Pursuit",
    category: "Action",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800",
  },
  {
    title: "Pacific Standard Heist",
    category: "Underground",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800",
  },
  {
    title: "Mount Zonah Air Medevac",
    category: "Emergency",
    image: "https://images.unsplash.com/photo-1587745416684-47953f16f02f?q=80&w=800",
  },
];

export default function MediaPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-cyan-500/30 text-xs font-mono text-cyan-400">
          <Camera className="w-3.5 h-3.5" />
          <span>CINEMATIC MOMENTS & CLIPS</span>
        </div>
        <h1 className="font-heading font-black text-4xl sm:text-5xl text-metallic">
          COMMUNITY MEDIA GALLERY
        </h1>
        <p className="text-slate-300 text-sm sm:text-base">
          Moments captured by citizens, content creators, and server cinematographers across Los Santos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {MEDIA_GALLERY.map((item, idx) => (
          <div
            key={idx}
            className="group relative h-72 rounded-2xl overflow-hidden glass-panel border border-white/5 hover:border-cyan-500/40 transition-all duration-500"
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            
            <div className="absolute top-4 left-4">
              <span className="px-2.5 py-1 rounded bg-black/70 text-[10px] font-mono text-cyan-400 border border-white/10 uppercase">
                {item.category}
              </span>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
              <h3 className="font-heading font-bold text-xl text-white group-hover:text-cyan-300 transition-colors">
                {item.title}
              </h3>
              <div className="p-3 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                <Play className="w-4 h-4 fill-current" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
