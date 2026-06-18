"use client";
import { useProgress } from "@/lib/store";
import { audio } from "@/lib/audio";
import { xpForLevel } from "@kssr/shared";

export default function Hud({ onParent }: { onParent: () => void }) {
  const s = useProgress();
  const pct = Math.min(100, (s.xp / xpForLevel(s.level)) * 100);

  const toggleAudio = () => {
    const next = !s.audioOn;
    s.setAudio(next);
    audio.unlock();
    audio.setMuted(!next);
    if (next) audio.startMusic();
    else audio.stopMusic();
  };

  return (
    <header className="sticky top-0 z-30 px-2 py-2">
      <div className="glass rounded-2xl flex items-center gap-1.5 sm:gap-2 flex-wrap p-1.5 text-xs sm:text-sm font-extrabold">
        <span className="rounded-xl px-2.5 py-1.5 bg-white/5">{s.avatar} {s.name}</span>
        <span className="rounded-xl px-2.5 py-1.5 bg-white/5 text-yellow-300">⭐ {s.stars}</span>
        <span className="rounded-xl px-2.5 py-1.5 bg-white/5 text-amber-400">🪙 {s.coins}</span>
        <span className="rounded-xl px-2.5 py-1.5 bg-white/5 text-cyan-300 hidden sm:inline">🧠 {s.knowledgePoints}</span>
        <div className="rounded-xl px-2.5 py-1 bg-white/5 min-w-[120px] flex-1 sm:flex-none">
          <div className="text-[10px] opacity-70 truncate">Lv {s.level} · {s.rank()}</div>
          <div className="h-1.5 rounded-full bg-black/40 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#22c55e,#06b6d4)" }} />
          </div>
        </div>
        <button className="btn rounded-xl px-2.5 grad-gold text-black ml-auto" onClick={onParent} aria-label="Parent dashboard">
          📊
        </button>
        <button className="btn rounded-xl px-2.5 bg-white/10" onClick={toggleAudio} aria-label="Toggle sound">
          {s.audioOn ? "🔊" : "🔇"}
        </button>
        <button
          className="btn rounded-xl px-2.5 bg-white/10"
          onClick={() => s.setLocale(s.locale === "en" ? "ms" : "en")}
          aria-label="Toggle language"
        >
          {s.locale === "en" ? "EN" : "BM"}
        </button>
      </div>
    </header>
  );
}
