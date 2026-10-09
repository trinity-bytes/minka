// T15 - Andy Salcedo: Buscador con filtros simulados (categoría, reputación, distancia)
// T30 - Andy Salcedo: Búsquedas guardadas y filtros avanzados
// Los datos demo viven en Store.seedDemo(); la búsqueda lee solo Store.getItems().
// ES module bundled by src/pages/pages/busqueda.astro; relies on the legacy
// globals Store, Toast and I18n loaded as classic scripts by AppLayout.
import { escapeHtml as esc } from "../lib/html.js";

// T31 - Distritos de referencia. Declared before the initial render():
// a restored district filter reads DISTRICT_KM during that first render,
// which used to throw (temporal dead zone) when declared further down.
const LIMA_DISTRICTS = [
  "Miraflores",
  "San Isidro",
  "Barranco",
  "Santiago de Surco",
  "San Borja",
  "Jesús María",
  "Magdalena",
  "La Molina",
  "Surquillo",
  "Lince",
];

const DISTRICT_KM = {
  Miraflores: 0,
  "San Isidro": 2,
  Barranco: 3,
  "Santiago de Surco": 6,
  "San Borja": 4,
  "Jesús María": 5,
  Magdalena: 6,
  "La Molina": 10,
  Surquillo: 2,
  Lince: 4,
};

const DEFAULT_FILTERS = Object.freeze({
  query: "",
  category: "",
  exclude: "", // T30 - Exclusiones
  userLocation: "", // T31
  minRating: 0,
  maxDistance: 15,
  sort: "relevance",
});

const state = { ...DEFAULT_FILTERS };

const el = {
  results: document.getElementById("results-list"),
  count: document.getElementById("results-count"),
  query: document.getElementById("search-query"),
  searchBtn: document.getElementById("search-btn"),
  saveSearchBtn: document.getElementById("save-search-btn"), // T30
  savedSearchesContainer: document.getElementById("saved-searches-container"), // T30
  savedSearchesList: document.getElementById("saved-searches-list"), // T30
  historyList: document.getElementById("search-history-list"), // T30
  category: document.getElementById("filter-category"),
  exclude: document.getElementById("filter-exclude"), // T30
  userLocation: document.getElementById("filter-user-location"), // T31
  getLocationBtn: document.getElementById("btn-get-location"), // T31
  rating: document.getElementById("filter-rating"),
  ratingValue: document.getElementById("filter-rating-value"),
  distance: document.getElementById("filter-distance"),
  distanceValue: document.getElementById("filter-distance-value"),
  sort: document.getElementById("filter-sort"),
  reset: document.getElementById("reset-filters"),
};

restoreFilters();
applyUrlParams();
loadSavedSearches(); // T30
loadSearchHistory(); // T30
attachEvents();
render();

// Permite llegar con ?q= y ?category= desde home u otras páginas
function applyUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  const category = params.get("category");
  if (q) {
    state.query = q.trim().toLowerCase();
    el.query.value = q;
    addToHistory(state.query);
  }
  if (category) {
    state.category = category;
    el.category.value = category;
  }
  // Filtros completos compartibles por URL (Chunk 4.7)
  if (params.get("exclude")) state.exclude = params.get("exclude");
  if (params.get("district")) state.userLocation = params.get("district");
  if (params.get("rating")) state.minRating = Number(params.get("rating")) || 0;
  if (params.get("distance"))
    state.maxDistance = Number(params.get("distance")) || 15;
  if (params.get("sort")) state.sort = params.get("sort");
  if ([...params.keys()].length) syncUI();
}

