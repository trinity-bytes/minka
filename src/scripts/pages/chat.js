// T17 - Lucero Pipa: Chat con plantillas y puntos de encuentro
// T31 - Andy Salcedo: Geolocalización en chat
// T34 - Ronel Rojas: Mejoras de chat (fotos, lectura)
// Persistencia centralizada en core/store.js (window.Store)
// ES module (bundled by Astro, deferred): runs after the classic core
// scripts, with the DOM parsed. Globals used: Store, Modal.
import { token, withAlpha } from "../tokens";
import { avatarTone, formatCount, initials } from "../lib/avatar.js";
import {
  filterThreads,
  groupPositions,
  lastMessagePreview,
  trailingIncomingCount,
} from "../lib/chat-thread.js";

const threads = [
  {
    id: "th-001",
    user: "Lucía P.",
    item: "Bicicleta urbana vintage",
    location: "Miraflores",
    rating: 4.8,
    distanceKm: 4,
    muted: false,
    messages: [
      { from: "them", text: "¡Hola! ¿Sigue disponible?", time: "09:10" },
      { from: "me", text: "Sí, sigue disponible.", time: "09:11" },
    ],
  },
  {
    id: "th-002",
    user: "Carlos R.",
    item: "Mesa de centro reciclada",
    location: "Barranco",
    rating: 4.2,
    distanceKm: 6,
    muted: false,
    messages: [
      { from: "them", text: "¿Podemos vernos sábado?", time: "10:05" },
    ],
  },
];

const templates = [
  "¿En qué distrito estás?",
  "Propongo vernos el sábado a las 10am",
  "Confirmado, nos vemos ahí",
  "Lo siento, debo cancelar el encuentro",
];

const meetingPoints = [
  "Parque Kennedy, Miraflores",
  "Estación Metropolitano Benavides",
  "Plaza Barranco",
  "CC Larcomar (zona pública)",
];

const els = {
  list: document.getElementById("thread-list"),
  messages: document.getElementById("messages"),
  templateList: document.getElementById("template-list"),
  meetingList: document.getElementById("meeting-list"),
  composer: document.getElementById("composer"),
  composerInput: document.getElementById("composer-input"),
  convItem: document.getElementById("conv-item"),
  convUser: document.getElementById("conv-user"),
  convMeta: document.getElementById("conv-meta"),
  btnMute: document.getElementById("btn-mute"),
  btnReport: document.getElementById("btn-report"),
  btnRate: document.getElementById("btn-rate"),
  btnShareLocation: document.getElementById("btn-share-location"), // T31
  btnAttachPhoto: document.getElementById("btn-attach-photo"), // T34
  fileInput: document.getElementById("file-input"), // T34
  typingIndicator: document.getElementById("typing-indicator"), // T34
};

// T18 - Modal elements
const modals = {
  report: document.getElementById("report-modal"),
  rating: document.getElementById("rating-modal"),
};

const forms = {
  report: document.getElementById("report-form"),
  rating: document.getElementById("rating-form"),
};

const feedback = {
  report: document.getElementById("report-feedback"),
  rating: document.getElementById("rating-feedback"),
};

let currentThreadId = threads[0].id;
// Presentational only (not persisted): threads opened in this page view.
// Unopened threads show their incoming messages after the user's last
// reply as an unread pill.
const seenThreads = new Set();
let listQuery = "";
loadDynamicThreads();
hydrateMessages();
restoreThread();
handleUrlParams();
seenThreads.add(currentThreadId);
renderThreads();
renderConversation();
renderTemplates();
renderMeetings();
attachComposer();
attachMobileNav();
attachThreadSearch();
attachExtras();
attachLocationSharing(); // T31
attachPhotoSharing(); // T34
attachMute();
attachReport();
attachRating();
bindCloseTriggers();

function restoreThread() {
  const saved = Store.getChatThread();
  if (saved && threads.some((t) => t.id === saved)) {
    currentThreadId = saved;
  }
}

function persistThread() {
  Store.saveChatThread(currentThreadId);
}

