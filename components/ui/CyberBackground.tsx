"use client";

import React, { useEffect, useRef } from "react";

export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Balanced Floating Neon Particle Orbs
    const particleCount = prefersReducedMotion ? 20 : 30;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() < 0.2 ? Math.random() * 2.5 + 2 : Math.random() * 1.8 + 0.6,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.6 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
      pulseDirection: Math.random() > 0.5 ? 1 : -1,
      isRed: Math.random() > 0.75, // 25% Crimson Red, 75% Neon Cyan
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Subtle pulsing opacity for a living particle field
        p.opacity += p.pulseSpeed * p.pulseDirection;
        if (p.opacity > 0.8) {
          p.opacity = 0.8;
          p.pulseDirection = -1;
        } else if (p.opacity < 0.15) {
          p.opacity = 0.15;
          p.pulseDirection = 1;
        }

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.isRed
          ? `rgba(255, 42, 85, ${p.opacity})`
          : `rgba(0, 240, 255, ${p.opacity})`;
        ctx.shadowBlur = p.isRed ? (p.size > 2.5 ? 16 : 10) : (p.size > 2.5 ? 18 : 12);
        ctx.shadowColor = p.isRed ? "rgba(255, 42, 85, 0.8)" : "rgba(0, 240, 255, 0.8)";
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Radial ambient background glows matching NOMIX palette */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px]" />
      <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[160px]" />
      <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[140px]" />

      {/* Subtle perspective grid lines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <canvas ref={canvasRef} className="absolute inset-0 opacity-85" />
    </div>
  );
}
