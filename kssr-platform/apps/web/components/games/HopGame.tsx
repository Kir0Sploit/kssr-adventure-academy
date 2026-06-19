"use client";
import { useEffect, useMemo, useState } from "react";
import { PRAISE, ENCOURAGE } from "@kssr/shared";
import type { ChallengeOption } from "@kssr/shared";
import { audio } from "@/lib/audio";
import { confetti } from "@/lib/confetti";
import { speak, stopSpeaking } from "@/lib/speak";
import { getQuestions, optionLabel, promptText, rewardFor, shuffle, type GameModeProps } from "@/lib/gameUtils";

const DEFAULT_STEPS = 5;

export default function HopGame({ topic, locale, accent, rounds, onAnswer, onReward, onComplete, onBack }: GameModeProps) {
  const isMs = locale === "ms";
  const STEPS = rounds ?? DEFAULT_STEPS;
  const questions = useMemo(() => getQuestions(topic, STEPS), [topic]);
  const [pos, setPos] = useState(0); // current star index (0..STEPS)
  const [opts, setOpts] = useState<ChallengeOption[]>(() => shuffle(questions[0]?.options ?? []));
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [hopping, setHopping] = useState(false);
  const [msg, setMsg] = useState("");

  const q = questions[pos];

  useEffect(() => {
    if (q) speak(promptText(q, locale), locale);
    return () => stopSpeaking();
  }, [pos, locale, q]);

  const finished = pos >= STEPS;

  const onPick = (o: ChallengeOption) => {
    if (hopping || finished || !q) return;
    onAnswer(q, o.correct);
    if (o.correct) {
      audio.correct();
      audio.coin();
      confetti(16);
      onReward(rewardFor(wrongIds.length));
      const line = PRAISE[locale][Math.floor(Math.random() * PRAISE[locale].length)]!;
      setMsg(line);
      speak(line, locale);
      setHopping(true);
      setTimeout(() => {
        const np = pos + 1;
        setPos(np);
        setHopping(false);
        setWrongIds([]);
        setMsg("");
        if (np >= STEPS) {
          audio.victory();
          onComplete({ answered: STEPS, correct: STEPS, accuracy: 1 });
        } else {
          setOpts(shuffle(questions[np]!.options));
        }
      }, 700);
    } else {
      audio.wrong();
      setWrongIds((w) => [...w, o.id]);
      setMsg(ENCOURAGE[locale][Math.floor(Math.random() * ENCOURAGE[locale].length)]!);
    }
  };

  return (
    <div className="p-3 max-w-xl mx-auto w-full animate-slideUp">
      <div className="flex items-center gap-2 mb-3">
        <button className="btn !min-h-0 rounded-2xl px-4 py-2" onClick={onBack}>← {isMs ? "Kembali" : "Back"}</button>
        <span className="chip px-3 py-1.5 ml-auto font-display text-sm">⭐ {pos}/{STEPS}</span>
      </div>

      {/* Star path with hopping mascot */}
      <div className="card p-4 sticker-r overflow-hidden">
        <div className="relative flex items-end justify-between px-1" style={{ height: 70 }}>
          {Array.from({ length: STEPS + 1 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center" style={{ width: `${100 / (STEPS + 1)}%` }}>
              <div className="relative h-9">
                {pos === i && (
                  <span className={`absolute left-1/2 -translate-x-1/2 -top-1 text-3xl ${hopping ? "animate-bobble" : ""}`}>
                    🦧
                  </span>
                )}
              </div>
              <span className="text-2xl">{i < pos ? "⭐" : i === STEPS ? "🏁" : "•"}</span>
            </div>
          ))}
        </div>
      </div>

      {!finished && q && (
        <>
          <div className="card p-5 text-center mt-3 sticker">
            <p className="font-display text-2xl leading-snug text-violet-700">{promptText(q, locale)}</p>
            <button className="btn !min-h-0 btn-sky rounded-full px-5 py-2 mt-2 font-display" onClick={() => speak(promptText(q, locale), locale)}>
              🔊 {isMs ? "Dengar" : "Listen"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            {opts.map((o) => {
              const isWrong = wrongIds.includes(o.id);
              return (
                <button
                  key={o.id}
                  disabled={hopping || isWrong}
                  onClick={() => onPick(o)}
                  className="btn rounded-3xl px-4 py-5 font-display text-xl"
                  style={isWrong ? { background: "#f3b1b1", color: "#7a2020" } : { borderBottomColor: accent }}
                >
                  {optionLabel(o, locale)}
                </button>
              );
            })}
          </div>
          <div className="text-center mt-3 min-h-[30px] font-display text-xl" style={{ color: msg && PRAISE[locale].includes(msg) ? "#36b14f" : "#e07a7a" }}>
            {msg}
          </div>
        </>
      )}
    </div>
  );
}
