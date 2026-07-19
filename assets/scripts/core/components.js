/**
 * Mink'a - Shared shell components (header/footer) + header behavior.
 * App pages carry empty placeholders (#app-header / #app-footer); the
 * markup is injected here from a single template so shell changes are
 * made once instead of per page. After injection this script enhances
 * the header:
 *  - marks the current page with aria-current
 *  - toggles auth/guest links according to the session
 *  - handles logout delegation
 *  - drives the mobile hamburger menu
 * auth.html and about.html keep their own static header/footer on purpose.
 */

(function () {
  "use strict";

  var HEADER_HTML =
    '<div class="auth-header__container">' +
    '<a href="home.html" class="auth-header__logo" aria-label="Ir a inicio">' +
    '<img src="../assets/images/minka-logo.png" alt="Mink\'a" class="logo-image" />' +
    "</a>" +
    '<button class="mobile-menu-toggle" aria-label="Abrir menú" aria-expanded="false" aria-controls="app-nav">' +
    '<span class="hamburger-icon"><span></span><span></span><span></span></span>' +
    "</button>" +
    '<nav class="auth-header__nav" id="app-nav" aria-label="Navegación principal">' +
    '<a href="home.html" class="auth-header__link"><i class="fa-solid fa-house nav-icon"></i><span data-i18n="nav_home">Inicio</span></a>' +
    '<a href="busqueda.html" class="auth-header__link"><i class="fa-solid fa-magnifying-glass nav-icon"></i><span data-i18n="nav_search">Buscar</span></a>' +
    '<a href="publicar.html" class="auth-header__link"><i class="fa-solid fa-circle-plus nav-icon"></i><span data-i18n="nav_publish">Publicar</span></a>' +
    '<a href="chat.html" class="auth-header__link" data-show="auth"><i class="fa-solid fa-comments nav-icon"></i><span data-i18n="nav_chats">Chats</span></a>' +
    '<a href="comunidad.html" class="auth-header__link"><i class="fa-solid fa-users nav-icon"></i><span data-i18n="nav_community">Comunidad</span></a>' +
    '<a href="notificaciones.html" class="auth-header__link" data-show="auth"><i class="fa-solid fa-bell nav-icon"></i><span data-i18n="nav_notifications">Notificaciones</span> <span class="nav-badge" data-unread-badge aria-label="notificaciones no leídas">0</span></a>' +
    '<a href="perfil.html" class="auth-header__link" data-show="auth"><i class="fa-solid fa-user nav-icon"></i><span data-i18n="nav_profile">Perfil</span></a>' +
    '<a href="auth.html" class="auth-header__link" data-action="logout" data-show="auth"><i class="fa-solid fa-right-from-bracket nav-icon"></i><span data-i18n="nav_logout">Salir</span></a>' +
    '<a href="auth.html" class="auth-header__link is-hidden" data-show="guest"><i class="fa-solid fa-right-to-bracket nav-icon"></i><span data-i18n="nav_login">Ingresar</span></a>' +
    "</nav>" +
    '<div class="mobile-nav-overlay" id="mobile-nav-overlay"></div>' +
    "</div>";

  var FOOTER_HTML =
    '<div class="container app-footer__content">' +
    '<div class="app-footer__brand">' +
    '<img src="../assets/images/minka-logo-negativo-blanco.png" alt="Mink\'a" class="app-footer__logo" />' +
    "<p>&copy; 2025 Mink'a. Trueque con propósito.</p>" +
    "</div>" +
    '<div class="app-footer__links">' +
    '<a href="about.html">Acerca de</a>' +
    '<a href="../index.html#impacto">Impacto</a>' +
    '<a href="about.html">Términos</a>' +
    '<a href="about.html">Privacidad</a>' +
    "</div>" +
    "</div>";

  function renderShell() {
    var header = document.getElementById("app-header");
    if (header && !header.firstElementChild) {
      header.innerHTML = HEADER_HTML;
    }
    var footer = document.getElementById("app-footer");
    if (footer && !footer.firstElementChild) {
      footer.innerHTML = FOOTER_HTML;
    }
  }

  function getCurrentPage() {
    var path = window.location.pathname;
    var parts = path.split("/");
    return parts[parts.length - 1] || "index.html";
  }

  function markCurrentLink(nav) {
    var currentPage = getCurrentPage();
    var links = nav.querySelectorAll(".auth-header__link");
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute("href");
      if (href === currentPage && !links[i].hasAttribute("data-action")) {
        links[i].setAttribute("aria-current", "page");
      }
    }
  }

  function applyAuthAffordance() {
    var authed = !!(window.Session && Session.isAuthenticated());
    var authEls = document.querySelectorAll('[data-show="auth"]');
    var guestEls = document.querySelectorAll('[data-show="guest"]');
    var i;
    for (i = 0; i < authEls.length; i++) {
      authEls[i].classList.toggle("is-hidden", !authed);
    }
    for (i = 0; i < guestEls.length; i++) {
      guestEls[i].classList.toggle("is-hidden", authed);
    }
  }

  function bindLogout(nav) {
    nav.addEventListener("click", function (e) {
      var a = e.target.closest("[data-action=logout]");
      if (!a) return;
      e.preventDefault();
      if (window.Session) Session.clearSession();
      location.href = "auth.html";
    });
  }

  function initMobileMenu() {
    var toggle = document.querySelector(".mobile-menu-toggle");
    var nav = document.getElementById("app-nav");
    var overlay = document.getElementById("mobile-nav-overlay");

    if (!toggle || !nav) return;

    function closeMenu() {
      toggle.setAttribute("aria-expanded", "false");
      toggle.classList.remove("is-active");
      nav.classList.remove("auth-header__nav--open");
      if (overlay) overlay.classList.remove("is-visible");
      document.body.classList.remove("mobile-menu-open");
    }

    function openMenu() {
      toggle.setAttribute("aria-expanded", "true");
      toggle.classList.add("is-active");
      nav.classList.add("auth-header__nav--open");
      if (overlay) overlay.classList.add("is-visible");
      document.body.classList.add("mobile-menu-open");
    }

    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    if (overlay) {
      overlay.addEventListener("click", closeMenu);
    }

    var links = nav.querySelectorAll(".auth-header__link");
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener("click", closeMenu);
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeMenu();
      }
    });

    // Si el viewport cruza al layout desktop (rotación, resize),
    // el drawer deja de existir visualmente: soltar overlay y estado.
    var desktopQuery = window.matchMedia("(min-width: 769px)");
    var onBreakpointChange = function (e) {
      if (e.matches) closeMenu();
    };
    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener("change", onBreakpointChange);
    } else if (desktopQuery.addListener) {
      desktopQuery.addListener(onBreakpointChange);
    }
  }

  // Botón "i" del page-head: muestra/oculta la descripción de la página.
  function initInfoToggles() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-info-toggle]");
      if (!btn) return;
      var target = document.getElementById(btn.getAttribute("aria-controls"));
      if (!target) return;
      var show = target.hidden;
      target.hidden = !show;
      btn.setAttribute("aria-expanded", show ? "true" : "false");
    });
  }

  function init() {
    renderShell();
    initInfoToggles();
    var nav = document.getElementById("app-nav");
    if (!nav) return;
    markCurrentLink(nav);
    applyAuthAffordance();
    bindLogout(nav);
    initMobileMenu();
  }

  // Runs via defer: DOM is parsed and the static header is available.
  init();
})();
