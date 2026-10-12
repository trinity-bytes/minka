/**
 * Pure helpers for Avatar.astro and Badge.astro: initials, a deterministic
 * tint per name, and capped counters. Plain JS so `node --test` imports it.
 */

/** Tint keys understood by Avatar.astro (see its `.avatar--*` rules). */
export const AVATAR_TONES = /** @type {const} */ (["mint", "lavender", "lavender-soft", "brand", "alt"]);

/** @typedef {(typeof AVATAR_TONES)[number]} AvatarTone */

/**
 * First letter of the first two words, uppercased ("Lucía Ramos" -> "LR").
 * Leading punctuation is skipped; empty names give "?".
 * @param {string} name
 */
export function initials(name) {
  const letters = name
    .split(/\s+/u)
    .map((word) => word.match(/\p{L}|\p{N}/u)?.[0])
    .filter(Boolean)
    .slice(0, 2);
  return letters.length ? letters.join("").toLocaleUpperCase("es") : "?";
}

/**
 * Stable tint for a name (FNV-1a hash), so a person keeps their color.
 * @param {string} name
 * @returns {AvatarTone}
 */
export function avatarTone(name) {
  let hash = 0x811c9dc5;
  for (const char of name.trim().toLocaleLowerCase("es")) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}

/**
 * Badge counter text, capped: 100 -> "99+".
 * @param {number} count
 * @param {number} [max]
 */
export function formatCount(count, max = 99) {
  return count > max ? `${max}+` : String(count);
}
