// T15 - Andy Salcedo: Buscador con filtros simulados (categoría, reputación, distancia)
// T30 - Andy Salcedo: Búsquedas guardadas y filtros avanzados
const mockItems = [
  {
    id: "itm-001",
    title: "Bicicleta urbana vintage",
    category: "Electrónica",
    tags: ["movilidad", "urbano", "bicicleta"],
    rating: 4.8,
    distanceKm: 4,
    location: "Miraflores",
    image: "../assets/images/items/bicicleta-vintage.jpg",
  },
  {
    id: "itm-002",
    title: "Set de libros ciencia ficción",
    category: "Libros",
    tags: ["libros", "sci-fi", "colección"],
    rating: 4.2,
    distanceKm: 9,
    location: "San Borja",
    image: "../assets/images/items/set-libros.jpg",
  },
  {
    id: "itm-003",
    title: "Laptop ligera i5",
    category: "Electrónica",
    tags: ["tech", "trabajo", "portátil"],
    rating: 4.9,
    distanceKm: 18,
    location: "Pueblo Libre",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "itm-004",
    title: "Mesa de centro reciclada",
    category: "Hogar",
    tags: ["madera", "reciclado", "hogar"],
    rating: 4.1,
    distanceKm: 6,
    location: "Barranco",
    image: "../assets/images/items/mesa-centro.jpg",
  },
  {
    id: "itm-005",
    title: "Clases de guitarra",
    category: "Servicios",
    tags: ["música", "clases", "servicio"],
    rating: 4.5,
    distanceKm: 12,
    location: "Surco",
    image: "../assets/images/items/guitarra-acustica.jpg",
  },
  {
    id: "itm-006",
    title: "Abrigo de lana mujer M",
    category: "Ropa y accesorios",
    tags: ["ropa", "abrigo", "mujer"],
    rating: 3.9,
    distanceKm: 3,
    location: "La Molina",
    image: "../assets/images/items/abrigo-lana-mujer.jpg",
  },
];

const state = {
  query: "",
  category: "",
  exclude: "", // T30 - Exclusiones
  userLocation: "", // T31
  minRating: 0,
  maxDistance: 15,
  sort: "relevance",
};

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
            alert(
              "No se pudo obtener la ubicación. Por favor ingrésala manualmente."
            );
          }
        );
      } else {
        alert("Geolocalización no soportada.");
      }
    });
  }

  el.query.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      state.query = el.query.value.trim().toLowerCase();
      render();
      persist();
    }
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

  el.reset.addEventListener("click", () => {
    state.query = "";
    state.category = "";
    state.minRating = 0;
    state.maxDistance = 15;
    state.sort = "relevance";
    syncUI();
    render();
    persist();
  });
}

function restoreFilters() {
  const saved = Store.getSearchFilters();
  if (saved) Object.assign(state, saved);
  syncUI();
}

function persist() {
  Store.saveSearchFilters(state);
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

function render() {
  const localItems = Store.getItems();
  const allItems = [...localItems, ...mockItems];
  const favorites = getFavorites(); // T30

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
        <article class="result-card" aria-label="${item.title}">
          <div style="position: relative;">
            <img src="${item.images ? item.images[0] : item.image}" alt="${
        item.title
      }" class="result-card__img" loading="lazy" style="object-fit: cover;" />
            <button class="item-card__favorite ${
              isFav ? "active" : ""
            }" onclick="toggleFavorite('${item.id}')" aria-label="${
        isFav ? "Quitar de favoritos" : "Añadir a favoritos"
      }">
              <i class="fas fa-heart"></i>
            </button>
          </div>
          <div class="result-card__body">
            <h3 class="result-card__title">${item.title}</h3>
            <div class="result-card__meta">
              <span class="badge">${item.category}</span>
              <span>${item.location}</span>
              <span>${displayDist} km</span>
              <span><i class="fa-solid fa-star star-rating"></i> ${item.rating.toFixed(
                1
              )}</span>
            </div>
            <div class="result-card__tags">
              Tags: ${item.tags ? item.tags.join(", ") : ""}
            </div>
            <div class="result-card__footer">
              <div class="result-card__actions">
                <a class="btn btn-secondary" href="detalle.html?id=${
                  item.id
                }">${
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

window.toggleFavorite = (id) => {
  Store.toggleFavorite(id);
  render();
};

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
    <li class="saved-search-tag" onclick="applySavedSearch(${s.id})">
      <span>${s.query || "Todo"} ${s.category ? `(${s.category})` : ""}</span>
      <span class="saved-search-remove" onclick="removeSavedSearch(event, ${
        s.id
      })">&times;</span>
    </li>
  `
    )
    .join("");
}

window.applySavedSearch = (id) => {
  const searches = Store.getSavedSearches();
  const search = searches.find((s) => s.id === id);
  if (search) {
    state.query = search.query;
    state.category = search.category;
    state.exclude = search.exclude || "";
    syncUI();
    render();
  }
};

window.removeSavedSearch = (e, id) => {
  e.stopPropagation();
  const filtered = Store.getSavedSearches().filter((s) => s.id !== id);
  Store.saveSearches(filtered);
  loadSavedSearches();
};

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
  const history = Store.getSearchHistory();
  el.historyList.innerHTML = history
    .map((term) => `<option value="${term}">`)
    .join("");
}
