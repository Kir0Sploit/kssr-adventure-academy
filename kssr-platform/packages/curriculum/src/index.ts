/**
 * @kssr/curriculum — public API (browser-safe core).
 *
 * Data-driven KSSR content for the KSSR Adventure Academy platform.
 * Game logic depends only on this surface, never on raw JSON paths.
 *
 * Populate the registry first via one of the loaders:
 *   - browser: import { loadBundledCurriculum } from "@kssr/curriculum/static"
 *   - node:    import { loadAllFromDisk }       from "@kssr/curriculum/node"
 */
export {
  COVERAGE,
  isAvailable,
  listAvailable,
  getSubjectCurriculum,
  registerSlice,
  clearCache,
} from "./registry.js";

export {
  nextChallenge,
  targetDifficulty,
  getTopics,
  updateMastery,
  type SelectionContext,
} from "./selector.js";

export {
  validateSubjectCurriculum,
  CurriculumValidationError,
} from "./validate.js";

import { getSubjectCurriculum } from "./registry.js";
import type { SubjectId, Topic, Year, Flashcard, Challenge } from "@kssr/shared";

/** Look up a single topic by id within a (year, subject) slice. */
export function getTopic(year: Year, subject: SubjectId, topicId: string): Topic | undefined {
  return getSubjectCurriculum(year, subject).topics.find((t) => t.id === topicId);
}

/** All flashcards for a topic (Learn Mode content). */
export function getFlashcards(year: Year, subject: SubjectId, topicId: string): Flashcard[] {
  return getTopic(year, subject, topicId)?.flashcards ?? [];
}

/** All challenges for a topic. */
export function getChallenges(year: Year, subject: SubjectId, topicId: string): Challenge[] {
  return getTopic(year, subject, topicId)?.challenges ?? [];
}
