/**
 * T27 - Miguel Sanca: Lógica de Configuración y Accesibilidad
 * Maneja idioma, alto contraste, modo bajo consumo y tamaño de fuente.
 * T29 - Lucero Pipa: Configuración de privacidad y verificación.
 */

// NOTA: El diccionario de traducciones se ha movido a translations.js
// NOTA: La lógica de i18n se ha movido a i18n.js

document.addEventListener("DOMContentLoaded", () => {
  initSettings();
});

function initSettings() {
  loadPreferences();
  loadSessions(); // T28
  setupEventListeners();
}

// T28 - Leonardo Chavez: Gestión de Sesiones (HU23)
const DEFAULT_SESSIONS = [
  {
    id: 1,
    device: "Windows PC - Chrome",
    location: "Lima, PE",
    active: true,
    current: true,
  },
  {
    id: 2,
    device: "Android Mobile - App",
    location: "Lima, PE",
    active: true,
    lastActive: "Hace 2 horas",
  },
  {
    id: 3,
    device: "iPhone 13 - Safari",
    location: "Arequipa, PE",
    active: true,
    lastActive: "Hace 1 día",
  },
];

function getSessions() {
  const prefs = window.Store ? Store.getPreferences() : {};
  return Array.isArray(prefs.sessions) ? prefs.sessions : DEFAULT_SESSIONS;
}

function persistSessions(sessions) {
  if (window.Store) Store.savePreferences({ sessions: sessions });
}

function loadSessions() {
  const sessionsList = document.getElementById("sessions-list");
  if (!sessionsList) return;

  const sessions = getSessions();

  if (!sessions.length) {
    sessionsList.innerHTML =
      '<p class="text-center">No hay otras sesiones activas.</p>';
    return;
  }

  sessionsList.innerHTML = sessions
    .map(
      (session) => `
    <div class="session-item" id="session-${session.id}">
      <div class="session-icon">
        <i class="fas ${
          session.device.includes("Mobile") || session.device.includes("iPhone")
            ? "fa-mobile-alt"
            : "fa-desktop"
        }"></i>
      </div>
      <div class="session-info">
        <strong>${session.device}</strong>
        <p>${session.location} · ${
        session.current
          ? '<span class="status-active">Actual</span>'
          : session.lastActive
      }</p>
      </div>
      ${
        !session.current
          ? `
        <button class="btn-icon" onclick="logoutSession(${session.id})" aria-label="Cerrar sesión">
          <i class="fas fa-times"></i>
        </button>
      `
          : ""
      }
    </div>
  `
    )
    .join("");
}

window.logoutSession = (id) => {
  Modal.confirm("¿Cerrar esta sesión?", {
    title: "Cerrar sesión",
    confirmText: "Cerrar sesión",
  }).then((ok) => {
    if (!ok) return;
    persistSessions(getSessions().filter((s) => s.id !== id));
    const el = document.getElementById(`session-${id}`);
    if (el) {
      el.style.opacity = "0.5";
      setTimeout(() => el.remove(), 500);
      Toast.show("Sesión cerrada correctamente.", "success");
    }
  });
};

