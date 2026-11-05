# Post per Instagram e Facebook

Tutto lo stile è in [BRAND.md](BRAND.md) (regole) e [brand.json](brand.json)
(colori, caratteri, formati, hashtag di base).

## Creare un post

1. Copia uno dei file in `post/` (es. `02-cerchiamo-voci.json`) con un nuovo
   numero e nome: `05-concerto-natale.json`. I numeri decidono l'ordine.
2. Scegli il `modello` (dettagli in [BRAND.md](BRAND.md)):
   - `dichiarazione` — `titolo` breve e `testo`, grande doppia C sullo sfondo.
   - `annuncio` — `titolo`, `testo`, `sopratitolo` opzionale, `dettagli`
     (coppie `["Quando", "…"]`).
   - `citazione` — `titolo` (la frase), `firma` opzionale.
   - `ascolta` — `titolo` del brano (va in corsivo), `testo`, `durata`.
   - `foto` — `foto` (chiesa, spartiti, spartiti-coro, palco, pianoforte,
     tastiera, bocconi), `posizione` opzionale (es. `"center 30%"`), `titolo`.
   - `elenco` — `titolo` e `voci` (lista).
   Sempre: `etichetta` (la categoria in alto). Opzionali: `"sito": true` per
   mostrare concordiasingers.it in basso a destra, `"sfondo": "crema"|"noce"`
   per forzare il fondo (altrimenti alterna a scacchiera), `"formato": "storia"`
   per 1080×1920.
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

`ConCordia` si colora da solo (seconda C in bronzo o oro), `\n` va a capo, `*testo*` va in corsivo (titoli di brani, latino). Niente emoji. Serve solo
Google Chrome installato; nessun pacchetto da installare. `out/` non va su git.

Per aggiungere foto nuove: mettile ottimizzate in `public/images/home/` come
`<nome>-1600.webp` (o chiedi a Claude di farlo).

## Reel con audio

Per un post `ascolta` con il campo `"audio"` (es. `"public/audio/allelujah.mp3"`):

```bash
node social/reel.mjs 07
```

Crea `social/out/07-suantrai.mp4`: un video verticale 1080×1920 nello stile del
post, con l'audio. La forma d'onda è calcolata dall'audio e si colora d'oro a
tempo col brano. Alla fine restano 2,5 secondi con il sito. Servono Chrome e ffmpeg.
