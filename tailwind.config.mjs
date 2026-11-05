/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      // Identità della brand guide: Cormorant Garamond per marchio e titoli,
      // Figtree (bastone caldo) per testi e interfaccia.
      // La chiave `serif` indica il ruolo "titolo". Corsivo Cormorant per i
      // testi latini e i titoli dei brani (.latino).
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Garamond"', 'Georgia', 'serif'],
        sans: ['"Figtree"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        accento: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        marchio: ['"Cormorant Garamond"', '"Garamond"', 'Georgia', 'serif'],
      },
      fontSize: {
        display: ['clamp(4rem, 12vw, 9rem)', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
      },
      colors: {
        // Palette dal logo: inchiostro caldo quasi nero, carta avorio,
        // bronzo (su chiaro) e oro (su scuro).
        // Dalla brand guide (social/BRAND.md): Cream, Ink, Walnut, bronzo e oro chiaro
        ink: {
          DEFAULT: '#26211C',
          soft:    '#4A433B',
          muted:   '#6B6258',
        },
        paper: {
          DEFAULT: '#F8F5EF',
          warm:    '#F1EBE1',
          dark:    '#E2D9CA',
        },
        noce: '#3E2C20',
        // `klein` è il nome storico del colore d'accento: ora è il bronzo del
        // logo. Stesse regole di prima: dettagli rari, mai su testo lungo.
        klein: '#A8834F',
        bronzo: { DEFAULT: '#A8834F', scuro: '#8A6A3A' },
        oro: '#C9A66B',
        accent: {
          DEFAULT: '#26211C',
          dark:    '#6B6258',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: '#4A433B',
          },
        },
      },
      maxWidth: {
        prose: '65ch',
      },
    },
  },
  plugins: [],
};
