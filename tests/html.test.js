import { test } from "node:test";
import assert from "node:assert/strict";
import { escapeHtml } from "../src/scripts/lib/html.js";

test("escapeHtml escapes the five HTML-significant characters", () => {
  assert.equal(
    escapeHtml(`<img src=x onerror="alert('x')">&`),
    "&lt;img src=x onerror=&quot;alert(&#39;x&#39;)&quot;&gt;&amp;"
  );
});

test("escapeHtml leaves plain text untouched, including accents", () => {
  assert.equal(escapeHtml("Bicicleta urbana · Jesús María"), "Bicicleta urbana · Jesús María");
});

test("escapeHtml does not double-escape semantics: ampersand is escaped first", () => {
  assert.equal(escapeHtml("&lt;"), "&amp;lt;");
});

test("escapeHtml stringifies numbers and booleans", () => {
  assert.equal(escapeHtml(4.5), "4.5");
  assert.equal(escapeHtml(0), "0");
  assert.equal(escapeHtml(false), "false");
});

test("escapeHtml renders null and undefined as an empty string", () => {
  assert.equal(escapeHtml(null), "");
  assert.equal(escapeHtml(undefined), "");
});
