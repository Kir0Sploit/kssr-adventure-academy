/**
 * Curriculum catalog. Content is now generated (pure TS), so this works on the
 * server (build/SSR) and the data is serialized to the client. The client then
 * regenerates fresh questions per play via the generator (see gameUtils).
 */
import { listAvailable, getTopics } from "@kssr/curriculum";
import { SUBJECTS, YEARS } from "@kssr/shared";
import type { SubjectMeta, Topic, Year } from "@kssr/shared";

export interface Catalog {
  years: Year[];
  subjects: SubjectMeta[];
  /** "year:subject" -> ordered topics (with skill + a small baked question set). */
  topicsByKey: Record<string, Topic[]>;
  available: Array<{ year: Year; subject: string }>;
}

export function key(year: number, subject: string): string {
  return `${year}:${subject}`;
}

export function getCatalog(): Catalog {
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
