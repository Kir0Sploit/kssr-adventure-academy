/**
 * Curriculum integrity tests — run against the built package (dist).
 * Content is generated, so we verify the generator output is always valid.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
  COVERAGE,
  listAvailable,
  getSubjectCurriculum,
  getTopics,
  getChallenges,
  generate,
  isGeneratable,
  targetDifficulty,
  updateMastery,
  validateSubjectCurriculum,
  TOPIC_COUNT,
} from "../dist/index.js";

test("covers all 6 years x 3 subjects", () => {
  assert.equal(listAvailable().length, COVERAGE.length);
  assert.ok(COVERAGE.length >= 18, "at least 18 year/subject slices");
});

test("there are 100+ topics", () => {
  assert.ok(TOPIC_COUNT >= 100, `expected 100+ topics, got ${TOPIC_COUNT}`);
});

test("every generated slice validates", () => {
  for (const { year, subject } of COVERAGE) {
    const slice = getSubjectCurriculum(year, subject);
    // throws on any structural problem (one correct option, localized text, etc.)
    validateSubjectCurriculum(slice, year, subject);
    assert.ok(slice.topics.length > 0);
  }
});

test("every challenge has exactly one correct option", () => {
  for (const { year, subject } of COVERAGE) {
    for (const topic of getTopics(year, subject)) {
      for (const c of topic.challenges) {
        const correct = c.options.filter((o) => o.correct).length;
        assert.equal(correct, 1, `${c.id} should have one correct option`);
        assert.ok(c.options.length >= 2);
      }
    }
  }
});

test("generator produces fresh, valid, non-empty questions", () => {
  const qs = generate("t-test", "math", "multiplication", 5, 6);
  assert.ok(qs.length >= 1);
  for (const q of qs) {
    assert.equal(q.options.filter((o) => o.correct).length, 1);
    assert.ok(q.prompt.en && q.prompt.ms);
  }
});

test("isGeneratable knows supported skills", () => {
  assert.ok(isGeneratable("math", "addition"));
  assert.ok(isGeneratable("bm", "peribahasa"));
  assert.ok(isGeneratable("english", "past-tense"));
  assert.equal(isGeneratable("math", "nonsense"), false);
});

test("difficulty banding + mastery EMA", () => {
  assert.equal(targetDifficulty(0), "intro");
  assert.equal(targetDifficulty(0.5), "core");
  assert.equal(targetDifficulty(0.9), "stretch");
  let m = { topicId: "t", subject: "math", year: 1, attempts: 0, correct: 0, mastery: 0, lastPlayedAt: 0 };
  m = updateMastery(m, true);
  assert.ok(m.mastery > 0);
});

test("each topic exposes a generator skill and challenges", () => {
  const topics = getTopics(3, "math");
  assert.ok(topics.length > 0);
  for (const t of topics) {
    assert.ok(t.skill, "topic has a skill");
    assert.ok(getChallenges(3, "math", t.id).length > 0);
  }
});
