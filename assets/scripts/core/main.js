// T02/T09 - Ronel Rojas: Control de menú responsive accesible
const menuToggle = document.querySelector(".header__menu-toggle");
const nav = document.querySelector(".header__nav");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("header__nav--open", !expanded);
  });
}

// T27 - Miguel Sanca: Cargar preferencias globales de accesibilidad
document.addEventListener("DOMContentLoaded", () => {
  const prefs = JSON.parse(localStorage.getItem("minka_preferences") || "{}");

  // Aplicar Alto Contraste
  if (prefs.highContrast) {
    document.body.classList.add("high-contrast");
  }

  // Aplicar Modo Bajo Consumo
  if (prefs.lowData) {
    document.body.classList.add("low-data");
  }

  // Aplicar Tamaño de Fuente
  if (prefs.fontSize) {
    const root = document.documentElement;
    switch (prefs.fontSize) {
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
  }

  // T28 - Leonardo Chavez: Gestión de Sesiones (HU23)
  initSessionManagement();
});

// T28 - Leonardo Chavez: Gestión de Sesiones (HU23)
function initSessionManagement() {
  const publicPages = ["index.html", "auth.html", "branding.txt"];
  const pathParts = window.location.pathname.split("/");
  const currentPage = pathParts[pathParts.length - 1] || "index.html";

  // Si estamos en una página pública, no hacemos nada
  if (publicPages.includes(currentPage)) return;

  // Verificar si hay sesión activa (simulada)
  // Nota: En un entorno real, esto se validaría contra el backend
  const session = localStorage.getItem("minka_session");

  // Si no hay sesión y es página privada, redirigir a auth
  // Comentado para facilitar el desarrollo, descomentar para probar flujo real
  /* 
  if (!session) {
      window.location.href = 'auth.html';
      return;
  }
  */

  // Simulación de Timeout por inactividad (ej. 5 minutos para demo)
  const INACTIVITY_LIMIT = 5 * 60 * 1000;
  let inactivityTimer;

  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      // Solo cerrar sesión si hay una activa
      if (localStorage.getItem("minka_session")) {
        alert("Tu sesión ha expirado por inactividad.");
        localStorage.removeItem("minka_session");
        window.location.href = "auth.html";
      }
    }, INACTIVITY_LIMIT);
  }

  // Eventos que resetean el timer
  window.addEventListener("mousemove", resetInactivityTimer);
  window.addEventListener("keypress", resetInactivityTimer);
  window.addEventListener("click", resetInactivityTimer);
  window.addEventListener("scroll", resetInactivityTimer);

  resetInactivityTimer(); // Iniciar timer
}
