// T19 - Andy Salcedo: Home app — populares desde Store (seed demo en first-run)

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

function renderEmptyState() {
  popularListEl.classList.remove("is-carousel");
  popularListEl.innerHTML = `
    <div class="empty-state">
      <div class="empty-state__icon" aria-hidden="true">🌱</div>
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
    renderPopular();
    if (window.Toast) Toast.show("Datos de ejemplo cargados.", "success");
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

  let allItems = [];
  try {
    allItems = window.Store ? Store.getItems() : [];
  } catch (error) {
    popularListEl.innerHTML = `
      <div class="error-state">
        <div class="error-state__icon" aria-hidden="true">⚠️</div>
        <h3>Error al cargar</h3>
        <p>No pudimos leer las publicaciones.</p>
        <button class="btn btn-secondary" type="button" onclick="location.reload()">Reintentar</button>
      </div>`;
    return;
  }

  if (allItems.length === 0) {
    renderEmptyState();
    return;
  }

  popularListEl.innerHTML = allItems
    .map(
      (item) => `
        <article class="popular-card is-entering" aria-label="${
          item.title
        }" onclick="window.location.href='detalle.html?id=${item.id}'">
          <div class="popular-card__media">
            <img src="${item.images ? item.images[0] : item.image}" alt="${
        item.title
      }" loading="lazy" decoding="async" width="400" height="200" />
            <button class="fav-toggle" type="button" aria-pressed="${
              window.Store ? Store.isFavorite(item.id) : false
            }" aria-label="Marcar como favorito" onclick="event.stopPropagation(); window.toggleHomeFavorite('${
        item.id
      }', this)">
              <i class="fas fa-heart" aria-hidden="true"></i>
            </button>
          </div>
          <div class="popular-card__body">
            <h3 class="popular-card__title">${item.title}</h3>
            <div class="popular-card__meta">
              <span class="badge">${item.category}</span>
              <span><i class="fas fa-map-marker-alt"></i> ${
                item.location
              }</span>
              <span><i class="fas fa-ruler"></i> ${item.distanceKm} km</span>
              <span><i class="fas fa-star"></i> ${(item.rating || 5).toFixed(
                1
              )}</span>
            </div>
            <div class="popular-card__footer">
              <a class="btn btn-secondary" href="busqueda.html?category=${encodeURIComponent(
                item.category
              )}" onclick="event.stopPropagation()">${
        window.I18n ? window.I18n.t("card_view_similar") : "Ver similar"
      }</a>
              <a class="btn btn-primary" href="detalle.html?id=${
                item.id
              }" onclick="event.stopPropagation()">${
        window.I18n ? window.I18n.t("card_view_detail") : "Ver detalle"
      }</a>
            </div>
          </div>
        </article>
      `
    )
    .join("");

  setupCarousel(allItems.length);
}

// Escuchar cambios de idioma para re-renderizar las tarjetas
document.addEventListener("languageChanged", () => {
  renderPopular();
});

// Favorito persistido desde la card (sin navegar)
window.toggleHomeFavorite = (id, btn) => {
  if (!window.Store) return;
  Store.toggleFavorite(id);
  btn.setAttribute("aria-pressed", String(Store.isFavorite(id)));
  btn.setAttribute(
    "aria-label",
    Store.isFavorite(id) ? "Quitar de favoritos" : "Marcar como favorito"
  );
};

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

  // Validación antes de enviar
  searchForm.addEventListener("submit", (e) => {
    const query = searchInput.value.trim();
    if (!query) {
      e.preventDefault();
      searchInput.focus();
      searchInput.placeholder = "Por favor, ingresa un término de búsqueda";
      searchInput.style.borderColor = "#e74c3c";

      setTimeout(() => {
        searchInput.style.borderColor = "";
        searchInput.placeholder = "Buscar objetos, categorías, ubicaciones...";
      }, 2000);
    }
  });
}
