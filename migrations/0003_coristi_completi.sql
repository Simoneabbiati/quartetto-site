-- Aggiunge i coristi mancanti in anagrafica, con le voci già dichiarate nelle
-- schede pubbliche del sito.
--
-- Nota: la colonna `email` è la chiave usata anche da Cloudflare Access per
-- riconoscere chi ha fatto il login. Per chi non ha ancora un indirizzo
-- registrato uso uno slug provvisorio: non è un indirizzo valido (quindi non
-- rischia di ricevere posta per errore) e serve solo a tenere insieme le
-- presenze. Quando arriva l'email vera va aggiornata QUI e in `presenze`.

INSERT INTO coristi (email, nome, voce) VALUES
  ('sara-sorensen',    'Sara Sorensen',      'soprano'),
  ('aisling-deegan',   'Aisling Deegan',     'contralto'),
  ('giovanni-de-luca', 'Giovanni De Luca',   'tenore'),
  ('erik-toomet-bjorck','Erik Toomet-Björck','tenore'),
  ('vecdi',            'Vecdi',              'basso');
