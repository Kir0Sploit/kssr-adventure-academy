"use client";
import { useEffect, useRef } from "react";
import type { RunnerHandle } from "@kssr/game-engine";
import { audio } from "@/lib/audio";
import type { GameModeProps } from "@/lib/gameUtils";

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
      // Client-only imports: Phaser must not be evaluated during SSR.
      const [{ mountRunner }, curriculum] = await Promise.all([
        import("@kssr/game-engine"),
        import("@kssr/curriculum"),
      ]);
      if (disposed) return;

      const seen = new Set<string>();
      let mastery = initialMastery;

      audio.unlock();
      audio.startMusic();

      handleRef.current = mountRunner({
        parent: host,
        locale,
        gates: 8,
        accent,
        nextChallenge: () => curriculum.nextChallenge(topic, { mastery, seenCorrect: seen }),
        callbacks: {
          onAnswer: ({ challenge, correct }) => {
            const alpha = 0.3;
            mastery = mastery * (1 - alpha) + (correct ? 1 : 0) * alpha;
            if (correct) {
              seen.add(challenge.id);
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
