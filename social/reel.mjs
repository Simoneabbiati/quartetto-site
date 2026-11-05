#!/usr/bin/env node
// Reel 1080×1920 da un post "ascolta" con audio: lo stile del post (BRAND.md),
// la forma d'onda calcolata dall'audio vero, le barre che si colorano d'oro a
// tempo col brano, il contatore che avanza. Scrive social/out/<id>.mp4.
//
//   node social/reel.mjs 07            il post il cui nome contiene "07"
//
// Il post deve avere "audio": percorso dell'mp3 dalla radice del sito
// (es. "public/audio/allelujah.mp3"). Servono Google Chrome e ffmpeg.

import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const QUI = dirname(fileURLToPath(import.meta.url));
const RADICE = resolve(QUI, '..');
const OUT = join(QUI, 'out');
const BRAND = JSON.parse(readFileSync(join(QUI, 'brand.json'), 'utf8'));
const C = BRAND.colori;
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const W = 1080, H = 1920, FPS = 30;
const CODA = 2.5;   // secondi finali, a brano finito, con il sito
const BARRE = 64;

const filtro = process.argv[2];
if (!filtro) { console.error('Uso: node social/reel.mjs <numero o nome del post>'); process.exit(1); }
const file = readdirSync(join(QUI, 'post')).find((f) => f.endsWith('.json') && f.includes(filtro));
if (!file) throw new Error(`Nessun post contiene "${filtro}"`);
const id = file.replace(/\.json$/, '');
const post = JSON.parse(readFileSync(join(QUI, 'post', file), 'utf8'));
if (!post.audio) throw new Error(`Il post ${id} non ha "audio"`);
const audio = join(RADICE, post.audio);

