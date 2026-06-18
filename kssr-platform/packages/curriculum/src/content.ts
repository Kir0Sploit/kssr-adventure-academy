/**
 * Content provider — builds curriculum slices from topic descriptors and the
 * generator. Pure TS (runs on server and in the browser). Replaces the old
 * JSON-file registry; content is now generated, so it never runs dry.
 */
import type { SubjectCurriculum, SubjectId, Year } from "@kssr/shared";
import { allYearSubjects, buildTopic, getTopicMetas } from "./topics.js";

const cache = new Map<string, SubjectCurriculum>();

export const COVERAGE: ReadonlyArray<{ year: Year; subject: SubjectId }> = allYearSubjects();

export function isAvailable(year: Year, subject: SubjectId): boolean {
  return getTopicMetas(year, subject).length > 0;
}

export function listAvailable(): Array<{ year: Year; subject: SubjectId }> {
  return COVERAGE.filter((c) => isAvailable(c.year, c.subject));
}

/** Builds (and caches) the curriculum slice for a year + subject. */
export function getSubjectCurriculum(year: Year, subject: SubjectId): SubjectCurriculum {
  const key = `${year}:${subject}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const metas = getTopicMetas(year, subject);
  if (metas.length === 0) {
    throw new Error(`[curriculum] No topics for Year ${year} ${subject}.`);
  }
  const slice: SubjectCurriculum = {
    subject,
    year,
    schemaVersion: 2,
    topics: metas.map((m) => buildTopic(m, 6)),
  };
  cache.set(key, slice);
  return slice;
}

export function clearCache(): void {
  cache.clear();
}
