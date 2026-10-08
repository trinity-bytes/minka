(function () {
  "use strict";

  var FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  var openStack = []; // { modal, trigger }

  function resolve(ref) {
    return typeof ref === "string" ? document.getElementById(ref) : ref;
  }

  function getFocusables(modal) {
    var dialog = modal.querySelector(".modal__content") || modal;
    return Array.prototype.filter.call(
      dialog.querySelectorAll(FOCUSABLE),
      function (el) {
        return el.offsetParent !== null || el === document.activeElement;
      }
    );
  }

  function open(ref) {
    var modal = resolve(ref);
    if (!modal || modal.getAttribute("aria-hidden") === "false") return;
    openStack.push({ modal: modal, trigger: document.activeElement });
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    var focusables = getFocusables(modal);
    var first =
      modal.querySelector("[data-autofocus]") ||
      focusables[0] ||
      modal.querySelector(".modal__content");
    if (first && first.focus) first.focus();
  }

  function close(ref) {
    var modal = resolve(ref);
    if (!modal || modal.getAttribute("aria-hidden") === "true") return;
    modal.setAttribute("aria-hidden", "true");
    for (var i = openStack.length - 1; i >= 0; i--) {
      if (openStack[i].modal === modal) {
        var trigger = openStack[i].trigger;
        openStack.splice(i, 1);
        if (trigger && trigger.focus && document.contains(trigger)) {
          trigger.focus();
        }
        break;
      }
    }
    if (openStack.length === 0) {
      document.body.classList.remove("modal-open");
    }
  }

  function topModal() {
    return openStack.length
      ? openStack[openStack.length - 1].modal
      : null;
  }

  // --- Delegación global de triggers ---
  document.addEventListener("click", function (e) {
    var opener = e.target.closest('[data-action="open-modal"]');
    if (opener) {
      e.preventDefault();
      open(opener.getAttribute("data-modal"));
      return;
    }
    var closer = e.target.closest('[data-action="close-modal"], [data-close-modal]');
    if (closer) {
      var id =
        closer.getAttribute("data-close-modal") ||
        closer.getAttribute("data-modal");
      var modal = id ? document.getElementById(id) : closer.closest(".modal");
      if (modal) {
        e.preventDefault();
        close(modal);
      }
    }
  });

  document.addEventListener("keydown", function (e) {
    var modal = topModal();
    if (!modal) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close(modal);
      return;
    }
    if (e.key === "Tab") {
      var focusables = getFocusables(modal);
      if (!focusables.length) {
        e.preventDefault();
        return;
      }
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // --- Modal genérico programático (reemplazo de alert/confirm/prompt) ---
  var GENERIC_ID = "minka-generic-modal";

  function buildGeneric() {
    var existing = document.getElementById(GENERIC_ID);
    if (existing) return existing;
    var modal = document.createElement("div");
    modal.className = "modal";
    modal.id = GENERIC_ID;
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML =
      '<div class="modal__overlay" data-close-modal></div>' +
      '<div class="modal__content" role="dialog" aria-modal="true" aria-labelledby="minka-generic-title">' +
      '<div class="modal__header">' +
      '<h3 id="minka-generic-title" class="modal__title"></h3>' +
      '<button type="button" class="modal__close" data-close-modal aria-label="Cerrar">&times;</button>' +
      "</div>" +
      '<div class="modal__body">' +
      '<p class="modal__subtitle" id="minka-generic-message"></p>' +
      '<div id="minka-generic-field" hidden>' +
      '<label class="form-label" for="minka-generic-input" id="minka-generic-label"></label>' +
      '<input type="text" id="minka-generic-input" />' +
      "</div>" +
      "</div>" +
      '<div class="modal__actions">' +
      '<button type="button" class="btn btn-secondary" id="minka-generic-cancel"></button>' +
      '<button type="button" class="btn btn-primary" id="minka-generic-ok"></button>' +
      "</div>" +
      "</div>";
    document.body.appendChild(modal);
    return modal;
  }

  function dialog(opts) {
    opts = opts || {};
    return new Promise(function (resolvePromise) {
      var modal = buildGeneric();
      var title = modal.querySelector("#minka-generic-title");
      var message = modal.querySelector("#minka-generic-message");
      var field = modal.querySelector("#minka-generic-field");
      var label = modal.querySelector("#minka-generic-label");
      var input = modal.querySelector("#minka-generic-input");
      var okBtn = modal.querySelector("#minka-generic-ok");
      var cancelBtn = modal.querySelector("#minka-generic-cancel");

      title.textContent = opts.title || "Mink'a";
      message.textContent = opts.message || "";
      message.hidden = !opts.message;
      var isPrompt = opts.mode === "prompt";
      field.hidden = !isPrompt;
      if (isPrompt) {
        label.textContent = opts.label || "";
        label.hidden = !opts.label;
        input.value = opts.value || "";
        input.placeholder = opts.placeholder || "";
        input.setAttribute("data-autofocus", "");
      } else {
        input.removeAttribute("data-autofocus");
      }
      okBtn.textContent = opts.confirmText || "Aceptar";
      cancelBtn.textContent = opts.cancelText || "Cancelar";
      cancelBtn.hidden = opts.mode === "alert";
      okBtn.classList.toggle("btn-danger", !!opts.danger);

      var settled = false;
      function settle(value) {
        if (settled) return;
        settled = true;
        cleanup();
        close(modal);
        resolvePromise(value);
      }
      function onOk() {
        settle(isPrompt ? input.value.trim() : true);
      }
      function onCancel() {
        settle(isPrompt ? null : false);
      }
      function onKey(e) {
        if (e.key === "Enter" && isPrompt && document.activeElement === input) {
          e.preventDefault();
          onOk();
        }
      }
      function onHidden(mutations) {
        if (modal.getAttribute("aria-hidden") === "true") {
          onCancel();
        }
      }
      var observer = new MutationObserver(onHidden);
      observer.observe(modal, {
        attributes: true,
        attributeFilter: ["aria-hidden"],
      });
      function cleanup() {
        okBtn.removeEventListener("click", onOk);
        cancelBtn.removeEventListener("click", onCancel);
        modal.removeEventListener("keydown", onKey);
        observer.disconnect();
      }
      okBtn.addEventListener("click", onOk);
      cancelBtn.addEventListener("click", onCancel);
      modal.addEventListener("keydown", onKey);
      open(modal);
    });
  }

  window.Modal = {
    open: open,
    close: close,
    alert: function (message, title) {
      return dialog({ mode: "alert", message: message, title: title });
    },
    confirm: function (message, opts) {
      opts = opts || {};
      opts.mode = "confirm";
      opts.message = message;
      return dialog(opts);
    },
    prompt: function (message, opts) {
      opts = opts || {};
      opts.mode = "prompt";
      opts.message = message;
      return dialog(opts);
    },
  };
})();
