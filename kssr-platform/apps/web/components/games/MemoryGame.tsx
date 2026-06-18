"use client";
import { useMemo, useState } from "react";
import type { Challenge } from "@kssr/shared";
import { audio } from "@/lib/audio";
import { optionLabel, promptText, shuffle, type GameModeProps } from "@/lib/gameUtils";

interface Card {
  key: string;
  pairId: number;
  text: string;
  kind: "q" | "a";
  challenge: Challenge;
}

const MAX_PAIRS = 4;

function clip(s: string, n = 46): string {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export default function MemoryGame({ topic, locale, accent, onAnswer, onReward, onComplete, onBack }: GameModeProps) {
  const isMs = locale === "ms";
  const pairs = Math.min(MAX_PAIRS, topic.challenges.length);

  const cards = useMemo<Card[]>(() => {
    const chosen = shuffle(topic.challenges).slice(0, pairs);
    const list: Card[] = [];
    chosen.forEach((c, i) => {
      const correct = c.options.find((o) => o.correct)!;
      list.push({ key: `q-${i}`, pairId: i, text: clip(promptText(c, locale)), kind: "q", challenge: c });
      list.push({ key: `a-${i}`, pairId: i, text: clip(optionLabel(correct, locale), 22), kind: "a", challenge: c });
    });
    return shuffle(list);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, locale]);

  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [mismatches, setMismatches] = useState(0);

  const flip = (card: Card) => {
    if (busy || flipped.includes(card.key) || matched.includes(card.pairId)) return;
    audio.click();
    const nf = [...flipped, card.key];
    setFlipped(nf);
    if (nf.length < 2) return;

    setBusy(true);
    const first = cards.find((c) => c.key === nf[0])!;
    const second = card;
    if (first.pairId === second.pairId) {
      audio.correct();
      audio.coin();
      onAnswer(second.challenge, true);
      onReward({ coins: 10, xp: 12, stars: 1 });
      const nm = [...matched, second.pairId];
      setMatched(nm);
      setFlipped([]);
      setBusy(false);
      if (nm.length >= pairs) {
        const total = pairs + mismatches;
        onComplete({ answered: pairs, correct: pairs, accuracy: total ? pairs / total : 1 });
      }
    } else {
      audio.wrong();
      onAnswer(second.challenge, false);
      setMismatches((m) => m + 1);
      setTimeout(() => {
        setFlipped([]);
        setBusy(false);
      }, 800);
    }
  };

  if (pairs < 2) {
    return (
      <div className="p-6 text-center">
        <p className="opacity-80 mb-4">{isMs ? "Topik ini belum cukup soalan untuk padanan." : "Not enough questions for matching yet."}</p>
        <button className="btn glass rounded-2xl px-6 py-3 font-bold" onClick={onBack}>← {isMs ? "Kembali" : "Back"}</button>
      </div>
    );
  }

  return (
    <div className="p-3 max-w-xl mx-auto w-full animate-slideUp">
      <div className="flex items-center gap-2 mb-3">
        <button className="btn glass rounded-xl px-3 py-2 text-sm font-bold" onClick={onBack}>← {isMs ? "Kembali" : "Back"}</button>
        <span className="font-bold text-sm ml-auto">🧩 {matched.length}/{pairs}</span>
      </div>
      <p className="text-center text-sm opacity-70 mb-3">
        {isMs ? "Padankan soalan dengan jawapan betul." : "Match each question with its correct answer."}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {cards.map((c) => {
          const isUp = flipped.includes(c.key) || matched.includes(c.pairId);
          const isMatched = matched.includes(c.pairId);
          return (
            <button
              key={c.key}
              onClick={() => flip(c)}
              className="btn rounded-2xl aspect-[3/4] p-2 text-center grid place-items-center font-bold text-sm transition-all"
              style={{
                background: isMatched
                  ? "rgba(34,197,94,.25)"
                  : isUp
                    ? c.kind === "q"
                      ? "rgba(255,255,255,.12)"
                      : accent
                    : "rgba(255,255,255,.06)",
                border: `1px solid ${isMatched ? "#22c55e" : "rgba(255,255,255,.15)"}`,
                transform: isUp ? "rotateY(0deg)" : undefined,
              }}
            >
              {isUp ? <span className="leading-tight">{c.text}</span> : <span className="text-2xl opacity-60">❓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
