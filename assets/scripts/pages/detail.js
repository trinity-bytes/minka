// T16 - Miguel Sanca: Lógica de ficha de detalle (datos simulados + QR)
// T18 - Leonardo Chavez: Modales de rating y reporte con validación
// T23 - Ronel Rojas: Gestión de estados de publicación
// T25 - Ronel Rojas: Métricas Ambientales
// T33 - Miguel Sanca: Trazabilidad Avanzada (Timeline)
const mockDetail = {
  id: "itm-001",
  title: "Bicicleta urbana vintage",
  category: "Electrónica",
  condition: "Como nuevo",
  location: "Miraflores, Lima",
  availability: "Fines de semana",
  rating: 4.8,
  description:
    "Bicicleta ligera, revisada recientemente. Incluye luces y candado. Ideal para ciudad.",
  tags: ["movilidad", "urbano", "bicicleta", "ligera"],
  specs: {
    Marca: "Monark",
    Modelo: "Vintage 2020",
    Color: "Verde menta",
  },
  images: [
    "../assets/images/items/bicicleta-vintage.jpg",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=80",
  ],
  owner: {
    name: "Lucero Pipa",
    location: "Lima, Perú",
    rating: 4.5,
  },
};

const qrImage = document.getElementById("qr-image");
const qrCanvas = document.getElementById("qr-canvas");
const qrCtx = qrCanvas ? qrCanvas.getContext("2d") : null;
const qrText = document.getElementById("qr-code-text");
const qrStatus = document.getElementById("qr-status");
const qrDownload = document.getElementById("qr-download");
const qrShare = document.getElementById("qr-share");

const thumbs = document.getElementById("gallery-thumbs");
const mainImg = document.getElementById("gallery-main");
const heroEyebrow = document.querySelector(".detail-hero__eyebrow");

const el = {
  title: document.getElementById("item-title"),
  meta: document.getElementById("item-meta"),
  description: document.getElementById("item-description"),
  tags: document.getElementById("item-tags"),
  condition: document.getElementById("item-condition"),
  location: document.getElementById("item-location"),
  availability: document.getElementById("item-availability"),
  rating: document.getElementById("item-rating"),
  specsContainer: document.querySelector(".detail-info"),
  sellerName: document.getElementById("seller-name"),
  sellerLocation: document.getElementById("seller-location"),
  sellerRating: document.getElementById("seller-rating"),
};

const ratingUser = document.getElementById("rating-user");
const modals = {
  rating: document.getElementById("rating-modal"),
  report: document.getElementById("report-modal"),
  eco: document.getElementById("eco-modal"),
  offline: document.getElementById("offline-modal"), // T33
  closeReason: document.getElementById("close-reason-modal"), // T25
};

// T25 - Ronel Rojas: Factores de impacto ambiental — fuente única en
// core/constants.js (window.MINKA_CONSTANTS).
const ECO_FACTORS = window.MINKA_CONSTANTS.ECO_FACTORS;

const forms = {
  rating: document.getElementById("rating-form"),
  report: document.getElementById("report-form"),
  offline: document.getElementById("offline-form"), // T33
  closeReason: document.getElementById("close-reason-form"), // T25
};

const feedback = {
  rating: document.getElementById("rating-feedback"),
  report: document.getElementById("report-feedback"),
  offline: document.getElementById("offline-feedback"), // T33
};

const controls = {
  rateBtn: document.getElementById("action-rate"),
  reportBtn: document.getElementById("action-report"),
  closeTriggers: document.querySelectorAll("[data-close-modal]"),
  pauseBtn: document.getElementById("action-pause"),
  reserveBtn: document.getElementById("action-reserve"),
  activateBtn: document.getElementById("action-activate"),
  reissueQrBtn: document.getElementById("qr-reissue"), // T33
  offlineCloseBtn: document.getElementById("action-offline-close"), // T33
};

let currentCode = "";
let itemState = "activo";
let currentItem = null;

