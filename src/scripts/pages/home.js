// T19 - Andy Salcedo: Home app — populares desde Store (seed demo en first-run)
// ES module bundled by src/pages/pages/home.astro; relies on the legacy
// globals Session, Store, Toast and I18n loaded as classic scripts by
// AppLayout (core/guard.js redirects guests to auth before this runs).
import { buildSearchUrl } from "../lib/search-params.js";
import { renderEmptyState, renderErrorState } from "../lib/states.js";
import { renderPopularCard } from "../lib/popular-card.js";

const userNameEl = document.getElementById("home-username");
const popularListEl = document.getElementById("popular-list");
// Estadísticas de impacto coherentes con gamification (Store.getGame)
function hydrateImpactStats() {
  if (!window.Store) return;
  const game = Store.getGame();
  if (!game) return;
  const pointsEl = document.getElementById("eco-points");
  const exchangesEl = document.getElementById("exchanges");
  const co2El = document.getElementById("co2-saved");
  if (pointsEl) pointsEl.textContent = game.points;
  if (exchangesEl && typeof game.exchanges === "number")
    exchangesEl.textContent = game.exchanges;
  if (co2El && typeof game.co2Saved === "number")
    co2El.textContent = game.co2Saved;
}
hydrateImpactStats();

setWelcomeName();
renderPopular();

function setWelcomeName() {
  if (!userNameEl) return;
  try {
    const user = window.Session ? Session.getSession() : null;
    let name = "Mink'a user";

    if (user) {
      name = user.name || user.email || "Mink'a user";
    }

    // Usar traducción si está disponible
    if (window.I18n && typeof window.I18n.t === "function") {
      const greetingTemplate = window.I18n.t("home_welcome_user"); // "Hola, Mink'a user" o "Rimaykullayki, Mink'a user"
      // Reemplazamos el placeholder por defecto con el nombre real
      // Asumimos que la traducción contiene "Mink'a user" como placeholder
      userNameEl.textContent = greetingTemplate.replace("Mink'a user", name);
    } else {
      userNameEl.textContent = `Hola, ${name}`;
    }
  } catch (error) {
    console.warn("No se pudo leer la sesión", error);
  }
}

// Escuchar cambios de idioma para actualizar el saludo dinámicamente
document.addEventListener("languageChanged", () => {
  setWelcomeName();
});

function renderEmptyPopular() {
  popularListEl.classList.remove("is-carousel");
  popularListEl.innerHTML = renderEmptyState({
    icon: "fa-seedling",
    headingLevel: 3,
    title: "Todavía no hay publicaciones",
    text: "Publica tu primer objeto o carga datos de ejemplo para explorar la demo.",
    actions: [
      { label: "Publicar mi primer objeto", href: "publicar.html", variant: "primary" },
      { label: "Cargar datos de ejemplo", id: "seed-demo-btn" },
    ],
  });
  document.getElementById("seed-demo-btn")?.addEventListener("click", () => {
    Store.seedDemo();
    renderPopular();
    if (window.Toast) Toast.show("Datos de ejemplo cargados.", "success");
  });
}

function renderPopularError() {
  popularListEl.classList.remove("is-carousel");
  popularListEl.innerHTML = renderErrorState({
    headingLevel: 3,
    title: "No pudimos cargar las publicaciones",
    text: "Hubo un problema al leer los datos guardados en este navegador.",
    retry: { label: "Reintentar", icon: "fa-rotate-right", data: { retry: "" } },
  });
}

// Carrusel infinito: duplica el set de tarjetas para el bucle continuo del
// marquee CSS. Los clones quedan fuera del árbol de accesibilidad y del tab.
function setupCarousel(count) {
  popularListEl.classList.remove("is-carousel");
  if (count < 4) return; // con pocos items el grid estático se ve mejor
  popularListEl.classList.add("is-carousel");
  popularListEl.insertAdjacentHTML("beforeend", popularListEl.innerHTML);
  const cards = popularListEl.querySelectorAll(".popular-card");
  cards.forEach((card, i) => {
    if (i < count) return;
    card.setAttribute("aria-hidden", "true");
    card
      .querySelectorAll("a, button")
      .forEach((el) => el.setAttribute("tabindex", "-1"));
  });
}

