(function () {
  "use strict";

  var container = null;

  function ensureContainer() {
    if (container && document.contains(container)) return container;
    container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      container.setAttribute("role", "status");
      container.setAttribute("aria-live", "polite");
      document.body.appendChild(container);
    }
    return container;
  }

  function show(message, type, duration) {
    var box = ensureContainer();
    var toast = document.createElement("div");
    var kind = type === "success" || type === "error" ? type : "info";
    toast.className = "toast toast--" + kind;
    toast.textContent = message;
    box.appendChild(toast);
    requestAnimationFrame(function () {
      toast.classList.add("is-visible");
    });
    var ms = typeof duration === "number" ? duration : 3500;
    setTimeout(function () {
      toast.classList.remove("is-visible");
      setTimeout(function () {
        toast.remove();
      }, 250);
    }, ms);
  }

  window.Toast = { show: show };
})();
