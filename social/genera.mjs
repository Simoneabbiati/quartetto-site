#!/usr/bin/env node
// Genera i post per Instagram/Facebook dai file in social/post/*.json, nello
// stile del marchio (BRAND.md, brand.json). Per ogni post scrive in social/out/:
//   <id>.png           immagine 1080×1350 (o 1080×1920 per le storie)
//   <id>.txt           didascalia pronta da incollare (IT + EN + hashtag)
// e una pagina di anteprima social/out/anteprima.html che mostra i post come
// nel feed di Instagram.
//
//   node social/genera.mjs            tutti i post
//   node social/genera.mjs 02-voci    solo quello (o quelli) con questo id
//
// Usa Google Chrome già installato (headless), nessuna dipendenza.

import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const QUI = dirname(fileURLToPath(import.meta.url));
const RADICE = resolve(QUI, '..');
const OUT = join(QUI, 'out');
const BRAND = JSON.parse(readFileSync(join(QUI, 'brand.json'), 'utf8'));
const C = BRAND.colori; // inchiostro, avorio, grigio, sabbia, bronzo, oro
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// ── Pezzi grafici ──────────────────────────────────────────────────────────
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// La seconda C di ConCordia in blu Klein, ovunque compaia il nome.
const nome = (s) => esc(s).replace(/Con[Cc]ordia/g, `Con<span class="k">C</span>ordia`);
// *testo* → corsivo (titoli di brani, parole latine)
const corsivo = (s) => nome(s).replace(/\*([^*]+)\*/g, '<em>$1</em>');
const a_capo = (s) => corsivo(s).replace(/\n/g, '<br>');

const monogramma = (px, colore = C.bronzo) => `
  <svg width="${px}" height="${px}" viewBox="20 20 165 165" aria-hidden="true">
    <g font-family="${BRAND.font.marchio}" font-weight="500" fill="${colore}">
      <text x="84" y="154" font-size="190" text-anchor="middle">C</text>
      <text transform="translate(142 130) scale(-1 1)" font-size="104" text-anchor="middle">C</text>
    </g>
  </svg>`;

const logo = (scuro = false) => `
  <div class="logo">${monogramma(66, scuro ? C.oro : C.bronzo)}
    <div><div class="logo-nome">Concordia</div><div class="logo-desc">singers · ${BRAND.descrizione}</div></div>
  </div>`;

const foto = (n) => {
  const p = join(RADICE, 'public/images/home', `${n}-1600.webp`);
  if (!existsSync(p)) throw new Error(`Foto "${n}" non trovata in public/images/home (es. chiesa, spartiti, palco, altare, pianoforte, tastiera, spartiti-coro)`);
  return pathToFileURL(p).href;
};

const ONDA = [0.2,0.22,0.62,0.96,0.96,0.85,0.86,0.81,0.64,0.64,0.74,0.84,0.94,0.62,0.58,0.42,0.3,0.44,0.66,0.65,0.72,0.61,0.75,0.63,0.74,0.93,0.92,0.63,0.43,0.46,0.47,0.35,0.58,0.69,0.74,0.81,0.86,0.68,0.72,0.73,0.96,1,0.88,0.48,0.44,0.31,0.39,0.6,0.69,0.78,0.65,0.62,0.67,0.85,0.57,0.66,0.6,0.59,0.44,0.37,0.27,0.21,0.13,0.12];

