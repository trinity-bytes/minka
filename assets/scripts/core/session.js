(function () {
  "use strict";
  const KEY = "minka_session";
  const inactivityLimit = 15 * 60 * 1000; // 15 min
  let timer = null;

  function setSession(user, { remember = false } = {}) {
    const data = { ...user, ts: Date.now(), remember };
    (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(data));
  }
  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || sessionStorage.getItem(KEY) || "null");
    } catch {
      return null;
    }
  }
  function clearSession() {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);
    localStorage.removeItem("minka-demo-session"); // legacy cleanup
  }
  function isAuthenticated() {
    return !!getSession();
  }
  function requireAuth(redirect) {
    if (!isAuthenticated()) {
      const r = redirect || location.pathname.split("/").pop();
      location.href = "auth.html?redirect=" + encodeURIComponent(r);
    }
  }
  function armInactivity(onTimeout) {
    if (!isAuthenticated()) return;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(onTimeout, inactivityLimit);
    };
    ["mousemove", "keydown", "click", "scroll"].forEach((e) =>
      document.addEventListener(e, reset)
    );
    reset();
  }
  window.Session = {
    setSession,
    getSession,
    clearSession,
    isAuthenticated,
    requireAuth,
    armInactivity,
  };
})();
