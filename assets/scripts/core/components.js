/**
 * Mink'a - Shared UI Components
 * Generates the app navigation header dynamically to eliminate duplication.
 * Handles mobile hamburger menu toggle.
 *
 * Usage: In HTML, place <header id="app-header" class="auth-header"></header>
 *        This script will populate it with the full nav structure.
 */

(function () {
  "use strict";

  /**
   * Navigation links configuration.
   * Single source of truth for all app pages.
   */
  const NAV_LINKS = [
    {
      href: "home.html",
      label: "Inicio",
      i18n: "nav_home",
      icon: "fa-house",
    },
    {
      href: "busqueda.html",
      label: "Buscar",
      i18n: "nav_search",
      icon: "fa-magnifying-glass",
    },
    {
      href: "publicar.html",
      label: "Publicar",
      i18n: "nav_publish",
      icon: "fa-circle-plus",
    },
    {
      href: "chat.html",
      label: "Chats",
      i18n: "nav_chats",
      icon: "fa-comments",
    },
    {
      href: "comunidad.html",
      label: "Comunidad",
      i18n: "nav_community",
      icon: "fa-users",
    },
    {
      href: "notificaciones.html",
      label: "Notificaciones",
      i18n: "nav_notifications",
      icon: "fa-bell",
      badge: true,
    },
    {
      href: "perfil.html",
      label: "Perfil",
      i18n: "nav_profile",
      icon: "fa-user",
    },
    {
      href: "auth.html",
      label: "Salir",
      i18n: "nav_logout",
      icon: "fa-right-from-bracket",
      action: "logout",
    },
  ];

  /**
   * Detects the current page filename from the URL.
   */
  function getCurrentPage() {
    var path = window.location.pathname;
    var parts = path.split("/");
    return parts[parts.length - 1] || "index.html";
  }

  /**
   * Renders the app navigation header into the #app-header placeholder.
   */
  function renderAppHeader() {
    var placeholder = document.getElementById("app-header");
    if (!placeholder) return;

    var currentPage = getCurrentPage();

    var navLinksHTML = NAV_LINKS.map(function (link) {
      var isCurrent = link.href === currentPage;
      var ariaCurrent = isCurrent ? ' aria-current="page"' : "";
      var i18nAttr = link.i18n ? ' data-i18n="' + link.i18n + '"' : "";
      var actionAttr = link.action ? ' data-action="' + link.action + '"' : "";

      if (link.badge) {
        return (
          '<a href="' +
          link.href +
          '" class="auth-header__link"' +
          ariaCurrent +
          actionAttr +
          ">" +
          '<i class="fa-solid ' +
          link.icon +
          ' nav-icon"></i>' +
          "<span" +
          i18nAttr +
          ">" +
          link.label +
          "</span>" +
          ' <span class="nav-badge" data-unread-badge aria-label="notificaciones no leídas">0</span>' +
          "</a>"
        );
      }

      return (
        '<a href="' +
        link.href +
        '" class="auth-header__link"' +
        ariaCurrent +
        actionAttr +
        ">" +
        '<i class="fa-solid ' +
        link.icon +
        ' nav-icon"></i>' +
        "<span" +
        i18nAttr +
        ">" +
        link.label +
        "</span>" +
        "</a>"
      );
    }).join("\n          ");

    placeholder.innerHTML =
      '<div class="auth-header__container">' +
      '  <a href="home.html" class="auth-header__logo" aria-label="Ir a inicio">' +
      '    <img src="../assets/images/minka-logo.png" alt="Mink\'a" class="logo-image" />' +
      "  </a>" +
      '  <button class="mobile-menu-toggle" aria-label="Abrir menú" aria-expanded="false">' +
      '    <span class="hamburger-icon">' +
      "      <span></span>" +
      "      <span></span>" +
      "      <span></span>" +
      "    </span>" +
      "  </button>" +
      '  <nav class="auth-header__nav" id="app-nav" aria-label="Navegación principal">' +
      "          " +
      navLinksHTML +
      "  </nav>" +
      '  <div class="mobile-nav-overlay" id="mobile-nav-overlay"></div>' +
      "</div>";

    // Initialize mobile menu behavior
    initMobileMenu();

    // Logout delegation
    var nav = document.getElementById("app-nav");
    if (nav) {
      nav.addEventListener("click", function (e) {
        var a = e.target.closest("[data-action=logout]");
        if (!a) return;
        e.preventDefault();
        if (window.Session) Session.clearSession();
        location.href = "auth.html";
      });
    }
  }

  /**
   * Sets up the mobile hamburger menu toggle, overlay, and link click handlers.
   */
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

    // Close on overlay click
    if (overlay) {
      overlay.addEventListener("click", closeMenu);
    }

    // Close on nav link click
    var links = nav.querySelectorAll(".auth-header__link");
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener("click", closeMenu);
    }

    // Close on Escape key
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeMenu();
      }
    });
  }

  // Execute immediately — this script runs after DOM parsing (via defer)
  // so the #app-header element is available.
  renderAppHeader();
})();
