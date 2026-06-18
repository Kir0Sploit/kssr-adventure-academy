/**
 * Shared helpers + the unified contract every game mode implements.
 * A "game mode" is just a React component that turns curriculum challenges
 * into a playable activity and reports answers/rewards/completion back.
 */
import type { Challenge, ChallengeOption, Locale, Localized, Topic } from "@kssr/shared";
import { generate, isGeneratable } from "@kssr/curriculum";

export interface GameSummary {
  answered: number;
  correct: number;
  accuracy: number; // 0..1
}

export interface GameModeProps {
  topic: Topic;
  locale: Locale;
  accent: string;
  initialMastery: number;
  onAnswer: (challenge: Challenge, correct: boolean) => void;
  onReward: (r: { coins: number; xp: number; stars: number }) => void;
  onComplete: (summary: GameSummary) => void;
  onBack: () => void;
}

export function optionLabel(o: ChallengeOption, locale: Locale): string {
  const l = o.label as Localized | string;
  return typeof l === "string" ? l : l[locale];
}

export function promptText(c: Challenge, locale: Locale): string {
  return c.prompt[locale];
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/**
 * Builds a question set of length `n` from a topic, cycling and shuffling
 * the available challenges and avoiding back-to-back repeats.
 */
export function buildQuestionSet(topic: Topic, n: number): Challenge[] {
  const base = topic.challenges;
  if (base.length === 0) return [];
  const out: Challenge[] = [];
  let pool = shuffle(base);
  while (out.length < n) {
    if (pool.length === 0) pool = shuffle(base);
    const c = pool.pop()!;
    if (base.length > 1 && out.length > 0 && out[out.length - 1]!.id === c.id) {
      pool.unshift(c);
      continue;
    }
    out.push(c);
  }
  return out;
}

export function rewardFor(attempts: number): { coins: number; xp: number; stars: number } {
  return { coins: 10, xp: 12, stars: attempts === 0 ? 1 : 0 };
}

/**
 * Fresh question set for a topic. If the topic has a generator skill, produce
 * brand-new questions every session (so games never repeat); otherwise fall
 * back to the baked challenges. This is what makes play feel endless.
 */
export function getQuestions(topic: Topic, n: number): Challenge[] {
  if (topic.skill && isGeneratable(topic.subject, topic.skill)) {
    const fresh = generate(topic.id, topic.subject, topic.skill, topic.year, n);
    if (fresh.length > 0) return fresh;
  }
  return buildQuestionSet(topic, n);
}
