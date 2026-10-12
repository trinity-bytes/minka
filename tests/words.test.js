import { test } from "node:test";
import assert from "node:assert/strict";
import { splitWords } from "../src/scripts/lib/words.js";

test("splits a sentence into indexed words", () => {
  const result = splitWords("Dale otra vida a tus cosas");
  assert.equal(result.text, "Dale otra vida a tus cosas");
  assert.deepEqual(
    result.words.map((w) => [w.text, w.index, w.key]),
    [
      ["Dale", 0, false],
      ["otra", 1, false],
      ["vida", 2, false],
      ["a", 3, false],
      ["tus", 4, false],
      ["cosas", 5, false],
    ],
  );
});

test("collapses surrounding and repeated whitespace", () => {
  const result = splitWords("  Trueque \n  de   barrio ");
  assert.equal(result.text, "Trueque de barrio");
  assert.deepEqual(
    result.words.map((w) => w.text),
    ["Trueque", "de", "barrio"],
  );
});

test("marks words wrapped in asterisks as key words and strips the markers", () => {
  const result = splitWords("Dale *otra vida* a tus *cosas*.");
  assert.equal(result.text, "Dale otra vida a tus cosas.");
  assert.deepEqual(
    result.words.map((w) => [w.text, w.key]),
    [
      ["Dale", false],
      ["otra", true],
      ["vida", true],
      ["a", false],
      ["tus", false],
      ["cosas.", true],
    ],
  );
});

test("keeps punctuation and accents attached to their word", () => {
  const result = splitWords("¿Listo para *girar*, Perú?");
  assert.deepEqual(
    result.words.map((w) => [w.text, w.key]),
    [
      ["¿Listo", false],
      ["para", false],
      ["girar,", true],
      ["Perú?", false],
    ],
  );
});

test("marks key words from the keys option, ignoring case and punctuation", () => {
  const result = splitWords("Intercambia, no compres. Comparte.", { keys: ["comparte", "INTERCAMBIA"] });
  assert.deepEqual(
    result.words.map((w) => [w.text, w.key]),
    [
      ["Intercambia,", true],
      ["no", false],
      ["compres.", false],
      ["Comparte.", true],
    ],
  );
});

test("returns no words for empty or blank input", () => {
  assert.deepEqual(splitWords(""), { text: "", words: [] });
  assert.deepEqual(splitWords("   "), { text: "", words: [] });
});

test("rejects unbalanced key markers", () => {
  assert.throws(() => splitWords("Dale *otra vida"), /unbalanced/i);
});

test("rejects non-string input", () => {
  assert.throws(() => splitWords(undefined), TypeError);
});
