// @ts-check
import { defineConfig } from "astro/config";

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
});