// T33 - Mock Timeline Data
const mockTimeline = [
  {
    date: "2025-12-01 10:00",
    title: "Publicado",
    desc: "Objeto publicado por Lucero P.",
    completed: true,
  },
  {
    date: "2025-12-02 15:30",
    title: "Reservado",
    desc: "Reservado para intercambio con Carlos R.",
    completed: true,
  },
  {
    date: "2025-12-03 09:00",
    title: "Encuentro Programado",
    desc: "Punto de encuentro: Parque Kennedy",
    completed: false,
  },
  {
    date: "-",
    title: "Intercambio Cerrado",
    desc: "Pendiente de confirmación",
    completed: false,
  },
];

init();

function init() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  let item = mockDetail;

  if (id) {
    const found = Store.getItem(id);
    if (found) {
      item = found;
      currentCode = item.qrCode; // Use stored QR code
    } else if (id !== mockDetail.id) {
      // If ID provided but not found in local or mock, maybe show error or fallback
      console.warn("Item not found, showing mock");
    }
  }

  currentItem = item;
  renderDetail(item);

  // Handoff hacia chat y perfil del dueño con contexto del item
  const ownerId = item.owner?.id || "seller-demo";
  const contactLink = document.getElementById("action-contact");
  if (contactLink) {
    contactLink.href = `chat.html?thread=${encodeURIComponent(
      item.id
    )}&owner=${encodeURIComponent(ownerId)}`;
  }
  const ownerLink = document.getElementById("owner-profile-link");
  if (ownerLink) {
    ownerLink.href = `perfil.html?user=${encodeURIComponent(ownerId)}`;
  }

  if (item.qrCode) {
    currentCode = item.qrCode;
    qrText.textContent = currentCode;
    qrStatus.textContent = "Activo";
    renderQrImage(currentCode);
    qrDownload.disabled = false;
    qrShare.disabled = false;
  } else {
    setPlaceholderQr();
  }

  // Restaurar estado persistido (pausado/reservado/etc.)
  if (item.status && ["activo", "pausado", "reservado"].includes(item.status)) {
    updateState(item.status);
  }

  renderTimeline(); // T33
  bindActions();
}

// T33 - Render Timeline (HU40)
function renderTimeline() {
  const container = document.getElementById("item-timeline");
  if (!container) return;

  container.innerHTML = mockTimeline
    .map(
      (event) => `
    <li class="timeline-item ${event.completed ? "completed" : ""}">
      <div class="timeline-marker"></div>
      <div class="timeline-content">
        <h4>${event.title}</h4>
        <span class="timeline-date">${event.date}</span>
        <p class="timeline-desc">${event.desc}</p>
      </div>
    </li>
  `
    )
    .join("");
}

function renderDetail(item) {
  if (!item) return;
  el.title.textContent = item.title;
  el.meta.textContent = `${item.category} · ${item.location} · ${item.condition}`;
  el.description.textContent = item.description;
  el.condition.textContent = item.condition;
  el.location.textContent = item.location;
  el.availability.textContent = item.availability;
  el.rating.innerHTML = `<i class="fas fa-star"></i> ${item.rating}`;

  if (item.specs && el.specsContainer) {
    Object.entries(item.specs).forEach(([key, value]) => {
      const row = document.createElement("div");
      row.className = "info-row";
      row.innerHTML = `<span>${key}</span><strong>${value}</strong>`;
      el.specsContainer.appendChild(row);
    });
  }

  el.sellerName.textContent = item.owner.name;
  el.sellerLocation.textContent = item.owner.location;
  el.sellerRating.innerHTML = `<i class="fas fa-star"></i> ${item.owner.rating}`;
  if (ratingUser) {
    ratingUser.textContent = item.owner.name;
  }

  if (Array.isArray(item.tags)) {
    el.tags.innerHTML = item.tags
      .map((tag) => `<span class="badge">${tag}</span>`)
      .join("");
  }

  if (Array.isArray(item.images) && item.images.length) {
    mainImg.src = item.images[0];
    thumbs.innerHTML = item.images
      .map(
        (src, idx) =>
          `<img src="${src}" alt="Vista ${idx + 1}" data-src="${src}" />`
      )
      .join("");

    thumbs.querySelectorAll("img").forEach((thumb) => {
      thumb.addEventListener("click", () => {
        mainImg.src = thumb.dataset.src;
      });
    });
  }
}

