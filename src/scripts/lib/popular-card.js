// Pure renderer for the home "Populares" card. Every Store-derived string is
// escaped (text and attributes) and URL parameters are encoded, so a stored
// title like `"><img onerror=…>` renders as text.
import { escapeHtml } from "./html.js";

const FALLBACK_LABELS = {
  card_view_similar: "Ver similar",
  card_view_detail: "Ver detalle",
};

export function renderPopularCard(item, options = {}) {
  const isFavorite = options.isFavorite || (() => false);
  const t = options.t || ((key) => FALLBACK_LABELS[key] || key);
  const title = escapeHtml(item.title);
  const image = escapeHtml(item.images ? item.images[0] : item.image);
  const rating = Number(item.rating || 5).toFixed(1);

  return `
        <article class="popular-card is-entering" aria-label="${title}" data-item-id="${escapeHtml(item.id)}">
          <div class="popular-card__media">
            <img src="${image}" alt="${title}" loading="lazy" decoding="async" width="400" height="200" />
            <button class="fav-toggle" type="button" aria-pressed="${Boolean(
              isFavorite(item.id)
            )}" aria-label="Marcar como favorito" data-fav-id="${escapeHtml(item.id)}">
              <i class="fas fa-heart" aria-hidden="true"></i>
            </button>
          </div>
          <div class="popular-card__body">
            <h3 class="popular-card__title">${title}</h3>
            <div class="popular-card__meta">
              <span class="badge">${escapeHtml(item.category)}</span>
              <span><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${escapeHtml(item.location)}</span>
              <span><i class="fas fa-ruler" aria-hidden="true"></i> ${escapeHtml(item.distanceKm)} km</span>
              <span><i class="fas fa-star" aria-hidden="true"></i> ${escapeHtml(rating)}</span>
            </div>
            <div class="popular-card__footer">
              <a class="btn btn-secondary" href="busqueda.html?category=${encodeURIComponent(
                item.category ?? ""
              )}">${escapeHtml(t("card_view_similar"))}</a>
              <a class="btn btn-primary" href="detalle.html?id=${encodeURIComponent(
                item.id ?? ""
              )}">${escapeHtml(t("card_view_detail"))}</a>
            </div>
          </div>
        </article>
      `;
}
