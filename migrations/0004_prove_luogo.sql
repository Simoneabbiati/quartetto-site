-- Indirizzo vero e proprio, separato dal nome del luogo: serve per aprire le
-- mappe / il navigatore e per l'evento di Google Calendar.
-- `luogo` resta il nome con cui i coristi lo chiamano ("San Ferdinando in
-- Bocconi"), `indirizzo` è quello che si dà a un navigatore.
ALTER TABLE prove ADD COLUMN indirizzo TEXT;

-- Ora di fine: Google Calendar rifiuta un evento senza orario di fine.
-- Se resta vuota, il sito assume due ore dall'inizio.
ALTER TABLE prove ADD COLUMN ora_fine TEXT;