function bindActions() {
  // const contactBtn = document.getElementById("action-contact"); // Now a direct link
  const editBtn = document.getElementById("action-edit");
  const closeBtn = document.getElementById("action-close");
  const deleteBtn = document.getElementById("action-delete");

  editBtn?.addEventListener("click", () => {
    if (itemState !== "activo") {
      Toast.show("No puedes editar una publicación pausada o reservada.", "error");
      return;
    }
    Modal.prompt("Editar título (simulación):", {
      title: "Editar publicación",
      value: el.title.textContent,
    }).then((newTitle) => {
      if (newTitle) {
        el.title.textContent = newTitle;
        persistItemPatch({ title: newTitle });
        Toast.show("Cambios guardados exitosamente.", "success");
      }
    });
  });

  closeBtn?.addEventListener("click", () => {
    // T25 - Ronel Rojas: Usar modal en lugar de prompt
    openModal(modals.closeReason);
  });

  // T25 - Manejo del formulario de motivo de cierre
  if (forms.closeReason) {
    forms.closeReason.addEventListener("submit", (e) => {
      e.preventDefault();
      const reason = document.querySelector(
        'input[name="close-reason"]:checked'
      )?.value;

      closeModal(modals.closeReason);

      if (reason === "exchanged") {
        setPlaceholderQr("Intercambiado");
        setStatus("Intercambiado");
        persistItemPatch({ status: "intercambiado" });
        // Use currentItem category if available, else fallback
        const category = currentItem ? currentItem.category : "Otros";
        showEcoMetrics(category);
      } else {
        setPlaceholderQr("Cerrado");
        setStatus("Cerrado");
        persistItemPatch({ status: "cerrado" });
      }
      if (window.Store && currentItem) {
        Store.addNotification({
          type: "match",
          title: reason === "exchanged" ? "Intercambio cerrado" : "Publicación cerrada",
          text: `"${currentItem.title}" cambió de estado.`,
          payload: { itemId: currentItem.id, action: "closed" },
        });
      }
    });
  }

  deleteBtn?.addEventListener("click", () => {
    Modal.confirm("¿Eliminar publicación? Esta acción es simulada.", {
      title: "Eliminar publicación",
      confirmText: "Eliminar",
      danger: true,
    }).then((confirmDel) => {
      if (confirmDel) {
        removePersistedItem();
        setPlaceholderQr("Eliminado");
        setStatus("Eliminado");
      }
    });
  });

  controls.pauseBtn?.addEventListener("click", () => updateState("pausado"));
  controls.reserveBtn?.addEventListener("click", () => {
    updateState("reservado");
    if (window.Store && currentItem) {
      Store.addNotification({
        type: "match",
        title: "Publicación reservada",
        text: `Reservaste "${currentItem.title}".`,
        payload: { itemId: currentItem.id, action: "reserved" },
      });
    }
  });
  controls.activateBtn?.addEventListener("click", () => updateState("activo"));

  setupRatingModal();
  setupReportModal();
  bindCloseTriggers();

  qrDownload?.addEventListener("click", () => {
    if (!currentCode || !qrCanvas) return;
    const link = document.createElement("a");
    link.href = qrCanvas.toDataURL("image/png");
    link.download = `${currentCode}.png`;
    link.click();
  });

  qrShare?.addEventListener("click", async () => {
    if (!currentCode || !qrCanvas) return;
    const dataUrl = qrCanvas.toDataURL("image/png");
    try {
      if (navigator.share && navigator.canShare?.({ files: [] })) {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `${currentCode}.png`, {
          type: "image/png",
        });
        await navigator.share({
          files: [file],
          title: currentCode,
          text: "QR de Mink'a",
        });
      } else {
        await navigator.clipboard.writeText(currentCode);
        Toast.show("Código QR copiado al portapapeles.", "success");
      }
    } catch (error) {
      console.warn("No se pudo compartir el QR", error);
      Toast.show("No se pudo compartir el QR en este navegador.", "error");
    }
  });

  // T33 - Reemitir QR (HU39)
  if (controls.reissueQrBtn) {
    controls.reissueQrBtn.addEventListener("click", () => {
      Modal.confirm(
        "¿Estás seguro de que deseas reemitir el código QR? El código anterior dejará de ser válido.",
        { title: "Reemitir QR", confirmText: "Reemitir" }
      ).then((ok) => {
        if (!ok) return;
        generateQr();
        Toast.show("Nuevo código QR generado exitosamente.", "success");
        // Agregar evento al timeline
        mockTimeline.push({
          date: new Date().toLocaleString(),
          title: "QR Reemitido",
          desc: "El usuario solicitó un nuevo código QR.",
          completed: true,
        });
        renderTimeline();
      });
    });
  }

  // T33 - Cierre Offline (HU41)
  if (controls.offlineCloseBtn) {
    controls.offlineCloseBtn.addEventListener("click", () => {
      openModal(modals.offline);
    });
  }

  if (forms.offline) {
    forms.offline.addEventListener("submit", (e) => {
      e.preventDefault();
      const codeInput = document.getElementById("offline-code");
      const code = codeInput.value.trim().toUpperCase();

      // Simular validación
      if (code.length >= 8) {
        feedback.offline.textContent =
          "Código validado correctamente. Cerrando intercambio...";
        feedback.offline.className = "form-feedback is-success";

        setTimeout(() => {
          closeModal(modals.offline);
          Toast.show("¡Intercambio cerrado exitosamente!", "success");

          // Actualizar estado
          updateState("intercambiado"); // Nuevo estado simulado
          qrStatus.textContent = "Intercambiado";

          // Actualizar timeline
          mockTimeline.push({
            date: new Date().toLocaleString(),
            title: "Intercambio Cerrado (Offline)",
            desc: `Código validado: ${code}`,
            completed: true,
          });
          renderTimeline();

          // Mostrar modal de impacto ambiental (existente)
          const category = currentItem ? currentItem.category : "Otros";
          showEcoMetrics(category);
        }, 1500);
      } else {
        feedback.offline.textContent =
          "Código inválido. Verifica e intenta nuevamente.";
        feedback.offline.className = "form-feedback is-error";
      }
    });
  }

  // Solo generar un QR nuevo si el item no tiene uno persistido;
  // si existe, init() ya lo mostró y no debe sobreescribirse.
  if (!currentCode) {
    generateQr();
  }
}

