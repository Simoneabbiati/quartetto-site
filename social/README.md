# Post per Instagram e Facebook

Tutto lo stile è in [BRAND.md](BRAND.md) (regole) e [brand.json](brand.json)
(colori, caratteri, formati, hashtag di base).

## Creare un post

1. Copia uno dei file in `post/` (es. `02-cerchiamo-voci.json`) con un nuovo
   numero e nome: `05-concerto-natale.json`. I numeri decidono l'ordine.
2. Scegli il `modello`:
   - `foto` — una nostra foto a tutta pagina (`foto`: chiesa, spartiti,
     spartiti-coro, palco, altare, pianoforte, tastiera; `posizione`
     opzionale, es. `"center 30%"`), `etichetta` e `titolo` in basso.
   - `annuncio` — `titolo`, `testo`, `dettagli` (coppie `["Quando", "…"]`).
   - `ascolta` — `titolo` del brano (tra `*asterischi*` va in corsivo),
     `testo`, `durata`.
   - `citazione` — `titolo` (la frase), `firma` opzionale.
   - `"formato": "storia"` per una storia 1080×1920 (di default 1080×1350).
3. Scrivi la `didascalia` in `it` e `en` e 2–3 `hashtag` sul contenuto (quelli
   di base si aggiungono da soli).
4. Lancia:
   ```bash
   node social/genera.mjs              # tutti
   node social/genera.mjs 05           # solo il post 05
   ```
5. Apri `social/out/anteprima.html`: vedi la griglia del profilo e ogni post
   con la sua didascalia, come su Instagram. Le immagini sono in
   `social/out/<id>.png`, le didascalie da incollare in `social/out/<id>.txt`.

`ConCordia` si colora da solo (seconda C in blu), `\n` va a capo. Serve solo
Google Chrome installato; nessun pacchetto da installare. `out/` non va su git.

Per aggiungere foto nuove: mettile ottimizzate in `public/images/home/` come
`<nome>-1600.webp` (o chiedi a Claude di farlo).
