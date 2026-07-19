/**
 * Mink'a - Shared UI behavior for the static app header.
 * The header markup lives in each pages/*.html (progressive enhancement:
 * navigation works without JS). This script only enhances it:
 *  - marks the current page with aria-current
 *  - toggles auth/guest links according to the session
 *  - handles logout delegation
 *  - drives the mobile hamburger menu
 */

(function () {
  "use strict";

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
  }

  function init() {
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