function setStatus(label) {
  qrStatus.textContent = label;
}

function persistItemPatch(patch) {
  if (!currentItem || !currentItem.id) return;
  if (!Store.getItem(currentItem.id)) return; // item mock, no persistido
  Store.updateItem(currentItem.id, patch);
  currentItem = { ...currentItem, ...patch };
}

function removePersistedItem() {
  if (!currentItem || !currentItem.id) return;
  Store.deleteItem(currentItem.id);
}

function updateState(state) {
  itemState = state;
  persistItemPatch({ status: state });
  const labels = {
    activo: "Publicación activa",
    pausado: "Publicación pausada",
    reservado: "Publicación reservada",
  };
  const badgeLabels = {
    activo: "Activo",
    pausado: "Pausado",
    reservado: "Reservado",
  };
  if (heroEyebrow) {
    heroEyebrow.textContent = labels[state] || "Publicación";
  }
  qrStatus.textContent = badgeLabels[state] || state;
  if (state === "pausado") {
    qrStatus.classList.add("badge--warning");
  } else {
    qrStatus.classList.remove("badge--warning");
  }
  if (state === "reservado") {
    qrStatus.classList.add("badge--info");
  } else {
    qrStatus.classList.remove("badge--info");
  }
}

function setPlaceholderQr(label = "Pendiente") {
  qrImage.src = "../assets/images/QR-generico.svg";
  qrText.textContent = label === "Pendiente" ? "Sin generar" : label;
  qrStatus.textContent = label;
  qrDownload.disabled = true;
  qrShare.disabled = true;
}

function generateQr() {
  currentCode = `MINKA-DET-${Date.now()}-${Math.floor(
    Math.random() * 1e6
  ).toString(16)}`;
  qrText.textContent = currentCode;
  qrStatus.textContent = "Activo";

  renderQrImage(currentCode);
  persistItemPatch({ qrCode: currentCode });
  qrDownload.disabled = false;
  qrShare.disabled = false;
}

