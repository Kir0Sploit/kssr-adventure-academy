"use client";
/**
 * Client progression store (offline-first).
 * Persists to localStorage; the shape mirrors @kssr/shared so it can later
 * sync to the backend without transformation.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { RANKS, rankForYear, xpForLevel } from "@kssr/shared";
import type { Locale, SubjectId, Year } from "@kssr/shared";

export interface SubjectStat {
  attempts: number;
  correct: number;
}

export interface CertificateRecord {
  id: string;
  subject: SubjectId;
  year: Year;
  level: "Bronze" | "Silver" | "Gold";
  date: string;
}

export interface ProgressState {
  name: string;
  avatar: string;
  locale: Locale;
  year: Year;
  level: number;
  xp: number;
  coins: number;
  stars: number;
  knowledgePoints: number;
  timePlayedSec: number;
  audioOn: boolean;
  streak: number;
  bestStreak: number;
  lastActiveDate: string | null;
  stats: Record<SubjectId, SubjectStat>;
  mastery: Record<string, number>; // topicId -> 0..1
  achievements: string[];
  certificates: CertificateRecord[];

  setProfile: (p: Partial<Pick<ProgressState, "name" | "avatar" | "year">>) => void;
  setLocale: (l: Locale) => void;
  setAudio: (on: boolean) => void;
  addReward: (r: { xp?: number; coins?: number; stars?: number; knowledgePoints?: number }) => void;
  recordAnswer: (subject: SubjectId, topicId: string, correct: boolean) => void;
  addTime: (sec: number) => void;
  touchStreak: () => void;
  unlock: (id: string) => void;
  grantCertificate: (subject: SubjectId, year: Year, level: "Bronze" | "Silver" | "Gold") => void;
  rank: () => string;
}

const emptyStats = (): Record<SubjectId, SubjectStat> => ({
  math: { attempts: 0, correct: 0 },
  bm: { attempts: 0, correct: 0 },
  english: { attempts: 0, correct: 0 },
});

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      name: "Hero",
      avatar: "🦸",
      locale: "en",
      year: 1,
      level: 1,
      xp: 0,
      coins: 0,
      stars: 0,
      knowledgePoints: 0,
      timePlayedSec: 0,
      audioOn: true,
      streak: 0,
      bestStreak: 0,
      lastActiveDate: null,
      stats: emptyStats(),
      mastery: {},
      achievements: [],
      certificates: [],

      setProfile: (p) => set((s) => ({ ...s, ...p })),
      setLocale: (l) => set({ locale: l }),
      setAudio: (on) => set({ audioOn: on }),

      addReward: ({ xp = 0, coins = 0, stars = 0, knowledgePoints = 0 }) =>
        set((s) => {
          let level = s.level;
          let total = s.xp + xp;
          while (total >= xpForLevel(level)) {
            total -= xpForLevel(level);
            level += 1;
          }
          return {
            xp: total,
            level,
            coins: s.coins + coins,
            stars: s.stars + stars,
            knowledgePoints: s.knowledgePoints + knowledgePoints,
          };
        }),

      recordAnswer: (subject, topicId, correct) =>
        set((s) => {
          const stat = s.stats[subject];
          const stats = { ...s.stats, [subject]: { attempts: stat.attempts + 1, correct: stat.correct + (correct ? 1 : 0) } };
          const prev = s.mastery[topicId] ?? 0;
          const alpha = 0.3;
          const mastery = { ...s.mastery, [topicId]: prev * (1 - alpha) + (correct ? 1 : 0) * alpha };
          const knowledgePoints = s.knowledgePoints + (correct ? 5 : 0);
          return { stats, mastery, knowledgePoints };
        }),

      addTime: (sec) => set((s) => ({ timePlayedSec: s.timePlayedSec + sec })),

      touchStreak: () =>
        set((s) => {
          const today = new Date().toISOString().slice(0, 10);
          if (s.lastActiveDate === today) return s;
          const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
          const streak = s.lastActiveDate === yesterday ? s.streak + 1 : 1;
          return { streak, bestStreak: Math.max(s.bestStreak, streak), lastActiveDate: today };
        }),

      unlock: (id) => set((s) => (s.achievements.includes(id) ? s : { achievements: [...s.achievements, id] })),

      grantCertificate: (subject, year, level) =>
        set((s) => {
          const id = `${subject}-y${year}`;
          if (s.certificates.some((c) => c.id === id)) return s;
          return {
            certificates: [
              ...s.certificates,
              { id, subject, year, level, date: new Date().toLocaleDateString() },
            ],
          };
        }),

      rank: () => rankForYear(get().year) ?? RANKS[0],
    }),
    { name: "kssr-progress-v1" },
  ),
);
