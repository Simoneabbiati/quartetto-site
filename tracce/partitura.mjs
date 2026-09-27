// Disegna la partitura di controllo (Humdrum **kern → SVG con Verovio) in una
// pagina HTML, con il numero su ogni battuta per confrontarla col PDF.
//   node tracce/partitura.mjs partitura.krn partitura.html
import { readFileSync, writeFileSync } from 'node:fs';
import createVerovioModule from 'verovio/wasm-hum';
import { VerovioToolkit } from 'verovio/esm';

const [krn, html] = process.argv.slice(2);
const tk = new VerovioToolkit(await createVerovioModule());
tk.setOptions({
  pageWidth: 2100,
  scale: 45,
  adjustPageHeight: true,
  header: 'none',
  footer: 'none',
  mnumInterval: 1, // numero su ogni battuta
  breaks: 'auto',
});
if (!tk.loadData(readFileSync(krn, 'utf8'))) {
  console.error(tk.getLog());
  process.exit(1);
}
const pagine = Array.from({ length: tk.getPageCount() }, (_, i) => tk.renderToSVG(i + 1));
writeFileSync(
  html,
  `<!doctype html><meta charset="utf-8"><title>Partitura di controllo</title>
<style>body{margin:2rem;font-family:system-ui;background:#fff}svg{max-width:100%;height:auto;display:block;margin-bottom:2rem}</style>
<p>Ricostruita dalla trascrizione: confrontala battuta per battuta con il PDF originale.
Il tenore è scritto in chiave di violino con l'8, come nello spartito.</p>
${pagine.join('\n')}`,
);