function attachEvents() {
  el.searchBtn.addEventListener("click", () => {
    state.query = el.query.value.trim().toLowerCase();
    addToHistory(state.query); // T30
    render();
    persist();
  });

  // T30 - Guardar Búsqueda
  if (el.saveSearchBtn) {
    el.saveSearchBtn.addEventListener("click", saveCurrentSearch);
  }

  // T30 - Exclusiones
  if (el.exclude) {
    el.exclude.addEventListener("change", (e) => {
      state.exclude = e.target.value;
      render();
      persist();
    });
  }

  // T31 - Tu Ubicación (HU36)
  if (el.userLocation) {
    el.userLocation.addEventListener("change", (e) => {
      state.userLocation = e.target.value;
      render();
      persist();
    });
  }

  if (el.getLocationBtn) {
    el.getLocationBtn.addEventListener("click", () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const mockAddress = mockReverseGeocode(
              pos.coords.latitude,
              pos.coords.longitude
            );
            el.userLocation.value = mockAddress;
            state.userLocation = mockAddress;
            render();
            persist();
          },
          (err) => {
            Toast.show(
              "No se pudo obtener la ubicación. Por favor ingrésala manualmente.",
              "error"
            );
          }
        );
      } else {
        Toast.show("Geolocalización no soportada.", "error");
      }
    });
  }

  el.query.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      state.query = el.query.value.trim().toLowerCase();
      addToHistory(state.query);
      render();
      persist();
    }
  });

  // Debounce 300ms: filtra al tipear sin apretar el botón
  let queryDebounce = null;
  el.query.addEventListener("input", () => {
    clearTimeout(queryDebounce);
    queryDebounce = setTimeout(() => {
      state.query = el.query.value.trim().toLowerCase();
      render();
      persist();
    }, 300);
  });

  // Borrar historial de búsquedas recientes
  document.getElementById("clear-history-btn")?.addEventListener("click", () => {
    Store.saveSearchHistory([]);
    loadSearchHistory();
    if (window.Toast) Toast.show("Historial de búsqueda borrado.", "info");
  });

  el.category.addEventListener("change", () => {
    state.category = el.category.value;
    render();
    persist();
  });

  el.rating.addEventListener("input", () => {
    const value = Number(el.rating.value);
    state.minRating = value;
    el.ratingValue.textContent = value;
    render();
    persist();
  });

  el.distance.addEventListener("input", () => {
    const value = Number(el.distance.value);
    state.maxDistance = value;
    el.distanceValue.textContent = value;
    render();
    persist();
  });

  el.sort.addEventListener("change", () => {
    state.sort = el.sort.value;
    render();
    persist();
  });

  // "Limpiar" resets every filter, including exclusions and district.
  el.reset.addEventListener("click", () => {
    Object.assign(state, DEFAULT_FILTERS);
    syncUI();
    render();
    persist();
  });

  // Rendered via innerHTML: delegated listeners for favorites and saved searches.
  el.results.addEventListener("click", (e) => {
    const favBtn = e.target.closest("[data-fav-id]");
    if (favBtn) toggleFavorite(favBtn.dataset.favId);
  });
  el.savedSearchesList?.addEventListener("click", (e) => {
    const remove = e.target.closest("[data-remove-saved-search]");
    if (remove) {
      removeSavedSearch(Number(remove.dataset.removeSavedSearch));
      // The focused button was re-rendered away: keep focus in the list.
      (
        el.savedSearchesList.querySelector("[data-saved-search]") ||
        el.saveSearchBtn
      )?.focus();
      return;
    }
    // Clicking anywhere on the pill (not just its button) still applies it.
    const tag = e.target
      .closest(".saved-search-tag")
      ?.querySelector("[data-saved-search]");
    if (tag) applySavedSearch(Number(tag.dataset.savedSearch));
  });

  // Toggle de filtros colapsables (solo visible en mobile)
  const filtersPanel = document.querySelector(".filters");
  const filtersToggle = document.getElementById("filters-toggle");
  filtersToggle?.addEventListener("click", () => {
    const open = filtersPanel.classList.toggle("filters--open");
    filtersToggle.setAttribute("aria-expanded", String(open));
  });
}

function restoreFilters() {
  const saved = Store.getSearchFilters();
  if (saved) Object.assign(state, saved);
  syncUI();
}