// Hilos creados dinámicamente (handoff desde detalle) que sobreviven recarga
function loadDynamicThreads() {
  Store.getDynamicThreads().forEach((meta) => {
    if (!threads.some((t) => t.id === meta.id)) {
      threads.push({ ...meta, messages: [] });
    }
  });
}

function persistDynamicThread(thread) {
  const { messages, ...meta } = thread;
  Store.saveDynamicThread(meta);
}

// Mensajes persistidos reemplazan/extienden los del mock por hilo
function hydrateMessages() {
  threads.forEach((thread) => {
    const stored = Store.getMessages(thread.id);
    if (stored.length) thread.messages = stored;
  });
}

function persistMessages(thread) {
  Store.saveMessages(thread.id, thread.messages);
}

// Handoff desde detalle: ?thread=<itemId>&owner=<ownerId>
function handleUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const threadParam = params.get("thread");
  const ownerParam = params.get("owner");
  if (!threadParam) return;

  let thread = threads.find((t) => t.id === threadParam);
  if (!thread && ownerParam) {
    thread = {
      id: threadParam,
      user: ownerParam === "seller-demo" ? "Vendedor Mink'a" : ownerParam,
      item: "Publicación " + threadParam,
      location: "Lima",
      rating: 4.5,
      distanceKm: 3,
      muted: false,
      messages: [
        {
          from: "them",
          text: "¡Hola! Vi que te interesa mi publicación. ¿Conversamos?",
          time: `${String(new Date().getHours()).padStart(2, "0")}:${String(
            new Date().getMinutes()
          ).padStart(2, "0")}`,
        },
      ],
    };
    threads.unshift(thread);
    persistDynamicThread(thread);
    persistMessages(thread);
  }
  if (thread) {
    currentThreadId = thread.id;
    persistThread();
  }
}

function renderThreads() {
  // Re-rendering replaces the rows: remember a focused row to restore it.
  const focusedId = document.activeElement?.closest?.("#thread-list .thread")?.dataset.id;
  const visible = filterThreads(threads, listQuery);
  if (!visible.length) {
    els.list.innerHTML = `<li class="thread-list__empty">No hay conversaciones que coincidan.</li>`;
    return;
  }

  els.list.innerHTML = visible
    .map((t) => {
      const active = t.id === currentThreadId;
      const preview = lastMessagePreview(t);
      const unread = seenThreads.has(t.id) ? 0 : trailingIncomingCount(t.messages);
      return `
        <li class="thread ${active ? "thread--active" : ""}${unread ? " thread--unread" : ""}" data-id="${t.id}">
          <button type="button" class="thread__btn"${active ? ' aria-current="true"' : ""}>
            <span class="chat-avatar chat-avatar--${avatarTone(t.user)}" aria-hidden="true">${initials(t.user)}</span>
            <span class="thread__text">
              <span class="thread__top">
                <span class="thread__title">${t.user}</span>
                <span class="thread__time">${preview.time}</span>
              </span>
              <span class="thread__item">${t.item}</span>
              <span class="thread__bottom">
                <span class="thread__preview">${preview.own ? "Tú: " : ""}${preview.text}</span>
                ${
                  unread
                    ? `<span class="thread__unread"><span class="sr-only">Mensajes sin leer: </span>${formatCount(unread)}</span>`
                    : ""
                }
              </span>
            </span>
          </button>
        </li>
      `;
    })
    .join("");

  if (focusedId) {
    els.list.querySelector(`.thread[data-id="${focusedId}"] .thread__btn`)?.focus();
  }

  els.list.querySelectorAll(".thread").forEach((node) => {
    node.addEventListener("click", () => {
      currentThreadId = node.dataset.id;
      seenThreads.add(currentThreadId);
      persistThread();
      renderThreads();
      renderConversation();
      // The list was re-rendered: keep keyboard focus on the chosen row.
      activeThreadButton()?.focus();
    });
  });
}

function activeThreadButton() {
  return els.list.querySelector(".thread--active .thread__btn");
}

