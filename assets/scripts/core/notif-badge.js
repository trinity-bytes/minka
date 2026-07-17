// T22 - Miguel Sanca: Badge de notificaciones no leídas (shared script)
(function () {
  const NAV_BADGE_SELECTOR = "[data-unread-badge]";
  const STORAGE_FEED = "minka-notif-feed";

  function initNavBadge() {
    renderBadge();
    window.addEventListener("storage", (event) => {
      if (event.key === STORAGE_FEED) renderBadge();
    });
    window.addEventListener("minka-feed-update", renderBadge);
  }

  function renderBadge() {
    const badges = document.querySelectorAll(NAV_BADGE_SELECTOR);
    if (!badges.length) return;
    const count = getUnreadCount();
    badges.forEach((badge) => {
      badge.textContent = count;
      badge.classList.toggle("is-hidden", count === 0);
    });
  }

  function getUnreadCount() {
    try {
      const raw = localStorage.getItem(STORAGE_FEED);
      if (!raw) return 0;
      const items = JSON.parse(raw);
      if (!Array.isArray(items)) return 0;
      return items.filter((n) => n.unread).length;
    } catch (error) {
      return 0;
    }
  }

  initNavBadge();
})();
