# Tracce audio per parte

Le tracce "Ascolta le parti" dell'area riservata (tutte le voci + una per
voce) si generano da una **trascrizione a mano** dello spartito, non dal
riconoscimento automatico del PDF: il primo tentativo con un OMR (homr) ha
prodotto note sbagliate. Trascrivere un pezzo corale breve richiede pochi
minuti ed è l'unico modo per avere tracce affidabili.

## Procedimento

Un solo comando fa i controlli e, **solo se passano tutti e tre**, genera
l'audio (pianoforte):

```bash
python3 tracce/genera.py tracce/brani/<id>-<titolo>.txt
```

| # | Controllo | Cosa verifica | Se fallisce |
|---|---|---|---|
| 1 | **Struttura** | Ogni sezione è fatta di battute intere; tutte le voci hanno la stessa durata | Si ferma subito: c'è una nota o una durata sbagliata |
| 2 | **Doppia trascrizione** | Esiste `<id>-<titolo>.bis.txt`, trascritto dallo stesso PDF **senza guardare il primo**, e coincide nota per nota | Elenca le battute diverse: ricontrollale sul PDF |
| 3 | **Avvisi musicali** | Note fuori estensione (errori d'ottava, tipico il tenore), alterazioni fuori armatura, salti oltre l'ottava, dissonanze tra voci sui tempi | Elenca ogni avviso con un codice: se sul PDF è proprio così, lo si segna con `verificato: <codice>` nella trascrizione, altrimenti si corregge |

Il controllo 2 è quello che trova le note sbagliate: due trascrizioni
indipendenti quasi mai sbagliano la stessa nota allo stesso modo. Il 3 trova
quello che sfugge a entrambe (tipicamente lo stesso errore d'ottava).

Ogni volta viene anche ridisegnata la partitura dalla trascrizione, con il
numero su ogni battuta: `tracce/.out/<id>/partitura.html`. Aprila accanto al
PDF per risolvere i controlli 2 e 3 a colpo d'occhio.

Passi per un nuovo spartito:

1. Trascrivi il PDF in `tracce/brani/<id>-<titolo>.txt` (modello:
   [`1-verbum-caro-factum-est.txt`](brani/1-verbum-caro-factum-est.txt)).
   `<id>` è l'id dello spartito nella tabella `spartiti` di D1.
2. Qualcun altro (o un secondo passaggio separato) trascrive lo stesso PDF
   in `<id>-<titolo>.bis.txt`, senza guardare il primo file.
3. Lancia il comando e risolvi quello che segnala finché i tre controlli sono ✓.
   Gli MP3 finiscono in `tracce/.out/<id>/` (ignorata da git).
4. Ascolta le tracce seguendo il PDF.
5. Carica sul sito: stesso comando con `--carica`. Mette gli MP3 su R2
   (`spartiti/<id>/<voce>.mp3`) e sostituisce le righe di `tracce_audio`
   per quello spartito. Non serve ripubblicare il sito.
6. Committa entrambe le trascrizioni.

Requisiti: `brew install fluid-synth ffmpeg`, `npm install --prefix tracce`
(per la partitura di controllo) e wrangler autenticato (per `--carica`). Il
soundfont (MuseScore General, ~40 MB) si scarica da solo al primo uso in
`tracce/.cache/`.

## Formato della trascrizione

```
spartito: 1
tempo: 92
battuta: 3
armatura: F# C# G#
forma: a b b c d d a b
verificato: b3t3-contralto-tenore b7t2-soprano-tenore

[soprano]
a: A4:2 A4:1 A4:2 G#4:1 ...
b: ...
```

- **Intestazione**: `spartito` è l'id in D1; `tempo` in semiminime al
  minuto; `battuta` in semiminime (3/4 → 3, 4/4 → 4); `armatura` sono le
  alterazioni in chiave (serve al controllo 3); `verificato` elenca i codici
  degli avvisi controllati sul PDF (anche su più righe).

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
- **Ordine delle sezioni**: la prima volta che una sezione compare in
  `forma` fissa l'ordine in cui è stampata, e da lì vengono i numeri di
  battuta negli avvisi e nella partitura di controllo. Scrivi `forma` in modo
  che le sezioni compaiano per la prima volta nell'ordine dello spartito.
- I commenti iniziano con `#` a inizio riga (un `#` dentro una riga è un
  diesis, quindi niente commenti in fondo alle righe di note).

Il suono è pianoforte: attacchi netti e ritmo chiaro, più utile di un
"coro" sintetico per imparare la propria parte.
