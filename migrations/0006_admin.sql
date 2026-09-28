-- Coristi amministratori: possono segnare la presenza anche per gli altri
-- (es. chi non usa il sito, o le risposte arrivate a voce/WhatsApp).
-- Chi è admin NON è scritto qui (repository pubblico, email = dati personali):
--   npx wrangler d1 execute quartetto-db --remote \
--     --command="UPDATE coristi SET admin = 1 WHERE email = '...'"
ALTER TABLE coristi ADD COLUMN admin INTEGER NOT NULL DEFAULT 0;