function renderPopular() {
  if (!popularListEl) return;

  // The server-rendered skeleton marks the region busy until this render.
  popularListEl.removeAttribute("aria-busy");

  let allItems = [];
  let cardsHtml = "";
  try {
    allItems = window.Store ? Store.getItems() : [];
    cardsHtml = renderPopularCards(allItems);
  } catch (error) {
    console.warn("No se pudieron cargar las publicaciones", error);
    renderPopularError();
    return;
  }

  if (allItems.length === 0) {
    renderEmptyPopular();
    return;
  }

  popularListEl.innerHTML = cardsHtml;
  setupCarousel(allItems.length);
}

function renderPopularCards(allItems) {
  const options = {
    isFavorite: (id) => (window.Store ? Store.isFavorite(id) : false),
    t: window.I18n ? (key) => window.I18n.t(key) : undefined,
  };
  return allItems.map((item) => renderPopularCard(item, options)).join("");
}

// Escuchar cambios de idioma para re-renderizar las tarjetas
document.addEventListener("languageChanged", () => {
  renderPopular();
});

// Cards are rendered via innerHTML: one delegated listener handles retry,
// favorites (without navigating), inner links and whole-card navigation.
popularListEl?.addEventListener("click", (e) => {
  if (e.target.closest("[data-retry]")) {
    renderPopular();
    return;
  }
  const favBtn = e.target.closest("[data-fav-id]");
  if (favBtn) {
    toggleHomeFavorite(favBtn.dataset.favId, favBtn);
    return;
  }
  if (e.target.closest("a")) return;
  const card = e.target.closest("[data-item-id]");
  if (card) window.location.href = `detalle.html?id=${encodeURIComponent(card.dataset.itemId)}`;
});

// Favorito persistido desde la card (sin navegar)
function toggleHomeFavorite(id, btn) {
  if (!window.Store) return;
  Store.toggleFavorite(id);
  btn.setAttribute("aria-pressed", String(Store.isFavorite(id)));
  btn.setAttribute(
    "aria-label",
    Store.isFavorite(id) ? "Quitar de favoritos" : "Marcar como favorito"
  );
}

// T19 - Andy Salcedo: Mejorar interactividad de búsqueda
const searchForm = document.querySelector(".home-search__form");
const searchInput = document.querySelector(".home-search__input");

if (searchForm && searchInput) {
  // Autocompletar sugerencias básicas
  const suggestions = [
    "bicicleta",
    "libros",
    "ropa",
    "muebles",
    "electrónica",
    "juguetes",
    "herramientas",
    "deportes",
  ];

  searchInput.addEventListener("focus", () => {
    searchInput.placeholder =
      suggestions[Math.floor(Math.random() * suggestions.length)];
  });

  searchInput.addEventListener("blur", () => {
    searchInput.placeholder = window.I18n
      ? window.I18n.t("home_search_placeholder")
      : "Buscar objetos, categorías, ubicaciones...";
  });

  // Quick filter chips (T10d-2): toggle buttons under the search bar.
  const chips = Array.from(document.querySelectorAll("[data-filter-chip]"));
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const pressed = chip.getAttribute("aria-pressed") === "true";
      chip.setAttribute("aria-pressed", String(!pressed));
    });
  });
  const pressedChips = () =>
    chips
      .filter((chip) => chip.getAttribute("aria-pressed") === "true")
      .map((chip) => chip.dataset.filterChip);

  // Validación antes de enviar; con filtros elegidos basta con ellos.
  searchForm.addEventListener("submit", (e) => {
    const query = searchInput.value.trim();
    const selected = pressedChips();
    if (query || selected.length) {
      e.preventDefault();
      window.location.href = buildSearchUrl(searchForm.action, query, selected);
      return;
    }
    if (!query) {
      e.preventDefault();
      searchInput.focus();
      searchInput.placeholder = "Por favor, ingresa un término de búsqueda";
      searchInput.style.borderColor = "var(--color-error)";

      setTimeout(() => {
        searchInput.style.borderColor = "";
        searchInput.placeholder = "Buscar objetos, categorías, ubicaciones...";
      }, 2000);
    }
  });
}
