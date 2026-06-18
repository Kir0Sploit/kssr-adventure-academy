"use client";
import { useEffect, useMemo, useState } from "react";
import { PRAISE, ENCOURAGE } from "@kssr/shared";
import { audio } from "@/lib/audio";
import { getQuestions, optionLabel, promptText, rewardFor, shuffle, type GameModeProps } from "@/lib/gameUtils";

const TOTAL = 8;
const BUBBLE_COLORS = ["#8b5cf6", "#3b82f6", "#06b6d4", "#ec4899", "#f59e0b"];

export default function BubbleGame({ topic, locale, accent, onAnswer, onReward, onComplete, onBack }: GameModeProps) {
  const isMs = locale === "ms";
  const questions = useMemo(() => getQuestions(topic, TOTAL), [topic]);
  const [round, setRound] = useState(0);
  const [nonce, setNonce] = useState(0);
  const [popped, setPopped] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState("");

  const q = questions[round];
  const bubbles = useMemo(() => shuffle(q?.options ?? []), [q, nonce]);

  useEffect(() => {
    if (!q) return;
    const id = window.setTimeout(() => {
      setPopped([]);
      setNonce((n) => n + 1);
    }, 8000);
    return () => window.clearTimeout(id);
  }, [round, nonce, q]);

  if (!q) return null;

  const advance = (nc: number) => {
    if (round + 1 >= TOTAL) {
      onComplete({ answered: TOTAL, correct: nc, accuracy: nc / TOTAL });
      return;
    }
    setRound((r) => r + 1);
    setNonce((n) => n + 1);
    setPopped([]);
    setFeedback("");
  };

  const tap = (optId: string, correct: boolean) => {
    if (popped.includes(optId)) return;
    onAnswer(q, correct);
    if (correct) {
      audio.correct();
      audio.coin();
      const nc = correctCount + 1;
      setCorrectCount(nc);
      onReward(rewardFor(attempts));
      setFeedback(PRAISE[locale][Math.floor(Math.random() * PRAISE[locale].length)]!);
      setTimeout(() => advance(nc), 550);
    } else {
      audio.wrong();
      setAttempts((a) => a + 1);
      setPopped((p) => [...p, optId]);
      setFeedback(ENCOURAGE[locale][Math.floor(Math.random() * ENCOURAGE[locale].length)]!);
    }
  };

  return (
    <div className="p-3 max-w-xl mx-auto w-full animate-slideUp">
      <div className="flex items-center gap-2 mb-2">
        <button className="btn !min-h-0 rounded-2xl px-4 py-2" onClick={onBack}>← {isMs ? "Kembali" : "Back"}</button>
        <div className="flex-1 h-3 rounded-full bg-black/10 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${(round / TOTAL) * 100}%`, background: accent }} />
        </div>
        <span className="font-display text-sm">{round + 1}/{TOTAL}</span>
      </div>

      <div className="card p-4 text-center mb-2 sticker">
        <p className="font-display text-xl leading-snug text-violet-700">{promptText(q, locale)}</p>
        <p className="text-xs text-soft mt-1">{isMs ? "Ketik buih jawapan betul!" : "Tap the correct answer bubble!"}</p>
      </div>

      <div
        className="relative w-full h-[52vh] rounded-3xl overflow-hidden border-[3px] border-white"
        style={{ background: "linear-gradient(180deg,#cdeffe,#eafaff)" }}
        key={`${round}-${nonce}`}
      >
        {bubbles.map((o, i) => {
          if (popped.includes(o.id)) return null;
          const left = ((i + 1) / (bubbles.length + 1)) * 100;
          const dur = 7 + (i % 3);
          const color = BUBBLE_COLORS[i % BUBBLE_COLORS.length];
          return (
            <button
              key={o.id + nonce}
              onClick={() => tap(o.id, o.correct)}
              className="absolute -translate-x-1/2 rounded-full grid place-items-center font-display text-center text-white"
              style={{
                left: `${left}%`,
                width: "5.6rem",
                height: "5.6rem",
                background: `radial-gradient(circle at 35% 30%, #ffffffaa, ${color})`,
                border: "3px solid rgba(255,255,255,.7)",
                boxShadow: "0 6px 12px rgba(0,0,0,.18)",
                animation: `rise ${dur}s linear forwards`,
                animationDelay: `${(i % 3) * 0.5}s`,
                fontSize: "0.95rem",
                padding: "0.4rem",
                lineHeight: 1.05,
              }}
            >
              {optionLabel(o, locale)}
            </button>
          );
        })}
      </div>

      <div className="text-center mt-2 min-h-[28px] font-display text-lg" style={{ color: feedback && PRAISE[locale].includes(feedback) ? "#36b14f" : "#e07a7a" }}>
        {feedback}
      </div>
    </div>
  );
}
