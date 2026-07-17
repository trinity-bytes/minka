// T12 - Leonardo Chavez: Lógica de autenticación en página dedicada (simulada)
// T28 - Leonardo Chavez: Login social y Auth Avanzado
const demoUser = {
  email: "lucero.pipa@minka.com",
  password: "Minka123",
  name: "Lucero Pipa",
  phone: "+51 987 654 321",
  location: "Lima, Perú",
};

const SESSION_KEY = "minka-demo-session";
const LOGIN_ATTEMPTS_KEY = "minka-login-attempts";
const ACCOUNT_LOCK_KEY = "minka-account-lock";

const saveSession = (user) => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch (error) {
    console.warn("No se pudo guardar la sesión demo", error);
  }
};

// Gestión de intentos de login
const getLoginAttempts = () => {
  try {
    const data = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
    return data ? JSON.parse(data) : { count: 0, lastAttempt: null };
  } catch {
    return { count: 0, lastAttempt: null };
  }
};

const saveLoginAttempts = (attempts) => {
  try {
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
  } catch (error) {
    console.warn("No se pudieron guardar los intentos", error);
  }
};

const isAccountLocked = () => {
  try {
    const lockUntil = localStorage.getItem(ACCOUNT_LOCK_KEY);
    if (!lockUntil) return false;
    const now = Date.now();
    if (now < parseInt(lockUntil)) {
      return true;
    }
    // Desbloquear automáticamente
    localStorage.removeItem(ACCOUNT_LOCK_KEY);
    localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
    return false;
  } catch {
    return false;
  }
};

const lockAccount = () => {
  const lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutos
  localStorage.setItem(ACCOUNT_LOCK_KEY, lockUntil.toString());
};

const tabButtons = document.querySelectorAll("[data-tab-target]");
const switchers = document.querySelectorAll("[data-switch-tab]");
const authForms = document.querySelectorAll(".auth-form");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9\s\-()]{9,15}$/;

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

const validateEmailOrPhone = (input) => {
  const value = input.value.trim();
  if (!value) return "El correo o teléfono es obligatorio";

  const isEmail = emailPattern.test(value);
  const isPhone = phonePattern.test(value);

  if (!isEmail && !isPhone) {
    return "Formato inválido. Usa correo electrónico o teléfono";
  }
  return "";
};

const validateEmail = (input) => {
  if (!input.value.trim()) return "El correo es obligatorio";
  if (!emailPattern.test(input.value.trim()))
    return "Formato de correo inválido";
  return "";
};

const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "", class: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (password.length < 8) {
    return {
      score: 0,
      label: "Muy débil - Mínimo 8 caracteres",
      class: "weak",
    };
  }
  if (score <= 2) {
    return { score: 1, label: "Débil", class: "weak" };
  }
  if (score === 3) {
    return { score: 2, label: "Media", class: "medium" };
  }
  return { score: 3, label: "Fuerte", class: "strong" };
};

const updatePasswordStrength = (input) => {
  const container = document.getElementById("password-strength");
  if (!container) return;

  const strength = getPasswordStrength(input.value);
  const fill = container.querySelector(".password-strength__fill");
  const label = container.querySelector(".password-strength__label");

  if (fill) {
    fill.className = "password-strength__fill";
    if (strength.class) fill.classList.add(strength.class);
    fill.style.width = `${(strength.score / 3) * 100}%`;
  }

  if (label) {
    label.textContent = strength.label;
    label.className = "password-strength__label";
    if (strength.class) label.classList.add(strength.class);
  }
};

const validatePassword = (input, isRealTime = false) => {
  const value = input.value.trim();
  if (!value && !isRealTime) return "La contraseña es obligatoria";
  if (value && value.length < 8) return "Mínimo 8 caracteres requeridos";
  return "";
};

const validateMatch = (input, other) => {
  if (!input.value.trim()) return "Confirma tu contraseña";
  if (input.value.trim() !== other.value.trim())
    return "Las contraseñas no coinciden";
  return "";
};

const switchAuthTab = (target) => {
  tabButtons.forEach((btn) => {
    const active = btn.dataset.tabTarget === target;
    btn.classList.toggle("modal__tab--active", active);
    btn.setAttribute("aria-selected", String(active));
  });

  authForms.forEach((form) => {
    const match = form.dataset.form === target;
    form.classList.toggle("is-hidden", !match);
  });
};

switchers.forEach((btn) => {
  btn.addEventListener("click", () => switchAuthTab(btn.dataset.switchTab));
});

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => switchAuthTab(btn.dataset.tabTarget));
});

// Gestión del modal OTP
const showOTPModal = (destination, userData) => {
  const modal = document.getElementById("otp-modal");
  const destinationEl = document.getElementById("otp-destination");
  const otpInput = document.getElementById("otp-input");
  const otpError = document.getElementById("otp-error");

  if (destinationEl) destinationEl.textContent = destination;
  if (otpInput) otpInput.value = "";
  if (otpError) otpError.textContent = "";
  if (modal) modal.hidden = false;

  // Guardar datos temporales
  modal.dataset.userData = JSON.stringify(userData);
};

