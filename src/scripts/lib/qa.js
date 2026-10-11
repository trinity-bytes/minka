/**
 * Pure helpers for the public Q&A on a listing (T12): validation, identity,
 * thread building (questions newest first, one reply level oldest first,
 * owner flag), immutable updates, relative times and demo seed data.
 * Plain JS so `node --test` imports it; the DOM side lives in qa-view.js.
 *
 * Stored shape (per listing):
 *   { id, authorId, authorName, text, createdAt (ms), replies: [
 *     { id, authorId, authorName, text, createdAt } ] }
 */

export const QA_MAX_LENGTH = 500;

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"];

/**
 * @param {unknown} text
 * @param {number} [max]
 * @returns {{ok: boolean, value: string, error: null | "empty" | "too-long", remaining: number}}
 */
export function validateQaText(text, max = QA_MAX_LENGTH) {
  const value = typeof text === "string" ? text.trim() : "";
  const remaining = max - value.length;
  let error = null;
  if (!value) error = "empty";
  else if (remaining < 0) error = "too-long";
  return { ok: error === null, value, error, remaining };
}

/** Session user id, the same rule publish.js uses for a listing's owner. */
export function userIdOf(session) {
  if (!session) return null;
  return session.id || session.email || "demo";
}

/** Listing owner id, the same fallback detail.js uses for its links. */
export function ownerIdOf(item) {
  return item?.owner?.id || "seller-demo";
}

const byCreatedAt = (a, b) => a.createdAt - b.createdAt;

/**
 * View model: questions newest first, replies oldest first, each post
 * flagged `isOwner` when written by the listing owner. Input is not mutated.
 */
export function buildThreads(questions, ownerId) {
  if (!Array.isArray(questions)) return [];
  return questions
    .map((q) => ({
      ...q,
      isOwner: q.authorId === ownerId,
      replies: (Array.isArray(q.replies) ? q.replies : [])
        .map((r) => ({ ...r, isOwner: r.authorId === ownerId }))
        .sort(byCreatedAt),
    }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

function post({ id, author, text, createdAt }) {
  return { id, authorId: author.id, authorName: author.name, text, createdAt };
}

/** Returns a new list with the question appended (no replies yet). */
export function addQuestion(questions, entry) {
  return [...(questions || []), { ...post(entry), replies: [] }];
}

/** Returns a new list with the reply added under `questionId` (one level). */
export function addReply(questions, questionId, entry) {
  return (questions || []).map((q) =>
    q.id === questionId ? { ...q, replies: [...(q.replies || []), post(entry)] } : q
  );
}

/** "ahora", "hace 5 min", "hace 3 h", "ayer", "hace 4 días", "2 sept". */
export function formatRelativeTime(timestamp, now = Date.now()) {
  const diff = Math.max(0, now - timestamp);
  if (diff < MINUTE) return "ahora";
  if (diff < HOUR) return `hace ${Math.floor(diff / MINUTE)} min`;
  if (diff < DAY) return `hace ${Math.floor(diff / HOUR)} h`;
  const days = Math.floor(diff / DAY);
  if (days === 1) return "ayer";
  if (days < 7) return `hace ${days} días`;
  const date = new Date(timestamp);
  const label = `${date.getDate()} ${MONTHS[date.getMonth()]}`;
  return date.getFullYear() === new Date(now).getFullYear() ? label : `${label} ${date.getFullYear()}`;
}

export function questionCountLabel(count) {
  if (!count) return "Sin preguntas";
  return count === 1 ? "1 pregunta" : `${count} preguntas`;
}

// Demo threads for a few seeded listings. `owner: true` marks posts written
// by the listing owner, whoever that is for the item being shown.
const NEIGHBORS = {
  lucia: { id: "vec-9", name: "Lucía Paredes" },
  diego: { id: "vec-10", name: "Diego Rojas" },
  carmen: { id: "vec-11", name: "Carmen Silva" },
};

const SEEDS = {
  "itm-001": [
    {
      author: NEIGHBORS.lucia,
      ago: 2 * DAY + 3 * HOUR,
      text: "¿Los frenos están en buen estado? La usaría para ir al trabajo todos los días.",
      replies: [
        { owner: true, ago: 2 * DAY, text: "Sí, los cambié hace un mes y tiene luces nuevas." },
        { author: NEIGHBORS.diego, ago: DAY + 5 * HOUR, text: "Yo la vi en persona, está impecable." },
      ],
    },
    {
      author: NEIGHBORS.carmen,
      ago: 5 * HOUR,
      text: "¿Aceptarías una mesa de centro a cambio? Puedo llevarla a Miraflores.",
      replies: [],
    },
  ],
  "itm-002": [
    {
      author: NEIGHBORS.diego,
      ago: DAY + 2 * HOUR,
      text: "¿Hasta qué hora podrías hacer el intercambio entre semana?",
      replies: [{ owner: true, ago: DAY, text: "Hasta las 7 p. m., cerca del parque." }],
    },
  ],
};

/** Seed questions for a listing (empty when it has no demo thread). */
export function seedQuestions(item, now = Date.now()) {
  const templates = SEEDS[item?.id] || [];
  const owner = { id: ownerIdOf(item), name: item?.owner?.name || "Vecino" };
  return templates.map((q, qi) => ({
    ...post({ id: `seed-${item.id}-q${qi}`, author: q.author, text: q.text, createdAt: now - q.ago }),
    replies: q.replies.map((r, ri) =>
      post({
        id: `seed-${item.id}-q${qi}-r${ri}`,
        author: r.owner ? owner : r.author,
        text: r.text,
        createdAt: now - r.ago,
      })
    ),
  }));
}
