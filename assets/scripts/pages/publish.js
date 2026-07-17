// T14 - Ronel Rojas: Lógica de publicación, QR mock y borradores locales
// T23 - Ronel Rojas: Estados, reservas y campos dinámicos por categoría
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("publish-form");
  const fileInput = document.getElementById("item-photos");
  const previewGrid = document.getElementById("photo-preview");
  const saveDraftBtn = document.getElementById("save-draft");
  // const downloadBtn = document.getElementById("download-qr");
  // const qrImage = document.getElementById("qr-image");
  // const qrCanvas = document.getElementById("qr-canvas");
  // const qrCtx = qrCanvas.getContext("2d");
  // const qrText = document.getElementById("qr-code-text");
  // const qrStatus = document.getElementById("qr-status");
  const successMsg = document.getElementById("form-success");
  const statusSelect = document.getElementById("item-status");
  const reservedToggle = document.getElementById("item-reserved");
  const dynamicFields = document.getElementById("dynamic-fields");

  const summaryFields = {
    title: document.getElementById("summary-title"),
    category: document.getElementById("summary-category"),
    location: document.getElementById("summary-location"),
    availability: document.getElementById("summary-availability"),
    status: document.getElementById("summary-status"),
    reserved: document.getElementById("summary-reserved"),
  };

  const inputRefs = {
    title: document.getElementById("item-title"),
    category: document.getElementById("item-category"),
    condition: document.getElementById("item-condition"),
    description: document.getElementById("item-description"),
    tags: document.getElementById("item-tags"),
    location: document.getElementById("item-location"),
    availability: document.getElementById("item-availability"),
    notes: document.getElementById("item-notes"),
    status: statusSelect,
    reserved: reservedToggle,
  };

  const categoryDynamicMap = {
    Electrónica: [
      {
        key: "power",
        labelKey: "publish.dynamic.power",
        placeholderKey: "publish.dynamic.powerPlaceholder",
      },
      {
        key: "accessories",
        labelKey: "publish.dynamic.accessories",
        placeholderKey: "publish.dynamic.accessoriesPlaceholder",
      },
    ],
    "Ropa y accesorios": [
      {
        key: "size",
        labelKey: "publish.dynamic.size",
        placeholderKey: "publish.dynamic.sizePlaceholder",
      },
      {
        key: "gender",
        labelKey: "publish.dynamic.fit",
        placeholderKey: "publish.dynamic.fitPlaceholder",
      },
    ],
    Libros: [
      {
        key: "author",
        labelKey: "publish.dynamic.author",
        placeholderKey: "publish.dynamic.authorPlaceholder",
      },
      {
        key: "edition",
        labelKey: "publish.dynamic.edition",
        placeholderKey: "publish.dynamic.editionPlaceholder",
      },
    ],
    Servicios: [
      {
        key: "hours",
        labelKey: "publish.dynamic.hours",
        placeholderKey: "publish.dynamic.hoursPlaceholder",
      },
      {
        key: "modality",
        labelKey: "publish.dynamic.modality",
        placeholderKey: "publish.dynamic.modalityPlaceholder",
      },
    ],
    Hogar: [
      {
        key: "materials",
        labelKey: "publish.dynamic.materials",
        placeholderKey: "publish.dynamic.materialsPlaceholder",
      },
    ],
  };

  const STORAGE_KEY = "minka_publish_draft";
  const PUBLISHED_KEY = "minka_published_items";
  let currentCode = "";
  let dynamicData = {};
  let uploadedImages = [];

  fileInput.addEventListener("change", handleFiles);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    generateQr();
    publishItem();
  });

  saveDraftBtn.addEventListener("click", () => {
    saveDraft();
    setSuccess(
      window.I18n
        ? window.I18n.t("publish.messages.draftSaved")
        : "Borrador guardado localmente."
    );
  });

  /*
  downloadBtn.addEventListener("click", () => {
    if (!currentCode) return;
    const link = document.createElement("a");
    link.href = qrCanvas.toDataURL("image/png");
    link.download = `${currentCode}.png`;
    link.click();
  });
  */

  Object.values(inputRefs).forEach((input) => {
    input.addEventListener("input", updateSummary);
    if (input.tagName === "SELECT" || input.tagName === "TEXTAREA") {
      input.addEventListener("change", updateSummary);
    }
  });

  statusSelect.addEventListener("change", updateSummary);
  reservedToggle.addEventListener("change", updateSummary);
  inputRefs.category.addEventListener("change", () => {
    renderDynamicFields(inputRefs.category.value);
    updateSummary();
  });

  window.addEventListener("languageChanged", () => {
    renderDynamicFields(inputRefs.category.value);
    updateSummary();
  });

  hydrateDraft();
  updateSummary();
  // setPlaceholderQr();
  renderDynamicFields(inputRefs.category.value);

  function validateForm() {
    let isValid = true;
    const requiredFields = [
      "title",
      "category",
      "condition",
      "description",
      "location",
      "availability",
    ];
    requiredFields.forEach((key) => {
      const field = inputRefs[key];
      const errorEl = document.querySelector(`[data-error-for="${field.id}"]`);
      if (!field.value.trim()) {
        errorEl.textContent = window.I18n
          ? window.I18n.t("publish.messages.required")
          : "Este campo es obligatorio.";
        isValid = false;
      } else {
        errorEl.textContent = "";
      }
    });

    if (fileInput.files.length === 0) {
      setSuccess("");
      alert(
        window.I18n
          ? window.I18n.t("publish.messages.uploadOne")
          : "Sube al menos 1 foto."
      );
      isValid = false;
    }

    if (fileInput.files.length > 5) {
      setSuccess("");
      alert(
        window.I18n
          ? window.I18n.t("publish.messages.uploadMax")
          : "Sube máximo 5 fotos."
      );
      isValid = false;
    }

    const dynInputs = dynamicFields.querySelectorAll("input[data-dynamic]");
    dynInputs.forEach((field) => {
      const errorEl = field.nextElementSibling;
      if (field.required && !field.value.trim()) {
        if (errorEl)
          errorEl.textContent = window.I18n
            ? window.I18n.t("publish.messages.completeData")
            : "Completa este dato";
        isValid = false;
      } else if (errorEl) {
        errorEl.textContent = "";
      }
    });

    return isValid;
  }

  function renderDynamicFields(category) {
    dynamicFields.innerHTML = "";
    const config = categoryDynamicMap[category];
    if (!config) return;

    const fragment = document.createDocumentFragment();
    const title = document.createElement("p");
    title.className = "form__hint form__hint--title";
    title.textContent = window.I18n
      ? window.I18n.t("publish.dynamic.suggested")
      : "Campos sugeridos para esta categoría";
    fragment.appendChild(title);

    config.forEach((field) => {
      const wrap = document.createElement("div");
      wrap.className = "form__group dynamic-field";
      const labelText = window.I18n
        ? window.I18n.t(field.labelKey)
        : field.labelKey;
      const placeholderText = window.I18n
        ? window.I18n.t(field.placeholderKey)
        : field.placeholderKey;

      wrap.innerHTML = `
        <label for="dynamic-${field.key}">${labelText}</label>
        <input id="dynamic-${field.key}" data-dynamic="${field.key}" placeholder="${placeholderText}" />
        <p class="form__error"></p>
      `;
      const input = wrap.querySelector("input");
      input.value = dynamicData[field.key] || "";
      input.addEventListener("input", () => {
        dynamicData[field.key] = input.value.trim();
        checkFormValidity();
      });
      fragment.appendChild(wrap);
    });

    dynamicFields.appendChild(fragment);
  }

  function handleFiles(event) {
    const files = Array.from(event.target.files).filter((file) =>
      file.type.startsWith("image/")
    );
    const limited = files.slice(0, 5);
    previewGrid.innerHTML = "";
    uploadedImages = [];

    if (!limited.length) {
      previewGrid.innerHTML = '<p class="form__hint">Aún no agregas fotos.</p>';
      return;
    }

    limited.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedImages.push(e.target.result);
        const card = document.createElement("div");
        card.className = "preview-card";
        card.innerHTML = `
          <img src="${e.target.result}" alt="${file.name}" />
          <div class="preview-card__meta">${file.name}</div>
        `;
        previewGrid.appendChild(card);
      };
      reader.readAsDataURL(file);
    });
    checkFormValidity();
  }

  function publishItem() {
    const newItem = {
      id: `itm-${Date.now()}`,
      title: inputRefs.title.value.trim(),
      category: inputRefs.category.value,
      condition: inputRefs.condition.value,
      description: inputRefs.description.value.trim(),
      tags: inputRefs.tags.value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      location: inputRefs.location.value.trim(),
      availability: inputRefs.availability.value,
      status: statusSelect.value,
      reserved: reservedToggle.checked,
      dynamicData,
      qrCode: currentCode,
      images: uploadedImages.length
        ? uploadedImages
        : ["../assets/images/items/default.jpg"],
      rating: 5.0, // New items start with 5 stars
      distanceKm: 1, // Mock distance
      owner: {
        name: "Usuario Demo", // Should come from session
        location: "Lima, Perú",
        rating: 4.5,
      },
      publishedAt: new Date().toISOString(),
    };

    const existingItems = JSON.parse(
      localStorage.getItem(PUBLISHED_KEY) || "[]"
    );
    existingItems.unshift(newItem);
    localStorage.setItem(PUBLISHED_KEY, JSON.stringify(existingItems));

    // Also save as draft just in case
    saveDraft(true);
  }

  function generateQr() {
    currentCode = `MINKA-${Date.now()}-${Math.floor(
      Math.random() * 1e6
    ).toString(16)}`;
    /*
    qrText.textContent = currentCode;
    qrStatus.textContent = "Generado";
    qrStatus.style.background = "rgba(46, 204, 113, 0.15)";
    drawPseudoQr(currentCode);
    qrImage.src = qrCanvas.toDataURL("image/png");
    downloadBtn.disabled = false;
    */
    setSuccess(
      window.I18n
        ? window.I18n.t("publish.messages.published")
        : "QR generado y datos guardados localmente."
    );
  }

  /*
  function setPlaceholderQr() {
    qrImage.src = "../assets/images/QR-generico.svg";
    qrText.textContent = "Sin generar";
    qrStatus.textContent = "Pendiente";
    qrStatus.style.background = "rgba(46, 204, 113, 0.15)";
    downloadBtn.disabled = true;
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
  */

  function updateSummary() {
    summaryFields.title.textContent = inputRefs.title.value.trim() || "—";
    summaryFields.category.textContent = inputRefs.category.value || "—";
    summaryFields.location.textContent = inputRefs.location.value.trim() || "—";
    summaryFields.availability.textContent =
      inputRefs.availability.value || "—";

    const statusKey = `publish.mainInfo.pubStatuses.${statusSelect.value}`;
    summaryFields.status.textContent = window.I18n
      ? window.I18n.t(statusKey)
      : statusSelect.value;

    const yes = window.I18n ? window.I18n.t("publish.messages.yes") : "Sí";
    const no = window.I18n ? window.I18n.t("publish.messages.no") : "No";
    summaryFields.reserved.textContent = reservedToggle.checked ? yes : no;

    checkFormValidity();
  }

  function checkFormValidity() {
    const generateBtn = document.getElementById("generate-qr");
    let isValid = true;

    const requiredFields = [
      "title",
      "category",
      "condition",
      "description",
      "location",
      "availability",
    ];

    requiredFields.forEach((key) => {
      if (!inputRefs[key].value.trim()) isValid = false;
    });

    if (fileInput.files.length === 0 || fileInput.files.length > 5) {
      isValid = false;
    }

    const dynInputs = dynamicFields.querySelectorAll("input[data-dynamic]");
    dynInputs.forEach((field) => {
      // Assuming dynamic fields are required if they exist, based on validateForm logic
      // validateForm checks: if (field.required && !field.value.trim())
      // But in renderDynamicFields, inputs don't have 'required' attribute set explicitly in HTML string?
      // Let's check renderDynamicFields in previous read_file output.
      // It says: <input id="dynamic-${field.key}" data-dynamic="${field.key}" placeholder="${field.placeholder}" />
      // It does NOT set required.
      // But validateForm says: if (field.required && !field.value.trim())
      // So maybe they are not required?
      // Wait, validateForm has: if (field.required && !field.value.trim())
      // If they are not required, this check passes.
      // So I should check if they are required.
      if (field.required && !field.value.trim()) isValid = false;
    });

    generateBtn.disabled = !isValid;
  }

  function saveDraft(includeTimestamp = false) {
    const data = {
      title: inputRefs.title.value.trim(),
      category: inputRefs.category.value,
      condition: inputRefs.condition.value,
      description: inputRefs.description.value.trim(),
      tags: inputRefs.tags.value.trim(),
      location: inputRefs.location.value.trim(),
      availability: inputRefs.availability.value,
      notes: inputRefs.notes.value.trim(),
      status: statusSelect.value,
      reserved: reservedToggle.checked,
      dynamic: dynamicData,
      mode: Array.from(
        document.querySelectorAll('input[name="mode"]:checked')
      ).map((item) => item.value),
      code: currentCode,
    };
    if (includeTimestamp) {
      data.savedAt = new Date().toISOString();
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function hydrateDraft() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      Object.entries(inputRefs).forEach(([key, input]) => {
        if (data[key]) input.value = data[key];
      });

      if (Array.isArray(data.mode)) {
        document.querySelectorAll('input[name="mode"]').forEach((checkbox) => {
          checkbox.checked = data.mode.includes(checkbox.value);
        });
      }

      if (data.status) {
        statusSelect.value = data.status;
      }
      if (typeof data.reserved === "boolean") {
        reservedToggle.checked = data.reserved;
      }
      if (data.dynamic) {
        dynamicData = data.dynamic;
      }
      renderDynamicFields(inputRefs.category.value);
      // reapply saved values to dynamic inputs
      Object.entries(dynamicData).forEach(([key, value]) => {
        const input = document.querySelector(`[data-dynamic="${key}"]`);
        if (input) input.value = value;
      });

      if (data.code) {
        currentCode = data.code;
        qrText.textContent = data.code;
        qrStatus.textContent = "Guardado";
        qrStatus.style.background = "rgba(46, 204, 113, 0.15)";
        drawPseudoQr(data.code);
        qrImage.src = qrCanvas.toDataURL("image/png");
        downloadBtn.disabled = false;
      }
      updateSummary();
    } catch (error) {
      console.warn("No se pudo leer el borrador", error);
    }
  }

  function setSuccess(message) {
    successMsg.textContent = message;
    if (message) {
      setTimeout(() => {
        successMsg.textContent = "";
      }, 3200);
    }
  }
});
