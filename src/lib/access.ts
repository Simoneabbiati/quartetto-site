export const TEAM_DOMAIN = 'https://jolly-meadow-0b7f.cloudflareaccess.com';

/**
 * Email verificata da Cloudflare Access. Non arriva mai da input utente:
 * l'header è impostato da Access solo dopo un login riuscito, quindi è
 * la fonte affidabile per identificare chi sta facendo la richiesta.
 */
export function getAccessEmail(request: Request): string | null {
  return request.headers.get('cf-access-authenticated-user-email');
}

export interface Corista {
  email: string;
  nome: string;
  voce: string;
}

export async function getCorista(db: any, email: string): Promise<Corista | null> {
  if (!db || !email) return null;
  return db.prepare('SELECT email, nome, voce FROM coristi WHERE email = ?').bind(email).first();
}
