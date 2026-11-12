import { test } from "node:test";
import { strict as assert } from "node:assert";
import { scrollProgress } from "../src/scripts/lib/scroll-progress.js";

test("scroll progress is clamped to the scrollable document range", () => {
  assert.equal(scrollProgress(0, 2000, 1000), 0);
  assert.equal(scrollProgress(500, 2000, 1000), 0.5);
  assert.equal(scrollProgress(1000, 2000, 1000), 1);
  assert.equal(scrollProgress(1200, 2000, 1000), 1);
  assert.equal(scrollProgress(-20, 2000, 1000), 0);
  assert.equal(scrollProgress(0, 1000, 1000), 0);
});