function setupEventListeners() {
  const prefs = window.Store ? Store.getPreferences() : {};

  // Language - Ahora manejado por i18n.js
  const langSelect = document.getElementById("language-select");
  if (langSelect) {
    // Inicializar valor
    if (window.I18n) {
      langSelect.value = window.I18n.currentLang;
    }

    // Escuchar cambios
    langSelect.addEventListener("change", (e) => {
      if (window.I18n) {
        window.I18n.setLanguage(e.target.value);
      }
    });
  }

  // High Contrast
  const contrastToggle = document.getElementById("high-contrast-toggle");
  if (contrastToggle) {
    contrastToggle.checked = prefs.highContrast || false;
    applyHighContrast(prefs.highContrast || false);
  }

  // Low Data
  const dataToggle = document.getElementById("low-data-toggle");
  if (dataToggle) {
    dataToggle.checked = prefs.lowData || false;
    applyLowData(prefs.lowData || false);
  }

  // Font Size
  applyFontSize(prefs.fontSize || "medium");

  // T29 - Lucero Pipa: Privacidad y Disponibilidad
  const visibilitySelect = document.getElementById("visibility-select");
  if (visibilitySelect) {
    visibilitySelect.value = prefs.visibility || "public";
  }

  const hideDistrictToggle = document.getElementById("hide-district-toggle");
  if (hideDistrictToggle) {
    hideDistrictToggle.checked = prefs.hideDistrict || false;
  }

  updateAvailabilitySummary(prefs.availability || {});

  // Event Listeners

  // High Contrast
  document
    .getElementById("high-contrast-toggle")
    ?.addEventListener("change", (e) => {
      applyHighContrast(e.target.checked);
    });

  // Low Data
  document
    .getElementById("low-data-toggle")
    ?.addEventListener("change", (e) => {
      applyLowData(e.target.checked);
    });

  // Font Size
  document
    .getElementById("font-decrease")
    ?.addEventListener("click", () => setFontSize("small"));
  document
    .getElementById("font-reset")
    ?.addEventListener("click", () => setFontSize("medium"));
  document
    .getElementById("font-increase")
    ?.addEventListener("click", () => setFontSize("large"));

  // T29 - Lucero Pipa: Disponibilidad (HU26)
  const openAvailBtn = document.getElementById("open-availability-modal");
  const availModal = document.getElementById("availability-modal");
  const cancelAvailBtn = document.getElementById("cancel-availability");
  const saveAvailBtn = document.getElementById("save-availability");
  const previewBtn = document.getElementById("preview-profile-btn");

  if (openAvailBtn && availModal) {
    openAvailBtn.addEventListener("click", () => {
      Modal.open(availModal);
      // Cargar estado actual en checkboxes
      const prefs = window.Store ? Store.getPreferences() : {};
      const availability = prefs.availability || {};

      document.querySelectorAll("input[name='day']").forEach((dayCb) => {
        const day = dayCb.value;
        const times = availability[day] || [];
        dayCb.checked = times.length > 0;

        document
          .querySelectorAll(`input[name='time_${day}']`)
          .forEach((timeCb) => {
            timeCb.checked = times.includes(timeCb.value);
          });
      });
    });

    cancelAvailBtn.addEventListener("click", () => {
      Modal.close(availModal);
    });

    saveAvailBtn.addEventListener("click", () => {
      const availability = {};
      document.querySelectorAll("input[name='day']").forEach((dayCb) => {
        if (dayCb.checked) {
          const day = dayCb.value;
          const times = [];
          document
            .querySelectorAll(`input[name='time_${day}']:checked`)
            .forEach((timeCb) => {
              times.push(timeCb.value);
            });
          if (times.length > 0) {
            availability[day] = times;
          }
        }
      });

      window.tempAvailability = availability;
      updateAvailabilitySummary(availability);
      Modal.close(availModal);
    });
  }

  if (previewBtn) {
    previewBtn.addEventListener("click", () => {
      Modal.alert(
        "Así ven tu perfil los usuarios públicos. Se ocultará tu distrito exacto si la opción está activa.",
        "Vista previa"
      );
    });
  }

  // Save Button (con bloqueo de doble click y feedback perceptible)
  document.getElementById("save-settings")?.addEventListener("click", (e) => {
    const btn = e.currentTarget;
    if (btn.disabled) return;
    btn.disabled = true;
    btn.classList.add("is-loading");
    setTimeout(() => {
      savePreferences();
      btn.disabled = false;
      btn.classList.remove("is-loading");
    }, 400);
  });

  // T28 - Leonardo Chavez: Reautenticación (HU24)
  const changePassBtn = document.getElementById("change-password-btn");
  const logoutAllBtn = document.getElementById("logout-all-sessions"); // HU23
  const reauthModal = document.getElementById("reauth-modal");
  const cancelReauthBtn = document.getElementById("cancel-reauth");
  const confirmReauthBtn = document.getElementById("confirm-reauth");
  const reauthPasswordInput = document.getElementById("reauth-password");

  let pendingAction = null;

  const requestReauth = (action) => {
    // Verificar tiempo de gracia (10 min)
    const lastAuth = localStorage.getItem("minka_last_reauth");
    const now = Date.now();

    if (lastAuth && now - parseInt(lastAuth) < 10 * 60 * 1000) {
      action(); // Ejecutar directamente si está en periodo de gracia
    } else {
      pendingAction = action;
      Modal.open(reauthModal);
    }
  };

  if (changePassBtn) {
    changePassBtn.addEventListener("click", () => {
      requestReauth(() => Toast.show("Redirigiendo a cambio de contraseña...", "info"));
    });
  }

  if (logoutAllBtn) {
    logoutAllBtn.addEventListener("click", () => {
      requestReauth(() => {
        persistSessions(getSessions().filter((s) => s.current));
        document.getElementById("sessions-list").innerHTML =
          '<p class="text-center">Todas las sesiones remotas han sido cerradas.</p>';
        Toast.show("Se han cerrado todas las sesiones excepto la actual.", "success");
      });
    });
  }

  if (reauthModal) {
    cancelReauthBtn.addEventListener("click", () => {
      Modal.close(reauthModal);
      reauthPasswordInput.value = "";
      pendingAction = null;
    });

    confirmReauthBtn.addEventListener("click", () => {
      const password = reauthPasswordInput.value;
      const reauthError = document.getElementById("reauth-error");
      const expected =
        (window.Session && Session.getSession()?.password) || "demo1234";

      if (!password) {
        if (reauthError) reauthError.textContent = "Ingresa tu contraseña.";
        return;
      }
      if (password !== expected) {
        if (reauthError)
          reauthError.textContent = "Contraseña incorrecta. Intenta de nuevo.";
        reauthPasswordInput.value = "";
        return;
      }

      if (reauthError) reauthError.textContent = "";
      localStorage.setItem("minka_last_reauth", Date.now().toString()); // Guardar timestamp

      Modal.close(reauthModal);
      reauthPasswordInput.value = "";

      if (pendingAction) {
        pendingAction();
        pendingAction = null;
      }
    });
  }
}

