# Tracce audio per parte

Le tracce "Ascolta le parti" dell'area riservata (tutte le voci + una per
voce) si generano da una **trascrizione a mano** dello spartito, non dal
riconoscimento automatico del PDF: il primo tentativo con un OMR (homr) ha
prodotto note sbagliate. Trascrivere un pezzo corale breve richiede pochi
minuti ed è l'unico modo per avere tracce affidabili.

## Procedimento

1. **Trascrivi** lo spartito in `tracce/brani/<id>-<titolo>.txt`, copiando
   come modello [`1-verbum-caro-factum-est.txt`](brani/1-verbum-caro-factum-est.txt).
   `<id>` è l'id dello spartito nella tabella `spartiti` di D1.
2. **Genera** gli MP3 e ascoltali:
   ```bash
   python3 tracce/genera.py tracce/brani/<file>.txt
   ```
   Finiscono in `tracce/.out/<id>/` (ignorata da git). Lo script si ferma con
   un errore se una sezione non è fatta di battute intere o se le voci non
   hanno la stessa durata: di solito è una nota o una durata sbagliata.
3. **Controlla a orecchio** ogni parte seguendo il PDF.
4. **Carica** sul sito:
   ```bash
   python3 tracce/genera.py tracce/brani/<file>.txt --carica
   ```
   Mette gli MP3 su R2 (`spartiti/<id>/<voce>.mp3`) e sostituisce le righe di
   `tracce_audio` per quello spartito. Non serve ripubblicare il sito.
5. **Committa** la trascrizione, così resta la fonte da cui rigenerare.

Requisiti: `brew install fluid-synth ffmpeg`, e wrangler già autenticato
(per `--carica`). Il soundfont (MuseScore General, ~40 MB) si scarica da solo
al primo uso in `tracce/.cache/`.

## Formato della trascrizione

```
spartito: 1          # id in D1
tempo: 92            # semiminime al minuto
battuta: 3           # semiminime per battuta (3/4 → 3, 4/4 → 4, 6/8 → 3)
forma: a b b c d d a b

[soprano]
a: A4:2 A4:1 A4:2 G#4:1 ...
b: ...
```

- **Note**: nome + ottava + `:` + durata in semiminime. `C4` è il Do
  centrale; alterazioni `#` e `b` (`F#4`, `Bb3`). `r` è una pausa.
  Durate: `4` semibreve, `2` minima, `1` semiminima, `.5` croma, `1.5`
  semiminima puntata, `3` minima puntata. Più battute di pausa: `r:12`
  (4 battute da 3/4).
- **Armatura di chiave**: non esiste, ogni diesis/bemolle va scritto sulla
  nota (in La maggiore: `C#`, `F#`, `G#`).
- **Tenore**: scrivilo all'**altezza reale**, cioè un'ottava sotto lo scritto
  quando è in chiave di violino con l'8 sotto. È l'errore più facile.
- **Sezioni e forma**: dividi il pezzo in sezioni (lettere a piacere) e
  scrivi in `forma` l'ordine in cui si suonano, ritornelli e da capo
  compresi. Ogni voce deve avere tutte le sezioni, anche solo pause.
- **Voci**: `soprano`, `contralto`, `mezzosoprano`, `tenore`, `baritono`,
  `basso` (le stesse della tabella `coristi`).
- I commenti iniziano con `#` a inizio riga.

Il suono è pianoforte: attacchi netti e ritmo chiaro, più utile di un
"coro" sintetico per imparare la propria parte.
