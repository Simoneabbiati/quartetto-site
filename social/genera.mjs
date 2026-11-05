#!/usr/bin/env node
// Genera i post Instagram/Facebook da social/post/*.json seguendo la brand
// guide (BRAND.md, brand.json). Per ogni post scrive in social/out/:
//   <id>.png   immagine 1080×1350
//   <id>.txt   didascalia pronta da incollare (IT + EN + hashtag)
// e social/out/anteprima.html, con la griglia del profilo e i post uno per uno.
//
//   node social/genera.mjs            tutti i post
//   node social/genera.mjs 05         solo quelli il cui nome contiene "05"
//
// Fondo: Cream o Walnut. Se il post non lo dice ("sfondo"), alterna a
// scacchiera in base al numero del post (dispari Walnut, pari Cream): così la
// griglia resta a scacchiera anche aggiungendo post nuovi.
// Serve solo Google Chrome installato.

import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const QUI = dirname(fileURLToPath(import.meta.url));
const RADICE = resolve(QUI, '..');
const OUT = join(QUI, 'out');
const BRAND = JSON.parse(readFileSync(join(QUI, 'brand.json'), 'utf8'));
const C = BRAND.colori;
const M = BRAND.margini;
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// Le due famiglie di colori della guida
const TEMI = {
  crema: { fondo: C.crema, titolo: C.inchiostro, testo: C.secondario, tenue: C.tenue, filo: C.filo, accento: C.bronzo, marchio: C.inchiostro, sbiadito: 'rgba(38,33,28,.18)' },
  noce:  { fondo: C.noce, titolo: C.titoloSuNoce, testo: C.testoSuNoce, tenue: C.tenueSuNoce, filo: 'rgba(248,245,239,.18)', accento: C.oroChiaro, marchio: C.titoloSuNoce, sbiadito: 'rgba(248,245,239,.32)' },
};

