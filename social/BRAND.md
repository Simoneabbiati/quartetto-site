# ConCordia Singers — linee guida del marchio

Regole per tutto ciò che pubblichiamo: post Instagram e Facebook, locandine,
programmi di sala. Sono le stesse del sito (concordiasingers.it). Lo script
`genera.mjs` le applica da solo: i valori numerici sono in `brand.json`.

## Chi siamo, in una frase

Un ensemble vocale nato in Bocconi, con voci da Irlanda, Stati Uniti, Estonia,
Turchia e Italia, che prova ogni domenica nella chiesa di San Ferdinando a
Milano. Il nome dice cosa cerchiamo: *concordia*, cuori che si accordano.

## Nome

- Si scrive **ConCordia Singers**: la seconda C è maiuscola (da *cor, cordis*,
  il cuore). Nel logo e nei titoli grandi è in **blu Klein**.
- Nei testi correnti e nelle didascalie va bene anche "Concordia Singers".
- Descrizione: **vocal ensemble** (in minuscolo, spaziato), mai "coro sacro"
  o "quartetto": facciamo musica d'insieme, sacra e profana.

## Logo

- **Monogramma**: due C, "con" e "cor", che si abbracciano. C esterna nera
  (o bianca su fondo scuro), C interna blu Klein.
- **Logo completo**: monogramma + "ConCordia Singers" in Italiana.
- **Logo ridotto** (foto profilo, icone): solo il monogramma su cerchio bianco.
- Spazio libero intorno al logo: almeno l'altezza della C esterna.
- Non deformarlo, non cambiare i colori, non aggiungere ombre o contorni.

## Colori

| Nome | Valore | Uso |
|---|---|---|
| Nero | `#0B0B0C` | testo, C esterna del monogramma |
| Bianco | `#FFFFFF` | fondo principale |
| Grigio | `#63656B` | testi secondari, didascalie |
| Grigio chiaro | `#F2F2F0` | fondi alternativi, mai dietro testo lungo |
| **Blu Klein** | `#002FA7` | **un solo dettaglio per immagine**: la C del cuore, il monogramma, un pallino |

Il blu è raro di proposito: se in un'immagine c'è più di un elemento blu, è
troppo. Mai sfumature, gradienti o blu chiari.

## Caratteri

- **Italiana** — solo per il nome e per i titoli molto grandi. Un solo peso,
  sottile: si usa grande (almeno 64 px su un post), con un leggero contorno
  dello stesso colore per dargli corpo.
- **Instrument Sans** — tutto il resto: testi, date, didascalie. Pesi 400 e 500.
  Per le etichette: minuscolo, spaziato (`vocal ensemble`).
- **Instrument Serif corsivo** — solo per parole latine o titoli di brani
  (*Suantraí*, *Verbum caro factum est*).

## Fotografie

- Le nostre, vere: prove, chiesa, spartiti, mani. Niente foto stock.
- Luce calda e scura degli interni, ripulite dal rumore (vedi
  `Downloads/…/ottimizzate/_script-ottimizzazione.py`). Niente filtri colorati.
- Ritaglio verticale 4:5 per il feed. Le persone non vanno tagliate a metà viso.
- Sulla foto al massimo il logo piccolo e una riga di testo, in basso.

## Formati

| Dove | Formato | Pixel |
|---|---|---|
| Instagram e Facebook, feed | 4:5 verticale | 1080 × 1350 |
| Storie e Reel | 9:16 | 1080 × 1920 |
| Copertina Facebook | — | 1640 × 624 (zona sicura centrale) |

## Modelli di post (in `genera.mjs`)

1. **foto** — una nostra foto a tutta pagina, logo piccolo e una riga di testo in basso.
2. **citazione** — fondo bianco, una frase grande in Italiana, il monogramma in basso.
3. **annuncio** — fondo bianco, titolo grande, 2–3 righe di dettagli (data,
   luogo, cosa portare), pallino blu. Per concerti, prove aperte, ricerca voci.
4. **ascolta** — fondo scuro, titolo del brano in corsivo, forma d'onda: per
   accompagnare un audio o un Reel.

## Tono di voce

- Caldo, diretto, entusiasta senza esagerare. Diamo del tu.
- Sempre in **italiano e inglese**: prima l'italiano, poi una riga vuota,
  poi l'inglese.
- Frasi brevi. Al massimo un'emoji per post, e solo se aggiunge qualcosa (♪, 🎶).
- Raccontiamo persone e musica, non noi stessi: "la prova di domenica",
  "la voce di Aisling", "un canto irlandese".
- Chiusura con un invito chiaro quando serve: "Scrivici", "Ascolta", "Vieni".
- Hashtag in fondo, 5–8, sempre gli stessi di base: `#ConCordiaSingers
  #vocalensemble #coro #Milano #Bocconi` + 2–3 sul contenuto.
- Link nel post: su Instagram non è cliccabile, si scrive "link in bio".
