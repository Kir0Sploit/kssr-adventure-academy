"use client";
import { useMemo, useState } from "react";
import { PRAISE, ENCOURAGE } from "@kssr/shared";
import type { ChallengeOption } from "@kssr/shared";
import { audio } from "@/lib/audio";
import { getQuestions, optionLabel, promptText, rewardFor, shuffle, type GameModeProps } from "@/lib/gameUtils";

const DEFAULT_TOTAL = 8;

export default function QuizGame({ topic, locale, accent, rounds, onAnswer, onReward, onComplete, onBack }: GameModeProps) {
  const TOTAL = rounds ?? DEFAULT_TOTAL;
  const questions = useMemo(() => getQuestions(topic, TOTAL), [topic]);
  const [idx, setIdx] = useState(0);
  const [opts, setOpts] = useState<ChallengeOption[]>(() => shuffle(questions[0]?.options ?? []));
  const [picked, setPicked] = useState<string | null>(null);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [dimmed, setDimmed] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState("");
  const isMs = locale === "ms";

  const q = questions[idx];
  if (!q) return null;

  const next = (nc: number) => {
    if (idx + 1 >= TOTAL) {
      onComplete({ answered: TOTAL, correct: nc, accuracy: nc / TOTAL });
      return;
    }
    const ni = idx + 1;
    setIdx(ni);
    setOpts(shuffle(questions[ni]!.options));
    setPicked(null);
    setWrongIds([]);
    setDimmed([]);
    setAttempts(0);
    setFeedback("");
  };

  const answer = (o: ChallengeOption) => {
    if (picked) return;
    onAnswer(q, o.correct);
    if (o.correct) {
      setPicked(o.id);
      audio.correct();
      audio.coin();
      const nc = correctCount + 1;
      setCorrectCount(nc);
      setStreak((x) => x + 1);
      onReward(rewardFor(attempts));
      setFeedback(PRAISE[locale][Math.floor(Math.random() * PRAISE[locale].length)]!);
      setTimeout(() => next(nc), 750);
    } else {
      audio.wrong();
      setStreak(0);
      setWrongIds((w) => [...w, o.id]);
      setAttempts((a) => a + 1);
      setFeedback(ENCOURAGE[locale][Math.floor(Math.random() * ENCOURAGE[locale].length)]!);
    }
  };

  const hint = () => {
    const wrong = opts.filter((o) => !o.correct && !dimmed.includes(o.id) && !wrongIds.includes(o.id));
    if (wrong.length <= 1) return;
    setDimmed((d) => [...d, wrong[Math.floor(Math.random() * wrong.length)]!.id]);
    audio.click();
  };

  return (
    <div className="p-3 max-w-xl mx-auto w-full animate-slideUp">
      <div className="flex items-center gap-2 mb-3">
        <button className="btn !min-h-0 rounded-2xl px-4 py-2" onClick={onBack}>← {isMs ? "Kembali" : "Back"}</button>
        <div className="flex-1 h-3 rounded-full bg-black/10 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${(idx / TOTAL) * 100}%`, background: accent }} />
        </div>
        <span className="font-display text-sm">{idx + 1}/{TOTAL}</span>
        {streak >= 2 && <span className="font-display text-orange-500">🔥{streak}</span>}
      </div>

      <div className="card p-6 text-center min-h-[120px] grid place-items-center animate-pop sticker" key={q.id}>
        <p className="font-display text-2xl leading-snug text-violet-700">{promptText(q, locale)}</p>
      </div>

      <div className="grid gap-2.5 mt-4">
        {opts.map((o, i) => {
          const isPicked = picked === o.id;
          const isWrong = wrongIds.includes(o.id);
          const isDim = dimmed.includes(o.id);
          return (
            <button
              key={o.id}
              disabled={!!picked || isWrong || isDim}
              className="btn rounded-2xl px-4 py-4 font-display text-lg text-left flex items-center gap-2"
              style={
                isPicked
                  ? { background: "#36b14f", color: "#fff", boxShadow: "0 6px 0 #1f8a3a" }
                  : isWrong
                    ? { background: "#f3b1b1", color: "#7a2020" }
                    : { opacity: isDim ? 0.4 : 1 }
              }
              onClick={() => answer(o)}
            >
              <span className="text-soft">{String.fromCharCode(65 + i)}.</span>
              {optionLabel(o, locale)}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-3 min-h-[30px]">
        <span className="font-display text-lg" style={{ color: picked ? "#36b14f" : "#e07a7a" }}>{feedback}</span>
        <button className="btn !min-h-0 btn-primary rounded-2xl px-4 py-2 text-sm font-display" onClick={hint}>
          💡 {isMs ? "Bantuan" : "Hint"}
        </button>
      </div>
    </div>
  );
}