function persist() {
  Store.saveSearchFilters(state);
  syncUrl();
}

// URLs compartibles: el estado completo de filtros vive en la query string
function syncUrl() {
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query);
  if (state.category) params.set("category", state.category);
  if (state.exclude) params.set("exclude", state.exclude);
  if (state.userLocation) params.set("district", state.userLocation);
  if (state.minRating > 0) params.set("rating", state.minRating);
  if (state.maxDistance !== 15) params.set("distance", state.maxDistance);
  if (state.sort !== "relevance") params.set("sort", state.sort);
  const qs = params.toString();
  history.replaceState(null, "", qs ? `?${qs}` : location.pathname);
}

// Chips de filtros activos con quitar individual
function renderChips() {
  const container = document.getElementById("active-filters");
  if (!container) return;
  const chips = [];
  if (state.query) chips.push({ key: "query", label: `"${state.query}"` });
  if (state.category)
    chips.push({ key: "category", label: `Categoría: ${state.category}` });
  if (state.exclude)
    chips.push({ key: "exclude", label: `Excluir: ${state.exclude}` });
  if (state.userLocation)
    chips.push({ key: "userLocation", label: `Distrito: ${state.userLocation}` });
  if (state.minRating > 0)
    chips.push({ key: "minRating", label: `★ ≥ ${state.minRating}` });
  if (state.maxDistance !== 15)
    chips.push({ key: "maxDistance", label: `≤ ${state.maxDistance} km` });
  if (state.sort !== "relevance")
    chips.push({ key: "sort", label: `Orden: ${state.sort}` });

  container.innerHTML = chips
    .map(
      (chip) => `
      <button class="filter-chip" type="button" data-chip="${chip.key}"
        aria-label="Quitar filtro ${esc(chip.label)}">
        ${esc(chip.label)} <span aria-hidden="true">×</span>
      </button>`
    )
    .join("");

  if (chips.length >= 2) {
    container.innerHTML += `
      <button class="filter-chip filter-chip--clear" type="button" data-chip="all">
        Limpiar todo
      </button>`;
  }

  const toggleCount = document.querySelector(".filters__toggle-count");
  if (toggleCount) {
    toggleCount.textContent = chips.length;
    toggleCount.hidden = chips.length === 0;
  }

  container.querySelectorAll("[data-chip]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.chip;
      if (key === "all") Object.assign(state, DEFAULT_FILTERS);
      else state[key] = DEFAULT_FILTERS[key];
      syncUI();
      render();
      persist();
    });
  });
}

function syncUI() {
  el.query.value = state.query;
  el.category.value = state.category;
  if (el.exclude) el.exclude.value = state.exclude || ""; // T30
  if (el.userLocation) el.userLocation.value = state.userLocation || ""; // T31
  el.rating.value = state.minRating;
  el.ratingValue.textContent = state.minRating;
  el.distance.value = state.maxDistance;
  el.distanceValue.textContent = state.maxDistance;
  el.sort.value = state.sort;
}

function renderEmptyCatalog() {
  el.count.textContent = `0 ${
    window.I18n ? window.I18n.t("search_results_count") : "resultados"
  }`;
  el.results.innerHTML = `
    <div class="empty-state">
      <div class="empty-state__icon" aria-hidden="true">🔍</div>
      <h3>Todavía no hay publicaciones</h3>
      <p>Publica tu primer objeto o carga datos de ejemplo para explorar la demo.</p>
      <div class="empty-state__actions">
        <a class="btn btn-primary" href="publicar.html">Publicar mi primer objeto</a>
        <button class="btn btn-secondary" type="button" id="seed-demo-btn">
          Cargar datos de ejemplo
        </button>
      </div>
    </div>`;
  document.getElementById("seed-demo-btn")?.addEventListener("click", () => {
    Store.seedDemo();
    render();
    if (window.Toast) Toast.show("Datos de ejemplo cargados.", "success");
  });
}