// Dibuja el pseudo-QR en el canvas y refleja el resultado en la imagen.
// Si no hay canvas disponible, cae al SVG genérico.
function renderQrImage(code) {
  if (qrCanvas && qrCtx) {
    drawPseudoQr(code);
    qrImage.src = qrCanvas.toDataURL("image/png");
  } else {
    qrImage.src = "../assets/images/QR-generico.svg";
  }
}

function drawPseudoQr(seedStr) {
  const size = 25;
  const cell = qrCanvas.width / size;
  const seed = seedStr
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  let rng = seed;

  const next = () => {
    rng ^= rng << 13;
    rng ^= rng >> 17;
    rng ^= rng << 5;
    return Math.abs(rng);
  };

  qrCtx.fillStyle = "#ffffff";
  qrCtx.fillRect(0, 0, qrCanvas.width, qrCanvas.height);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const value = next();
      if (value % 3 === 0) {
        qrCtx.fillStyle = "#2c3e50";
        qrCtx.fillRect(x * cell, y * cell, cell, cell);
      } else if (value % 7 === 0) {
        qrCtx.fillStyle = "#2ecc71";
        qrCtx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
  }
}

function openModal(modal) {
  if (window.Modal) Modal.open(modal);
}

function closeModal(modal) {
  if (window.Modal) Modal.close(modal);
}

function bindCloseTriggers() {
  // core/modal.js maneja data-close-modal, Escape y focus trap
}

function setupRatingModal() {
  const stars = Array.from(document.querySelectorAll(".rating-star"));
  if (!controls.rateBtn || !modals.rating || !forms.rating || !feedback.rating)
    return;

  let current = 0;

  const setActiveStars = (value) => {
    stars.forEach((star) => {
      const starValue = Number(star.dataset.value);
      star.classList.toggle("is-active", starValue <= value);
    });
  };

  const reset = () => {
    current = 0;
    setActiveStars(0);
    forms.rating.reset();
    feedback.rating.textContent = "";
    feedback.rating.classList.remove("is-success", "is-error");
  };

  controls.rateBtn.addEventListener("click", () => {
    reset();
    openModal(modals.rating);
  });

  stars.forEach((star) => {
    star.addEventListener("click", () => {
      current = Number(star.dataset.value);
      setActiveStars(current);
      feedback.rating.textContent = "";
      feedback.rating.classList.remove("is-error");
    });
  });

  forms.rating.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!current) {
      feedback.rating.textContent = "Selecciona una calificación.";
      feedback.rating.classList.add("is-error");
      return;
    }

    feedback.rating.textContent =
      "Calificación enviada. Revisión en progreso (simulado).";
    feedback.rating.classList.remove("is-error");
    feedback.rating.classList.add("is-success");

    setTimeout(() => {
      closeModal(modals.rating);
    }, 800);
  });
}

function setupReportModal() {
  if (
    !controls.reportBtn ||
    !modals.report ||
    !forms.report ||
    !feedback.report
  )
    return;

  const reason = document.getElementById("report-reason");
  const details = document.getElementById("report-details");

  const reset = () => {
    forms.report.reset();
    feedback.report.textContent = "";
    feedback.report.classList.remove("is-success", "is-error");
  };

  controls.reportBtn.addEventListener("click", () => {
    reset();
    openModal(modals.report);
  });

  forms.report.addEventListener("submit", (event) => {
    event.preventDefault();
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
      "Reporte enviado. Revisaremos la información (simulado).";
    feedback.report.classList.remove("is-error");
    feedback.report.classList.add("is-success");

    setTimeout(() => {
      closeModal(modals.report);
    }, 900);
  });
}

// T25 - Ronel Rojas: Mostrar métricas ambientales
function showEcoMetrics(category) {
  const factors = ECO_FACTORS[category] || ECO_FACTORS["Otros"];

  // Update modal content
  document.getElementById("eco-co2").textContent = `${factors.co2} kg`;
  document.getElementById("eco-water").textContent = `${factors.water} L`;

  // Simulate comparison (randomly better or average)
  const isBetter = Math.random() > 0.3;
  const comparisonEl = document.getElementById("eco-comparison-val");
  if (comparisonEl) {
    comparisonEl.textContent = isBetter ? "superior" : "similar";
    comparisonEl.style.color = isBetter
      ? "var(--color-primary)"
      : "var(--color-secondary)";
  }

  openModal(modals.eco);
}
