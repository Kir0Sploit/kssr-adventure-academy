"use client";
import type { Locale, Topic } from "@kssr/shared";
import { GAME_MODES } from "@/lib/games";
import { audio } from "@/lib/audio";

export default function GameSelect({
  topic,
  locale,
  accent,
  onLearn,
  onPickMode,
  onBack,
}: {
  topic: Topic;
  locale: Locale;
  accent: string;
  onLearn: () => void;
  onPickMode: (id: string) => void;
  onBack: () => void;
}) {
  const isMs = locale === "ms";
  return (
    <section className="p-3 sm:p-5 max-w-2xl mx-auto w-full animate-slideUp">
      <div className="flex items-center gap-2 mb-3">
        <button className="btn glass rounded-xl px-3 py-2 text-sm font-bold" onClick={onBack}>
          ← {isMs ? "Kembali" : "Back"}
        </button>
        <h2 className="text-lg sm:text-xl font-black text-shadow truncate">
          {topic.icon} {topic.title[locale]}
        </h2>
      </div>
      <p className="text-center text-sm opacity-75 mb-4">
        {isMs ? "Pilih cara anda mahu bermain!" : "Choose how you want to play!"}
      </p>

      {/* Learn card (recommended first) */}
      <button
        className="btn glass card w-full p-4 text-left mb-3 flex items-center gap-4 shine"
        onClick={() => { audio.click(); onLearn(); }}
        style={{ borderLeft: "6px solid #22c55e" }}
      >
        <span className="text-4xl">📇</span>
        <span className="flex-1">
          <span className="block font-black text-lg">{isMs ? "Kad Imbas (Belajar)" : "Flashcards (Learn)"}</span>
          <span className="block text-xs opacity-70">{isMs ? "Belajar dahulu sebelum bermain" : "Learn first before you play"}</span>
        </span>
        <span className="opacity-50">›</span>
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {GAME_MODES.map((m, i) => (
          <button
            key={m.id}
            className="btn card p-4 text-left flex items-center gap-3 animate-slideUp"
            style={{
              background: "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.12)",
              borderLeft: `6px solid ${m.color}`,
              animationDelay: `${i * 60}ms`,
            }}
            onClick={() => { audio.click(); onPickMode(m.id); }}
          >
            <span
              className="text-3xl grid place-items-center rounded-2xl w-14 h-14 shrink-0"
              style={{ background: `${m.color}33` }}
            >
              {m.icon}
            </span>
            <span className="min-w-0">
              <span className="block font-black">{m.name[locale]}</span>
              <span className="block text-xs opacity-70">{m.desc[locale]}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
