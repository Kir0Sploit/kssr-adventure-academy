/**
 * Runtime validation for authored curriculum JSON.
 * Content is data — possibly AI-generated — so we validate defensively
 * and fail loudly with actionable messages rather than shipping bad data.
 */
import type {
  SubjectCurriculum,
  Topic,
  Challenge,
  Flashcard,
  Localized,
  SubjectId,
  Year,
} from "@kssr/shared";

const SUBJECT_IDS: SubjectId[] = ["math", "bm", "english", "sains", "jawi", "pi", "sejarah"];
const MECHANICS = ["lane-select", "gate-pass", "collect", "build", "sequence", "true-false"];

export class CurriculumValidationError extends Error {
  constructor(message: string) {
    super(`[curriculum] ${message}`);
    this.name = "CurriculumValidationError";
  }
}

function isLocalized(v: unknown): v is Localized {
  return !!v && typeof v === "object" && typeof (v as Localized).en === "string" && typeof (v as Localized).ms === "string";
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new CurriculumValidationError(msg);
}

function validateFlashcard(fc: Flashcard, ctx: string): void {
  assert(typeof fc.id === "string" && fc.id, `${ctx}: flashcard missing id`);
  assert(isLocalized(fc.title), `${ctx}/${fc.id}: flashcard.title must be localized`);
  assert(isLocalized(fc.definition), `${ctx}/${fc.id}: flashcard.definition must be localized`);
  assert(isLocalized(fc.example), `${ctx}/${fc.id}: flashcard.example must be localized`);
  assert(typeof fc.illustration === "string", `${ctx}/${fc.id}: flashcard.illustration required`);
  assert(isLocalized(fc.hint), `${ctx}/${fc.id}: flashcard.hint must be localized`);
  assert(isLocalized(fc.funFact), `${ctx}/${fc.id}: flashcard.funFact must be localized`);
}

function validateChallenge(c: Challenge, ctx: string): void {
  assert(typeof c.id === "string" && c.id, `${ctx}: challenge missing id`);
  assert(MECHANICS.includes(c.mechanic), `${ctx}/${c.id}: invalid mechanic '${c.mechanic}'`);
  assert(isLocalized(c.prompt), `${ctx}/${c.id}: challenge.prompt must be localized`);
  assert(isLocalized(c.hint), `${ctx}/${c.id}: challenge.hint must be localized`);
  assert(Array.isArray(c.options) && c.options.length >= 2, `${ctx}/${c.id}: need at least 2 options`);
  const correctCount = c.options.filter((o) => o.correct).length;
  assert(correctCount === 1, `${ctx}/${c.id}: exactly one option must be correct (found ${correctCount})`);
  assert(Array.isArray(c.skills) && c.skills.length > 0, `${ctx}/${c.id}: at least one skill tag required`);
}

function validateTopic(t: Topic, ctx: string): void {
  assert(typeof t.id === "string" && t.id, `${ctx}: topic missing id`);
  assert(isLocalized(t.title), `${ctx}/${t.id}: topic.title must be localized`);
  assert(isLocalized(t.description), `${ctx}/${t.id}: topic.description must be localized`);
  assert(Array.isArray(t.flashcards), `${ctx}/${t.id}: flashcards must be an array`);
  assert(Array.isArray(t.challenges) && t.challenges.length > 0, `${ctx}/${t.id}: need at least one challenge`);
  t.flashcards.forEach((fc) => validateFlashcard(fc, `${ctx}/${t.id}`));
  t.challenges.forEach((c) => validateChallenge(c, `${ctx}/${t.id}`));
}

/**
 * Validates an unknown JSON value and narrows it to SubjectCurriculum.
 * Throws CurriculumValidationError with a precise path on failure.
 */
export function validateSubjectCurriculum(data: unknown, expectedYear: Year, expectedSubject: SubjectId): SubjectCurriculum {
  const d = data as SubjectCurriculum;
  const ctx = `year${expectedYear}/${expectedSubject}`;
  assert(SUBJECT_IDS.includes(d.subject), `${ctx}: invalid subject '${d.subject}'`);
  assert(d.subject === expectedSubject, `${ctx}: subject mismatch (file says '${d.subject}')`);
  assert(d.year === expectedYear, `${ctx}: year mismatch (file says '${d.year}')`);
  assert(typeof d.schemaVersion === "number", `${ctx}: schemaVersion required`);
  assert(Array.isArray(d.topics) && d.topics.length > 0, `${ctx}: need at least one topic`);
  d.topics.forEach((t) => validateTopic(t, ctx));
  return d;
}