// ── Forma d'onda dall'audio: RMS per barra, normalizzato ───────────────────
const durata = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', audio]).toString());
const pcm = execFileSync('ffmpeg', ['-v', 'error', '-i', audio, '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], { maxBuffer: 1 << 26 });
const campioni = new Int16Array(pcm.buffer, pcm.byteOffset, pcm.length >> 1);
const rms = (a, b) => { let s = 0; for (let i = a; i < b; i++) s += campioni[i] ** 2; return Math.sqrt(s / Math.max(1, b - a)); };
const passo = campioni.length / BARRE;
let onda = Array.from({ length: BARRE }, (_, i) => rms(Math.floor(i * passo), Math.floor((i + 1) * passo)));
const max = Math.max(...onda);
onda = onda.map((v) => Math.max(0.08, v / max));
// Intensità istante per istante (per far "respirare" la barra che suona)
const fotogrammi = Math.ceil((durata + CODA) * FPS);
const perFot = 8000 / FPS;
let livello = Array.from({ length: fotogrammi }, (_, f) => rms(Math.floor(f * perFot), Math.floor((f + 1) * perFot)));
const maxL = Math.max(...livello);
livello = livello.map((v) => v / maxL);

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const ricco = (s) => esc(s).replace(/Con[Cc]ordia/g, 'Con<span class="acc">C</span>ordia').replace(/\*([^*]+)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

const monogramma = (px, colore) => `<svg width="${px}" height="${px}" viewBox="20 20 165 165"><g font-family="${BRAND.font.marchio}" font-weight="500" fill="${colore}"><text x="84" y="154" font-size="190" text-anchor="middle">C</text><text transform="translate(143 131) scale(-1 1)" font-size="114" text-anchor="middle">C</text></g></svg>`;

// Zone sicure dei Reel: in alto e in basso Instagram copre con i suoi comandi,
// quindi il contenuto sta fra 250 px dall'alto e 420 px dal basso.
const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="${BRAND.font.googleFonts}">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:${W}px;height:${H}px;overflow:hidden;background:${C.noce}}
  body{font-family:"${BRAND.font.testo}",sans-serif;font-weight:300;color:${C.testoSuNoce};-webkit-font-smoothing:antialiased}
  .post{position:absolute;inset:250px 96px 420px;display:flex;flex-direction:column}
  .acc{color:${C.oroChiaro}}
  .etichetta{display:flex;align-items:center;gap:16px;font-size:30px;font-weight:400;color:${C.tenueSuNoce}}
  .punto{width:13px;height:13px;border-radius:50%;background:${C.oroChiaro}}
  .centro{margin:auto 0;display:flex;flex-direction:column;gap:44px}
  .brano{font-family:"${BRAND.font.marchio}",serif;font-style:italic;font-weight:500;font-size:190px;line-height:1;color:${C.titoloSuNoce}}
  .testo{font-size:38px;line-height:1.45}
  .onda{height:170px;display:flex;align-items:center;gap:7px;margin-top:20px}
  .onda span{flex:1;min-height:8px;border-radius:4px;background:rgba(248,245,239,.32);transform-origin:center}
  .durata{display:flex;align-items:center;gap:16px;font-size:30px;font-weight:400;color:${C.tenueSuNoce};font-variant-numeric:tabular-nums}
  .play{width:0;height:0;border-left:18px solid ${C.oroChiaro};border-top:11px solid transparent;border-bottom:11px solid transparent}
  .piede{display:flex;align-items:flex-end;justify-content:space-between}
  .lockup{display:flex;align-items:center;gap:18px;color:${C.titoloSuNoce}}
  .parola{font-family:"${BRAND.font.marchio}",serif;font-weight:500;font-size:38px;letter-spacing:.32em;text-transform:uppercase;line-height:1}
  .sotto{font-size:15px;font-weight:400;letter-spacing:.3em;text-transform:uppercase;color:${C.tenueSuNoce};margin-top:12px}
  .sito{font-size:28px;color:${C.tenueSuNoce}}
  .entra{opacity:0}
</style></head><body><div class="post">
  <div class="etichetta entra" id="e1"><span class="punto"></span>${esc(post.etichetta || 'Ascolta')}</div>
  <div class="centro">
    <div class="brano entra" id="e2">${ricco(post.titolo.replace(/\*/g, ''))}</div>
    ${post.testo ? `<div class="testo entra" id="e3">${ricco(post.testo)}</div>` : ''}
    <div class="onda" id="onda">${onda.map(() => '<span></span>').join('')}</div>
    <div class="durata entra" id="e4"><span class="play"></span><span><span id="tempo">0:00</span> / ${mmss(durata)}</span></div>
  </div>
  <div class="piede entra" id="e5">
    <div class="lockup">${monogramma(66, C.oroChiaro)}<div><div class="parola">Concordia</div><div class="sotto">Singers · Vocal ensemble</div></div></div>
    <div class="sito entra" id="sito">${BRAND.sito}</div>
  </div>
</div><script>
  const ONDA = ${JSON.stringify(onda)}, LIV = ${JSON.stringify(livello)}, DUR = ${durata}, FPS = ${FPS};
  const barre = [...document.querySelectorAll('#onda span')];
  const morbido = (x) => { x = Math.min(1, Math.max(0, x)); return 1 - Math.pow(1 - x, 3); };
  const entra = (el, t0, t) => { if (!el) return; const k = morbido((t - t0) / .7); el.style.opacity = k; el.style.transform = 'translateY(' + (1 - k) * 24 + 'px)'; };
  const ORO = [201,166,107], SBI = [248,245,239];
  window.disegna = (f) => {
    const t = f / FPS;
    entra(document.getElementById('e1'), 0, t);
    entra(document.getElementById('e2'), .15, t);
    entra(document.getElementById('e3'), .35, t);
    entra(document.getElementById('e4'), .5, t);
    entra(document.getElementById('e5'), .6, t);
    entra(document.getElementById('sito'), DUR + .3, t);
    const avanzamento = Math.min(1, t / DUR) * barre.length;
    const liv = LIV[Math.min(LIV.length - 1, f)] || 0;
    barre.forEach((b, i) => {
      // Le barre crescono in sequenza nel primo secondo
      const crescita = morbido((t - .3 - i * .012) / .6);
      const pieno = Math.min(1, Math.max(0, avanzamento - i));       // 0 = da suonare, 1 = suonata
      const corrente = avanzamento > i && avanzamento < i + 1 && t < DUR;
      const respiro = corrente ? 1 + .25 * liv : 1;
      b.style.height = (ONDA[i] * 100 * crescita) + '%';
      b.style.transform = 'scaleY(' + respiro + ')';
      if (pieno >= 1) b.style.background = 'rgb(' + ORO + ')';
      else if (pieno <= 0) b.style.background = 'rgba(' + SBI + ',.32)';
      else b.style.background = 'linear-gradient(90deg, rgb(' + ORO + ') ' + pieno * 100 + '%, rgba(' + SBI + ',.32) ' + pieno * 100 + '%)';
    });
    const s = Math.min(DUR, t);
    document.getElementById('tempo').textContent = Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  };
  disegna(0);
  document.fonts.ready.then(() => document.body.dataset.pronto = '1');
</script></body></html>`;

// ── Fotogrammi con Chrome headless ─────────────────────────────────────────
const tmp = join(OUT, `.reel-${id}`);
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
const pagina = join(tmp, 'reel.html');
writeFileSync(pagina, html);

const porta = 9400 + Math.floor(Math.random() * 400);
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${porta}`, '--disable-gpu', 'about:blank'], { stdio: 'ignore' });
const attendi = (ms) => new Promise((r) => setTimeout(r, ms));
let t;
for (let i = 0; i < 40 && !t; i++) {
  await attendi(250);
  try { t = (await (await fetch(`http://127.0.0.1:${porta}/json`)).json()).find((x) => x.type === 'page'); } catch {}
}
const ws = new WebSocket(t.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let n = 0; const attese = {};
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (attese[m.id]) { attese[m.id](m.result); delete attese[m.id]; } };
const send = (method, params = {}) => new Promise((r) => { const i = ++n; attese[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
await send('Page.enable');
await send('Page.navigate', { url: pathToFileURL(pagina).href });
for (let i = 0; i < 60; i++) {
  await attendi(200);
  const r = await send('Runtime.evaluate', { expression: 'document.body && document.body.dataset.pronto', returnByValue: true });
  if (r?.result?.value === '1') break;
}
await attendi(300);
for (let f = 0; f < fotogrammi; f++) {
  await send('Runtime.evaluate', { expression: `disegna(${f})` });
  const s = await send('Page.captureScreenshot', { format: 'jpeg', quality: 95, clip: { x: 0, y: 0, width: W, height: H, scale: 1 } });
  writeFileSync(join(tmp, `f${String(f).padStart(5, '0')}.jpg`), Buffer.from(s.data, 'base64'));
  if (f % 150 === 0) console.log(`fotogramma ${f}/${fotogrammi}`);
}
ws.close(); chrome.kill();

// ── Video + audio ──────────────────────────────────────────────────────────
const mp4 = join(OUT, `${id}.mp4`);
execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', join(tmp, 'f%05d.jpg'), '-i', audio,
  '-filter_complex', `[1:a]apad=pad_dur=${CODA}[a]`, '-map', '0:v', '-map', '[a]',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'slow',
  '-c:a', 'aac', '-b:a', '192k', '-t', String(fotogrammi / FPS), '-movflags', '+faststart', mp4]);
rmSync(tmp, { recursive: true, force: true });
console.log(`\nReel: ${mp4}`);
