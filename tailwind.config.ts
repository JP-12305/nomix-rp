import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#06080C",
        surface: {
          DEFAULT: "#0B0F17",
          hover: "#111827",
          elevated: "#151D2E",
          card: "#0E1420",
        },
        cyan: {
          DEFAULT: "#00F0FF",
          glow: "#00E5FF",
          dim: "#0284C7",
          dark: "#083344",
        },
        red: {
          accent: "#FF2A55",
          glow: "#E11D48",
          dark: "#4C0519",
        },
        silver: {
          DEFAULT: "#E2E8F0",
          muted: "#94A3B8",
          dark: "#334155",
        }
      },
      fontFamily: {
        sans: ["var(--font-rajdhani)", "var(--font-inter)", "sans-serif"],
        heading: ["var(--font-orbitron)", "var(--font-rajdhani)", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "0.95rem" }],    // 11px
        "xs": ["0.75rem", { lineHeight: "1.125rem" }],       // 12px
        "sm": ["0.8125rem", { lineHeight: "1.25rem" }],      // 13px
        "base": ["0.875rem", { lineHeight: "1.375rem" }],    // 14px
        "lg": ["1rem", { lineHeight: "1.5rem" }],            // 16px
        "xl": ["1.125rem", { lineHeight: "1.6rem" }],        // 18px
        "2xl": ["1.375rem", { lineHeight: "1.85rem" }],      // 22px
        "3xl": ["1.75rem", { lineHeight: "2.1rem" }],        // 28px
        "4xl": ["2.125rem", { lineHeight: "2.4rem" }],       // 34px
        "5xl": ["2.75rem", { lineHeight: "1.15" }],          // 44px
        "6xl": ["3.5rem", { lineHeight: "1.1" }],            // 56px
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "cyan-glow-radial": "radial-gradient(circle at 50% 0%, rgba(0, 240, 255, 0.15), transparent 70%)",
        "red-glow-radial": "radial-gradient(circle at 80% 80%, rgba(255, 42, 85, 0.08), transparent 60%)",
        "metallic-shine": "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 100%)",
      },
      boxShadow: {
        "neon-cyan": "0 0 25px rgba(0, 240, 255, 0.25), 0 0 50px rgba(0, 240, 255, 0.1)",
        "neon-cyan-sm": "0 0 10px rgba(0, 240, 255, 0.3)",
        "neon-red": "0 0 25px rgba(255, 42, 85, 0.3), 0 0 50px rgba(255, 42, 85, 0.1)",
        "glass-panel": "0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-cyan": "glowCyan 3s ease-in-out infinite alternate",
        "scanline": "scanline 8s linear infinite",
      },
      keyframes: {
        glowCyan: {
          "0%": { boxShadow: "0 0 15px rgba(0, 240, 255, 0.2)" },
          "100%": { boxShadow: "0 0 35px rgba(0, 240, 255, 0.45)" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
