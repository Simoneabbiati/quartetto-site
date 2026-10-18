# Istruzioni per trascrivere uno spartito

Queste istruzioni servono per le due trascrizioni indipendenti richieste dal
controllo 2 di [`genera.py`](genera.py). Chi fa la seconda trascrizione
(`<id>-<titolo>.bis.txt`) non deve guardare la prima: lavora solo dal PDF.

## Metodo

Ogni nota, durata, alterazione e ottava deve essere esattamente quella
stampata. Lavora battuta per battuta, voce per voce:

1. Renderizza il PDF ad alta risoluzione: `pdftoppm -r 300 -png spartito.pdf pagina`.
2. Ritaglia un rigo alla volta, poche battute per ritaglio, e ingrandiscilo
   (es. con Python/PIL): a quella scala si vede senza ambiguità se una testa
   sta su una riga o in uno spazio.
3. Per le note con tagli addizionali o dubbie, conta righe e tagli; nel
   dubbio misura la posizione verticale della testa rispetto alle righe.
4. Conta le durate di ogni battuta: devono tornare.
5. Controlla l'armonia a ogni tempo: un accordo che non ha senso di solito
   è una nota letta male.
6. Alla fine rileggi tutto confrontando battuta per battuta con le immagini.

## Formato

Vedi la sezione "Formato della trascrizione" nel [README](README.md). In breve:

```
spartito: 1
tempo: 92
battuta: 3
armatura: F# C# G#
forma: a b b c d d a b

[soprano]
a: A4:2 A4:1 A4:2 G#4:1 B4:2 B4:1 C#5:2 r:1
...
```

- `battuta`: semiminime per battuta (3/4 → 3, 4/4 → 4, 2/2 → 4, 4/8 → 2,
  6/8 → 3). Se il metro non è in quarti aggiungi `metro: 4/8` (serve solo
  alla partitura di controllo).
- `tempo`: semiminime al minuto; se lo spartito dà la croma (♪ = 120),
  dividi per 2. Senza indicazione usa 92.
- Durate in semiminime: `4` semibreve, `3` minima puntata, `2` minima,
  `1.5` semiminima puntata, `1` semiminima, `.75` croma puntata, `.5` croma,
  `.375` semicroma puntata, `.25` semicroma.
- Nessuna armatura implicita: scrivi su ogni nota l'alterazione con cui
  suona. Le alterazioni accidentali valgono fino alla fine della battuta.
- Legature di valore (note uguali, anche oltre la stanghetta): una sola nota
  con la durata sommata. Le legature di portamento si ignorano.
- Tenore in chiave di violino con l'8 sotto: trascrivilo un'ottava sotto lo
  scritto. In chiave di basso, così com'è.
- Due voci sullo stesso rigo: gambi su = voce superiore, gambi giù =
  inferiore; una testa con due gambi è un unisono (va in entrambe).
- Note tra parentesi (alternative): solo la nota principale. Accordi in una
  voce sola (divisi): la nota superiore.
- Parte solistica separata dal coro (soprano solo, semicoro): voce `[solo]`,
  scritta per prima. Il pianoforte "for practice only" non si trascrive.

## Sezioni e forma

`forma` è l'ordine di **esecuzione** delle sezioni: ritornelli, strofe, finali
di 1ª/2ª volta e da capo compresi.

- Ogni voce ha tutte le sezioni, con la stessa durata per sezione (pause comprese).
- Le sezioni compaiono in `forma`, la prima volta, nell'ordine di stampa.
- Senza anacrusi ogni sezione è fatta di battute intere; con anacrusi
  (`anacrusi: <semiminime>`) la battuta in levare va in una sezione a sé.
- Da capo al Fine: si ripete dall'inizio fino a Fine, senza ritornelli.
  Strofe: il pezzo si ripete tante volte quante sono le righe di testo.

In cima al file metti un commento con la divisione in sezioni e i numeri di
battuta stampati.