function render() {
  const allItems = Store.getItems();
  const favorites = getFavorites(); // T30

  renderChips();

  if (allItems.length === 0) {
    renderEmptyCatalog();
    return;
  }

  const results = allItems
    .filter((item) => {
      // T30 - Filtro de Favoritos
      if (state.category === "favorites") {
        return favorites.includes(item.id);
      }
      return state.category ? item.category === state.category : true;
    })
    .filter((item) => {
      // T30 - Exclusiones (HU34)
      if (state.exclude && item.category === state.exclude) return false;
      return true;
    })
    .filter((item) => item.rating >= state.minRating)
    .filter((item) => item.distanceKm <= state.maxDistance)
    .filter((item) => {
      if (!state.query) return true;
      const blob = `${item.title} ${item.tags ? item.tags.join(" ") : ""} ${
        item.location
      }`.toLowerCase();
      return blob.includes(state.query);
    });

  const sorted = [...results];
  if (state.sort === "distance") {
    sorted.sort((a, b) => a.distanceKm - b.distanceKm);
  } else if (state.sort === "rating") {
    sorted.sort((a, b) => b.rating - a.rating);
  }

  el.count.textContent = `${sorted.length} ${
    window.I18n ? window.I18n.t("search_results_count") : "resultados"
  }`;

  if (sorted.length === 0) {
    el.results.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon" aria-hidden="true">🤷</div>
        <h3>Sin resultados con estos filtros</h3>
        <p>Prueba con otros términos o restablece los filtros.</p>
        <div class="empty-state__actions">
          <button class="btn btn-secondary" type="button" id="empty-reset-filters">
            Restablecer filtros
          </button>
        </div>
      </div>`;
    document
      .getElementById("empty-reset-filters")
      ?.addEventListener("click", () => el.reset?.click());
    return;
  }

  el.results.innerHTML = sorted
    .map((item) => {
      const isFav = favorites.includes(item.id);

      // T31 - Distancia relativa al distrito del usuario (mock determinista)
      let displayDist = item.distanceKm;
      if (state.userLocation) {
        const originKm = userDistanceKm(state.userLocation);
        displayDist = Math.abs(item.distanceKm - originKm).toFixed(1);
        if (Number(displayDist) === 0) displayDist = 0.5;
      }

      return `
        <article class="result-card is-entering" aria-label="${esc(item.title)}">
          <div style="position: relative;">
            <img src="${esc(item.images ? item.images[0] : item.image)}" alt="${esc(
        item.title
      )}" class="result-card__img" loading="lazy" decoding="async" style="object-fit: cover;" />
            <button class="item-card__favorite ${
              isFav ? "active" : ""
            }" aria-pressed="${isFav}" data-fav-id="${esc(item.id)}" aria-label="${
        isFav ? "Quitar de favoritos" : "Añadir a favoritos"
      }">
              <i class="fas fa-heart" aria-hidden="true"></i>
            </button>
          </div>
          <div class="result-card__body">
            <h3 class="result-card__title">${esc(item.title)}</h3>
            <div class="result-card__meta">
              <span class="badge">${esc(item.category)}</span>
              <span>${esc(item.location)}</span>
              <span>${esc(displayDist)} km</span>
              <span><i class="fa-solid fa-star star-rating"></i> ${esc(
                item.rating.toFixed(1)
              )}</span>
            </div>
            <div class="result-card__tags">
              Tags: ${esc(item.tags ? item.tags.join(", ") : "")}
            </div>
            <div class="result-card__footer">
              <div class="result-card__actions">
                <a class="btn btn-secondary" href="detalle.html?id=${esc(
                  encodeURIComponent(item.id)
                )}">${
        window.I18n ? window.I18n.t("card_view_detail") : "Ver detalle"
      }</a>
                <a class="btn btn-primary" href="chat.html">Quiero intercambiar</a>
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

// Escuchar cambios de idioma para re-renderizar
document.addEventListener("languageChanged", () => {
  // Actualizar placeholder
  if (el.query) {
    el.query.placeholder = window.I18n.t("search_placeholder");
  }
  // Re-renderizar resultados para actualizar textos dinámicos
  render();
});

