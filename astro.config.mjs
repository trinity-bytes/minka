// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Static build for GitHub Pages, served at the root of the custom domain
// (public/CNAME holds minka.jahattrinidad.com).
// build.format "file" emits `page.html` files (404.html is what Pages serves).
export default defineConfig({
  site: "https://minka.jahattrinidad.com",
  output: "static",
  trailingSlash: "ignore",
  build: {
    format: "file",
  },
  // sitemap-index.xml for search consoles; the 404 page is not indexable.
  // URLs get the ".html" suffix so they match each page canonical (format "file").
  integrations: [
    sitemap({
      filter: (page) => !/\/404(\.html|\/)?$/.test(page),
      serialize: (item) => (item.url.endsWith("/") ? item : { ...item, url: `${item.url}.html` }),
    }),
  ],
});
