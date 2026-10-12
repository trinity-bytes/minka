import { test } from "node:test";
import assert from "node:assert/strict";
import { renderPopularCard } from "../src/scripts/lib/popular-card.js";

const base = {
  id: "item-1",
  title: "Bicicleta urbana",
  category: "Deportes",
  location: "Miraflores",
  distanceKm: 1.2,
  rating: 4.5,
  images: ["img/bici.jpg"],
};

test("renderPopularCard renders the item fields and links", () => {
  const html = renderPopularCard(base);
  assert.match(html, /<h3 class="popular-card__title">Bicicleta urbana<\/h3>/);
  assert.match(html, /href="detalle\.html\?id=item-1"/);
  assert.match(html, /href="busqueda\.html\?category=Deportes"/);
  assert.match(html, /4\.5/);
  assert.match(html, /aria-pressed="false"/);
});

test("renderPopularCard escapes a malicious title in text and attributes", () => {
  const html = renderPopularCard({
    ...base,
    title: `"><img src=x onerror="alert(1)">`,
  });
  assert.doesNotMatch(html, /<img src=x/);
  assert.doesNotMatch(html, /onerror="alert/);
  assert.match(html, /aria-label="&quot;&gt;&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;"/);
});

test("renderPopularCard escapes category, location, image and id", () => {
  const html = renderPopularCard({
    ...base,
    id: `x" onclick="evil`,
    category: "<b>c</b>",
    location: "<script>l</script>",
    images: [`a.jpg" onerror="evil`],
  });
  assert.doesNotMatch(html, /<b>c<\/b>/);
  assert.doesNotMatch(html, /<script>/);
  assert.doesNotMatch(html, /" onerror="evil/);
  assert.doesNotMatch(html, /" onclick="evil/);
  assert.match(html, /href="detalle\.html\?id=x%22%20onclick%3D%22evil"/);
});

test("renderPopularCard uses the favorite flag and translator", () => {
  const html = renderPopularCard(base, {
    isFavorite: () => true,
    t: (key) => `[${key}]`,
  });
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /\[card_view_similar\]/);
  assert.match(html, /\[card_view_detail\]/);
});

test("renderPopularCard falls back to item.image and default rating", () => {
  const { images, rating, ...rest } = base;
  const html = renderPopularCard({ ...rest, image: "img/one.jpg" });
  assert.match(html, /src="img\/one\.jpg"/);
  assert.match(html, /5\.0/);
});
