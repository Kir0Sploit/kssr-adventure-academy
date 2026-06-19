"use client";
import type { CSSProperties } from "react";

/** Custom SVG wordmark + badge (owl + graduation cap) — hand-drawn, not emoji. */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 select-none">
      <svg width="40" height="40" viewBox="0 0 48 48" aria-hidden className="shrink-0">
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7c5cff" />
            <stop offset="1" stopColor="#19b6e8" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#lg)" />
        {/* owl */}
        <circle cx="18" cy="24" r="6.5" fill="#fff" />
        <circle cx="30" cy="24" r="6.5" fill="#fff" />
        <circle cx="18" cy="24" r="3" fill="#2b2350" />
        <circle cx="30" cy="24" r="3" fill="#2b2350" />
        <path d="M21 30 q3 3 6 0" stroke="#ffd23f" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        {/* graduation cap */}
        <path d="M24 9 L37 15 L24 21 L11 15 Z" fill="#2b2350" />
        <path d="M33 17 v6" stroke="#ffd23f" strokeWidth="2" strokeLinecap="round" />
        <circle cx="33" cy="24" r="1.6" fill="#ffd23f" />
      </svg>
      {!compact && (
        <span className="leading-none">
          <span className="block font-display text-base sm:text-lg text-violet-700">KSSR Adventure</span>
          <span className="block text-[10px] tracking-[0.2em] font-bold text-sky-600 uppercase">Academy</span>
        </span>
      )}
    </span>
  );
}

type IconName = "play" | "star" | "shield" | "chart" | "book" | "voice" | "offline" | "spark" | "heart" | "medal" | "check" | "lock";

const PATHS: Record<IconName, string> = {
  play: "M8 5v14l11-7z",
  star: "M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z",
  shield: "M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  book: "M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z M18 3v18",
  voice: "M12 3v18M7 8v8M17 8v8M3 11v2M21 11v2",
  offline: "M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01",
  spark: "M12 2v6M12 16v6M2 12h6M16 12h6M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3",
  heart: "M12 21s-7-4.6-9.3-9C1 8.5 3 5 6.5 5 9 5 12 8 12 8s3-3 5.5-3C21 5 23 8.5 21.3 12 19 16.4 12 21 12 21z",
  medal: "M8 4l4 7 4-7M12 11v4M9 18a3 3 0 1 0 6 0 3 3 0 0 0-6 0z",
  check: "M5 13l4 4L19 7",
  lock: "M6 11V8a6 6 0 0 1 12 0v3M5 11h14v10H5z",
};

const FILLED: Set<IconName> = new Set(["play", "star", "heart"]);

export function Icon({ name, size = 24, color = "currentColor", style }: { name: IconName; size?: number; color?: string; style?: CSSProperties }) {
  const filled = FILLED.has(name);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={style}
      fill={filled ? color : "none"} stroke={filled ? "none" : color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d={PATHS[name]} />
    </svg>
  );
}
