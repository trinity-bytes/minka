// T17 - Lucero Pipa: Chat con plantillas y puntos de encuentro
// T31 - Andy Salcedo: Geolocalización en chat
// T34 - Ronel Rojas: Mejoras de chat (fotos, lectura)
// Persistencia centralizada en core/store.js (window.Store)

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
loadDynamicThreads();
hydrateMessages();
restoreThread();
handleUrlParams();
renderThreads();
renderConversation();
renderTemplates();
renderMeetings();
attachComposer();
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
  els.list.innerHTML = threads
    .map(
      (t) => `
        <li class="thread ${
          t.id === currentThreadId ? "thread--active" : ""
        }" data-id="${t.id}">
          <div class="thread__title">${t.user}</div>
          <div class="thread__meta">${t.item}</div>
          <div class="thread__meta">${
            t.location
          } · <i class="fas fa-star"></i> ${t.rating}</div>
        </li>
      `
    )
    .join("");

  els.list.querySelectorAll(".thread").forEach((node) => {
    node.addEventListener("click", () => {
      currentThreadId = node.dataset.id;
      persistThread();
      renderThreads();
      renderConversation();
    });
  });
}

function renderConversation() {
  const thread = threads.find((t) => t.id === currentThreadId);
  if (!thread) return;

  els.convItem.textContent = thread.item;
  els.convUser.textContent = thread.user;
  els.convMeta.innerHTML = `${thread.location} · <i class="fas fa-star"></i> ${thread.rating} · ${thread.distanceKm} km`;

  if (thread.muted) {
    els.btnMute.innerHTML = '<i class="fa-solid fa-bell"></i> Activar';
    els.btnMute.classList.add("btn-outline");
    els.btnMute.classList.remove("btn-secondary");
  } else {
    els.btnMute.innerHTML = '<i class="fa-solid fa-bell-slash"></i> Silenciar';
    els.btnMute.classList.remove("btn-outline");
    els.btnMute.classList.add("btn-secondary");
  }

  els.messages.innerHTML = thread.messages
    .map((msg) => {
      // T34 - Status Icon Logic
      let statusIcon = "";
      if (msg.from === "me") {
        if (msg.status === "read")
          statusIcon =
            '<i class="fas fa-check-double message__status read"></i>';
        else if (msg.status === "delivered")
          statusIcon = '<i class="fas fa-check-double message__status"></i>';
        else statusIcon = '<i class="fas fa-check message__status"></i>';
      }

      // T34 - Image Rendering
      const content = msg.image
        ? `<img src="${msg.image}" alt="Foto adjunta" class="message__image" loading="lazy" />`
        : `<div>${msg.text}</div>`;

      return `
        <div class="message ${msg.from === "me" ? "message--me" : ""}">
          <div class="message__meta">${
            msg.from === "me" ? "Tú" : thread.user
          } · ${msg.time} ${statusIcon}</div>
          ${content}
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
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
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
