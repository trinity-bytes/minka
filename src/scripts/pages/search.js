// T15 - Andy Salcedo: Buscador con filtros simulados (categoría, reputación, distancia)
// T30 - Andy Salcedo: Búsquedas guardadas y filtros avanzados
// Los datos demo viven en Store.seedDemo(); la búsqueda lee solo Store.getItems().
// ES module bundled by src/pages/pages/busqueda.astro; relies on the legacy
// globals Store, Toast and I18n loaded as classic scripts by AppLayout.
import { escapeHtml } from "../lib/html.js";
import {
  SEARCH_DEFAULTS,
  filtersToParams,
  parseSearchParams,
  resultsSummary,
} from "../lib/search-params.js";

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

// query, category, exclude (T30), userLocation (T31), minRating,
// maxDistance, sort: shared with the home search (lib/search-params.js).
const DEFAULT_FILTERS = SEARCH_DEFAULTS;

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

// Llegada con filtros en la URL (búsqueda desde home con sus chips, o una
// URL compartida, Chunk 4.7): la URL manda y reemplaza los filtros
// guardados, para que la búsqueda de home no herede filtros viejos.
function applyUrlParams() {
  const { filters, hasParams } = parseSearchParams(window.location.search);
  if (!hasParams) return;
  Object.assign(state, filters, { query: filters.query.toLowerCase() });
  syncUI();
  el.query.value = filters.query; // keep the typed casing in the field
  addToHistory(state.query);
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
      return;
    }
    const tag = e.target.closest("[data-saved-search]");
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
  const qs = filtersToParams(state).toString();
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
        aria-label="Quitar filtro ${escapeHtml(chip.label)}">
        ${escapeHtml(chip.label)} <span aria-hidden="true">×</span>
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
  el.count.textContent = resultsSummary(0, state.query);
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

  el.count.textContent = resultsSummary(sorted.length, el.query.value || state.query);

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

      // Photo tile + text below on the page (T10d-2); the title link is
      // stretched over the tile, the favorite button sits above it.
      const src = item.images ? item.images[0] : item.image;
      return `
        <article class="result-card is-entering">
          <div class="result-card__tile">
            <img src="${escapeHtml(src)}" alt="" class="result-card__img" loading="lazy" decoding="async" />
            <button type="button" class="item-card__favorite ${
              isFav ? "active" : ""
            }" aria-pressed="${isFav}" data-fav-id="${escapeHtml(item.id)}" aria-label="${
        isFav ? "Quitar de favoritos" : "Añadir a favoritos"
      }">
              <i class="fas fa-heart" aria-hidden="true"></i>
            </button>
          </div>
          <div class="result-card__body">
            <h3 class="result-card__title">
              <a class="result-card__link" href="detalle.html?id=${encodeURIComponent(
                item.id
              )}">${escapeHtml(item.title)}</a>
            </h3>
            <p class="result-card__meta">${escapeHtml(item.category)} · ${escapeHtml(
        item.location
      )} · ${displayDist} km</p>
            <p class="result-card__rating">
              <i class="fa-solid fa-star star-rating" aria-hidden="true"></i>
              <span class="sr-only">Reputación:</span> ${Number(item.rating || 0).toFixed(1)}
            </p>
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
    el.savedSearchesContainer.classList.add("hidden");
    return;
  }

  el.savedSearchesContainer.classList.remove("hidden");
  el.savedSearchesList.innerHTML = searches
    .map(
      (s) => `
    <li class="saved-search-tag">
      <button type="button" class="saved-search-apply" data-saved-search="${escapeHtml(s.id)}">${escapeHtml(s.query || "Todo")} ${s.category ? `(${escapeHtml(s.category)})` : ""}</button>
      <button type="button" class="saved-search-remove" data-remove-saved-search="${s.id}" aria-label="Quitar búsqueda guardada"><span aria-hidden="true">&times;</span></button>
    </li>
  `
    )
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
    .map((term) => `<option value="${escapeHtml(term)}">`)
    .join("");
}
