import { test } from "node:test";
import assert from "node:assert/strict";
import { tr } from "../src/scripts/lib/i18n.js";

const fakeI18n = (dict) => ({ t: (key) => dict[key] ?? key });

test("tr returns the translation when I18n knows the key", () => {
  assert.equal(tr("qa_reply", "Responder", {}, fakeI18n({ qa_reply: "Reply" })), "Reply");
});

test("tr falls back to the Spanish text for unknown keys or without I18n", () => {
  assert.equal(tr("qa_reply", "Responder", {}, fakeI18n({})), "Responder");
  assert.equal(tr("qa_reply", "Responder", {}, undefined), "Responder");
  assert.equal(tr("qa_reply", "Responder", {}, { t: () => "" }), "Responder");
});

test("tr fills {name} placeholders and leaves unknown ones untouched", () => {
  const i18n = fakeI18n({ qa_reply_to: "Reply to {name}" });
  assert.equal(tr("qa_reply_to", "Responder a {name}", { name: "Ana" }, i18n), "Reply to Ana");
  assert.equal(tr("x", "{count} de {total}", { count: 2 }, undefined), "2 de {total}");
});
