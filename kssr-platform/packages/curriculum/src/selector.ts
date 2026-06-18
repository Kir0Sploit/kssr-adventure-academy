/**
 * Adaptive challenge selector.
 *
 * Chooses the next challenge for a learner based on lightweight mastery
 * signals. Keeps the game "play-first": it never blocks, it just paces
 * difficulty so children stay in flow (not too easy, not too hard).
 */
import type { Challenge, Difficulty, SubjectId, Topic, TopicMastery, Year } from "@kssr/shared";
import { getSubjectCurriculum } from "./registry.js";

const DIFF_ORDER: Difficulty[] = ["intro", "core", "stretch"];

export interface SelectionContext {
  /** Mastery 0..1 for the topic (0 if new). */
  mastery: number;
  /** Challenge ids already answered correctly this session (avoid repeats). */
  seenCorrect: ReadonlySet<string>;
}

/** Maps a mastery estimate to a target difficulty band. */
export function targetDifficulty(mastery: number): Difficulty {
  if (mastery < 0.34) return "intro";
  if (mastery < 0.74) return "core";
  return "stretch";
}

/**
 * Picks the next challenge from a topic given the learner's context.
 * Falls back gracefully so a topic with limited content still works.
 */
export function nextChallenge(topic: Topic, ctx: SelectionContext): Challenge {
  const target = targetDifficulty(ctx.mastery);
  const fresh = topic.challenges.filter((c) => !ctx.seenCorrect.has(c.id));
  const pool = fresh.length > 0 ? fresh : topic.challenges;

  // Prefer the target band, then nearest band by index distance.
  const targetIdx = DIFF_ORDER.indexOf(target);
  const ranked = [...pool].sort((a, b) => {
    const da = Math.abs(DIFF_ORDER.indexOf(a.difficulty) - targetIdx);
    const db = Math.abs(DIFF_ORDER.indexOf(b.difficulty) - targetIdx);
    return da - db;
  });
  return ranked[0] ?? pool[0]!;
}

/** Convenience: get the ordered topics for a subject/year. */
export function getTopics(year: Year, subject: SubjectId): Topic[] {
  return [...getSubjectCurriculum(year, subject).topics].sort((a, b) => a.order - b.order);
}

/** Recompute a rolling mastery estimate after an answer. */
export function updateMastery(prev: TopicMastery, correct: boolean): TopicMastery {
  const attempts = prev.attempts + 1;
  const correctCount = prev.correct + (correct ? 1 : 0);
  // Exponential moving average so recent performance matters more.
  const alpha = 0.3;
  const mastery = prev.mastery * (1 - alpha) + (correct ? 1 : 0) * alpha;
  return { ...prev, attempts, correct: correctCount, mastery, lastPlayedAt: Date.now() };
}
