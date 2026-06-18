/**
 * @kssr/shared — Player progression & persistence model.
 *
 * The same shape is persisted client-side (IndexedDB/localStorage) and,
 * when a backend is present, synced to PostgreSQL via the server contract.
 */
import type { SubjectId, Year } from "./curriculum.js";

/** Rank ladder, mapped 1:1 to years for a clear sense of growth. */
export const RANKS = [
  "Year 1 Explorer",
  "Year 2 Adventurer",
  "Year 3 Ranger",
  "Year 4 Hero",
  "Year 5 Master",
  "Year 6 Legend",
] as const;
export type Rank = (typeof RANKS)[number];

export interface CurrencyWallet {
  xp: number;
  coins: number;
  stars: number;
  /** Knowledge Points — earned only through correct learning actions. */
  knowledgePoints: number;
}

/** Per-topic mastery record used by the parent dashboard & adaptive engine. */
export interface TopicMastery {
  topicId: string;
  subject: SubjectId;
  year: Year;
  attempts: number;
  correct: number;
  /** 0..1 rolling mastery estimate. */
  mastery: number;
  lastPlayedAt: number; // epoch ms
}

export interface StreakState {
  current: number;
  longest: number;
  /** ISO date (YYYY-MM-DD) of the last active day. */
  lastActiveDate: string | null;
}

export interface UnlockState {
  characters: string[];
  pets: string[];
  vehicles: string[];
  trails: string[];
  costumes: string[];
  worlds: string[];
  titles: string[];
}

export interface PlayerProfile {
  id: string;
  name: string;
  avatar: string;
  locale: "en" | "ms";
  /** The year the child is currently learning. */
  year: Year;
  createdAt: number;
}

export interface CertificateRecord {
  id: string;
  subject: SubjectId;
  year: Year;
  masteryLevel: "Bronze" | "Silver" | "Gold";
  awardedAt: number;
}

/** The complete save document. Versioned for safe migration. */
export interface PlayerSave {
  saveVersion: number;
  profile: PlayerProfile;
  level: number;
  rank: Rank;
  wallet: CurrencyWallet;
  mastery: TopicMastery[];
  streak: StreakState;
  unlocks: UnlockState;
  achievements: string[];
  certificates: CertificateRecord[];
  /** Total active learning time in seconds. */
  timePlayedSec: number;
  /** Selected active cosmetics. */
  active: { character: string; pet: string | null; vehicle: string | null };
  /** Daily/weekly mission progress keyed by mission id. */
  missions: Record<string, number>;
}

export function xpForLevel(level: number): number {
  return 100 + level * 60;
}

export function rankForYear(year: Year): Rank {
  return RANKS[year - 1] ?? RANKS[0];
}
