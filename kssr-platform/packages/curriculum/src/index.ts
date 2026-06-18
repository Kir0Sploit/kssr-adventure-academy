/**
 * @kssr/curriculum — public API (browser-safe, pure TS).
 *
 * Content is generated from topic descriptors + a question generator, so it
 * provides 100+ topics and effectively unlimited, non-repeating questions.
 */
export {
  COVERAGE,
  isAvailable,
  listAvailable,
  getSubjectCurriculum,
  clearCache,
} from "./content.js";

export {
  nextChallenge,
  targetDifficulty,
  getTopics,
  updateMastery,
  type SelectionContext,
} from "./selector.js";

export { validateSubjectCurriculum, CurriculumValidationError } from "./validate.js";

export { generate, isGeneratable, type GenQ } from "./generators.js";
export { getTopicMetas, buildTopic, allYearSubjects, TOPIC_COUNT, type TopicMeta } from "./topics.js";

import { getSubjectCurriculum } from "./content.js";
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
