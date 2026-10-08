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

  // La gestión de sesión (guards + inactividad) vive en core/session.js +
  // core/guard.js y solo se carga en páginas protegidas.
});