function renderConversation() {
  const thread = threads.find((t) => t.id === currentThreadId);
  if (!thread) return;

  els.convItem.textContent = thread.item;
  els.convUser.textContent = thread.user;
  els.convMeta.innerHTML = `${thread.location} · <i class="fas fa-star" aria-hidden="true"></i> ${thread.rating} · ${thread.distanceKm} km`;
  const convAvatar = document.getElementById("conv-avatar");
  if (convAvatar) {
    convAvatar.textContent = initials(thread.user);
    convAvatar.className = `chat-avatar chat-avatar--${avatarTone(thread.user)} chat-avatar--md`;
  }

  if (thread.muted) {
    els.btnMute.innerHTML = '<i class="fa-solid fa-bell" aria-hidden="true"></i>';
    els.btnMute.classList.add("is-muted");
    els.btnMute.title = "Activar notificaciones";
    els.btnMute.setAttribute("aria-label", "Activar notificaciones");
  } else {
    els.btnMute.innerHTML = '<i class="fa-solid fa-bell-slash" aria-hidden="true"></i>';
    els.btnMute.classList.remove("is-muted");
    els.btnMute.title = "Silenciar";
    els.btnMute.setAttribute("aria-label", "Silenciar conversación");
  }

  const positions = groupPositions(thread.messages);
  els.messages.innerHTML = thread.messages
    .map((msg, index) => {
      const own = msg.from === "me";
      // T34 - Status Icon Logic
      let statusIcon = "";
      if (own) {
        if (msg.status === "read")
          statusIcon =
            '<i class="fas fa-check-double message__status read" role="img" aria-label="Leído"></i>';
        else if (msg.status === "delivered")
          statusIcon = '<i class="fas fa-check-double message__status" role="img" aria-label="Entregado"></i>';
        else statusIcon = '<i class="fas fa-check message__status" role="img" aria-label="Enviado"></i>';
      }

      // T34 - Image Rendering
      const content = msg.image
        ? `<img src="${msg.image}" alt="Foto adjunta" class="message__image" loading="lazy" />`
        : `<div class="message__text">${msg.text}</div>`;

      const { start, end } = positions[index];
      const classes = [
        "message",
        own ? "message--me" : "",
        start ? "message--start" : "",
        end ? "message--end" : "",
        msg.image && !msg.text ? "message--photo" : "",
      ]
        .filter(Boolean)
        .join(" ");

      // Sender is visible through alignment and color; the sr-only label
      // keeps it for screen readers.
      return `
        <div class="${classes}">
          <span class="sr-only">${own ? "Tú" : thread.user}:</span>
          ${content}
          <div class="message__meta">${msg.time} ${statusIcon}</div>
        </div>
      `;
    })
    .join("");

  els.messages.scrollTop = els.messages.scrollHeight;
}

function renderTemplates() {
  els.templateList.innerHTML = templates
    .map(
      (tpl) =>
        `<button type="button" class="template" data-template="${tpl}">${tpl}</button>`
    )
    .join("");

  els.templateList.querySelectorAll("[data-template]").forEach((btn) => {
    btn.addEventListener("click", () => insertMessage(btn.dataset.template));
  });
}

function renderMeetings() {
  els.meetingList.innerHTML = meetingPoints
    .map(
      (place) =>
        `<button type="button" class="meeting-chip" data-place="${place}">${place}</button>`
    )
    .join("");

  els.meetingList.querySelectorAll("[data-place]").forEach((btn) => {
    btn.addEventListener("click", () =>
      insertMessage(`📍 Sugiero punto de encuentro: ${btn.dataset.place}`, true)
    );
  });
}

function attachComposer() {
  els.composer.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = els.composerInput.value.trim();
    if (!text) return;
    insertMessage(text, true);
    els.composerInput.value = "";
  });
}

// En móvil la lista y la conversación son dos pantallas: elegir un
// hilo abre la conversación; el botón volver regresa a la lista.
function attachMobileNav() {
  const shell = document.querySelector(".chat-shell");
  const btnBack = document.getElementById("btn-back");
  if (!shell) return;

  els.list.addEventListener("click", (e) => {
    if (e.target.closest(".thread")) {
      shell.classList.add("is-thread-open");
      // Phones: the list is hidden now, so focus moves into the thread.
      if (btnBack && btnBack.offsetParent) btnBack.focus();
    }
  });

  if (btnBack) {
    btnBack.addEventListener("click", () => {
      shell.classList.remove("is-thread-open");
      activeThreadButton()?.focus();
    });
  }

  // Handoff directo desde detalle (?thread=...): abrir la conversación
  if (new URLSearchParams(window.location.search).get("thread")) {
    shell.classList.add("is-thread-open");
  }
}

