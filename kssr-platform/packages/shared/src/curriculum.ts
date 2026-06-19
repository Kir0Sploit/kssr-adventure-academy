/**
 * @kssr/shared — Curriculum domain model
 *
 * These types are the contract between the data-driven curriculum
 * (`@kssr/curriculum`), the Phaser game engine, the web app and any
 * future AI content-generation pipeline. Game logic must never hardcode
 * curriculum; it consumes data shaped by these types.
 */

/** Malaysian KSSR primary school years (Darjah). */
export type Year = 1 | 2 | 3 | 4 | 5 | 6;

/** Supported subjects. */
export type SubjectId = "math" | "bm" | "english" | "sains" | "jawi" | "pi" | "sejarah";

/** Bilingual string. The UI renders one based on the active locale. */
export interface Localized {
  en: string;
  ms: string;
}

export type Locale = "en" | "ms";

/** Difficulty band within a year, used to pace challenges. */
export type Difficulty = "intro" | "core" | "stretch";

/**
 * The interaction a challenge maps to inside the runner/race game modes.
 * This decouples *what* is learned from *how* it is played, so the same
 * question data can be reused across game modes.
 */
export type ChallengeMechanic =
  | "lane-select" // choose the correct lane to run into
  | "gate-pass" // pass through the gate with the correct answer
  | "collect" // collect the correct token while running
  | "build" // assemble syllables / words / sentences
  | "sequence" // order items correctly
  | "true-false"; // dodge or hit

/** A single answer option presented to the learner. */
export interface ChallengeOption {
  id: string;
  /** Short label shown on a lane/gate/token (kept terse for gameplay). */
  label: Localized | string;
  correct: boolean;
}

/**
 * A bite-sized, gameplay-embedded learning challenge.
 * Authored as data (JSON) and validated at load time.
 */
export interface Challenge {
  id: string;
  topicId: string;
  subject: SubjectId;
  year: Year;
  difficulty: Difficulty;
  mechanic: ChallengeMechanic;
  /** The prompt. Kept short so it can overlay live gameplay. */
  prompt: Localized;
  options: ChallengeOption[];
  /** Scaffolded hint — never reveals the answer directly. */
  hint: Localized;
  /** Optional explanation shown after answering (for Learn reinforcement). */
  explanation?: Localized;
  /** Tags for analytics / adaptive selection (e.g. "addition", "imbuhan"). */
  skills: string[];
}

/**
 * An interactive flashcard shown in Learn Mode before any challenge.
 * Children must learn before being tested.
 */
export interface Flashcard {
  id: string;
  topicId: string;
  title: Localized;
  definition: Localized;
  example: Localized;
  /** Emoji or icon token used to render an illustration without external assets. */
  illustration: string;
  /** Text to be spoken via speech synthesis (Web Speech API / Howler cue). */
  pronunciation?: { text: string; locale: Locale };
  hint: Localized;
  funFact: Localized;
}

/** A topic groups flashcards + challenges and is the unit of mastery. */
export interface Topic {
  id: string;
  subject: SubjectId;
  year: Year;
  title: Localized;
  description: Localized;
  /** Display order within the subject for the year. */
  order: number;
  /** Icon token (emoji) for menus. */
  icon: string;
  /** Optional generator skill key — enables unlimited fresh questions. */
  skill?: string;
  flashcards: Flashcard[];
  challenges: Challenge[];
}

/** Top-level curriculum slice for one subject in one year. */
export interface SubjectCurriculum {
  subject: SubjectId;
  year: Year;
  /** Schema version to allow safe content migrations. */
  schemaVersion: number;
  topics: Topic[];
}

/** Static metadata about a subject for menus and theming. */
export interface SubjectMeta {
  id: SubjectId;
  name: Localized;
  icon: string;
  /** Hex accent colour used for theming this subject. */
  color: string;
}

export const SUBJECTS: readonly SubjectMeta[] = [
  { id: "math", name: { en: "Mathematics", ms: "Matematik" }, icon: "📕", color: "#2563eb" },
  { id: "bm", name: { en: "Bahasa Melayu", ms: "Bahasa Melayu" }, icon: "📘", color: "#16a34a" },
  { id: "english", name: { en: "English", ms: "Bahasa Inggeris" }, icon: "📗", color: "#f59e0b" },
  { id: "sains", name: { en: "Science", ms: "Sains" }, icon: "🔬", color: "#14b8a6" },
  { id: "jawi", name: { en: "Jawi", ms: "Jawi" }, icon: "✍️", color: "#9333ea" },
  { id: "pi", name: { en: "Islamic Studies", ms: "Pendidikan Islam" }, icon: "🕌", color: "#d97706" },
  { id: "sejarah", name: { en: "History", ms: "Sejarah" }, icon: "📜", color: "#b45309" },
] as const;

export const YEARS: readonly Year[] = [1, 2, 3, 4, 5, 6] as const;
