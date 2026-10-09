// Escapes a value for safe interpolation into HTML text or a quoted
// attribute. Use it for every Store-derived or user-provided string that
// reaches innerHTML / insertAdjacentHTML; prefer textContent when building
// nodes directly.
const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}
