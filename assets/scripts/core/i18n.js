/**
 * Sistema de Internacionalización (i18n) Simple
 * Maneja la carga y aplicación de traducciones en toda la web.
 */

const I18n = {
  currentLang: "es",

  init: function () {
    // 1. Cargar preferencia guardada o detectar navegador
    const prefs = JSON.parse(localStorage.getItem("minka_preferences") || "{}");
    this.currentLang = prefs.language || "es";

    console.log(`[I18n] Inicializando con idioma: ${this.currentLang}`);

    // 2. Aplicar idioma inicial
    this.applyLanguage(this.currentLang);

    // 3. Escuchar cambios si estamos en la página de settings
    const langSelect = document.getElementById("language-select");
    if (langSelect) {
      langSelect.value = this.currentLang;
    }
  },

  setLanguage: function (lang) {
    this.currentLang = lang;

    // Guardar en preferencias
    const prefs = JSON.parse(localStorage.getItem("minka_preferences") || "{}");
    prefs.language = lang;
    localStorage.setItem("minka_preferences", JSON.stringify(prefs));

    // Aplicar cambios visuales
    this.applyLanguage(lang);
  },

  /**
   * Obtiene el texto traducido para una clave (soporta anidación "key.subkey").
   * @param {string} key - La clave de traducción.
   * @returns {string} El texto traducido o la clave si no existe.
   */
  t: function (key) {
    if (typeof MINKA_TRANSLATIONS === "undefined") return key;
    const texts =
      MINKA_TRANSLATIONS[this.currentLang] || MINKA_TRANSLATIONS["es"];

    const result = key
      .split(".")
      .reduce((obj, i) => (obj ? obj[i] : null), texts);
    return result || key;
  },

  applyLanguage: function (lang) {
    if (typeof MINKA_TRANSLATIONS === "undefined") {
      console.error("[I18n] No se encontró el diccionario de traducciones.");
      return;
    }

    // Actualizar atributo lang del HTML
    document.documentElement.lang = lang;

    // 1. Elementos con data-i18n
    const elements = document.querySelectorAll("[data-i18n]");
    console.log(
      `[I18n] Aplicando traducciones a ${elements.length} elementos.`
    );

    elements.forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const text = this.t(key);

      if (text !== key) {
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          el.placeholder = text;
        } else {
          el.textContent = text;
        }
      } else {
        console.warn(`[I18n] Falta traducción para: ${key} (${lang})`);
      }
    });

    // 2. Elementos con data-i18n-placeholder
    const placeholders = document.querySelectorAll("[data-i18n-placeholder]");
    placeholders.forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      const text = this.t(key);
      if (text !== key) {
        el.placeholder = text;
      }
    });

    // Disparar evento personalizado
    document.dispatchEvent(
      new CustomEvent("languageChanged", { detail: { language: lang } })
    );
  },
};

// Exponer globalmente
window.I18n = I18n;

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  I18n.init();
});
