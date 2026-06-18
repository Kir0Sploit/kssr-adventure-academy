import type { Challenge, Locale } from "@kssr/shared";

/** Result reported each time the player runs through a gate. */
export interface AnswerResult {
  challenge: Challenge;
  correct: boolean;
  /** Wrong attempts on this challenge before the current evaluation. */
  attempts: number;
  hintUsed: boolean;
  durationMs: number;
}

export interface RunSummary {
  answered: number;
  correct: number;
  accuracy: number; // 0..1
}

/** Host callbacks — the app turns these into analytics events + rewards. */
export interface RunnerCallbacks {
  onAnswer?(result: AnswerResult): void;
  onReward?(reward: { coins: number; xp: number; stars: number }): void;
  onProgress?(p: { cleared: number; total: number }): void;
  onComplete?(summary: RunSummary): void;
}

export interface RunnerConfig {
  /** DOM element the canvas mounts into. */
  parent: HTMLElement;
  locale: Locale;
  /** Number of correct gates to clear to finish a run. Default 8. */
  gates?: number;
  /** Provider for the next challenge — wire this to @kssr/curriculum. */
  nextChallenge: () => Challenge;
  /** Subject accent colour (hex), used for theming. Default purple. */
  accent?: string;
  callbacks?: RunnerCallbacks;
}

/** Imperative handle returned to the host to control the running game. */
export interface RunnerHandle {
  destroy(): void;
  setLocale(locale: Locale): void;
  pause(): void;
  resume(): void;
  /** Trigger a scaffolded hint for the current challenge (dims a wrong lane). */
  hint(): void;
}