// ── Testo ──────────────────────────────────────────────────────────────────
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// "ConCordia" nei titoli: seconda C nel colore d'accento
const nome = (s) => esc(s).replace(/Con[Cc]ordia/g, 'Con<span class="acc">C</span>ordia');
// *testo* → corsivo (titoli di brani, parole latine)
const ricco = (s) => nome(s).replace(/\*([^*]+)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');

// ── Elementi grafici ───────────────────────────────────────────────────────
const monogramma = (px, colore) => `
  <svg width="${px}" height="${px}" viewBox="20 20 165 165" aria-hidden="true">
    <g font-family="${BRAND.font.marchio}" font-weight="500" fill="${colore}">
      <text x="84" y="154" font-size="190" text-anchor="middle">C</text>
      <text transform="translate(143 131) scale(-1 1)" font-size="114" text-anchor="middle">C</text>
    </g>
  </svg>`;

const lockup = (T, sito) => `
  <div class="piede">
    <div class="lockup">${monogramma(58, T.accento)}
      <div><div class="parola">Concordia</div><div class="sotto">Singers · Vocal ensemble</div></div>
    </div>
    ${sito ? `<div class="sito">${BRAND.sito}</div>` : ''}
  </div>`;

const etichetta = (testo) => `<div class="etichetta"><span class="punto"></span>${esc(testo)}</div>`;

const foto = (n) => {
  const p = join(RADICE, 'public/images/home', `${n}-1600.webp`);
  if (!existsSync(p)) throw new Error(`Foto "${n}" non trovata in public/images/home (es. chiesa, spartiti, spartiti-coro, palco, pianoforte, tastiera, bocconi)`);
  return pathToFileURL(p).href;
};

const ONDA = [0.2,0.22,0.62,0.96,0.96,0.85,0.86,0.81,0.64,0.64,0.74,0.84,0.94,0.62,0.58,0.42,0.3,0.44,0.66,0.65,0.72,0.61,0.75,0.63,0.74,0.93,0.92,0.63,0.43,0.46,0.47,0.35,0.58,0.69,0.74,0.81,0.86,0.68,0.72,0.73,0.96,1,0.88,0.48,0.44,0.31,0.39,0.6,0.69,0.78,0.65,0.62,0.67,0.85,0.57,0.66,0.6,0.59,0.44,0.37,0.27,0.21,0.13,0.12];

// ── Modelli ────────────────────────────────────────────────────────────────
// Ogni modello: etichetta in alto, contenuto centrato e allineato a sinistra,
// lockup in basso a sinistra (sito opzionale a destra).
const MODELLI = {
  // Titolo + testo (+ tabella a filo opzionale): annunci, prove, ricerca voci.
  annuncio: (p, T) => `
    ${etichetta(p.etichetta)}
    <div class="centro">
      ${p.sopratitolo ? `<div class="sopra">${esc(p.sopratitolo)}</div>` : ''}
      <div class="titolo">${ricco(p.titolo)}</div>
      ${p.testo ? `<div class="testo">${ricco(p.testo)}</div>` : ''}
      ${p.dettagli?.length ? `<dl class="tabella">${p.dettagli.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${ricco(v)}</dd></div>`).join('')}</dl>` : ''}
    </div>
    ${lockup(T, p.sito)}`,

  // Una frase sola, grande.
  citazione: (p, T) => `
    ${etichetta(p.etichetta)}
    <div class="centro">
      <div class="titolo">${ricco(p.titolo)}</div>
      ${p.firma ? `<div class="firma">${ricco(p.firma)}</div>` : ''}
    </div>
    ${lockup(T, p.sito)}`,

  // Dichiarazione su Walnut con la grande doppia C che esce dal bordo destro.
  dichiarazione: (p, T) => `
    <div class="cc-grande">${monogramma(980, T.accento)}</div>
    ${etichetta(p.etichetta)}
    <div class="centro"><div class="titolo">${ricco(p.titolo)}</div>
      ${p.testo ? `<div class="testo">${ricco(p.testo)}</div>` : ''}</div>
    ${lockup(T, p.sito)}`,

  // Ascolto: titolo del brano in corsivo, forma d'onda (parte "suonata" in oro).
  ascolta: (p, T) => `
    ${etichetta(p.etichetta || 'Ascolta')}
    <div class="centro">
      <div class="brano">${ricco(`*${p.titolo.replace(/\*/g, '')}*`)}</div>
      ${p.testo ? `<div class="testo">${ricco(p.testo)}</div>` : ''}
      <div class="onda">${ONDA.map((h, i) => `<span style="height:${Math.round(h * 100)}%;background:${i < ONDA.length * 0.38 ? T.accento : T.sbiadito}"></span>`).join('')}</div>
      <div class="durata"><span class="play"></span>${esc(p.durata || '0:28')}</div>
    </div>
    ${lockup(T, p.sito)}`,

  // Foto dentro i margini, con titolo corsivo sotto.
  foto: (p, T) => `
    ${etichetta(p.etichetta)}
    <div class="centro">
      <div class="riquadro" style="background-image:url('${foto(p.foto)}');background-position:${p.posizione || 'center'}"></div>
      ${p.titolo ? `<div class="didascalia-foto">${ricco(p.titolo)}</div>` : ''}
    </div>
    ${lockup(T, p.sito)}`,

  // Elenco a fili (repertorio, paesi, programma).
  elenco: (p, T) => `
    ${etichetta(p.etichetta)}
    <div class="centro">
      <div class="titolo">${ricco(p.titolo)}</div>
      <ul class="elenco">${(p.voci || []).map((v) => `<li>${ricco(v)}</li>`).join('')}</ul>
    </div>
    ${lockup(T, p.sito)}`,
};

const CSS = (T, w, h) => `
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:${w}px;height:${h}px;overflow:hidden;background:${T.fondo}}
  body{font-family:"${BRAND.font.testo}",sans-serif;font-weight:300;color:${T.testo};-webkit-font-smoothing:antialiased}
  .post{position:relative;width:${w}px;height:${h}px;padding:${M.alto}px ${M.lati}px ${M.basso}px;display:flex;flex-direction:column;overflow:hidden}
  .acc{color:${T.accento}}
  em{font-family:"${BRAND.font.marchio}",serif;font-style:italic;font-weight:500}
  .etichetta{position:relative;display:flex;align-items:center;gap:14px;font-size:26px;font-weight:400;color:${T.tenue}}
  .punto{width:12px;height:12px;border-radius:50%;background:${T.accento}}
  .centro{position:relative;margin:auto 0;display:flex;flex-direction:column;gap:36px}
  .sopra{font-size:26px;font-weight:500;letter-spacing:.28em;text-transform:uppercase;color:${T.accento};margin-bottom:-12px}
  .titolo{font-family:"${BRAND.font.marchio}",serif;font-weight:500;font-size:116px;line-height:1.02;color:${T.titolo}}
  .titolo em{font-size:inherit}
  .testo{font-size:34px;line-height:1.45;max-width:820px}
  .firma{font-size:30px;color:${T.tenue}}
  .tabella{border-top:1px solid ${T.filo}}
  .tabella div{display:flex;gap:32px;padding:20px 0;border-bottom:1px solid ${T.filo};font-size:30px}
  .tabella dt{width:150px;flex:none;color:${T.tenue};font-weight:400}
  .tabella dd{color:${T.titolo}}
  .brano{font-size:168px;line-height:1;color:${T.titolo}}
  .brano em{font-size:inherit}
  .onda{height:120px;display:flex;align-items:center;gap:6px}
  .onda span{flex:1;min-height:6px;border-radius:3px}
  .durata{display:flex;align-items:center;gap:14px;font-size:26px;font-weight:400;color:${T.tenue}}
  .play{width:0;height:0;border-left:16px solid ${T.accento};border-top:10px solid transparent;border-bottom:10px solid transparent}
  .riquadro{width:100%;height:760px;background-size:cover}
  .didascalia-foto{font-family:"${BRAND.font.marchio}",serif;font-style:italic;font-weight:500;font-size:64px;line-height:1.1;color:${T.titolo}}
  .didascalia-foto em{font-size:inherit}
  .elenco{list-style:none;border-top:1px solid ${T.filo}}
  .elenco li{padding:20px 0;border-bottom:1px solid ${T.filo};font-size:32px;color:${T.titolo}}
  .cc-grande{position:absolute;right:-150px;top:50%;transform:translateY(-52%);opacity:.2}
  .piede{position:relative;display:flex;align-items:flex-end;justify-content:space-between}
  .lockup{display:flex;align-items:center;gap:16px;color:${T.marchio}}
  .parola{font-family:"${BRAND.font.marchio}",serif;font-weight:500;font-size:34px;letter-spacing:.32em;text-transform:uppercase;line-height:1}
  .sotto{font-size:13px;font-weight:400;letter-spacing:.3em;text-transform:uppercase;color:${T.tenue};margin-top:10px}
  .sito{font-size:22px;color:${T.tenue}}
`;

const temaDi = (post) => {
  if (post.sfondo) return post.sfondo;
  const n = parseInt(post.id, 10);
  return Number.isNaN(n) || n % 2 === 1 ? 'noce' : 'crema';
};

const pagina = (post) => {
  const [w, h] = BRAND.formati[post.formato || 'post'];
  const modello = MODELLI[post.modello];
  if (!modello) throw new Error(`Modello "${post.modello}" sconosciuto: usa ${Object.keys(MODELLI).join(', ')}`);
  const T = TEMI[temaDi(post)];
  return { w, h, html: `<!doctype html><html><head><meta charset="utf-8">
    <link rel="stylesheet" href="${BRAND.font.googleFonts}"><style>${CSS(T, w, h)}</style></head>
    <body><div class="post">${modello(post, T)}</div><script>
      const bg = [...document.querySelectorAll('[style*="url("]')].map(e => getComputedStyle(e).backgroundImage.match(/url\\("?([^")]+)/)?.[1]).filter(Boolean);
      Promise.all(bg.map(u => new Promise(r => { const im = new Image(); im.onload = im.onerror = r; im.src = u; })))
        .then(() => document.fonts.ready).then(() => document.body.dataset.pronto = '1');
    </script></body></html>` };
};

const didascalia = (p) => {
  const tag = [...BRAND.hashtagBase, ...(p.hashtag || [])].join(' ');
  return [p.didascalia?.it, p.didascalia?.en, tag].filter(Boolean).join('\n\n');
};

// ── Chrome headless via DevTools Protocol ──────────────────────────────────
async function conChrome(fn) {
  const porta = 9400 + Math.floor(Math.random() * 400);
  const p = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${porta}`, '--disable-gpu', '--allow-file-access-from-files', 'about:blank'], { stdio: 'ignore' });
  const attendi = (ms) => new Promise((r) => setTimeout(r, ms));
  let t;
  for (let i = 0; i < 40 && !t; i++) {
    await attendi(250);
    try { t = (await (await fetch(`http://127.0.0.1:${porta}/json`)).json()).find((x) => x.type === 'page'); } catch {}
  }
  if (!t) { p.kill(); throw new Error('Chrome non si è avviato (variabile CHROME per un percorso diverso)'); }
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0; const attese = {};
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (attese[m.id]) { attese[m.id](m.result); delete attese[m.id]; } };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; attese[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  try { await fn(send, attendi); } finally { ws.close(); p.kill(); }
}

