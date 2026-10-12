/**
 * Pure helpers for the chat screen (pages/chat.js): bubble grouping, the
 * thread row preview, the presentational unread count and the list filter.
 * Plain JS so `node --test` imports it. Messages look like
 * `{ from: "me" | "them", text, time, image? }`.
 */

/**
 * Position of each message inside its run of consecutive messages from the
 * same sender, so bubbles can be grouped with tighter spacing.
 * @param {Array<{ from: string }>} messages
 * @returns {Array<{ start: boolean, end: boolean }>}
 */
export function groupPositions(messages) {
  return messages.map((message, index) => ({
    start: index === 0 || messages[index - 1].from !== message.from,
    end: index === messages.length - 1 || messages[index + 1].from !== message.from,
  }));
}

/**
 * One-line preview of a thread's last message for the conversation list.
 * Photos (no text, an image) read as "Foto".
 * @param {{ messages?: Array<{ from: string, text?: string, time?: string, image?: string | null }> }} thread
 */
export function lastMessagePreview(thread) {
  const last = thread.messages?.at(-1);
  if (!last) return { text: "", own: false, time: "" };
  const text = last.text || (last.image ? "Foto" : "");
  return { text, own: last.from === "me", time: last.time ?? "" };
}

/**
 * Incoming messages after the user's last reply (the unread badge for a
 * thread the user has not opened yet).
 * @param {Array<{ from: string }>} messages
 */
export function trailingIncomingCount(messages) {
  let count = 0;
  for (let i = messages.length - 1; i >= 0 && messages[i].from !== "me"; i -= 1) count += 1;
  return count;
}

/** Lowercase without diacritics, for forgiving search. */
function fold(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("es");
}

/**
 * Threads whose partner name, listing or last message contains the query
 * (case and accent insensitive). A blank query keeps every thread.
 * @template {{ user: string, item: string, messages?: Array<{ text?: string }> }} T
 * @param {T[]} threads
 * @param {string} query
 * @returns {T[]}
 */
export function filterThreads(threads, query) {
  const needle = fold(query).trim();
  if (!needle) return threads;
  return threads.filter((thread) =>
    [thread.user, thread.item, lastMessagePreview(thread).text].some((field) =>
      fold(field).includes(needle)
    )
  );
}
