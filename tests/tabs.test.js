import { test } from "node:test";
import assert from "node:assert/strict";
import { nextTabIndex } from "../src/scripts/lib/tabs.js";

test("nextTabIndex moves with the arrow keys and wraps at both ends", () => {
  assert.equal(nextTabIndex(0, "ArrowRight", 3), 1);
  assert.equal(nextTabIndex(2, "ArrowRight", 3), 0);
  assert.equal(nextTabIndex(1, "ArrowLeft", 3), 0);
  assert.equal(nextTabIndex(0, "ArrowLeft", 3), 2);
});

test("nextTabIndex jumps to the first and last tab with Home and End", () => {
  assert.equal(nextTabIndex(1, "Home", 4), 0);
  assert.equal(nextTabIndex(1, "End", 4), 3);
});

test("nextTabIndex mirrors the horizontal arrows in right-to-left layouts", () => {
  assert.equal(nextTabIndex(0, "ArrowRight", 3, { rtl: true }), 2);
  assert.equal(nextTabIndex(0, "ArrowLeft", 3, { rtl: true }), 1);
});

test("nextTabIndex returns -1 for keys that do not move focus", () => {
  assert.equal(nextTabIndex(0, "Enter", 3), -1);
  assert.equal(nextTabIndex(0, "ArrowDown", 3), -1);
  assert.equal(nextTabIndex(0, "a", 3), -1);
});

test("nextTabIndex returns -1 when there are no tabs", () => {
  assert.equal(nextTabIndex(0, "ArrowRight", 0), -1);
  assert.equal(nextTabIndex(0, "Home", 0), -1);
});