// Client-side filter of the conversation list (name, listing, last message).
function attachThreadSearch() {
  const input = document.getElementById("thread-search");
  if (!input) return;
  input.addEventListener("input", () => {
    listQuery = input.value;
    renderThreads();
  });
}

// "+" in the composer unfolds the extras panel (photo, location, meeting
// points); choosing an extra or Escape folds it again.
function attachExtras() {
  const toggle = document.getElementById("btn-extras");
  const panel = document.getElementById("chat-extras");
  if (!toggle || !panel) return;

  const setOpen = (open) => {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.classList.toggle("is-open", open);
  };

  toggle.addEventListener("click", () => setOpen(panel.hidden));
  // Capture phase: fold the panel and focus the toggle before the extra
  // runs, so a modal it opens (location prompt) returns focus to the "+".
  panel.addEventListener(
    "click",
    (e) => {
      if (!e.target.closest("button")) return;
      setOpen(false);
      toggle.focus();
    },
    true
  );
  // Escape anywhere in the composer folds the panel back.
  panel.parentElement.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });
}

function attachMute() {
  if (!els.btnMute) return;
  els.btnMute.addEventListener("click", () => {
    const thread = threads.find((t) => t.id === currentThreadId);
    if (thread) {
      thread.muted = !thread.muted;
      renderConversation();
    }
  });
}

function attachReport() {
  if (!els.btnReport) return;
  els.btnReport.addEventListener("click", () => {
    const thread = threads.find((t) => t.id === currentThreadId);
    if (thread) {
      // Reset form
      forms.report.reset();
      feedback.report.textContent = "";
      feedback.report.classList.remove("is-success", "is-error");
      openModal(modals.report);
    }
  });

  forms.report.addEventListener("submit", (event) => {
    event.preventDefault();
    const reason = document.getElementById("report-reason");
    const details = document.getElementById("report-details");
    const selected = reason?.value;
    const detailText = details?.value?.trim() || "";

    if (!selected) {
      feedback.report.textContent = "Selecciona un motivo para continuar.";
      feedback.report.classList.add("is-error");
      return;
    }

    if (selected === "otro" && detailText.length < 12) {
      feedback.report.textContent =
        "Agrega más contexto para procesar el reporte.";
      feedback.report.classList.add("is-error");
      return;
    }

    feedback.report.textContent =
      "Reporte enviado. Revisaremos la información.";
    feedback.report.classList.remove("is-error");
    feedback.report.classList.add("is-success");

    setTimeout(() => {
      closeModal(modals.report);
    }, 1500);
  });
}

function attachRating() {
  if (!els.btnRate) return;

  let currentRating = 0;
  const stars = forms.rating.querySelectorAll(".rating-star");

  els.btnRate.addEventListener("click", () => {
    const thread = threads.find((t) => t.id === currentThreadId);
    if (thread) {
      const userSpan = document.getElementById("rating-user");
      if (userSpan) userSpan.textContent = thread.user;

      forms.rating.reset();
      currentRating = 0;
      updateStars(0);
      feedback.rating.textContent = "";
      feedback.rating.classList.remove("is-success", "is-error");
      openModal(modals.rating);
    }
  });

  stars.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentRating = parseInt(btn.dataset.value, 10);
      updateStars(currentRating);
    });
  });

  function updateStars(value) {
    stars.forEach((btn) => {
      const starVal = parseInt(btn.dataset.value, 10);
      const icon = btn.querySelector("i");
      if (starVal <= value) {
        btn.classList.add("is-active");
      } else {
        btn.classList.remove("is-active");
      }
    });
  }

  forms.rating.addEventListener("submit", (event) => {
    event.preventDefault();
    if (currentRating === 0) {
      feedback.rating.textContent = "Por favor selecciona una calificación.";
      feedback.rating.classList.add("is-error");
      return;
    }

    feedback.rating.textContent = "¡Gracias! Tu calificación ha sido enviada.";
    feedback.rating.classList.remove("is-error");
    feedback.rating.classList.add("is-success");

    setTimeout(() => {
      closeModal(modals.rating);
    }, 1500);
  });
}

