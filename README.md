# Quartetto Vocale — sito ufficiale

Sito statico costruito con [Astro](https://astro.build), Tailwind CSS, deploy su Cloudflare Pages.

## Stack

- **Framework**: Astro 5 (output statico)
- **Stile**: Tailwind CSS
- **Tipografia**: EB Garamond (titoli) + Inter (corpo)
- **Lingue**: italiano (default) + inglese (`/en/`)
- **Hosting consigliato**: Cloudflare Pages

## Setup iniziale

Prerequisiti: Node.js 20+ e npm.

```bash
npm install
npm run dev
```

Il sito sarà disponibile su `http://localhost:4321`.

## Comandi

| Comando | Azione |
| --- | --- |
| `npm run dev` | Avvia il server di sviluppo |
| `npm run build` | Genera il sito statico in `./dist/` |
| `npm run preview` | Anteprima locale del build |

## Struttura dei contenuti

I contenuti vivono in `src/content/`:

- `concerti/` — un file `.md` per concerto. Naming: `YYYY-MM-DD-citta.md`
- `cantanti/` — schede individuali. Naming: `01-soprano.md`, `02-contralto.md`, ecc.
- `pagine/` — testi narrativi (chi siamo, repertorio)

Lo schema dei dati è definito in `src/content/config.ts`. Astro valida automaticamente i file Markdown rispetto allo schema: se manca un campo o c'è un errore di formato, il build fallisce con un messaggio chiaro.

### Aggiungere un concerto

1. Crea `src/content/concerti/2026-MM-GG-citta.md`
2. Compila il frontmatter:
   ```yaml
   ---
   titolo: "Titolo del concerto"
   data: 2026-06-15
   ora: "21:00"
   luogo: "Nome della sala/chiesa"
   citta: "Città"
   occasione: concerto   # oppure: liturgia | festival
   programma:
     - compositore: "Nome"
       opera: "Titolo brano"
   ingresso: "Libero"
   lingua: it
   ---
   ```
3. Per la versione inglese, duplica il file con suffisso `-en.md` e cambia `lingua: en`
4. `git commit && git push` → Cloudflare Pages rilancia la build automaticamente

### Aggiungere/aggiornare una bio cantante

Modifica i file in `src/content/cantanti/`. Il prefisso numerico (`01-`, `02-`...) determina l'ordine di visualizzazione.

## Deploy su Cloudflare Pages

1. Pusha la repo su GitHub
2. Su Cloudflare Pages: "Create a project" → connetti la repo
3. Build command: `npm run build`
4. Build output directory: `dist`
5. Aggiungi il dominio personalizzato dalle impostazioni del progetto

## Da configurare prima del lancio

- [ ] Sostituire `https://quartetto.example.com` in `astro.config.mjs` con il dominio reale
- [ ] Sostituire l'endpoint Formspree in `src/pages/contatti.astro` (e nella futura versione EN)
- [ ] Aggiungere un favicon in `public/favicon.svg`
- [ ] Aggiungere un'immagine di default per Open Graph in `public/images/og-default.jpg`
- [ ] Sostituire i testi provvisori nei file `src/content/pagine/*.md` e `src/content/cantanti/*.md`
- [ ] Aggiungere la versione EN di `chi-siamo.md` e `repertorio.md` (basta duplicare con `lingua: en`)
- [ ] Sostituire i placeholder embed video/audio nella pagina Media
- [ ] Creare le pagine speculari in `src/pages/en/` (vedi nota in fondo)

## Pagine in inglese (TODO)

Nello scaffold attuale è presente la sola home italiana e le pagine principali italiane. Per attivare la versione EN completa, duplica i file da `src/pages/` a `src/pages/en/` e adatta:
- nome del file (es. `quartetto.astro` → `ensemble.astro`)
- chiamata a `useTranslations('en')`
- filtri sulle collections con `data.lingua === 'en'`

## Workflow contenuti consigliato

Ogni modifica passa per Git:
```
modifica file .md
↓
git add . && git commit -m "Aggiungo concerto del 15 giugno"
↓
git push
↓
Cloudflare Pages rebuilda → online in ~30 secondi
```