// ── Main ───────────────────────────────────────────────────────────────────
const cartella = join(QUI, 'post');
const leggi = () => readdirSync(cartella).filter((f) => f.endsWith('.json')).sort()
  .map((f) => ({ id: f.replace(/\.json$/, ''), ...JSON.parse(readFileSync(join(cartella, f), 'utf8')) }));
const filtro = process.argv.slice(2);
const posts = leggi().filter((p) => !filtro.length || filtro.some((x) => p.id.includes(x)));
mkdirSync(OUT, { recursive: true });

await conChrome(async (send, attendi) => {
  await send('Page.enable');
  for (const post of posts) {
    const { w, h, html } = pagina(post);
    const file = join(OUT, `.${post.id}.html`);
    writeFileSync(file, html);
    await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: pathToFileURL(file).href });
    for (let i = 0; i < 60; i++) {
      await attendi(200);
      const r = await send('Runtime.evaluate', { expression: 'document.body && document.body.dataset.pronto', returnByValue: true });
      if (r?.result?.value === '1') break;
    }
    await attendi(250);
    const s = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: w, height: h, scale: 1 } });
    writeFileSync(join(OUT, `${post.id}.png`), Buffer.from(s.data, 'base64'));
    writeFileSync(join(OUT, `${post.id}.txt`), didascalia(post) + '\n');
    console.log(`✓ ${post.id}  (${post.modello}, ${temaDi(post)})`);
  }
});

