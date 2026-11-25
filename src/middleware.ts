import { defineMiddleware } from 'astro:middleware';
import { TEAM_DOMAIN } from './lib/access';

// L'area riservata si apre solo con un login di Cloudflare Access *verificato*:
// controlliamo la firma del token (Cf-Access-Jwt-Assertion) con le chiavi
// pubbliche del team, l'emittente, la scadenza e l'applicazione (aud). Non ci
// fidiamo del solo header con l'email, che chiunque può inviare se la richiesta
// non passa da Access (è successo: concordiasingers.it non era protetto).
// Se manca un login valido, l'area resta chiusa: meglio chiusa che aperta.

// AUD dell'applicazione Access dell'area riservata (aggiungere i nuovi domini
// a questa stessa applicazione, così l'AUD non cambia).
const AUD = '47e4fd3d4441c7c03a92d3de7a3970a5cbdaf90c98cfb17a5e4b16f26c286511';

let chiavi: { kid: string; key: CryptoKey }[] | null = null;
let chiaviScadenza = 0;

async function chiaviPubbliche() {
  if (chiavi && Date.now() < chiaviScadenza) return chiavi;
  const res = await fetch(`${TEAM_DOMAIN}/cdn-cgi/access/certs`);
  const { keys } = (await res.json()) as { keys: (JsonWebKey & { kid: string })[] };
  chiavi = await Promise.all(
    keys.map(async (k) => ({
      kid: k.kid,
      key: await crypto.subtle.importKey('jwk', k, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']),
    }))
  );
  chiaviScadenza = Date.now() + 60 * 60 * 1000; // le chiavi ruotano di rado
  return chiavi;
}

function base64url(s: string): Uint8Array {
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
}

/** Email del token se è valido, altrimenti null. */
async function emailVerificata(token: string | null): Promise<string | null> {
  if (!token) return null;
  const parti = token.split('.');
  if (parti.length !== 3) return null;
  try {
    const intestazione = JSON.parse(new TextDecoder().decode(base64url(parti[0])));
    const dati = JSON.parse(new TextDecoder().decode(base64url(parti[1])));
    const chiave = (await chiaviPubbliche()).find((k) => k.kid === intestazione.kid);
    if (!chiave || intestazione.alg !== 'RS256') return null;
    const firmaValida = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      chiave.key,
      base64url(parti[2]),
      new TextEncoder().encode(`${parti[0]}.${parti[1]}`)
    );
    const ora = Math.floor(Date.now() / 1000);
    const aud = Array.isArray(dati.aud) ? dati.aud : [dati.aud];
    if (!firmaValida || dati.iss !== TEAM_DOMAIN || !aud.includes(AUD) || !(dati.exp > ora)) return null;
    return typeof dati.email === 'string' ? dati.email : null;
  } catch {
    return null;
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (!context.url.pathname.startsWith('/riservato')) return next();

  const token = context.request.headers.get('cf-access-jwt-assertion');
  const email = await emailVerificata(token);
  const dichiarata = context.request.headers.get('cf-access-authenticated-user-email');

  // Valido solo se c'è un token firmato e l'email dell'header è la stessa.
  if (email && (!dichiarata || dichiarata.toLowerCase() === email.toLowerCase())) {
    return next();
  }

  if (context.url.pathname.startsWith('/riservato/api/')) {
    return new Response(JSON.stringify({ error: 'Non autenticato' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }
  return new Response(
    `<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Area riservata · Concordia Singers</title>
<body style="font-family:system-ui,sans-serif;max-width:34rem;margin:15vh auto;padding:0 16px;color:#1a2535;line-height:1.5">
<h1 style="font-weight:500">Area riservata</h1>
<p>L'area dei coristi è momentaneamente chiusa mentre sistemiamo il login. Riapre a breve.</p>
<p lang="en" style="color:#5a6572">The members area is temporarily closed while we fix the sign-in. It will reopen shortly.</p>
<p><a href="/">concordiasingers.it</a></p>
</body></html>`,
    { status: 401, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } }
  );
});
