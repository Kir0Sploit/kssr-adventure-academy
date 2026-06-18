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
      <div className="panel rounded-3xl flex items-center gap-1.5 sm:gap-2 flex-wrap p-2 text-sm">
        <span className="chip px-2.5 py-1.5 flex items-center gap-1">
          <span className="text-lg">{s.avatar}</span>
          <span className="font-display">{s.name}</span>
        </span>
        <span className="chip px-2.5 py-1.5 text-amber-600">⭐ {s.stars}</span>
        <span className="chip px-2.5 py-1.5 text-amber-700">🪙 {s.coins}</span>
        <span className="chip px-2.5 py-1.5 text-sky-700 hidden sm:inline">🧠 {s.knowledgePoints}</span>
        <div className="chip px-3 py-1.5 min-w-[128px] flex-1 sm:flex-none">
          <div className="text-[10px] text-soft truncate font-bold">Lv {s.level} · {s.rank()}</div>
          <div className="h-2 rounded-full bg-black/10 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#5ad06a,#58b6ff)" }} />
          </div>
        </div>
        <button className="btn !min-h-0 rounded-2xl px-3 py-2 btn-primary ml-auto" onClick={onParent} aria-label="Parent dashboard">
          📊
        </button>
        <button className="btn !min-h-0 rounded-2xl px-3 py-2" onClick={toggleAudio} aria-label="Toggle sound">
          {s.audioOn ? "🔊" : "🔇"}
        </button>
        <button
          className="btn !min-h-0 rounded-2xl px-3 py-2 btn-sky"
          onClick={() => s.setLocale(s.locale === "en" ? "ms" : "en")}
          aria-label="Toggle language"
        >
          {s.locale === "en" ? "EN" : "BM"}
        </button>
      </div>
    </header>
  );
}
