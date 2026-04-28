// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // ⚠️ Sostituire con il dominio reale prima del deploy in produzione
  site: 'https://quartetto.example.com',

  // Strategia bilingue: IT default su /, EN su /en/
  i18n: {
    defaultLocale: 'it',
    locales: ['it', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  integrations: [
    tailwind({
      applyBaseStyles: false, // useremo il nostro global.css
    }),
    sitemap(),
  ],

  // Compressione HTML attiva di default in Astro 5
});
