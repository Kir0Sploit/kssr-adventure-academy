"use client";
import { useEffect, useRef } from "react";
import type { RunnerHandle } from "@kssr/game-engine";
import { audio } from "@/lib/audio";
import { getQuestions, type GameModeProps } from "@/lib/gameUtils";

export default function GameCanvas({
  topic,
  locale,
  accent,
  initialMastery,
  onAnswer,
  onReward,
  onComplete,
  onBack,
}: GameModeProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<RunnerHandle | null>(null);

  useEffect(() => {
    let disposed = false;
    const host = hostRef.current;
    if (!host) return;

    (async () => {
      // Client-only import: Phaser must not be evaluated during SSR.
      const { mountRunner } = await import("@kssr/game-engine");
      if (disposed) return;

      // A fresh, large, shuffled pool of generated questions for this run.
      let pool = getQuestions(topic, 30);
      let pi = 0;
      const provider = () => {
        if (pi >= pool.length) {
          pool = getQuestions(topic, 30);
          pi = 0;
        }
        return pool[pi++]!;
      };

      handleRef.current = mountRunner({
        parent: host,
        locale,
        gates: 8,
        accent,
        nextChallenge: provider,
        callbacks: {
          onAnswer: ({ challenge, correct }) => {
            if (correct) {
              audio.correct();
              audio.coin();
            } else {
              audio.wrong();
            }
            onAnswer(challenge, correct);
          },
          onReward: (r) => onReward(r),
          onComplete: (snap) => {
            audio.victory();
            onComplete(snap);
          },
        },
      });
    })();

    return () => {
      disposed = true;
      audio.stopMusic();
      handleRef.current?.destroy();
      handleRef.current = null;
    };
    // Mount once per topic; locale handled live below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic.id]);

  useEffect(() => {
    handleRef.current?.setLocale(locale);
  }, [locale]);

  return (
    <div className="relative w-full animate-slideUp">
      <div
        ref={hostRef}
        className="w-full h-[62vh] sm:h-[68vh] rounded-3xl overflow-hidden border-[3px] border-white shadow-lg"
        style={{ touchAction: "none" }}
      />
      <div className="absolute top-3 left-3 flex gap-2">
        <button className="btn !min-h-0 rounded-2xl px-4 py-2 font-display" onClick={onBack}>
          ← {locale === "ms" ? "Kembali" : "Back"}
        </button>
      </div>
      <div className="absolute top-3 right-3 flex gap-2">
        <button className="btn !min-h-0 btn-primary rounded-2xl px-4 py-2 font-display" onClick={() => handleRef.current?.hint()}>
          💡 {locale === "ms" ? "Bantuan" : "Hint"}
        </button>
      </div>
      <p className="text-center text-xs text-soft mt-2 px-2 font-bold">
        {locale === "ms"
          ? "Gerak kiri/kanan (anak panah, ketik, atau leret) ke lorong jawapan betul"
          : "Move left/right (arrows, tap, or swipe) into the correct answer lane"}
      </p>
    </div>
  );
}
