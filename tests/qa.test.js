import { test } from "node:test";
import assert from "node:assert/strict";
import {
  QA_MAX_LENGTH,
  validateQaText,
  userIdOf,
  ownerIdOf,
  buildThreads,
  addQuestion,
  addReply,
  formatRelativeTime,
  questionCountLabel,
  seedQuestions,
} from "../src/scripts/lib/qa.js";

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const NOW = Date.UTC(2026, 9, 11, 15, 0, 0);

test("validateQaText trims and accepts normal text", () => {
  const r = validateQaText("  ¿Sigue disponible?  ");
  assert.equal(r.ok, true);
  assert.equal(r.value, "¿Sigue disponible?");
  assert.equal(r.error, null);
  assert.equal(r.remaining, QA_MAX_LENGTH - r.value.length);
});

test("validateQaText rejects empty and whitespace-only text", () => {
  assert.equal(validateQaText("").error, "empty");
  assert.equal(validateQaText("   \n ").error, "empty");
  assert.equal(validateQaText(undefined).error, "empty");
  assert.equal(validateQaText("   ").ok, false);
});

test("validateQaText rejects text over the max length", () => {
  const r = validateQaText("a".repeat(QA_MAX_LENGTH + 1));
  assert.equal(r.ok, false);
  assert.equal(r.error, "too-long");
  assert.equal(r.remaining, -1);
  assert.equal(validateQaText("a".repeat(QA_MAX_LENGTH)).ok, true);
  assert.equal(validateQaText("abcd", 3).error, "too-long");
});

test("userIdOf mirrors the publish owner id (id, then email, then demo)", () => {
  assert.equal(userIdOf(null), null);
  assert.equal(userIdOf({ id: "u1", email: "a@b.pe" }), "u1");
  assert.equal(userIdOf({ email: "a@b.pe" }), "a@b.pe");
  assert.equal(userIdOf({ name: "Sin id" }), "demo");
});

test("ownerIdOf mirrors detail.js (owner id or seller-demo)", () => {
  assert.equal(ownerIdOf({ owner: { id: "vec-1" } }), "vec-1");
  assert.equal(ownerIdOf({ owner: { name: "x" } }), "seller-demo");
  assert.equal(ownerIdOf({}), "seller-demo");
});

const questions = [
  {
    id: "q1",
    authorId: "n1",
    authorName: "Lucía",
    text: "Primera",
    createdAt: NOW - 3 * DAY,
    replies: [
      { id: "r2", authorId: "n2", authorName: "Diego", text: "Luego", createdAt: NOW - 1 * DAY },
      { id: "r1", authorId: "owner", authorName: "Dueña", text: "Antes", createdAt: NOW - 2 * DAY },
    ],
  },
  { id: "q2", authorId: "n2", authorName: "Diego", text: "Segunda", createdAt: NOW - HOUR, replies: [] },
];

test("buildThreads sorts questions newest first and replies oldest first", () => {
  const threads = buildThreads(questions, "owner");
  assert.deepEqual(
    threads.map((q) => q.id),
    ["q2", "q1"]
  );
  assert.deepEqual(
    threads[1].replies.map((r) => r.id),
    ["r1", "r2"]
  );
});

test("buildThreads flags posts written by the listing owner", () => {
  const threads = buildThreads(questions, "owner");
  assert.equal(threads[1].isOwner, false);
  assert.equal(threads[1].replies[0].isOwner, true);
  assert.equal(threads[1].replies[1].isOwner, false);
});

test("buildThreads does not mutate its input and tolerates missing replies", () => {
  const input = [{ id: "q", authorId: "a", authorName: "A", text: "t", createdAt: NOW }];
  const snapshot = JSON.stringify(questions);
  const threads = buildThreads(input, "owner");
  buildThreads(questions, "owner");
  assert.deepEqual(threads[0].replies, []);
  assert.equal(JSON.stringify(questions), snapshot);
  assert.deepEqual(buildThreads(null, "owner"), []);
});

test("addQuestion appends a question with no replies, immutably", () => {
  const next = addQuestion(questions, {
    id: "q3",
    author: { id: "me", name: "Yo" },
    text: "Nueva",
    createdAt: NOW,
  });
  assert.equal(questions.length, 2);
  assert.equal(next.length, 3);
  assert.deepEqual(next[2], {
    id: "q3",
    authorId: "me",
    authorName: "Yo",
    text: "Nueva",
    createdAt: NOW,
    replies: [],
  });
});

test("addReply adds one reply level under the target question only", () => {
  const next = addReply(questions, "q2", {
    id: "r9",
    author: { id: "owner", name: "Dueña" },
    text: "Sí",
    createdAt: NOW,
  });
  assert.equal(questions[1].replies.length, 0);
  assert.equal(next[1].replies.length, 1);
  assert.equal(next[1].replies[0].authorId, "owner");
  assert.equal(next[1].replies[0].replies, undefined);
  assert.equal(next[0], questions[0]);
});

test("addReply leaves the list unchanged for an unknown question", () => {
  const next = addReply(questions, "nope", {
    id: "r",
    author: { id: "a", name: "A" },
    text: "x",
    createdAt: NOW,
  });
  assert.deepEqual(next, questions);
});

test("formatRelativeTime gives short Spanish relative times", () => {
  assert.equal(formatRelativeTime(NOW - 20 * 1000, NOW), "ahora");
  assert.equal(formatRelativeTime(NOW - MIN, NOW), "hace 1 min");
  assert.equal(formatRelativeTime(NOW - 45 * MIN, NOW), "hace 45 min");
  assert.equal(formatRelativeTime(NOW - 3 * HOUR, NOW), "hace 3 h");
  assert.equal(formatRelativeTime(NOW - DAY, NOW), "ayer");
  assert.equal(formatRelativeTime(NOW - 4 * DAY, NOW), "hace 4 días");
  assert.equal(formatRelativeTime(Date.UTC(2026, 8, 2, 12), NOW), "2 sept");
  assert.equal(formatRelativeTime(Date.UTC(2025, 0, 5, 12), NOW), "5 ene 2025");
  assert.equal(formatRelativeTime(NOW + 5 * MIN, NOW), "ahora");
});

test("questionCountLabel pluralizes", () => {
  assert.equal(questionCountLabel(0), "Sin preguntas");
  assert.equal(questionCountLabel(1), "1 pregunta");
  assert.equal(questionCountLabel(4), "4 preguntas");
});

test("seedQuestions gives the demo listing a thread answered by its owner", () => {
  const item = { id: "itm-001", owner: { id: "vec-1", name: "María Quispe" } };
  const seeded = seedQuestions(item, NOW);
  assert.ok(seeded.length >= 2);
  const ownerReplies = seeded.flatMap((q) => q.replies).filter((r) => r.authorId === "vec-1");
  assert.ok(ownerReplies.length >= 1);
  assert.equal(ownerReplies[0].authorName, "María Quispe");
  assert.ok(seeded.every((q) => q.createdAt < NOW));
});

test("seedQuestions uses seller-demo for an owner without id and is empty for unknown items", () => {
  const seeded = seedQuestions({ id: "itm-001", owner: { name: "Lucero Pipa" } }, NOW);
  assert.ok(seeded.flatMap((q) => q.replies).some((r) => r.authorId === "seller-demo"));
  assert.deepEqual(seedQuestions({ id: "nuevo-123", owner: { id: "x" } }, NOW), []);
});
