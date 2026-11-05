# Concordia Singers — linee guida del marchio

Riassunto della brand guide preparata per l'ensemble (Instagram e Facebook).
Lo script `genera.mjs` applica queste regole da solo; i valori sono in
`brand.json`. Il sito (concordiasingers.it) usa gli stessi colori e caratteri.

## Chi siamo, in una frase

Un ensemble vocale nato in Bocconi, con voci da Irlanda, Stati Uniti, Estonia,
Turchia e Italia, che prova ogni domenica nella chiesa di San Ferdinando a
Milano. *Concordia*: da *cum* + *cor, cordis*, cuori che si accordano.

## Nome e logo

- **Concordia Singers**, descrizione **vocal ensemble**. Siamo un
  **ensemble**: mai "coro" o "choir", né nei post né sul sito (vale anche
  per gli hashtag). Nei titoli
  "ConCordia" con la seconda C in bronzo (su crema) o oro chiaro (su noce).
- **Logo**: una C grande e una C più piccola (circa 60%) specchiata, annidata
  a destra. Lockup: logo + CONCORDIA (Cormorant maiuscolo, spaziatura 0.32em)
  + "SINGERS · VOCAL ENSEMBLE" piccolo in Figtree.
- Logo bronzo su crema, oro chiaro su noce. Parola del marchio in inchiostro
  su crema, in crema su noce. Mai ombre, contorni o sfumature.

## Colori

| Nome | Valore | Uso |
|---|---|---|
| Crema | `#F8F5EF` | fondo chiaro |
| Inchiostro | `#26211C` | titoli su crema |
| Secondario | `#4A433B` | testo su crema |
| Tenue | `#6B6258` | etichette, didascalie su crema |
| Filo | `#E2D9CA` | linee sottili su crema |
| **Bronzo** | `#A8834F` | accento su crema |
| Noce | `#3E2C20` | unico fondo scuro |
| Titolo su noce | `#F7F1E6` | |
| Testo su noce | `#EDE4D4` | |
| Tenue su noce | `#CFC3AE` | |
| **Oro chiaro** | `#C9A66B` | accento su noce |

L'accento è raro: pallino dell'etichetta, C del nome, parte "suonata" della
forma d'onda. Niente sfumature, effetti metallici, ombre, emoji o icone stock.

## Caratteri

- **Cormorant Garamond 500** — titoli, in minuscolo normale (mai tutto
  maiuscolo), 110–120 px nel post. Corsivo per titoli di brani e parole
  latine, fino a 168 px.
- **Figtree 300** — testi (30–36 px). **Figtree 400** — etichette (26 px,
  con pallino d'accento).

## Struttura di un post (1080 × 1350)

- Margini: 96 px ai lati e in alto, 88 px in basso.
- In alto a sinistra l'**etichetta**: pallino + categoria (Benvenuti, Chi
  siamo, Il nostro nome, Le prove, Dietro le quinte, Repertorio, Ascolta,
  Cerchiamo voci, In concerto).
- Contenuto allineato a sinistra, centrato in verticale.
- In basso a sinistra il **lockup**; il sito in basso a destra è opzionale.
- Le foto stanno dentro i margini, non a tutta pagina.
- **Griglia**: crema e noce alternati a scacchiera. Lo script lo fa da solo
  (post dispari noce, pari crema); `"sfondo": "crema" | "noce"` lo forza.

## Firme visive (modelli)

| Modello | Cosa |
|---|---|
| `dichiarazione` | frase breve su noce, grande doppia C che esce dal bordo destro |
| `annuncio` | titolo, testo, tabella a fili (Quando / Dove / Come) |
| `citazione` | una frase grande, firma piccola |
| `ascolta` | titolo del brano in corsivo, forma d'onda oro + sbiadita, ▶ durata |
| `foto` | una nostra foto dentro i margini, titolo corsivo sotto |
| `elenco` | titolo + elenco a fili (paesi, repertorio, programma) |

## Tono di voce

- Caldo, diretto, frasi brevi. Sempre **italiano e inglese** (prima IT).
- Nessuna emoji.
- Hashtag in fondo: quelli di base (`brand.json`) + 2–3 sul contenuto.
- Su Instagram il link non è cliccabile: "link in bio".

## Per Claude (o chi scrive i post)

- **Mai inventare fatti**: date, orari, luoghi, prezzi, nomi, repertorio.
  Se manca un dato, usa un segnaposto tra parentesi quadre: `[data]`,
  `[orario]`, `[luogo]`, e segnalalo.
- Usa solo foto vere dell'ensemble (`public/images/home/`).
- Rispetta palette, caratteri, margini ed etichette qui sopra; non aggiungere
  elementi decorativi.