const hideOTPModal = () => {
  const modal = document.getElementById("otp-modal");
  if (modal) modal.hidden = true;
};

// Listeners para el modal OTP
document.addEventListener("DOMContentLoaded", () => {
  const otpVerifyBtn = document.getElementById("otp-verify");
  const otpCancelBtn = document.getElementById("otp-cancel");
  const otpInput = document.getElementById("otp-input");
  const otpError = document.getElementById("otp-error");

  if (otpCancelBtn) {
    otpCancelBtn.addEventListener("click", hideOTPModal);
  }

  if (otpVerifyBtn && otpInput) {
    otpVerifyBtn.addEventListener("click", () => {
      const code = otpInput.value.trim();

      if (!code || code.length !== 6) {
        otpError.textContent = "Ingresa un código de 6 dígitos";
        return;
      }

      // Simulación: cualquier código de 6 dígitos es válido (en producción sería 123456)
      if (!/^\d{6}$/.test(code)) {
        otpError.textContent = "El código debe contener solo números";
        return;
      }

      // Recuperar datos del usuario
      const modal = document.getElementById("otp-modal");
      const userData = modal?.dataset.userData
        ? JSON.parse(modal.dataset.userData)
        : null;

      if (userData) {
        saveSession(userData);

        // T28 - Leonardo Chavez: Guardar consentimiento legal (HU22)
        const consent = {
          termsVersion: "v1.2",
          privacyVersion: "v1.0",
          timestamp: new Date().toISOString(),
          method: "standard_registration",
        };
        localStorage.setItem("minka_legal_consent", JSON.stringify(consent));

        hideOTPModal();

        // Mostrar mensaje de éxito
        const form = document.querySelector("[data-form='register']");
        if (form) {
          setFormSuccess(
            form,
            "✓ Cuenta verificada exitosamente. Redirigiendo..."
          );
        }

        setTimeout(() => {
          window.location.href = "home.html";
        }, 1200);
      }
    });
  }
});

// Validación en tiempo real
document.addEventListener("DOMContentLoaded", () => {
  // Validación email/phone en registro
  const registerEmailInput = document.getElementById("register-email");
  if (registerEmailInput) {
    registerEmailInput.addEventListener("input", () => {
      const error = validateEmailOrPhone(registerEmailInput);
      setFieldError(registerEmailInput, error);
      checkRegisterFormValidity();
    });
  }

  // Validación de nombre
  const registerNameInput = document.getElementById("register-name");
  if (registerNameInput) {
    registerNameInput.addEventListener("input", () => {
      let error = "";
      if (
        registerNameInput.value.trim().length > 0 &&
        registerNameInput.value.trim().length < 3
      ) {
        error = "El nombre debe tener al menos 3 caracteres";
      }
      setFieldError(registerNameInput, error);
      checkRegisterFormValidity();
    });
  }

  // Validación de contraseña con indicador de fortaleza
  const registerPasswordInput = document.getElementById("register-password");
  if (registerPasswordInput) {
    registerPasswordInput.addEventListener("input", () => {
      updatePasswordStrength(registerPasswordInput);
      const error = validatePassword(registerPasswordInput, true);
      setFieldError(registerPasswordInput, error);
      checkRegisterFormValidity();
    });
  }

  // Validación de confirmación de contraseña
  const registerConfirmInput = document.getElementById("register-confirm");
  if (registerConfirmInput) {
    registerConfirmInput.addEventListener("input", () => {
      const mainPass = document.getElementById("register-password");
      const error = validateMatch(registerConfirmInput, mainPass);
      setFieldError(registerConfirmInput, error);
      checkRegisterFormValidity();
    });
  }

  // Validación de términos
  const termsCheckbox = document.querySelector(
    "[data-form='register'] input[name='terms']"
  );
  if (termsCheckbox) {
    termsCheckbox.addEventListener("change", checkRegisterFormValidity);
  }

  // Validación en tiempo real para login
  const loginEmailInput = document.getElementById("login-email");
  if (loginEmailInput) {
    loginEmailInput.addEventListener("input", () => {
      const error = validateEmail(loginEmailInput);
      setFieldError(loginEmailInput, error);
    });
  }

  const loginPasswordInput = document.getElementById("login-password");
  if (loginPasswordInput) {
    loginPasswordInput.addEventListener("input", () => {
      const error = validatePassword(loginPasswordInput, true);
      setFieldError(loginPasswordInput, error);
    });
  }
});

// Verificar validez del formulario de registro
const checkRegisterFormValidity = () => {
  const submitBtn = document.getElementById("register-submit");
  if (!submitBtn) return;

  const nameInput = document.getElementById("register-name");
  const emailInput = document.getElementById("register-email");
  const passwordInput = document.getElementById("register-password");
  const confirmInput = document.getElementById("register-confirm");
  const termsCheckbox = document.querySelector(
    "[data-form='register'] input[name='terms']"
  );

  const nameValid = nameInput?.value.trim().length >= 3;
  const emailValid = !validateEmailOrPhone(emailInput);
  const passwordValid =
    !validatePassword(passwordInput, true) && passwordInput?.value.length >= 8;
  const confirmValid = !validateMatch(confirmInput, passwordInput);
  const termsValid = termsCheckbox?.checked;

  const allValid =
    nameValid && emailValid && passwordValid && confirmValid && termsValid;
  submitBtn.disabled = !allValid;
};

authForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let hasErrors = false;

    form.querySelectorAll("input").forEach((input) => {
      let errorMessage = "";

      if (input.id === "register-email") {
        errorMessage = validateEmailOrPhone(input);
      } else if (input.type === "email") {
        errorMessage = validateEmail(input);
      }

      if (input.type === "password" && input.id !== "register-confirm") {
        errorMessage = validatePassword(input);
      }

      if (input.id === "register-confirm") {
        const mainPass = form.querySelector("#register-password");
        errorMessage = validateMatch(input, mainPass);
      }

      if (input.type === "text" && input.id === "register-name") {
        if (!input.value.trim()) errorMessage = "El nombre es obligatorio";
        else if (input.value.trim().length < 3)
          errorMessage = "Mínimo 3 caracteres";
      }

      if (input.type === "checkbox" && input.hasAttribute("required")) {
        if (!input.checked) errorMessage = "Debes aceptar los términos";
      }

      setFieldError(input, errorMessage);
      if (errorMessage) hasErrors = true;
    });

    const formType = form.dataset.form;
    if (hasErrors) return;

    if (formType === "login") {
      // Verificar si la cuenta está bloqueada
      if (isAccountLocked()) {
        const lockUntil = localStorage.getItem(ACCOUNT_LOCK_KEY);
        const remainingTime = Math.ceil(
          (parseInt(lockUntil) - Date.now()) / 60000
        );
        setFieldError(
          form.querySelector("#login-password"),
          `Cuenta bloqueada. Intenta nuevamente en ${remainingTime} minuto(s).`
        );
        return;
      }

      const emailInput = form.querySelector("#login-email");
      const passInput = form.querySelector("#login-password");
      const isMatch =
        emailInput.value.trim().toLowerCase() ===
          demoUser.email.toLowerCase() && passInput.value === demoUser.password;

      if (!isMatch) {
        // Incrementar intentos fallidos
        const attempts = getLoginAttempts();
        attempts.count++;
        attempts.lastAttempt = Date.now();
        saveLoginAttempts(attempts);

        if (attempts.count >= 5) {
          lockAccount();
          setFieldError(
            passInput,
            "Cuenta bloqueada por 15 minutos tras 5 intentos fallidos. Se ha enviado notificación por correo."
          );
        } else {
          const remaining = 5 - attempts.count;
          setFieldError(
            passInput,
            `Credenciales inválidas. Te quedan ${remaining} intento(s) antes del bloqueo.`
          );
        }
        return;
      }

      // Login exitoso: resetear intentos
      localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
      localStorage.removeItem(ACCOUNT_LOCK_KEY);

      saveSession(demoUser);
      setFormSuccess(
        form,
        `✓ Sesión iniciada como ${demoUser.name}. Redirigiendo...`
      );
      setTimeout(() => {
        window.location.href = "home.html";
      }, 900);
      return;
    }

    if (formType === "register") {
      const nameInput = form.querySelector("#register-name");
      const emailInput = form.querySelector("#register-email");

      const destination = emailInput.value.trim();
      const mockUser = {
        name: nameInput.value.trim(),
        email: emailPattern.test(destination) ? destination : demoUser.email,
        phone: phonePattern.test(destination) ? destination : demoUser.phone,
        location: "Lima, Perú",
      };

      // Mostrar modal OTP en lugar de registrar directamente
      showOTPModal(destination, mockUser);
      return;
    }

    if (formType === "recovery") {
      const emailInput = form.querySelector("#recovery-email");
      const error = validateEmail(emailInput);

      if (error) {
        setFieldError(emailInput, error);
        return;
      }

      setFormSuccess(
        form,
        "✓ Instrucciones de recuperación enviadas por correo (simulado)."
      );
      return;
    }
  });
});

// Seleccionar tab inicial
switchAuthTab("login");

// T28 - Leonardo Chavez: Simulación de Social Login (HU21)
window.simulateSocialLogin = (provider) => {
  const confirmLogin = confirm(
    `Mink'a dice:\n\n¿Deseas continuar usando tu cuenta de ${provider}?`
  );

  if (confirmLogin) {
    // Simular proceso de autenticación
    const socialUser = {
      ...demoUser,
      name: `Usuario ${provider}`,
      email: `usuario.${provider.toLowerCase()}@ejemplo.com`,
      provider: provider,
    };

    saveSession(socialUser);

    // Simular registro de consentimiento (HU22)
    const consent = {
      termsVersion: "v1.2",
      privacyVersion: "v1.0",
      timestamp: new Date().toISOString(),
      method: "social_login",
    };
    localStorage.setItem("minka_legal_consent", JSON.stringify(consent));

    alert(`¡Bienvenido! Has iniciado sesión correctamente con ${provider}.`);
    window.location.href = "home.html";
  }
};
