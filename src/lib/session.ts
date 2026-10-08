/**
 * Read/clear helpers for the demo session. Mirrors the storage contract of
 * public/assets/scripts/core/session.js (key `minka_session` in local or
 * session storage) so ported and legacy pages share the same login state.
 * Writing sessions (auth page) and the inactivity guard still use the
 * legacy global `Session` (loaded by AppLayout), because legacy pages share
 * that script until T4-T6 port them.
 */
export const SESSION_KEY = "minka_session";
const LEGACY_DEMO_KEY = "minka-demo-session";

export function getSession(): Record<string, unknown> | null {
  try {
    return JSON.parse(
      localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY) || "null",
    );
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getSession();
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LEGACY_DEMO_KEY);
  } catch {
    /* storage unavailable: nothing to clear */
  }
}
