// T13 - Lucero Pipa: Lógica de perfil e identidad simulada
// T35 - Leonardo Chavez: Gestión de reputación
document.addEventListener("DOMContentLoaded", () => {

  const demoUser = {
    email: "lucero.pipa@minka.com",
    password: "Minka123",
    name: "Lucero Pipa",
    phone: "+51 987 654 321",
    location: "Lima, Perú",
  };

  const getSessionUser = () => {
    return window.Session ? Session.getSession() : null;
  };

  const profileForm = document.getElementById("profile-form");
  const profileInputs = profileForm
    ? profileForm.querySelectorAll("input, textarea")
    : [];
  const profilePhotoInput = document.getElementById("profile-photo-input");
  const profilePhotoPreview = document.getElementById("profile-photo-preview");
  const profileProgressFill = document.querySelector(".profile-progress__fill");
  const profileProgressBar = document.querySelector(".profile-progress__bar");
  const profileProgressValue = document.getElementById(
    "profile-progress-value"
  );
  const profileBadge = document.getElementById("perfil-verificacion");
  const profileSummary = {
    name: document.getElementById("perfil-resumen"),
    email: document.getElementById("perfil-email"),
    phone: document.getElementById("perfil-telefono"),
    location: document.getElementById("perfil-ubicacion"),
  };
  const saveProfileButtons = document.querySelectorAll("[data-save-profile]");
  // const simulateIdentityBtn = document.querySelector("[data-simulate-identity]"); // Removed in favor of data-verify-action
  const identityError = document.querySelector("[data-identity-error]");
  const identitySuccess = document.querySelector("[data-identity-success]");
  const identityModal = document.getElementById("identity-modal");
  const modalOpeners = document.querySelectorAll("[data-open-modal]");
  const modalClosers = document.querySelectorAll("[data-close-modal]");
  const myItemsList = document.getElementById("my-items-list");
  let viewedUserId = null; // seteado en init() si llega ?user=

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const profileState = {
    photo: true,
    verified: false,
    verificationLevel: "none", // none, basic, advanced
  };

  init();

  function init() {
    // Handoff desde detalle: ?user=<id> muestra el perfil de otro usuario
    // en modo solo lectura (sin edición).
    const viewedUser = new URLSearchParams(window.location.search).get("user");
    const ownUser = getSessionUser();
    const isReadonly =
      viewedUser && viewedUser !== (ownUser?.id || ownUser?.email);
    if (isReadonly) {
      viewedUserId = viewedUser;
      enterReadonlyMode(viewedUser);
    }
    // Restaurar verificación persistida
    if (window.Store) {
      const saved = Store.getProfile();
      if (saved.verificationLevel && saved.verificationLevel !== "none") {
        profileState.verified = true;
        profileState.verificationLevel = saved.verificationLevel;
      }
    }
    bindEvents();
    renderMyItems();
    setupVerificationTabs(); // T29
  }

  function enterReadonlyMode(userId) {
    document.body.classList.add("is-readonly");
    // Ocultar todo control de edición
    const editControls = [
      ...document.querySelectorAll("[data-save-profile]"),
      ...document.querySelectorAll("[data-open-modal]"),
      ...document.querySelectorAll("[data-verify-action]"),
      profilePhotoInput,
    ].filter(Boolean);
    editControls.forEach((node) => (node.style.display = "none"));
    if (profileForm) {
      profileForm
        .querySelectorAll("input, textarea, select, button")
        .forEach((field) => (field.disabled = true));
    }
    // Banner de contexto
    const banner = document.createElement("p");
    banner.className = "form__hint profile-readonly-banner";
    banner.setAttribute("role", "status");
    banner.textContent = `Estás viendo el perfil público de ${userId}. La edición está deshabilitada.`;
    const main = document.querySelector("main") || document.body;
    main.prepend(banner);
  }

  function renderMyItems() {
    if (!myItemsList) return;
    // Perfil propio: mis publicaciones. Perfil público (?user=): las de ese owner.
    const sessionUser = getSessionUser();
    const myId = viewedUserId || sessionUser?.id || sessionUser?.email || "demo";
    const items = (window.Store ? Store.getItems() : []).filter(
      (item) => item.owner?.id === myId
    );

    if (items.length === 0) {
      myItemsList.innerHTML = `<p class="form__hint">${
        window.I18n
          ? window.I18n.t("profile.noItems")
          : "No tienes publicaciones activas."
      }</p>`;
      return;
    }

    myItemsList.innerHTML = items
      .map((item) => {
        const statusKey = `publish.mainInfo.pubStatuses.${item.status}`;
        const statusText = window.I18n
          ? window.I18n.t(statusKey)
          : item.status || "Activo";
        return `
    <div class="profile-item-card" onclick="window.location.href='detalle.html?id=${
      item.id
    }'">
      <img src="${
        item.images ? item.images[0] : "../assets/images/items/default.jpg"
      }" alt="${item.title}" />
      <div class="profile-item-info">
        <h4>${item.title}</h4>
        <span class="badge">${statusText}</span>
      </div>
    </div>
  `;
      })
      .join("");
  }

  // T29 - HU27: Lógica de Tabs y Verificación
  function setupVerificationTabs() {
    const tabs = document.querySelectorAll("[data-verify-tab]");
    const sections = {
      basic: document.getElementById("verify-basic"),
      advanced: document.getElementById("verify-advanced"),
    };

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        // Update tabs
        tabs.forEach((t) => t.classList.remove("modal__tab--active"));
        tab.classList.add("modal__tab--active");

        // Update sections
        const target = tab.dataset.verifyTab;
        Object.values(sections).forEach((s) => s.classList.add("hidden"));
        if (sections[target]) sections[target].classList.remove("hidden");

        // Clear messages
        if (identityError) identityError.textContent = "";
        if (identitySuccess) identitySuccess.hidden = true;
      });
    });

    // Handle Verification Actions
    const verifyButtons = document.querySelectorAll("[data-verify-action]");
    console.log("Found", verifyButtons.length, "verification buttons");

    verifyButtons.forEach((btn) => {
      console.log(
        "Setting up listener for button:",
        btn.dataset.verifyAction,
        btn
      );
      btn.addEventListener("click", (e) => {
        e.preventDefault(); // Prevent any default action
        e.stopPropagation(); // Stop event bubbling
        const level = e.currentTarget.dataset.verifyAction; // Use currentTarget to ensure we get the button
        console.log("Button clicked! Level:", level);
        handleVerification(level, e.currentTarget);
      });
    });
  }

  function handleVerification(level, btnElement) {
    console.log(
      "handleVerification called with level:",
      level,
      "button:",
      btnElement
    );

    if (!identitySuccess || !identityError) {
      console.error("Missing identitySuccess or identityError elements");
      return;
    }

    identityError.textContent = "";
    identitySuccess.hidden = true;

    // Simulación de proceso
    const btn = btnElement;
    if (!btn) {
      console.error("No button element provided to handleVerification");
      return;
    }

    const originalText = btn.textContent.trim();
    const processingText = window.I18n
      ? window.I18n.t("profile.identityModal.processing")
      : "Procesando...";

    console.log(
      "Changing button text from:",
      originalText,
      "to:",
      processingText
    );
    btn.textContent = processingText;
    btn.disabled = true;

    setTimeout(() => {
      console.log(
        "Verification completed, restoring button text to:",
        originalText
      );
      btn.textContent = originalText;
      btn.disabled = false;

      if (level === "basic") {
        // HU27: Basic <= 5 mins (Simulated instant)
        profileState.verified = true;
        profileState.verificationLevel = "basic";
        if (window.Store)
          Store.saveProfile({ verified: true, verificationLevel: "basic" });
        identitySuccess.textContent = window.I18n
          ? window.I18n.t("profile.identityModal.successBasic")
          : "✓ Teléfono verificado. Insignia 'Brote Verificado' otorgada.";
        console.log("Basic verification completed");
      } else if (level === "advanced") {
        // HU27: Advanced <= 24 hours (Simulated instant for demo)
        profileState.verified = true;
        profileState.verificationLevel = "advanced";
        if (window.Store)
          Store.saveProfile({ verified: true, verificationLevel: "advanced" });
        identitySuccess.textContent = window.I18n
          ? window.I18n.t("profile.identityModal.successAdvanced")
          : "✓ Documentos enviados. Insignia 'Raíz Verificada' otorgada.";
        console.log("Advanced verification completed");
      }

      identitySuccess.hidden = false;
      updateProfileProgress();

      // Close modal after delay
      setTimeout(() => {
        toggleModalVisibility(identityModal, false);
        identitySuccess.hidden = true;
      }, 2000);
    }, 1500);
  }

  const toggleModalVisibility = (modal, open) => {
    if (!modal) return;
    if (open) Modal.open(modal);
    else Modal.close(modal);
  };

  const setFieldError = (field, message) => {
    const errorNode = document.querySelector(`[data-error-for="${field.id}"]`);
    if (errorNode) errorNode.textContent = message || "";
    field.setAttribute("aria-invalid", message ? "true" : "false");
  };

  const setFormSuccess = (form, message) => {
    let success = form.querySelector(".form__success");
    if (!success) {
      success = document.createElement("p");
      success.className = "form__success";
      form.appendChild(success);
    }
    success.textContent = message;
    success.hidden = false;
  };

  const validateEmail = (input) => {
    if (!input.value.trim())
      return window.I18n
        ? window.I18n.t("profile.messages.emailRequired")
        : "El correo es obligatorio";
    if (!emailPattern.test(input.value.trim()))
      return window.I18n
        ? window.I18n.t("profile.messages.emailInvalid")
        : "Formato de correo inválido";
    return "";
  };

  const validatePhone = (input) => {
    if (!input.value.trim())
      return window.I18n
        ? window.I18n.t("profile.messages.phoneRequired")
        : "El teléfono es obligatorio";
    if (input.value.trim().length < 9)
      return window.I18n
        ? window.I18n.t("profile.messages.phoneInvalid")
        : "Ingresa un teléfono válido";
    return "";
  };

  const validateLocation = (input) => {
    if (!input.value.trim())
      return window.I18n
        ? window.I18n.t("profile.messages.locationRequired")
        : "El distrito es obligatorio para guardar cambios";
    if (input.value.trim().length < 3)
      return window.I18n
        ? window.I18n.t("profile.messages.locationInvalid")
        : "Ingresa un distrito válido";
    return "";
  };

  const validateBio = (textarea) => {
    const value = textarea.value.trim();
    if (value.length > 150)
      return window.I18n
        ? window.I18n.t("profile.messages.bioLimit")
        : "La descripción no puede exceder 150 caracteres";
    return "";
  };

  // T13 - Lucero Pipa: Contador de caracteres en tiempo real
  const bioTextarea = document.getElementById("profile-bio");
  const bioCharCount = document.getElementById("bio-char-count");
  const charCountContainer = document.querySelector(".form__char-count");

  if (bioTextarea && bioCharCount) {
    const updateCharCount = () => {
      const length = bioTextarea.value.length;
      bioCharCount.textContent = length;

      charCountContainer.classList.remove("warning", "error");
      if (length > 150) {
        charCountContainer.classList.add("error");
      } else if (length > 130) {
        charCountContainer.classList.add("warning");
      }
    };

    bioTextarea.addEventListener("input", updateCharCount);
    updateCharCount();
  }

  // T13 - Lucero Pipa: Validación en tiempo real del distrito
  const locationInput = document.getElementById("profile-location");

  const checkFormValidity = () => {
    if (!locationInput || saveProfileButtons.length === 0) return;

    const locationValid = locationInput.value.trim().length >= 3;
    saveProfileButtons.forEach((btn) => {
      btn.disabled = !locationValid;
    });
  };

  if (locationInput) {
    locationInput.addEventListener("input", () => {
      const error = validateLocation(locationInput);
      setFieldError(locationInput, error);
      checkFormValidity();
    });

    // Verificar al cargar
    checkFormValidity();
  }

  // T13 - HU03: Progreso distingue campos requeridos (distrito) vs opcionales
  const updateProfileProgress = () => {
    if (!profileForm) return;
    const name = profileForm.querySelector("#profile-name");
    const email = profileForm.querySelector("#profile-email");
    const phone = profileForm.querySelector("#profile-phone");
    const location = profileForm.querySelector("#profile-location");
    const bio = profileForm.querySelector("#profile-bio");

    // REQUERIDO: distrito
    const hasRequired = location.value.trim().length > 0;

    // OPCIONALES: nombre, email, teléfono, bio, foto, verificación
    const optionalChecks = [
      name.value.trim(),
      email.value.trim(),
      phone.value.trim(),
      bio.value.trim(),
      profileState.photo,
      profileState.verified,
    ];

    // Si no tiene el requerido, progreso es 0%. Si tiene, se calcula sobre opcionales
    let percent = 0;
    if (hasRequired) {
      const completedOptional = optionalChecks.filter(Boolean).length;
      percent = Math.round((completedOptional / 6) * 100);
    }

    if (profileProgressFill) profileProgressFill.style.width = `${percent}%`;
    if (profileProgressBar)
      profileProgressBar.setAttribute("aria-valuenow", String(percent));
    if (profileProgressValue) profileProgressValue.textContent = `${percent}%`;

    if (profileState.verified && profileBadge) {
      // T29 - Lucero Pipa: Niveles de verificación (HU27)
      if (profileState.verificationLevel === "advanced") {
        profileBadge.textContent = window.I18n
          ? window.I18n.t("profile.badges.verifiedAdvanced")
          : "Raíz Verificada";
        profileBadge.classList.add("profile-card__badge--verified");
        profileBadge.style.backgroundColor = "var(--color-primary-darker)";
      } else {
        profileBadge.textContent = window.I18n
          ? window.I18n.t("profile.badges.verifiedBasic")
          : "Brote Verificado";
        profileBadge.classList.add("profile-card__badge--verified");
        profileBadge.style.backgroundColor = ""; // Reset to default verified color
      }
    }
  };

  // T13 - HU03: Validación distingue requeridos vs opcionales
  const handleProfileValidation = (form) => {
    let hasErrors = false;
    form.querySelectorAll("input, textarea").forEach((input) => {
      let message = "";
      if (input.type === "email") message = validateEmail(input);
      else if (input.id === "profile-phone") message = validatePhone(input);
      else if (input.id === "profile-location")
        message = validateLocation(input);
      else if (input.id === "profile-bio") message = validateBio(input);
      // Nombre NO es obligatorio según HU03
      setFieldError(input, message);
      if (message) hasErrors = true;
    });
    return hasErrors;
  };

  // T13 - HU03: Hidratación incluye bio y actualiza contador
  const hydrateProfileWithUser = (user) => {
    if (!user || !profileForm) return;
    const map = {
      name: "#profile-name",
      email: "#profile-email",
      phone: "#profile-phone",
      location: "#profile-location",
      bio: "#profile-bio",
    };
    Object.entries(map).forEach(([key, selector]) => {
      const node = profileForm.querySelector(selector);
      if (node && user[key]) {
        node.value = user[key];
        // Actualizar contador si es el bio
        if (key === "bio" && bioTextarea && bioCharCount) {
          const length = node.value.length;
          bioCharCount.textContent = length;
          charCountContainer.classList.toggle("warning", length > 130);
          charCountContainer.classList.toggle("error", length > 150);
        }
      }
    });
    if (profileSummary.name && user.name)
      profileSummary.name.textContent = user.name;
    if (profileSummary.email && user.email)
      profileSummary.email.textContent = user.email;
    if (profileSummary.phone && user.phone)
      profileSummary.phone.textContent = user.phone;
    if (profileSummary.location && user.location)
      profileSummary.location.textContent = user.location;

    // T13 - HU03: Verificar validez del formulario al cargar
    checkFormValidity();
    updateProfileProgress();
  };

  function bindEvents() {
    if (profilePhotoInput && profilePhotoPreview) {
      const photoButtons = document.querySelectorAll("[data-photo-upload]");
      photoButtons.forEach((btn) => {
        btn.addEventListener("click", () => profilePhotoInput.click());
      });

      profilePhotoInput.addEventListener("change", () => {
        const file = profilePhotoInput.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          profilePhotoPreview.src = event.target?.result;
          profileState.photo = true;
          updateProfileProgress();
        };
        reader.readAsDataURL(file);
      });
    }

    if (profileInputs.length) {
      profileInputs.forEach((input) => {
        // Arrow para evitar TDZ: updateProfileProgress es const y se define
        // después de que init() ejecute bindEvents().
        input.addEventListener("input", () => updateProfileProgress());
      });
    }

    if (profileForm) {
      profileForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const hasErrors = handleProfileValidation(profileForm);
        if (!hasErrors) {
          setFormSuccess(
            profileForm,
            window.I18n
              ? window.I18n.t("profile.messages.profileUpdated")
              : "Perfil actualizado (simulado)."
          );
          const user = {
            name: profileForm.name.value,
            email: profileForm.email.value,
            phone: profileForm.phone.value,
            location: profileForm.location.value,
          };
          hydrateProfileWithUser(user);
          try {
            const current = Session.getSession() || {};
            Session.setSession(
              { ...current, ...user },
              { remember: !!current.remember }
            );
          } catch (error) {
            console.warn("No se pudo persistir el perfil", error);
          }
        }
      });
    }

    if (saveProfileButtons.length && profileForm) {
      saveProfileButtons.forEach((btn) => {
        btn.addEventListener("click", () => profileForm.requestSubmit());
      });
    }

    modalOpeners.forEach((opener) => {
      opener.addEventListener("click", (event) => {
        event.preventDefault();
        const target = opener.dataset.openModal;
        if (target === "identity") toggleModalVisibility(identityModal, true);
      });
    });

    modalClosers.forEach((closer) => {
      closer.addEventListener("click", () =>
        toggleModalVisibility(identityModal, false)
      );
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") toggleModalVisibility(identityModal, false);
    });

    document.addEventListener("languageChanged", () => {
      renderMyItems();
      renderReviews();
      updateProfileProgress();
    });
  }

  const sessionUser = getSessionUser();
  hydrateProfileWithUser(sessionUser || demoUser);
  updateProfileProgress();

  // T29/HU26 - Privacidad efectiva en la tarjeta pública (vista ?user=)
  if (viewedUserId && window.Store) {
    const prefs = Store.getPreferences();
    if (prefs.hideDistrict && profileSummary.location) {
      profileSummary.location.textContent = "Lima";
    }
    const availability = prefs.availability || {};
    const days = Object.keys(availability).filter(
      (d) => availability[d] && availability[d].length
    );
    if (days.length && profileSummary.location) {
      const hint = document.createElement("p");
      hint.className = "form__hint profile-availability";
      hint.textContent =
        "Horarios disponibles: " +
        days.map((d) => `${d} (${availability[d].join(", ")})`).join(" · ");
      profileSummary.location.parentElement?.appendChild(hint);
    }
  }

  // T35 - Gestión de Reputación (HU28)
  const mockReviews = [
    {
      id: 1,
      author: "María González",
      avatar: "../assets/images/items/default.jpg",
      date: "Hace 2 días",
      rating: 5,
      content:
        "Excelente vendedora, muy amable y el producto estaba en perfectas condiciones. Recomendada 100%.",
      canAppeal: false,
    },
    {
      id: 2,
      author: "Juan Pérez",
      avatar: "../assets/images/items/default.jpg",
      date: "Hace 1 semana",
      rating: 4,
      content:
        "Todo bien, aunque demoró un poco en responder los mensajes. El producto cumple con lo descrito.",
      canAppeal: false,
    },
    {
      id: 3,
      author: "Carlos Ruiz",
      avatar: "../assets/images/items/default.jpg",
      date: "Hace 2 semanas",
      rating: 1,
      content:
        "No se presentó al lugar acordado y no contestó mis llamadas. Pésima experiencia.",
      canAppeal: true,
    },
  ];

  const reviewsList = document.getElementById("reviews-list");
  const appealModal = document.getElementById("appeal-modal");
  const appealForm = document.getElementById("appeal-form");
  const appealReviewIdInput = document.getElementById("appeal-review-id");
  const closeAppealModalBtns = document.querySelectorAll(
    "[data-close-appeal-modal]"
  );

  function renderReviews() {
    if (!reviewsList) return;

    reviewsList.innerHTML = mockReviews
      .map(
        (review) => `
    <div class="review-card">
      <div class="review-header">
        <div class="review-author">
          <img src="${review.avatar}" alt="${
          review.author
        }" class="review-avatar">
          <div class="review-meta">
            <span class="review-name">${review.author}</span>
            <span class="review-date">${review.date}</span>
          </div>
        </div>
        <div class="review-rating">
          ${Array(5)
            .fill(0)
            .map(
              (_, i) =>
                `<i class="${i < review.rating ? "fas" : "far"} fa-star"></i>`
            )
            .join("")}
        </div>
      </div>
      <p class="review-content">${review.content}</p>
      ${
        review.canAppeal
          ? `
        <div class="review-actions">
          <button class="btn-appeal" onclick="openAppealModal(${review.id})">
            <i class="fas fa-flag"></i> ${
              window.I18n
                ? window.I18n.t("profile.messages.appealAction")
                : "Apelar reseña"
            }
          </button>
        </div>
      `
          : ""
      }
    </div>
  `
      )
      .join("");
  }

  function openAppealModal(reviewId) {
    if (appealReviewIdInput) appealReviewIdInput.value = reviewId;
    toggleModalVisibility(appealModal, true);
  }

  if (closeAppealModalBtns) {
    closeAppealModalBtns.forEach((btn) => {
      btn.addEventListener("click", () =>
        toggleModalVisibility(appealModal, false)
      );
    });
  }

  if (appealForm) {
    appealForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const reason = document.getElementById("appeal-reason").value;
      const details = document.getElementById("appeal-details").value;

      // Simular envío de apelación
      const submitBtn = appealForm.querySelector("button[type='submit']");
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = window.I18n
        ? window.I18n.t("profile.appealModal.sending")
        : "Enviando...";

      setTimeout(() => {
        Toast.show(
          window.I18n
            ? window.I18n.t("profile.appealModal.success")
            : "Tu apelación ha sido enviada y será revisada por nuestro equipo de moderación.",
          "success"
        );
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        appealForm.reset();
        toggleModalVisibility(appealModal, false);
      }, 1500);
    });
  }

  // Inicializar reseñas
  renderReviews();

  window.openAppealModal = openAppealModal;
});