function openModal(modal) {
  if (window.Modal) Modal.open(modal);
}

function closeModal(modal) {
  if (window.Modal) Modal.close(modal);
}

// T31 - Location Sharing (HU45)
function attachLocationSharing() {
  if (!els.btnShareLocation) return;

  els.btnShareLocation.addEventListener("click", () => {
    Modal.prompt("¿Por cuánto tiempo quieres compartir tu ubicación?", {
      title: "Compartir ubicación",
      label: "Minutos",
      value: "15",
    }).then((duration) => {
      if (!duration) return;

      insertMessage(
        `📍 Compartiendo ubicación en tiempo real por ${duration} min.`,
        true
      );
    });
  });
}

function bindCloseTriggers() {
  // core/modal.js maneja data-close-modal, Escape y focus trap
}

function insertMessage(text, fromUser = false, image = null) {
  const thread = threads.find((t) => t.id === currentThreadId);
  if (!thread) return;
  const time = new Date();
  const label = `${String(time.getHours()).padStart(2, "0")}:${String(
    time.getMinutes()
  ).padStart(2, "0")}`;

  const newMessage = {
    from: fromUser ? "me" : "them",
    text,
    time: label,
    image: image, // T34
    status: fromUser ? "sent" : "read", // T34
  };

  thread.messages.push(newMessage);
  persistMessages(thread);
  renderConversation();
  renderThreads(); // keep the row preview and time current

  // Notificar mensajes entrantes (badge + feed)
  if (!fromUser && window.Store) {
    Store.addNotification({
      type: "message",
      title: `Nuevo mensaje de ${thread.user}`,
      text: text.slice(0, 80),
      payload: { threadId: thread.id, from: "them" },
    });
  }

  // T34 - Simulate Status Updates (Sent -> Delivered -> Read)
  if (fromUser) {
    setTimeout(() => {
      newMessage.status = "delivered";
      persistMessages(thread);
      renderConversation();
    }, 1500);

    setTimeout(() => {
      newMessage.status = "read";
      persistMessages(thread);
      renderConversation();
    }, 3500);

    // Simulate Reply Typing + respuesta mock del otro lado
    setTimeout(() => {
      showTyping();
    }, 2000);

    setTimeout(() => {
      insertMessage("¡Genial! Coordinemos, ¿te parece este fin de semana?");
    }, 4000);
  }
}

// T34 - Typing Indicator (HU44)
function showTyping() {
  if (els.typingIndicator) {
    els.typingIndicator.classList.remove("hidden");
    els.messages.scrollTop = els.messages.scrollHeight;

    setTimeout(() => {
      els.typingIndicator.classList.add("hidden");
    }, 2000);
  }
}

// T34 - Photo Sharing with Watermark (HU43)
function attachPhotoSharing() {
  if (!els.btnAttachPhoto || !els.fileInput) return;

  els.btnAttachPhoto.addEventListener("click", () => {
    els.fileInput.click();
  });

  els.fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas for watermark
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Set dimensions
        canvas.width = 800; // Normalize width
        canvas.height = (img.height / img.width) * 800;

        // Draw original image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Add Watermark
        ctx.font = "bold 24px Arial";
        ctx.fillStyle = withAlpha(token("--color-on-primary"), 0.7);
        ctx.textAlign = "right";
        ctx.fillText(
          `Mink'a ID: ${currentThreadId}`,
          canvas.width - 20,
          canvas.height - 20
        );
        ctx.fillText(`User: Me`, canvas.width - 20, canvas.height - 50);

        // Send as message
        const watermarkedUrl = canvas.toDataURL("image/jpeg", 0.8);
        insertMessage("", true, watermarkedUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);

    // Reset input
    els.fileInput.value = "";
  });
}
