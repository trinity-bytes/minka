// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Static build for GitHub Pages (project site under /minka).
// build.format "file" emits `page.html` files so legacy URLs such as
// /minka/pages/auth.html keep working once pages are ported to src/pages.
export default defineConfig({
  site: "https://trinity-bytes.github.io",
  base: "/minka",
  output: "static",
  trailingSlash: "ignore",
  build: {
    format: "file",
  },
  // sitemap-index.xml for search consoles; the 404 page and the internal brand
  // review board (/brand) are not indexable.
  // URLs get the ".html" suffix so they match each page canonical (format "file").
  integrations: [
    sitemap({
      filter: (page) => !/\/(404|brand)(\.html|\/)?$/.test(page),
      serialize: (item) => (item.url.endsWith("/") ? item : { ...item, url: `${item.url}.html` }),
    }),
  ],
});
