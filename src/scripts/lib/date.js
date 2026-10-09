// Date-only ("YYYY-MM-DD") helpers that stay on the local calendar day.
// `new Date("2025-12-15")` is parsed as UTC midnight, which renders as the
// previous day in negative-offset zones such as Lima (UTC-5), and
// `date.toISOString().slice(0, 10)` has the mirror problem after 19:00.

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

// Parses "YYYY-MM-DD" as local midnight; anything else is an invalid Date.
export function parseLocalDate(value) {
  const match = DATE_ONLY.exec(String(value ?? "").trim());
  if (!match) return new Date(NaN);
  const [, year, month, day] = match.map(Number);
  return new Date(year, month - 1, day);
}

// Formats a Date as its local calendar day, "YYYY-MM-DD".
export function toLocalDateString(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
