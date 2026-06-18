/**
 * Curriculum integrity tests — run against the built package (dist).
 * Verifies every authored slice loads, validates, and is internally sound.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { loadAllFromDisk } from "../dist/node-loader.js";
import {
  COVERAGE,
  listAvailable,
  getSubjectCurriculum,
  getTopic,
  getFlashcards,
  getChallenges,
  nextChallenge,
  targetDifficulty,
  updateMastery,
} from "../dist/index.js";

// Populate the registry from disk before any lookups.
loadAllFromDisk();

test("all declared coverage slices are available and valid", () => {
  for (const { year, subject } of COVERAGE) {
    const slice = getSubjectCurriculum(year, subject);
    assert.equal(slice.year, year);
    assert.equal(slice.subject, subject);
    assert.ok(slice.topics.length > 0, `${year}/${subject} has topics`);
  }
});

test("listAvailable matches coverage on disk", () => {
  assert.equal(listAvailable().length, COVERAGE.length);
});

test("every challenge has exactly one correct option", () => {
  for (const { year, subject } of COVERAGE) {
    for (const topic of getSubjectCurriculum(year, subject).topics) {
      for (const c of topic.challenges) {
        const correct = c.options.filter((o) => o.correct).length;
        assert.equal(correct, 1, `${c.id} should have one correct option`);
        assert.ok(c.options.length >= 2, `${c.id} should have >= 2 options`);
      }
    }
  }
});

test("topic and content accessors work", () => {
  const topic = getTopic(1, "math", "y1-math-numbers-20");
  assert.ok(topic, "topic found");
  assert.ok(getFlashcards(1, "math", "y1-math-numbers-20").length >= 1);
  assert.ok(getChallenges(1, "math", "y1-math-numbers-20").length >= 1);
});

test("difficulty banding scales with mastery", () => {
  assert.equal(targetDifficulty(0), "intro");
  assert.equal(targetDifficulty(0.5), "core");
  assert.equal(targetDifficulty(0.9), "stretch");
});

test("adaptive selector returns a fresh challenge when possible", () => {
  const topic = getTopic(1, "math", "y1-math-numbers-20");
  const seen = new Set(["y1-m1-1"]);
  const picked = nextChallenge(topic, { mastery: 0, seenCorrect: seen });
  assert.ok(picked, "a challenge is selected");
  assert.notEqual(picked.id, "y1-m1-1", "prefers an unseen challenge");
});

test("mastery EMA increases on correct, never throws", () => {
  let m = { topicId: "t", subject: "math", year: 1, attempts: 0, correct: 0, mastery: 0, lastPlayedAt: 0 };
  const before = m.mastery;
  m = updateMastery(m, true);
  assert.ok(m.mastery > before);
  assert.equal(m.attempts, 1);
  assert.equal(m.correct, 1);
});

test("missing slice throws a helpful error", () => {
  // Year 9 is outside KSSR coverage — should throw.
  assert.throws(() => getSubjectCurriculum(9, "math"), /not authored yet/);
});
