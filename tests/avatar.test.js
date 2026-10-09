import { test } from "node:test";
import assert from "node:assert/strict";
import { initials, avatarTone, AVATAR_TONES, formatCount } from "../src/scripts/lib/avatar.js";

test("initials take the first letter of the first two words, uppercased", () => {
  assert.equal(initials("lucía ramos"), "LR");
  assert.equal(initials("Ana María Quispe Huamán"), "AM");
});

test("initials use one letter for single names and ignore extra whitespace", () => {
  assert.equal(initials("  Rosa  "), "R");
  assert.equal(initials("Mateo\t  Flores "), "MF");
});

test("initials keep accented letters and skip leading punctuation", () => {
  assert.equal(initials("Ñusta Álvarez"), "ÑÁ");
  assert.equal(initials("@juan (perez)"), "JP");
});

test("initials fall back to a placeholder for empty names", () => {
  assert.equal(initials(""), "?");
  assert.equal(initials("   "), "?");
});

test("avatarTone is deterministic and always a known tone", () => {
  const names = ["Lucía Ramos", "Mateo Flores", "Rosa", "Ana María Quispe", ""];
  for (const name of names) {
    const tone = avatarTone(name);
    assert.ok(AVATAR_TONES.includes(tone), `${tone} is a known tone`);
    assert.equal(avatarTone(name), tone);
  }
});

test("avatarTone spreads different names across tones", () => {
  const tones = new Set(
    ["Lucía Ramos", "Mateo Flores", "Rosa Huamán", "Diego Paredes", "Valeria Soto", "Jorge Quispe"].map(avatarTone),
  );
  assert.ok(tones.size >= 3, `expected at least 3 tones, got ${tones.size}`);
});

test("formatCount caps large counts with a plus sign", () => {
  assert.equal(formatCount(0), "0");
  assert.equal(formatCount(7), "7");
  assert.equal(formatCount(99), "99");
  assert.equal(formatCount(100), "99+");
  assert.equal(formatCount(12, 9), "9+");
});
