/**
 * Pure word-splitting for staggered headline reveals (see WordReveal.astro).
 * Plain JS with JSDoc so `node --test` can import it without a TS loader.
 *
 * Key words are marked either inline with asterisks ("Dale *otra vida*") or
 * through `options.keys` (matched ignoring case and edge punctuation).
 * Punctuation stays attached to its word so wrapping looks natural.
 */

/**
 * @typedef {{ text: string; index: number; key: boolean }} Word
 * @typedef {{ text: string; words: Word[] }} SplitResult
 */

const MARKER = "*";
const EDGE_PUNCTUATION = /^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu;

/** @param {string} word */
function normalize(word) {
  return word.replace(EDGE_PUNCTUATION, "").toLocaleLowerCase("es");
}

/**
 * @param {string} source Sentence, optionally with `*key words*` markers.
 * @param {{ keys?: string[] }} [options]
 * @returns {SplitResult}
 */
export function splitWords(source, options = {}) {
  if (typeof source !== "string") {
    throw new TypeError("splitWords expects a string");
  }
  const keySet = new Set((options.keys ?? []).map(normalize));

  /** @type {{ text: string; key: boolean }[]} */
  const raw = [];
  let current = "";
  let currentKey = false;
  let inKey = false;

  const flush = () => {
    if (current) raw.push({ text: current, key: currentKey });
    current = "";
    currentKey = false;
  };

  for (const char of source) {
    if (char === MARKER) {
      inKey = !inKey;
    } else if (/\s/u.test(char)) {
      flush();
    } else {
      current += char;
      currentKey ||= inKey;
    }
  }
  if (inKey) {
    throw new Error(`splitWords: unbalanced "${MARKER}" key marker in "${source}"`);
  }
  flush();

  const words = raw.map((word, index) => ({
    text: word.text,
    index,
    key: word.key || keySet.has(normalize(word.text)),
  }));
  return { text: words.map((w) => w.text).join(" "), words };
}
