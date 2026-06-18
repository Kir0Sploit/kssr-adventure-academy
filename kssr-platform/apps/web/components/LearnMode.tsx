"use client";
import { useState } from "react";
import type { Locale, Topic } from "@kssr/shared";
import { audio } from "@/lib/audio";
import { speak, spell } from "@/lib/speak";

export default function LearnMode({
  topic,
  locale,
  onStart,
}: {
  topic: Topic;
  locale: Locale;
  onStart: () => void;
}) {
  const [i, setI] = useState(0);
  const cards = topic.flashcards;
  const card = cards[i];

  if (!card) {
    return (
      <div className="p-6 text-center">
        <p className="text-soft">{locale === "ms" ? "Mari bermain!" : "Let's play!"}</p>
        <button className="btn btn-go rounded-2xl px-8 py-4 mt-4 font-display text-lg" onClick={onStart}>
          ▶ {locale === "ms" ? "Main" : "Play"}
        </button>
      </div>
    );
  }

  const last = i === cards.length - 1;
  const go = (n: number) => { audio.click(); setI(n); };

  return (
    <div className="p-4 max-w-xl mx-auto w-full">
      <div className="flex justify-center gap-1.5 mb-3">
        {cards.map((_, idx) => (
          <span key={idx} className={`h-2.5 rounded-full transition-all ${idx === i ? "w-7 bg-amber-400" : "w-2.5 bg-black/15"}`} />
        ))}
      </div>
      <div className="card p-6 animate-pop sticker">
        <div className="text-7xl text-center animate-bobble">{card.illustration}</div>
        <h3 className="font-display text-2xl text-center mt-2 text-violet-700">{card.title[locale]}</h3>
        <p className="mt-3 text-center">{card.definition[locale]}</p>
        <div className="panel rounded-2xl p-3 mt-3 text-center font-bold text-violet-700">{card.example[locale]}</div>
        <div className="mt-3 text-sm text-amber-600 font-bold">💡 {card.funFact[locale]}</div>
        <div className="flex gap-2 mt-3 justify-center flex-wrap">
          <button
            className="btn !min-h-0 btn-sky rounded-full px-4 py-2 text-sm font-display"
            onClick={() => speak(card.pronunciation?.text ?? card.title[locale], card.pronunciation?.locale ?? locale)}
          >
            🔊 {locale === "ms" ? "Dengar" : "Listen"}
          </button>
          <button
            className="btn !min-h-0 rounded-full px-4 py-2 text-sm font-display"
            onClick={() => spell(card.pronunciation?.text ?? card.title[locale], card.pronunciation?.locale ?? locale)}
          >
            🔤 {locale === "ms" ? "Eja" : "Spell"}
          </button>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        {i > 0 && (
          <button className="btn rounded-2xl px-5 py-3 font-display" onClick={() => go(i - 1)}>←</button>
        )}
        {!last ? (
          <button className="btn btn-primary rounded-2xl px-5 py-3 font-display flex-1" onClick={() => go(i + 1)}>
            {locale === "ms" ? "Seterusnya" : "Next"} →
          </button>
        ) : (
          <button className="btn btn-go rounded-2xl px-5 py-3 font-display flex-1" onClick={onStart}>
            🎮 {locale === "ms" ? "Pilih Permainan" : "Pick a Game"}
          </button>
        )}
      </div>
    </div>
  );
}