// T31 - Geocodificación inversa simulada: distrito determinista según coords
// (LIMA_DISTRICTS / DISTRICT_KM are declared at the top of the module.)
function mockReverseGeocode(lat, lng) {
  const idx = Math.abs(Math.round((lat + lng) * 100)) % LIMA_DISTRICTS.length;
  return `${LIMA_DISTRICTS[idx]}, Lima`;
}

function userDistanceKm(location) {
  const district = Object.keys(DISTRICT_KM).find((d) => location.includes(d));
  return district ? DISTRICT_KM[district] : 0;
}

// T30 - Funciones de Favoritos (HU33)
function getFavorites() {
  return Store.getFavorites();
}

function toggleFavorite(id) {
  Store.toggleFavorite(id);
  render();
}

// T30 - Funciones de Búsquedas Guardadas (HU32)
function saveCurrentSearch() {
  const searches = Store.getSavedSearches();
  const newSearch = {
    id: Date.now(),
    query: state.query,
    category: state.category,
    exclude: state.exclude,
    timestamp: new Date().toISOString(),
  };

  // Evitar duplicados exactos
  const exists = searches.some(
    (s) => s.query === newSearch.query && s.category === newSearch.category
  );
  if (!exists) {
    searches.unshift(newSearch);
    Store.saveSearches(searches);
    loadSavedSearches();
    const feedback = document.getElementById("save-search-feedback");
    if (feedback) {
      feedback.textContent = "Búsqueda guardada correctamente";
      feedback.classList.add("is-success");
      setTimeout(() => {
        feedback.textContent = "";
        feedback.classList.remove("is-success");
      }, 3000);
    }
  }
}

function loadSavedSearches() {
  if (!el.savedSearchesContainer || !el.savedSearchesList) return;

  const searches = Store.getSavedSearches();
  if (searches.length === 0) {
    el.savedSearchesList.innerHTML = "";
    el.savedSearchesContainer.classList.add("hidden");
    return;
  }

  el.savedSearchesContainer.classList.remove("hidden");
  // Real buttons: both actions are reachable and operable from the keyboard.
  el.savedSearchesList.innerHTML = searches
    .map((s) => {
      const label = `${s.query || "Todo"}${s.category ? ` (${s.category})` : ""}`;
      return `
    <li class="saved-search-tag">
      <button type="button" class="saved-search-tag__apply" data-saved-search="${esc(
        s.id
      )}" aria-label="Aplicar búsqueda guardada: ${esc(label)}">${esc(label)}</button>
      <button type="button" class="saved-search-remove" data-remove-saved-search="${esc(
        s.id
      )}" aria-label="Eliminar búsqueda guardada: ${esc(label)}"><span aria-hidden="true">&times;</span></button>
    </li>
  `;
    })
    .join("");
}

function applySavedSearch(id) {
  const searches = Store.getSavedSearches();
  const search = searches.find((s) => s.id === id);
  if (search) {
    state.query = search.query;
    state.category = search.category;
    state.exclude = search.exclude || "";
    syncUI();
    render();
  }
}

function removeSavedSearch(id) {
  const filtered = Store.getSavedSearches().filter((s) => s.id !== id);
  Store.saveSearches(filtered);
  loadSavedSearches();
}

// T30 - Historial y Sugerencias (HU35)
function addToHistory(query) {
  if (!query) return;
  const history = Store.getSearchHistory();
  if (!history.includes(query)) {
    history.unshift(query);
    if (history.length > 10) history.pop(); // Mantener solo últimos 10
    Store.saveSearchHistory(history);
    loadSearchHistory();
  }
}

function loadSearchHistory() {
  if (!el.historyList) return;
  const history = Store.getSearchHistory().slice(0, 5);
  el.historyList.innerHTML = history
    .map((term) => `<option value="${esc(term)}">`)
    .join("");
}
