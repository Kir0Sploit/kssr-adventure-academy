/**
 * @kssr/shared — Gamification definitions (achievements, missions, rewards).
 * Authored as data so new content can be added without touching game code.
 */
import type { Localized, SubjectId } from "./curriculum.js";

export interface RewardBundle {
  xp?: number;
  coins?: number;
  stars?: number;
  knowledgePoints?: number;
  unlock?: { type: keyof import("./progression.js").UnlockState; id: string };
}

export interface AchievementDef {
  id: string;
  title: Localized;
  description: Localized;
  icon: string;
  /** How the achievement is detected by the analytics/gamification engine. */
  trigger:
    | { kind: "correct-total"; subject?: SubjectId; count: number }
    | { kind: "quests-completed"; count: number }
    | { kind: "streak-days"; count: number }
    | { kind: "boss-defeated"; count: number }
    | { kind: "treasures"; count: number }
    | { kind: "first-play" };
  reward?: RewardBundle;
}

export type MissionPeriod = "daily" | "weekly";

export interface MissionDef {
  id: string;
  period: MissionPeriod;
  title: Localized;
  goal: number;
  metric: "correctAnswers" | "topicsPlayed" | "coinsEarned" | "minutesPlayed";
  reward: RewardBundle;
}

/** Randomised positive-feedback lines (never punishing). */
export const PRAISE: Record<"en" | "ms", string[]> = {
  en: ["Awesome!", "Excellent!", "Fantastic!", "Brilliant!", "Great job!", "Superb!"],
  ms: ["Hebat!", "Bijak!", "Mantap!", "Syabas!", "Cemerlang!", "Tahniah!"],
};

export const ENCOURAGE: Record<"en" | "ms", string[]> = {
  en: ["Try again!", "Almost there!", "Keep going!", "You can do it!"],
  ms: ["Cuba lagi!", "Hampir betul!", "Teruskan!", "Anda boleh lakukan!"],
};
