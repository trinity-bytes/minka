// T19 - Andy Salcedo: Home app con datos simulados de populares

const popularItems = [
  {
    id: "pop-001",
    title: "Bicicleta urbana vintage",
    category: "Electrónica",
    location: "Miraflores",
    distanceKm: 4,
    rating: 4.8,
    image: "../assets/images/items/bicicleta-vintage.jpg",
  },
  {
    id: "pop-002",
    title: "Guitarra acústica seminueva",
    category: "Instrumentos",
    location: "Surco",
    distanceKm: 12,
    rating: 4.5,
    image: "../assets/images/items/guitarra-acustica.jpg",
  },
  {
    id: "pop-003",
    title: "Mesa de centro reciclada",
    category: "Hogar",
    location: "Barranco",
    distanceKm: 6,
    rating: 4.1,
    image: "../assets/images/items/mesa-centro.jpg",
  },
  {
    id: "pop-004",
    title: "Set de libros ciencia ficción",
    category: "Libros",
    location: "San Borja",
    distanceKm: 9,
    rating: 4.2,
    image: "../assets/images/items/set-libros.jpg",
  },
];

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

function renderPopular() {
  if (!popularListEl) return;

  const localItems = window.Store ? Store.getItems() : [];
  // Combine local items with mock items
  const allItems = [...localItems, ...popularItems];

  popularListEl.innerHTML = allItems
    .map(
      (item) => `
        <article class="popular-card" aria-label="${
          item.title
        }" onclick="window.location.href='detalle.html?id=${item.id}'">
          <img src="${item.images ? item.images[0] : item.image}" alt="${
        item.title
      }" loading="lazy" style="object-fit: cover; height: 200px; width: 100%;" />
          <div class="popular-card__body">
            <h3 class="popular-card__title">${item.title}</h3>
            <div class="popular-card__meta">
              <span class="badge">${item.category}</span>
              <span><i class="fas fa-map-marker-alt"></i> ${
                item.location
              }</span>
              <span><i class="fas fa-ruler"></i> ${item.distanceKm} km</span>
              <span><i class="fas fa-star"></i> ${item.rating.toFixed(1)}</span>
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
}

// Escuchar cambios de idioma para re-renderizar las tarjetas
document.addEventListener("languageChanged", () => {
  renderPopular();
});

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
