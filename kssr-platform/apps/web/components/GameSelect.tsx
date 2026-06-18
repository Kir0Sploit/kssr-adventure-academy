"use client";
import type { Locale, Topic } from "@kssr/shared";
import { GAME_MODES, type GameModeDef } from "@/lib/games";
import { audio } from "@/lib/audio";

function ModeCard({ m, locale, onPick }: { m: GameModeDef; locale: Locale; onPick: (id: string) => void }) {
  return (
    <button
      className="btn card p-4 text-left flex items-center gap-3"
      style={{ borderTop: `8px solid ${m.color}` }}
      onClick={() => { audio.click(); onPick(m.id); }}
    >
      <span className="text-3xl grid place-items-center rounded-2xl w-14 h-14 shrink-0" style={{ background: `${m.color}26` }}>
        {m.icon}
      </span>
      <span className="min-w-0">
        <span className="block font-display text-lg">{m.name[locale]}</span>
        <span className="block text-xs text-soft">{m.desc[locale]}</span>
      </span>
    </button>
  );
}

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
  const easy = GAME_MODES.filter((m) => m.easy);
  const rest = GAME_MODES.filter((m) => !m.easy);

  return (
    <section className="p-3 sm:p-5 max-w-2xl mx-auto w-full animate-slideUp">
      <div className="flex items-center gap-2 mb-3">
        <button className="btn !min-h-0 rounded-2xl px-4 py-2" onClick={onBack}>← {isMs ? "Kembali" : "Back"}</button>
        <h2 className="font-display text-xl text-violet-700 truncate">{topic.icon} {topic.title[locale]}</h2>
      </div>

      {/* Learn first */}
      <button
        className="btn card w-full p-4 text-left mb-4 flex items-center gap-4 sticker"
        onClick={() => { audio.click(); onLearn(); }}
        style={{ borderTop: "8px solid #22c55e" }}
      >
        <span className="text-4xl animate-bobble">📇</span>
        <span className="flex-1">
          <span className="block font-display text-lg">{isMs ? "Kad Imbas (Belajar)" : "Flashcards (Learn)"}</span>
          <span className="block text-xs text-soft">{isMs ? "Belajar dahulu" : "Learn it first"}</span>
        </span>
        <span className="text-2xl">👉</span>
      </button>

      <h3 className="font-display text-sm text-soft mb-2 flex items-center gap-1">🧸 {isMs ? "Untuk Pemula" : "Little Learners"}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {easy.map((m) => <ModeCard key={m.id} m={m} locale={locale} onPick={onPickMode} />)}
      </div>

      <h3 className="font-display text-sm text-soft mb-2 flex items-center gap-1">🚀 {isMs ? "Cabaran" : "Challenge"}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {rest.map((m) => <ModeCard key={m.id} m={m} locale={locale} onPick={onPickMode} />)}
      </div>
    </section>
  );
}
