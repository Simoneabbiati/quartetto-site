// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  // Deploy su Cloudflare Pages: https://quartetto-site.pages.dev (dominio personalizzato da collegare in seguito)
  site: 'https://quartetto-site.pages.dev',

  // Strategia bilingue: EN default su /, IT su /it/
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'it'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  // Compressione HTML attiva di default in Astro 5
  integrations: [
    tailwind({
      applyBaseStyles: false, // useremo il nostro global.css
    }),
    sitemap(),
  ],

  adapter: cloudflare()
});