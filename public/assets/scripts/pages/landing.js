/* ============================================================
   MINK'A — LANDING "TRUEQUE EDITORIAL"
   Interacciones de index.html: header flotante, menú móvil,
   reveals on scroll, trazos hand-drawn, count-up, palabra
   rotante del hero y facade de YouTube.
   Respeta prefers-reduced-motion en todo.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* === Header: pill flotante al hacer scroll === */
  var header = document.querySelector(".l-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* === Menú móvil accesible === */
  var navToggle = document.querySelector(".l-nav-toggle");
  var nav = document.getElementById("menu-principal");
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      navToggle.setAttribute(
        "aria-label",
        expanded ? "Abrir menú" : "Cerrar menú"
      );
      nav.classList.toggle("is-open", !expanded);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Abrir menú");
      });
    });
  }

  /* === Reveal on scroll (IntersectionObserver) === */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length && "IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* === Trazos hand-drawn que se dibujan al entrar en viewport === */
  var drawEls = document.querySelectorAll(".l-draw");
  if (drawEls.length && "IntersectionObserver" in window && !reduceMotion) {
    var drawObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-drawn");
            drawObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    drawEls.forEach(function (el) {
      drawObserver.observe(el);
    });
  } else {
    drawEls.forEach(function (el) {
      el.classList.add("is-drawn");
    });
  }

  /* === Count-up de estadísticas === */
  var formatNumber = function (n) {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  var animateCount = function (el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";

    if (reduceMotion) {
      el.textContent = prefix + formatNumber(target) + suffix;
      return;
    }

    var duration = 1600;
    var start = null;
    var step = function (ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      /* easing easeOutExpo */
      var eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      el.textContent =
        prefix + formatNumber(Math.round(target * eased)) + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  };

  var countEls = document.querySelectorAll("[data-count]");
  if (countEls.length && "IntersectionObserver" in window) {
    var countObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    countEls.forEach(function (el) {
      countObserver.observe(el);
    });
  } else {
    countEls.forEach(animateCount);
  }

  /* === Palabra rotante del hero === */
  var wordEl = document.querySelector(".l-hero__word");
  if (wordEl) {
    var words = (wordEl.getAttribute("data-words") || "")
      .split(",")
      .map(function (w) {
        return w.trim();
      })
      .filter(Boolean);

    if (words.length > 1) {
      var index = 0;
      window.setInterval(function () {
        if (reduceMotion) {
          index = (index + 1) % words.length;
          wordEl.textContent = words[index];
          return;
        }
        wordEl.classList.add("is-out");
        window.setTimeout(function () {
          index = (index + 1) % words.length;
          wordEl.textContent = words[index];
          wordEl.classList.remove("is-out");
          wordEl.classList.add("is-in");
          window.setTimeout(function () {
            wordEl.classList.remove("is-in");
          }, 340);
        }, 280);
      }, 2600);
    }
  }

  /* === Facade de YouTube (carga el player solo al hacer click) === */
  var facade = document.getElementById("video-facade");
  if (facade) {
    facade.addEventListener("click", function () {
      var iframe = document.createElement("iframe");
      iframe.src =
        "https://www.youtube.com/embed/" +
        this.getAttribute("data-video-id") +
        "?autoplay=1";
      iframe.title = "Video de presentación Mink'a";
      iframe.style.cssText =
        "position:absolute;top:0;left:0;width:100%;height:100%;border:0;";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      this.replaceWith(iframe);
    });
  }
})();
