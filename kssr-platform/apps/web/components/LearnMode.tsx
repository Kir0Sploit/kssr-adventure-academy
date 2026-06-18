"use client";
import { useState } from "react";
import type { Locale, Topic } from "@kssr/shared";
import { audio } from "@/lib/audio";

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

  const speak = (text: string, loc: Locale) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = loc === "ms" ? "ms-MY" : "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  if (!card) {
    return (
      <div className="p-6 text-center">
        <p className="opacity-80">{locale === "ms" ? "Mari bermain!" : "Let's play!"}</p>
        <button className="btn grad rounded-2xl px-8 py-4 mt-4 font-black text-lg" onClick={onStart}>
          ▶ {locale === "ms" ? "Main" : "Play"}
        </button>
      </div>
    );
  }

  const last = i === cards.length - 1;
  const go = (n: number) => {
    audio.click();
    setI(n);
  };
  return (
    <div className="p-4 max-w-xl mx-auto w-full">
      <div className="flex justify-center gap-1.5 mb-3">
        {cards.map((_, idx) => (
          <span key={idx} className={`h-2 rounded-full transition-all ${idx === i ? "w-6 bg-cyan-300" : "w-2 bg-white/20"}`} />
        ))}
      </div>
      <div className="glass card p-6 animate-pop">
        <div className="text-7xl text-center animate-floaty">{card.illustration}</div>
        <h3 className="text-2xl font-black text-center mt-2">{card.title[locale]}</h3>
        <p className="mt-3 text-center text-white/90">{card.definition[locale]}</p>
        <div className="glass rounded-2xl p-3 mt-3 text-center font-semibold">{card.example[locale]}</div>
        <div className="mt-3 text-sm text-yellow-200">💡 {card.funFact[locale]}</div>
        {card.pronunciation && (
          <button
            className="btn glass rounded-xl px-4 py-2 mt-3 text-sm"
            onClick={() => speak(card.pronunciation!.text, card.pronunciation!.locale)}
          >
            🔊 {locale === "ms" ? "Dengar" : "Listen"}
          </button>
        )}
      </div>
      <div className="flex gap-2 mt-4">
        {i > 0 && (
          <button className="btn glass rounded-2xl px-5 py-3 font-bold" onClick={() => go(i - 1)}>
            ←
          </button>
        )}
        {!last ? (
          <button className="btn grad rounded-2xl px-5 py-3 font-black flex-1" onClick={() => go(i + 1)}>
            {locale === "ms" ? "Seterusnya" : "Next"} →
          </button>
        ) : (
          <button className="btn grad rounded-2xl px-5 py-3 font-black flex-1 shine" onClick={onStart}>
            ▶ {locale === "ms" ? "Main Sekarang" : "Play Now"}
          </button>
        )}
      </div>
    </div>
  );
}