function updateAvailabilitySummary(availability) {
  const summaryContainer = document.getElementById("availability-summary");
  if (!summaryContainer) return;

  const days = Object.keys(availability).filter(
    (day) => availability[day] && availability[day].length > 0
  );

  if (days.length === 0) {
    summaryContainer.innerHTML =
      '<p class="text-muted">No hay horarios configurados.</p>';
    return;
  }

  summaryContainer.innerHTML = days
    .map(
      (day) => `
    <div class="availability-tag">
      <strong>${day}:</strong> ${availability[day].join(", ")}
    </div>
  `
    )
    .join("");
}

function applyHighContrast(enabled) {
  if (enabled) {
    document.body.classList.add("high-contrast");
  } else {
    document.body.classList.remove("high-contrast");
  }
}

function applyLowData(enabled) {
  if (enabled) {
    document.body.classList.add("low-data");
  } else {
    document.body.classList.remove("low-data");
  }
}

function setFontSize(size) {
  const root = document.documentElement;
  switch (size) {
    case "small":
      root.style.fontSize = "14px";
      break;
    case "medium":
      root.style.fontSize = "16px";
      break;
    case "large":
      root.style.fontSize = "20px";
      break;
  }
  root.setAttribute("data-font-size", size);
}

function applyFontSize(size) {
  setFontSize(size);
}

function loadPreferences() {
  // Esta función ahora solo carga preferencias visuales que no son idioma
  // El idioma lo maneja i18n.js
}

function savePreferences() {
  const prefs = window.Store ? Store.getPreferences() : {};

  Store.savePreferences({
    // language: ya se guarda en i18n.js al cambiar
    highContrast: document.getElementById("high-contrast-toggle").checked,
    lowData: document.getElementById("low-data-toggle").checked,
    fontSize:
      document.documentElement.getAttribute("data-font-size") || "medium",
    // T29 - Lucero Pipa: Privacidad y Disponibilidad
    visibility: document.getElementById("visibility-select")?.value || "public",
    hideDistrict:
      document.getElementById("hide-district-toggle")?.checked || false,
    availability: window.tempAvailability || prefs.availability || {},
  });
  Toast.show("Preferencias guardadas correctamente.", "success");
}
