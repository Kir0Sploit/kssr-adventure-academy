/**
 * Curriculum registry — browser-safe core.
 *
 * Holds an in-memory map of validated curriculum slices. It has NO Node
 * dependencies so it bundles cleanly for the web/game client.
 *
 * Slices are populated by one of two loaders:
 *  - `@kssr/curriculum/node`   — reads JSON from disk (tests, tooling, SSR).
 *  - `@kssr/curriculum/static` — imports JSON via the bundler (browser).
 */
import type { SubjectCurriculum, SubjectId, Year } from "@kssr/shared";
import { validateSubjectCurriculum } from "./validate.js";

/** Coverage manifest: which (year, subject) slices exist as authored content. */
export const COVERAGE: ReadonlyArray<{ year: Year; subject: SubjectId }> = [
  { year: 1, subject: "math" },
  { year: 1, subject: "bm" },
  { year: 1, subject: "english" },
  { year: 2, subject: "math" },
  { year: 2, subject: "bm" },
  { year: 2, subject: "english" },
  { year: 3, subject: "math" },
  { year: 3, subject: "bm" },
  { year: 3, subject: "english" },
  { year: 4, subject: "math" },
  { year: 4, subject: "bm" },
  { year: 4, subject: "english" },
  { year: 5, subject: "math" },
  { year: 5, subject: "bm" },
  { year: 5, subject: "english" },
  { year: 6, subject: "math" },
  { year: 6, subject: "bm" },
  { year: 6, subject: "english" },
];

const cache = new Map<string, SubjectCurriculum>();

function key(year: Year, subject: SubjectId): string {
  return `${year}:${subject}`;
}

/**
 * Validate and register a curriculum slice. Idempotent for a given key.
 * Loaders call this; content authors never call it directly.
 */
export function registerSlice(raw: unknown, year: Year, subject: SubjectId): SubjectCurriculum {
  const validated = validateSubjectCurriculum(raw, year, subject);
  cache.set(key(year, subject), validated);
  return validated;
}

/** True if a slice has been loaded into the registry. */
export function isAvailable(year: Year, subject: SubjectId): boolean {
  return cache.has(key(year, subject));
}

/** All slices currently registered. */
export function listAvailable(): Array<{ year: Year; subject: SubjectId }> {
  return COVERAGE.filter((c) => isAvailable(c.year, c.subject));
}

/**
 * Returns a registered curriculum slice.
 * @throws if the slice has not been loaded — with guidance on how to load it.
 */
export function getSubjectCurriculum(year: Year, subject: SubjectId): SubjectCurriculum {
  const found = cache.get(key(year, subject));
  if (found) return found;
  const declared = COVERAGE.some((c) => c.year === year && c.subject === subject);
  if (!declared) {
    throw new Error(
      `[curriculum] Year ${year} ${subject} is not authored yet. ` +
        `Add it to src/data and COVERAGE following the SubjectCurriculum schema.`,
    );
  }
  throw new Error(
    `[curriculum] Year ${year} ${subject} is not loaded. ` +
      `Call loadBundledCurriculum() (browser) or loadAllFromDisk() (node) first.`,
  );
}

/** Clears the registry (useful for hot-reloading authored content in dev). */
export function clearCache(): void {
  cache.clear();
}
