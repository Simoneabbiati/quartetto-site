export const prerender = false;

import type { APIRoute } from 'astro';
import { getAccessEmail } from '../../../lib/access';

// Risponde 200 solo a chi ha fatto il login (il percorso è dietro Cloudflare
// Access): le pagine pubbliche lo usano per mostrare ai coristi i link agli
// spartiti. A chi non è loggato Access risponde con un redirect al login.
export const GET: APIRoute = async ({ request }) => {
  const email = getAccessEmail(request);
  return new Response(JSON.stringify({ ok: !!email }), {
    status: email ? 200 : 401,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
};
