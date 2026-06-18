/**
 * @kssr/shared — Learning analytics event contract.
 *
 * The game emits a typed stream of events. The analytics engine reduces
 * them into the parent dashboard metrics and feeds the adaptive selector.
 * The same events can be batched and shipped to the backend later.
 */
import type { SubjectId, Year, ChallengeMechanic } from "./curriculum.js";

interface BaseEvent {
  id: string;
  ts: number; // epoch ms
  sessionId: string;
  playerId: string;
}

export interface ChallengeAnsweredEvent extends BaseEvent {
  type: "challenge_answered";
  challengeId: string;
  topicId: string;
  subject: SubjectId;
  year: Year;
  mechanic: ChallengeMechanic;
  correct: boolean;
  /** Number of attempts before this answer (0 = first try). */
  attempts: number;
  hintUsed: boolean;
  /** Time taken to answer in ms. */
  durationMs: number;
}

export interface TopicCompletedEvent extends BaseEvent {
  type: "topic_completed";
  topicId: string;
  subject: SubjectId;
  year: Year;
  accuracy: number; // 0..1
}

export interface SessionEvent extends BaseEvent {
  type: "session_start" | "session_end";
}

export interface RewardEvent extends BaseEvent {
  type: "reward_granted";
  source: string;
  xp: number;
  coins: number;
  stars: number;
}

export type LearningEvent =
  | ChallengeAnsweredEvent
  | TopicCompletedEvent
  | SessionEvent
  | RewardEvent;

/** Aggregated metrics surfaced to the parent dashboard. */
export interface DashboardMetrics {
  totalTimeSec: number;
  totalXp: number;
  overallAccuracy: number; // 0..1
  topicsMastered: number;
  bySubject: Record<SubjectId, { accuracy: number; attempts: number; correct: number }>;
  /** Up to N strongest / weakest skills for insights. */
  strengths: string[];
  improvements: string[];
  /** Active minutes per ISO day for the activity chart. */
  dailyActivity: Record<string, number>;
}