// ── Anteprima in stile Instagram ───────────────────────────────────────────
const tutti = leggi().filter((p) => existsSync(join(OUT, `${p.id}.png`)));
writeFileSync(join(OUT, 'anteprima.html'), `<!doctype html><html lang="it"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Anteprima post · ${BRAND.nome}</title>
<link rel="stylesheet" href="${BRAND.font.googleFonts}">
<style>
  body{margin:0;background:#fafafa;font-family:-apple-system,"Helvetica Neue",Arial,sans-serif;color:#111}
  header{max-width:935px;margin:0 auto;padding:40px 16px 24px;display:flex;gap:28px;align-items:center;border-bottom:1px solid #dbdbdb}
  .avatar{width:120px;height:120px;border-radius:50%;background:${C.crema};border:1px solid #dbdbdb;display:grid;place-items:center;flex:none}
  .handle{font-size:20px;margin-bottom:8px} .bio{font-size:14px;line-height:1.5;color:#333}
  .bio b{font-family:"Cormorant Garamond",serif;font-size:20px;font-weight:500} .bio .acc{color:${C.bronzo}}
  .griglia{max-width:935px;margin:24px auto;padding:0 16px;display:grid;grid-template-columns:repeat(3,1fr);gap:4px}
  .griglia a{aspect-ratio:4/5;background:#eee center/cover;display:block}
  h2{max-width:935px;margin:48px auto 16px;padding:0 16px;font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:#888}
  .post{max-width:470px;margin:0 auto 40px;background:#fff;border:1px solid #dbdbdb;border-radius:8px;overflow:hidden}
  .post-testa{display:flex;align-items:center;gap:10px;padding:12px 14px;font-size:14px;font-weight:600}
  .post-testa .mini{width:32px;height:32px;border-radius:50%;border:1px solid #dbdbdb;display:grid;place-items:center;background:${C.crema}}
  .post img{width:100%;display:block}
  .cap{padding:12px 14px 16px;font-size:14px;line-height:1.5;white-space:pre-wrap}
  .cap b{font-weight:600}
  .file{padding:0 14px 14px;font-size:12px;color:#888}
</style></head><body>
<header><div class="avatar">${monogramma(80, C.bronzo)}</div>
  <div><div class="handle">concordiasingers</div>
  <div class="bio"><b>${nome('ConCordia Singers')}</b><br>Vocal ensemble · Milano<br>Ogni domenica a San Ferdinando, accanto alla Bocconi<br><span style="color:#00376b">${BRAND.sito}</span></div></div></header>
<h2>Griglia del profilo (il più recente in alto a sinistra)</h2>
<div class="griglia">${[...tutti].reverse().map((p) => `<a href="#${p.id}" style="background-image:url('${p.id}.png')"></a>`).join('')}</div>
<h2>Post uno per uno (in ordine di pubblicazione)</h2>
${tutti.map((p) => `<article class="post" id="${p.id}">
  <div class="post-testa"><span class="mini">${monogramma(24, C.bronzo)}</span>concordiasingers</div>
  <img src="${p.id}.png" alt="">
  <div class="cap"><b>concordiasingers</b> ${esc(didascalia(p))}</div>
  <div class="file">${p.id}.png · didascalia in ${p.id}.txt</div>
</article>`).join('')}
</body></html>`);
console.log(`\nAnteprima: ${join(OUT, 'anteprima.html')}`);
