export const TEAM_DOMAIN = 'https://jolly-meadow-0b7f.cloudflareaccess.com';

/**
 * Email verificata da Cloudflare Access. Non arriva mai da input utente:
 * l'header è impostato da Access solo dopo un login riuscito, quindi è
 * la fonte affidabile per identificare chi sta facendo la richiesta.
 */
// Email presa dal token di Access *verificato* dal middleware (src/middleware.ts),
// legata alla richiesta. Non si legge più l'header in chiaro: Access non lo
// manda sempre, e senza Access davanti chiunque potrebbe inventarlo.
const emailVerificate = new WeakMap<Request, string>();

export function impostaEmailVerificata(request: Request, email: string) {
  emailVerificate.set(request, email.toLowerCase());
}

export function getAccessEmail(request: Request): string | null {
  return emailVerificate.get(request) ?? null;
}

export interface Corista {
  email: string;
  nome: string;
  voce: string;
  admin: number;
}

export async function getCorista(db: any, email: string): Promise<Corista | null> {
  if (!db || !email) return null;
  return db.prepare('SELECT email, nome, voce, admin FROM coristi WHERE lower(email) = ?').bind(email.toLowerCase()).first();
}
