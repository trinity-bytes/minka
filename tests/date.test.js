import { test } from "node:test";
import assert from "node:assert/strict";
import { parseLocalDate, toLocalDateString } from "../src/scripts/lib/date.js";

// Pin a UTC-5 zone (Lima, no DST) so the UTC off-by-one is reproducible
// regardless of the machine running the suite. Node honours runtime TZ changes.
process.env.TZ = "America/Lima";

test("parseLocalDate keeps the calendar day of a date-only string", () => {
  const date = parseLocalDate("2025-12-15");
  assert.equal(date.getFullYear(), 2025);
  assert.equal(date.getMonth(), 11);
  assert.equal(date.getDate(), 15);
  assert.equal(date.getHours(), 0);
});

test("parseLocalDate differs from the UTC parse in a negative-offset zone", () => {
  // The built-in parser treats date-only strings as UTC midnight.
  assert.equal(new Date("2026-01-01").getDate(), 31);
  const local = parseLocalDate("2026-01-01");
  assert.equal(local.getDate(), 1);
  assert.equal(local.getMonth(), 0);
});

test("parseLocalDate returns an invalid date for malformed input", () => {
  assert.ok(Number.isNaN(parseLocalDate("not-a-date").getTime()));
  assert.ok(Number.isNaN(parseLocalDate("").getTime()));
  assert.ok(Number.isNaN(parseLocalDate(undefined).getTime()));
});

test("toLocalDateString formats the local calendar day as YYYY-MM-DD", () => {
  // 23:30 local on 2026-10-09 is already 2026-10-10 in UTC for Lima.
  assert.equal(toLocalDateString(new Date(2026, 9, 9, 23, 30)), "2026-10-09");
  assert.equal(toLocalDateString(new Date(2026, 0, 5)), "2026-01-05");
});

test("toLocalDateString round-trips through parseLocalDate", () => {
  assert.equal(toLocalDateString(parseLocalDate("2025-12-31")), "2025-12-31");
});
