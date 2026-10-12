import { test } from "node:test";
import assert from "node:assert/strict";
import {
  groupPositions,
  lastMessagePreview,
  trailingIncomingCount,
  filterThreads,
} from "../src/scripts/lib/chat-thread.js";

const msg = (from, text = "x") => ({ from, text, time: "10:00" });

test("groupPositions marks the start and end of each run of one sender", () => {
  const list = [msg("them"), msg("them"), msg("me"), msg("them")];
  assert.deepEqual(groupPositions(list), [
    { start: true, end: false },
    { start: false, end: true },
    { start: true, end: true },
    { start: true, end: true },
  ]);
});

test("groupPositions handles empty and single-message lists", () => {
  assert.deepEqual(groupPositions([]), []);
  assert.deepEqual(groupPositions([msg("me")]), [{ start: true, end: true }]);
});

test("lastMessagePreview returns the last text, sender and time", () => {
  const thread = { messages: [msg("them", "Hola"), { from: "me", text: "Sí", time: "09:11" }] };
  assert.deepEqual(lastMessagePreview(thread), { text: "Sí", own: true, time: "09:11" });
});

test("lastMessagePreview labels photos and handles threads without messages", () => {
  const photo = { messages: [{ from: "them", text: "", image: "data:x", time: "08:00" }] };
  assert.deepEqual(lastMessagePreview(photo), { text: "Foto", own: false, time: "08:00" });
  assert.deepEqual(lastMessagePreview({ messages: [] }), { text: "", own: false, time: "" });
  assert.deepEqual(lastMessagePreview({}), { text: "", own: false, time: "" });
});

test("trailingIncomingCount counts incoming messages after the last own one", () => {
  assert.equal(trailingIncomingCount([msg("them"), msg("me"), msg("them"), msg("them")]), 2);
  assert.equal(trailingIncomingCount([msg("them"), msg("me")]), 0);
  assert.equal(trailingIncomingCount([msg("them")]), 1);
  assert.equal(trailingIncomingCount([]), 0);
});

test("filterThreads matches name, item or last message ignoring case and accents", () => {
  const threads = [
    { id: "a", user: "Lucía P.", item: "Bicicleta urbana", messages: [msg("them", "¿Sigue disponible?")] },
    { id: "b", user: "Carlos R.", item: "Mesa de centro", messages: [msg("them", "¿Sábado?")] },
  ];
  assert.deepEqual(filterThreads(threads, "lucia").map((t) => t.id), ["a"]);
  assert.deepEqual(filterThreads(threads, "MESA").map((t) => t.id), ["b"]);
  assert.deepEqual(filterThreads(threads, "sabado").map((t) => t.id), ["b"]);
  assert.deepEqual(filterThreads(threads, "zzz"), []);
});

test("filterThreads returns every thread for a blank query", () => {
  const threads = [{ id: "a", user: "A", item: "", messages: [] }];
  assert.equal(filterThreads(threads, "  ").length, 1);
  assert.equal(filterThreads(threads, "").length, 1);
});
