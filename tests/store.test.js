import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const SOURCE = readFileSync(new URL("../public/assets/scripts/core/store.js", import.meta.url), "utf8");

/** Runs core/store.js (a classic script) against an in-memory localStorage. */
function loadStore(initial = {}) {
  const data = new Map(Object.entries(initial));
  const localStorage = {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
  };
  const window = {};
  vm.runInNewContext(SOURCE, { window, localStorage, console });
  return { Store: window.Store, data };
}

test("getQuestions returns null for a listing without stored questions", () => {
  const { Store } = loadStore();
  assert.equal(Store.getQuestions("itm-001"), null);
});

test("saveQuestions keeps one map keyed by listing id under minka_questions", () => {
  const { Store, data } = loadStore({ minka_questions: JSON.stringify({ "itm-002": [{ id: "q-0" }] }) });
  assert.equal(Store.saveQuestions("itm-001", [{ id: "q-1" }]), true);
  assert.deepEqual(JSON.parse(data.get("minka_questions")), {
    "itm-002": [{ id: "q-0" }],
    "itm-001": [{ id: "q-1" }],
  });
  // JSON round trip: values created inside the vm realm have other prototypes.
  assert.deepEqual(JSON.parse(JSON.stringify(Store.getQuestions("itm-001"))), [{ id: "q-1" }]);
});

test("corrupt or non-map stored questions read as empty and are replaced on save", () => {
  for (const raw of ["{not json", "[1,2]", "null", JSON.stringify({ "itm-001": "x" })]) {
    const { Store, data } = loadStore({ minka_questions: raw });
    assert.equal(Store.getQuestions("itm-001"), null, raw);
    Store.saveQuestions("itm-003", []);
    const saved = JSON.parse(data.get("minka_questions"));
    assert.deepEqual(saved["itm-003"], [], raw);
  }
});