// ── Modelli ────────────────────────────────────────────────────────────────
const MODELLI = {
  // Foto a tutta pagina, sfumata in basso, logo e una riga di testo.
  foto: (p) => `
    <div class="pagina scura" style="background:#000 url('${foto(p.foto)}') ${p.posizione || 'center'}/cover">
      <div class="velo"></div>
      <div class="fondo">
        ${p.etichetta ? `<div class="etichetta chiara">${esc(p.etichetta)}</div>` : ''}
        ${p.titolo ? `<div class="titolo-foto">${a_capo(p.titolo)}</div>` : ''}
        <div class="riga">${logo(true)}</div>
      </div>
    </div>`,

  // Fondo bianco, una frase grande, monogramma in basso.
  citazione: (p) => `
    <div class="pagina">
      <div class="alto"><span class="pallino"></span>${esc(p.etichetta || BRAND.descrizione)}</div>
      <div class="centro"><div class="citazione">${a_capo(p.titolo)}</div>
        ${p.firma ? `<div class="firma">${corsivo(p.firma)}</div>` : ''}</div>
      <div class="riga">${logo()}</div>
    </div>`,

  // Annuncio: titolo grande + dettagli (concerti, prove aperte, ricerca voci).
  annuncio: (p) => `
    <div class="pagina">
      <div class="alto"><span class="pallino"></span>${esc(p.etichetta || 'Annuncio')}</div>
      <div class="centro">
        <div class="titolo-grande">${a_capo(p.titolo)}</div>
        ${p.testo ? `<div class="testo">${a_capo(p.testo)}</div>` : ''}
        ${(p.dettagli || []).length ? `<dl class="dettagli">${p.dettagli.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${corsivo(v)}</dd></div>`).join('')}</dl>` : ''}
      </div>
      <div class="riga">${logo()}<div class="sito">${BRAND.sito}</div></div>
    </div>`,

  // Ascolta: fondo nero, brano in corsivo, forma d'onda.
  ascolta: (p) => `
    <div class="pagina scura" style="background:${C.inchiostro}">
      <div class="alto chiara"><span class="pallino"></span>${esc(p.etichetta || 'Ascolta')}</div>
      <div class="centro">
        <div class="brano">${corsivo(p.titolo)}</div>
        ${p.testo ? `<div class="testo chiaro">${a_capo(p.testo)}</div>` : ''}
        <div class="onda">${ONDA.map((h, i) => `<span style="height:${Math.round(h * 100)}%;${i < ONDA.length * 0.38 ? `background:${C.oro}` : ''}"></span>`).join('')}</div>
        <div class="play">▶︎ ${esc(p.durata || '0:28')}</div>
      </div>
      <div class="riga">${logo(true)}</div>
    </div>`,
};

const CSS = (w, h) => `
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:${w}px;height:${h}px;overflow:hidden;background:${C.avorio}}
  body{font-family:"${BRAND.font.testo}",sans-serif;color:${C.inchiostro};-webkit-font-smoothing:antialiased}
  .k{color:${C.bronzo}}
  em{font-family:"${BRAND.font.corsivo}",serif;font-style:italic;letter-spacing:0}
  .pagina{position:relative;width:${w}px;height:${h}px;padding:88px 84px 80px;display:flex;flex-direction:column}
  .scura{color:#fff}
  .scura .k{color:${C.oro}}
  .velo{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0) 45%,rgba(0,0,0,.72) 100%)}
  .fondo{position:relative;margin-top:auto;display:flex;flex-direction:column;gap:28px}
  .alto{display:flex;align-items:center;gap:14px;font-size:26px;letter-spacing:.04em;color:${C.grigio}}
  .alto.chiara,.etichetta.chiara{color:rgba(255,255,255,.75)}
  .etichetta{font-size:26px;letter-spacing:.04em}
  .pallino{width:14px;height:14px;border-radius:50%;background:${C.bronzo};display:inline-block}
  .centro{margin:auto 0;display:flex;flex-direction:column;gap:40px}
  .riga{display:flex;align-items:flex-end;justify-content:space-between}
  .logo{display:flex;align-items:center;gap:18px}
  .logo-nome{font-family:"${BRAND.font.marchio}",serif;font-weight:500;font-size:36px;line-height:1;letter-spacing:.32em;text-transform:uppercase}
  .logo-desc{font-size:14px;letter-spacing:.34em;text-transform:uppercase;opacity:.7;margin-top:10px}
  .sito{font-size:22px;color:${C.grigio};letter-spacing:.02em}
  .titolo-foto{font-family:"${BRAND.font.marchio}",serif;font-size:76px;line-height:1.05;font-weight:400;max-width:880px}
  .citazione{font-family:"${BRAND.font.marchio}",serif;font-size:82px;line-height:1.08;font-weight:400;}
  .firma{font-size:28px;color:${C.grigio}}
  .titolo-grande{font-family:"${BRAND.font.marchio}",serif;font-size:104px;line-height:1;font-weight:400;}
  .testo{font-size:34px;line-height:1.4;color:#3A352E;max-width:820px}
  .testo.chiaro{color:rgba(255,255,255,.78)}
  .dettagli{display:flex;flex-direction:column;border-top:1px solid #E5DDD0}
  .dettagli div{display:flex;gap:28px;padding:18px 0;border-bottom:1px solid #E5DDD0;font-size:30px}
  .dettagli dt{width:170px;color:${C.grigio};flex:none}
  .brano{font-family:"${BRAND.font.corsivo}",serif;font-style:italic;font-size:140px;line-height:1}
  .brano em{font-size:inherit}
  .onda{height:150px;display:flex;align-items:center;gap:5px}
  .onda span{flex:1;min-height:6px;border-radius:3px;background:rgba(255,255,255,.28)}
  .play{font-size:28px;letter-spacing:.04em;color:rgba(255,255,255,.7)}
`;

const pagina = (post) => {
  const [w, h] = BRAND.formati[post.formato || 'post'];
  const modello = MODELLI[post.modello];
  if (!modello) throw new Error(`Modello "${post.modello}" sconosciuto: usa ${Object.keys(MODELLI).join(', ')}`);
  return { w, h, html: `<!doctype html><html><head><meta charset="utf-8">
    <link rel="stylesheet" href="${BRAND.font.googleFonts}"><style>${CSS(w, h)}</style></head>
    <body>${modello(post)}<script>
      Promise.all([document.fonts.ready, ...[...document.images].map(i => i.decode().catch(()=>{}))])
        .then(() => document.body.dataset.pronto = '1');
      // le immagini di sfondo CSS: precaricate a mano
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
const filtro = process.argv.slice(2);
const cartella = join(QUI, 'post');
const posts = readdirSync(cartella).filter((f) => f.endsWith('.json')).sort()
  .map((f) => ({ id: f.replace(/\.json$/, ''), ...JSON.parse(readFileSync(join(cartella, f), 'utf8')) }))
  .filter((p) => !filtro.length || filtro.some((x) => p.id.includes(x)));
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
    console.log(`✓ ${post.id}  (${post.modello}, ${w}×${h})`);
  }
});

