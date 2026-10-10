import { test } from "node:test";
import assert from "node:assert/strict";
import { countAt, easeOutExpo, formatNumber } from "../src/scripts/lib/stat-count.js";

test("formatNumber groups thousands with commas", () => {
  assert.equal(formatNumber(0), "0");
  assert.equal(formatNumber(500), "500");
  assert.equal(formatNumber(1250), "1,250");
  assert.equal(formatNumber(1250000), "1,250,000");
});

test("formatNumber rounds to an integer before grouping", () => {
  assert.equal(formatNumber(1249.6), "1,250");
  assert.equal(formatNumber(749.4), "749");
});

test("easeOutExpo starts at 0, ends at 1 and clamps out-of-range progress", () => {
  assert.equal(easeOutExpo(0), 0);
  assert.equal(easeOutExpo(1), 1);
  assert.equal(easeOutExpo(-0.5), 0);
  assert.equal(easeOutExpo(2), 1);
});

test("easeOutExpo front-loads progress and never decreases", () => {
  assert.ok(easeOutExpo(0.5) > 0.9);
  let previous = 0;
  for (let i = 1; i <= 20; i++) {
    const value = easeOutExpo(i / 20);
    assert.ok(value >= previous, `not monotonic at ${i / 20}`);
    previous = value;
  }
});

test("countAt returns the eased integer count between 0 and the target", () => {
  assert.equal(countAt(1250, 0), 0);
  assert.equal(countAt(1250, 1), 1250);
  const mid = countAt(1250, 0.3);
  assert.ok(Number.isInteger(mid));
  assert.ok(mid > 0 && mid < 1250);
});

test("countAt never overshoots the target", () => {
  assert.equal(countAt(500, 1.5), 500);
  assert.equal(countAt(500, -1), 0);
});
