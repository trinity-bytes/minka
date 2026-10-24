import { test } from "node:test";
import assert from "node:assert/strict";
import { approach, magneticPull, normalizedOffset } from "../src/scripts/lib/pointer.js";

const rect = { left: 100, top: 50, width: 200, height: 100 };

test("normalizedOffset maps the rect's center to 0 and its edges to -1 and 1", () => {
  assert.deepEqual(normalizedOffset(rect, 200, 100), { x: 0, y: 0 });
  assert.deepEqual(normalizedOffset(rect, 100, 50), { x: -1, y: -1 });
  assert.deepEqual(normalizedOffset(rect, 300, 150), { x: 1, y: 1 });
  assert.deepEqual(normalizedOffset(rect, 250, 75), { x: 0.5, y: -0.5 });
});

test("normalizedOffset clamps pointers outside the rect", () => {
  assert.deepEqual(normalizedOffset(rect, -500, 900), { x: -1, y: 1 });
});

test("normalizedOffset returns 0 for an empty rect instead of NaN", () => {
  assert.deepEqual(normalizedOffset({ left: 0, top: 0, width: 0, height: 0 }, 10, 10), { x: 0, y: 0 });
});

test("magneticPull scales the distance from the center by the strength", () => {
  assert.deepEqual(magneticPull(rect, 200, 100, 0.4, 20), { x: 0, y: 0 });
  assert.deepEqual(magneticPull(rect, 220, 90, 0.5, 20), { x: 10, y: -5 });
});

test("magneticPull caps each axis at the max distance", () => {
  assert.deepEqual(magneticPull(rect, 300, 0, 0.5, 12), { x: 12, y: -12 });
});

test("approach moves a fraction of the remaining distance toward the target", () => {
  assert.equal(approach(0, 10, 0.25), 2.5);
  assert.equal(approach(10, 0, 0.5), 5);
  assert.equal(approach(4, 4, 0.3), 4);
});
