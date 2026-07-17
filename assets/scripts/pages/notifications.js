// T22 - Miguel Sanca: Sistema de notificaciones con feed y preferencias
(function () {
  const STORAGE_PREFS = "minka-notif-preferences";
  const STORAGE_FEED = "minka-notif-feed";

  const defaultFeed = [
    {
      id: "n1",
      type: "message",
      title: "Nuevo mensaje en Bicicleta vintage",
      text: "Lucero: ¿Puedes compartir otra foto del timón?",
      time: "Hace 5 min",
      unread: true,
    },
    {
      id: "n2",
      type: "match",
      title: "¡Coincidencia!",
      text: "Encontramos 3 publicaciones similares a tu mesa reciclada.",
      time: "Hace 25 min",
      unread: true,
    },
    {
      id: "n3",
      type: "reminder",
      title: "Recordatorio de encuentro",
      text: "Mañana 6:00 pm en Parque Kennedy. Confirma en el chat.",
      time: "Hace 1 h",
      unread: false,
    },
    {
      id: "n4",
      type: "message",
      title: "Mensaje archivado",
      text: "Ronel confirmó que llegará 10 minutos tarde.",
      time: "Hace 3 h",
      unread: false,
    },
    {
      id: "n5",
      type: "reminder",
      title: "Checklist de entrega",
      text: "Revisa el estado del objeto y marca la transacción con QR.",
      time: "Ayer",
      unread: false,
    },
    {
      id: "n6",
      type: "match",
      title: "Nueva coincidencia: Laptop usada",
      text: "Alguien publicó una laptop que coincide con tu búsqueda.",
      time: "Hace 2 h",
      unread: true,
    },
    {
      id: "n7",
      type: "news",
      title: "¡Bienvenido al nuevo sistema de reputación!",
      text: "Ahora puedes calificar tus trueques con más detalle.",
      time: "Hace 1 día",
      unread: false,
    },
    {
      id: "n8",
      type: "message",
      title: "Mensaje de Carla",
      text: "Hola, ¿sigue disponible la guitarra?",
      time: "Hace 2 días",
      unread: false,
    },
  ];

  const defaultPrefs = {
    messages: true,
    matches: true,
    reminders: true,
    reviews: false,
    news: false,
    quiet: "none",
  };

  const ui = {
    list: document.getElementById("notifications-list"),
    filterUnread: document.getElementById("filter-unread"),
    filterType: document.getElementById("filter-type"),
    markAll: document.getElementById("mark-all-read"),
    clearRead: document.getElementById("clear-read"),
    summary: {
      unread: document.getElementById("summary-unread"),
      messages: document.getElementById("summary-messages"),
      matches: document.getElementById("summary-matches"),
      reminders: document.getElementById("summary-reminders"),
    },
    prefs: {
      messages: document.getElementById("pref-messages"),
      matches: document.getElementById("pref-matches"),
      reminders: document.getElementById("pref-reminders"),
      reviews: document.getElementById("pref-reviews"),
      news: document.getElementById("pref-news"),
      quiet: document.getElementById("pref-quiet"),
    },
  };

  let feed = loadFeed();
  let prefs = loadPrefs();

  saveFeed();

  renderFeed();
  applyPrefsToUI();
  updateSummary();
  bindEvents();

  function bindEvents() {
    ui.filterUnread?.addEventListener("change", renderFeed);
    ui.filterType?.addEventListener("change", renderFeed);
    ui.markAll?.addEventListener("click", markAllRead);
    ui.clearRead?.addEventListener("click", clearRead);
    document.addEventListener("languageChanged", renderFeed);

    Object.entries(ui.prefs).forEach(([key, element]) => {
      if (!element) return;
      element.addEventListener("change", () => {
        const value =
          element.type === "checkbox" ? element.checked : element.value;
        prefs = { ...prefs, [key]: value };
        savePrefs();
      });
    });
  }

  function renderFeed() {
    if (!ui.list) return;
    const onlyUnread = ui.filterUnread?.checked;
    const typeFilter = ui.filterType?.value || "all";

    const filtered = feed.filter((item) => {
      const passUnread = onlyUnread ? item.unread : true;
      const passType = typeFilter === "all" ? true : item.type === typeFilter;
      const enabledByPrefs = prefsForType(item.type);
      return passUnread && passType && enabledByPrefs;
    });

    if (!filtered.length) {
      ui.list.innerHTML = `<p class="empty">${I18n.t("notif_empty")}</p>`;
      updateSummary();
      return;
    }

    ui.list.innerHTML = filtered
      .map((item) => {
        const badgeClass = `badge badge--${item.type}`;
        const icon = iconForType(item.type);
        return `
        <article class="notification-item ${
          item.unread ? "is-unread" : ""
        }" aria-label="${item.title}">
          <div class="notification-icon">${icon}</div>
          <div class="notification-body">
            <div class="notification-meta">
              <span class="${badgeClass}">${labelForType(item.type)}</span>
              ${
                item.unread
                  ? `<span class="badge badge--new">${I18n.t(
                      "notif_badge_new"
                    )}</span>`
                  : ""
              }
              <span>${item.time}</span>
            </div>
            <h4>${item.title}</h4>
            <p>${item.text}</p>
          </div>
          <div class="notification-actions">
            <button type="button" data-action="read" data-id="${item.id}">
              ${
                item.unread
                  ? I18n.t("notif_action_read")
                  : I18n.t("notif_action_unread")
              }
            </button>
            <button type="button" data-action="remove" data-id="${
              item.id
            }">${I18n.t("notif_action_remove")}</button>
          </div>
        </article>
      `;
      })
      .join("");

    ui.list.querySelectorAll("button[data-action]").forEach((btn) => {
      btn.addEventListener("click", () => handleAction(btn));
    });

    updateSummary();
  }

  function handleAction(button) {
    const id = button.dataset.id;
    const action = button.dataset.action;
    if (!id || !action) return;

    if (action === "read") {
      feed = feed.map((item) =>
        item.id === id ? { ...item, unread: !item.unread } : item
      );
    }

    if (action === "remove") {
      feed = feed.filter((item) => item.id !== id);
    }

    saveFeed();
    renderFeed();
  }

  function markAllRead() {
    feed = feed.map((item) => ({ ...item, unread: false }));
    saveFeed();
    renderFeed();
  }

  function clearRead() {
    feed = feed.filter((item) => item.unread);
    saveFeed();
    renderFeed();
  }

  function prefsForType(type) {
    if (type === "message") return prefs.messages;
    if (type === "match") return prefs.matches;
    if (type === "reminder") return prefs.reminders;
    return true;
  }

  function labelForType(type) {
    if (type === "message") return I18n.t("notif_label_message");
    if (type === "match") return I18n.t("notif_label_match");
    if (type === "reminder") return I18n.t("notif_label_reminder");
    return I18n.t("notif_label_default");
  }

  function iconForType(type) {
    if (type === "message") return "💬";
    if (type === "match") return "✨";
    if (type === "reminder") return "⏰";
    return "🔔";
  }

  function loadFeed() {
    try {
      const raw = localStorage.getItem(STORAGE_FEED);
      if (!raw) return defaultFeed;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : defaultFeed;
    } catch (error) {
      console.warn("No se pudo leer feed", error);
      return defaultFeed;
    }
  }

  function saveFeed() {
    try {
      localStorage.setItem(STORAGE_FEED, JSON.stringify(feed));
      window.dispatchEvent(new Event("minka-feed-update"));
    } catch (error) {
      console.warn("No se pudo guardar feed", error);
    }
  }

  function loadPrefs() {
    try {
      const raw = localStorage.getItem(STORAGE_PREFS);
      if (!raw) return defaultPrefs;
      return { ...defaultPrefs, ...JSON.parse(raw) };
    } catch (error) {
      console.warn("No se pudo leer prefs", error);
      return defaultPrefs;
    }
  }

  function savePrefs() {
    try {
      localStorage.setItem(STORAGE_PREFS, JSON.stringify(prefs));
    } catch (error) {
      console.warn("No se pudo guardar prefs", error);
    }
  }

  function applyPrefsToUI() {
    Object.entries(ui.prefs).forEach(([key, element]) => {
      if (!element) return;
      if (element.type === "checkbox") {
        element.checked = Boolean(prefs[key]);
      } else {
        element.value = prefs[key];
      }
    });
  }

  function updateSummary() {
    if (!ui.summary || !ui.summary.unread) return;
    const unread = feed.filter((n) => n.unread).length;
    const messages = feed.filter((n) => n.type === "message").length;
    const matches = feed.filter((n) => n.type === "match").length;
    const reminders = feed.filter((n) => n.type === "reminder").length;

    ui.summary.unread.textContent = unread;
    ui.summary.messages.textContent = messages;
    ui.summary.matches.textContent = matches;
    ui.summary.reminders.textContent = reminders;
  }
})();
