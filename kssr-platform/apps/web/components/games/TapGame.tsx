"use client";
import { useEffect, useMemo, useState } from "react";
import { PRAISE, ENCOURAGE } from "@kssr/shared";
import type { ChallengeOption } from "@kssr/shared";
import { audio } from "@/lib/audio";
import { confetti } from "@/lib/confetti";
import { speak, stopSpeaking } from "@/lib/speak";
import { getQuestions, optionLabel, promptText, rewardFor, shuffle, type GameModeProps } from "@/lib/gameUtils";

const TOTAL = 6; // shorter for little learners
const TILE = ["🟦", "🟩", "🟧", "🟪"];

export default function TapGame({ topic, locale, accent, onAnswer, onReward, onComplete, onBack }: GameModeProps) {
  const isMs = locale === "ms";
  const questions = useMemo(() => getQuestions(topic, TOTAL), [topic]);
  const [idx, setIdx] = useState(0);
  const [opts, setOpts] = useState<ChallengeOption[]>(() => shuffle(questions[0]?.options ?? []));
  const [done, setDone] = useState(false);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [happy, setHappy] = useState("");

  const q = questions[idx];

  // Read the question aloud whenever it changes.
  useEffect(() => {
    if (q) speak(promptText(q, locale), locale);
    return () => stopSpeaking();
  }, [idx, locale, q]);

  if (!q) return null;

  const advance = (nc: number) => {
    if (idx + 1 >= TOTAL) {
      onComplete({ answered: TOTAL, correct: nc, accuracy: nc / TOTAL });
      return;
    }
    const ni = idx + 1;
    setIdx(ni);
    setOpts(shuffle(questions[ni]!.options));
    setWrongIds([]);
    setDone(false);
    setHappy("");
  };

  const tap = (o: ChallengeOption) => {
    if (done) return;
    onAnswer(q, o.correct);
    if (o.correct) {
      setDone(true);
      audio.correct();
      audio.coin();
      confetti(16);
      const nc = correctCount + 1;
      setCorrectCount(nc);
      onReward(rewardFor(wrongIds.length));
      const line = PRAISE[locale][Math.floor(Math.random() * PRAISE[locale].length)]!;
      setHappy(line);
      speak(line, locale);
      setTimeout(() => advance(nc), 950);
    } else {
      audio.wrong();
      setWrongIds((w) => [...w, o.id]);
      const line = ENCOURAGE[locale][Math.floor(Math.random() * ENCOURAGE[locale].length)]!;
      setHappy(line);
    }
  };

  return (
    <div className="p-3 max-w-xl mx-auto w-full animate-slideUp">
      <div className="flex items-center gap-2 mb-3">
        <button className="btn !min-h-0 rounded-2xl px-4 py-2" onClick={onBack}>← {isMs ? "Kembali" : "Back"}</button>
        <div className="flex-1 flex justify-center gap-1">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <span key={i} className="text-xl">{i < idx ? "⭐" : i === idx ? "✨" : "☆"}</span>
          ))}
        </div>
      </div>

      <div className="card p-6 text-center sticker">
        <p className="font-display text-3xl leading-snug text-violet-700">{promptText(q, locale)}</p>
        <button
          className="btn !min-h-0 btn-sky rounded-full px-5 py-2 mt-3 font-display"
          onClick={() => speak(promptText(q, locale), locale)}
        >
          🔊 {isMs ? "Dengar lagi" : "Say it again"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {opts.map((o, i) => {
          const isWrong = wrongIds.includes(o.id);
          return (
            <button
              key={o.id}
              disabled={done || isWrong}
              onClick={() => tap(o)}
              className="btn rounded-3xl px-5 py-6 font-display text-2xl flex items-center gap-3"
              style={
                done && o.correct
                  ? { background: "#36b14f", color: "#fff", boxShadow: "0 6px 0 #1f8a3a" }
                  : isWrong
                    ? { background: "#f3b1b1", color: "#7a2020" }
                    : undefined
              }
            >
              <span className="text-2xl">{TILE[i % TILE.length]}</span>
              <span>{optionLabel(o, locale)}</span>
            </button>
          );
        })}
      </div>

      <div className="text-center mt-4 min-h-[34px] font-display text-2xl" style={{ color: done ? "#36b14f" : "#e07a7a" }}>
        {happy}
      </div>
    </div>
  );
}