// ── Anteprima in stile Instagram ───────────────────────────────────────────
const tutti = readdirSync(cartella).filter((f) => f.endsWith('.json')).sort()
  .map((f) => ({ id: f.replace(/\.json$/, ''), ...JSON.parse(readFileSync(join(cartella, f), 'utf8')) }))
  .filter((p) => existsSync(join(OUT, `${p.id}.png`)));
writeFileSync(join(OUT, 'anteprima.html'), `<!doctype html><html lang="it"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Anteprima post · ${BRAND.nome}</title>
<link rel="stylesheet" href="${BRAND.font.googleFonts}">
<style>
  body{margin:0;background:#fafafa;font-family:-apple-system,"Helvetica Neue",Arial,sans-serif;color:#111}
  header{max-width:935px;margin:0 auto;padding:40px 16px 24px;display:flex;gap:28px;align-items:center;border-bottom:1px solid #dbdbdb}
  .avatar{width:120px;height:120px;border-radius:50%;background:#fff;border:1px solid #dbdbdb;display:grid;place-items:center;flex:none}
  .handle{font-size:20px;margin-bottom:8px} .bio{font-size:14px;line-height:1.5;color:#333}
  .bio b{font-family:"Italiana",serif;font-size:20px;font-weight:400} .bio .k{color:${C.bronzo}}
  .griglia{max-width:935px;margin:24px auto;padding:0 16px;display:grid;grid-template-columns:repeat(3,1fr);gap:4px}
  .griglia a{aspect-ratio:4/5;background:#eee center/cover;display:block}
  h2{max-width:935px;margin:48px auto 16px;padding:0 16px;font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:#888}
  .post{max-width:470px;margin:0 auto 40px;background:#fff;border:1px solid #dbdbdb;border-radius:8px;overflow:hidden}
  .post-testa{display:flex;align-items:center;gap:10px;padding:12px 14px;font-size:14px;font-weight:600}
  .post-testa .mini{width:32px;height:32px;border-radius:50%;border:1px solid #dbdbdb;display:grid;place-items:center;background:${C.avorio}}
  .post img{width:100%;display:block}
  .azioni{padding:10px 14px 0;font-size:22px;letter-spacing:10px}
  .cap{padding:8px 14px 16px;font-size:14px;line-height:1.5;white-space:pre-wrap}
  .cap b{font-weight:600}
  .file{padding:0 14px 14px;font-size:12px;color:#888}
</style></head><body>
<header><div class="avatar">${monogramma(78)}</div>
  <div><div class="handle">concordiasingers</div>
  <div class="bio"><b>${nome(BRAND.nome)}</b><br>Vocal ensemble · Milano 🇮🇪🇺🇸🇪🇪🇹🇷🇮🇹<br>Ogni domenica a San Ferdinando, accanto alla Bocconi<br><span style="color:#00376b">${BRAND.sito}</span></div></div></header>
<h2>Griglia del profilo (il più recente in alto a sinistra)</h2>
<div class="griglia">${[...tutti].reverse().map((p) => `<a href="#${p.id}" style="background-image:url('${p.id}.png')"></a>`).join('')}</div>
<h2>Post uno per uno</h2>
${tutti.map((p) => `<article class="post" id="${p.id}">
  <div class="post-testa"><span class="mini">${monogramma(22)}</span>concordiasingers</div>
  <img src="${p.id}.png" alt="">
  <div class="azioni">♡ ◯ ➤</div>
  <div class="cap"><b>concordiasingers</b> ${esc(didascalia(p))}</div>
  <div class="file">${p.id}.png · didascalia in ${p.id}.txt</div>
</article>`).join('')}
</body></html>`);
console.log(`\nAnteprima: ${join(OUT, 'anteprima.html')}`);
