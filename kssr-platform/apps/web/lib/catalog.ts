/**
 * Server-side curriculum catalog.
 *
 * Runs only in server components / build. It loads JSON via the Node loader
 * and exposes a fully serializable catalog that is handed to client
 * components as props — so the browser bundle never imports Node `fs`.
 */
import { loadAllFromDisk } from "@kssr/curriculum/node";
import { listAvailable, getTopics } from "@kssr/curriculum";
import { SUBJECTS, YEARS } from "@kssr/shared";
import type { SubjectMeta, Topic, Year } from "@kssr/shared";

let loaded = false;
function ensureLoaded(): void {
  if (!loaded) {
    loadAllFromDisk();
    loaded = true;
  }
}

export interface Catalog {
  years: Year[];
  subjects: SubjectMeta[];
  /** Available (year, subject) keys -> ordered topics (with flashcards & challenges). */
  topicsByKey: Record<string, Topic[]>;
  available: Array<{ year: Year; subject: string }>;
}

export function key(year: number, subject: string): string {
  return `${year}:${subject}`;
}

export function getCatalog(): Catalog {
  ensureLoaded();
  const available = listAvailable();
  const topicsByKey: Record<string, Topic[]> = {};
  for (const { year, subject } of available) {
    topicsByKey[key(year, subject)] = getTopics(year, subject);
  }
  return {
    years: [...YEARS],
    subjects: [...SUBJECTS],
    topicsByKey,
    available: available.map((a) => ({ year: a.year, subject: a.subject })),
  };
}
