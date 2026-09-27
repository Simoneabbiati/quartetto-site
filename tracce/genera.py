#!/usr/bin/env python3
"""Genera le tracce audio per parte di uno spartito da una trascrizione a mano.

    python3 tracce/genera.py tracce/brani/1-verbum-caro-factum-est.txt
    python3 tracce/genera.py tracce/brani/1-verbum-caro-factum-est.txt --carica

Senza --carica crea solo gli MP3 in tracce/.out/<spartito>/ per ascoltarli.
Con --carica li mette anche su R2 e registra le tracce in D1 (tabella
tracce_audio), sostituendo quelle esistenti. Il formato della trascrizione è
descritto in tracce/README.md.

Requisiti: python3, fluidsynth e ffmpeg (brew install fluid-synth ffmpeg).
Nessuna libreria Python esterna.
"""
import argparse
import re
import struct
import subprocess
import sys
import urllib.request
from pathlib import Path

QUI = Path(__file__).resolve().parent
RADICE = QUI.parent
CACHE = QUI / '.cache'
SOUNDFONT = CACHE / 'MuseScore_General.sf3'
SOUNDFONT_URL = 'https://ftp.osuosl.org/pub/musescore/soundfont/MuseScore_General/MuseScore_General.sf3'

TPQ = 480          # tick MIDI per semiminima
STRUMENTO = 0      # General MIDI 0 = pianoforte: attacchi netti, ritmo chiaro per imparare la parte
VOCI_VALIDE = {'soprano', 'contralto', 'mezzosoprano', 'tenore', 'baritono', 'basso'}
NOTE = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}


def altezza(nome: str) -> int:
    m = re.fullmatch(r'([A-G])(#|b)?(-?\d)', nome)
    if not m:
        raise ValueError(f'nota non valida: {nome!r} (esempi: A4, C#5, Bb3)')
    alterazione = {'#': 1, 'b': -1, None: 0}[m[2]]
    return 12 * (int(m[3]) + 1) + NOTE[m[1]] + alterazione


def leggi(percorso: Path):
    meta, voci, voce = {}, {}, None
    for n, riga in enumerate(percorso.read_text().splitlines(), 1):
        # Commenti solo a inizio riga: '#' dentro una riga è un diesis (C#5).
        riga = riga.strip()
        if not riga or riga.startswith('#'):
            continue
        if m := re.fullmatch(r'\[(\w+)\]', riga):
            voce = m[1]
            if voce not in VOCI_VALIDE:
                sys.exit(f'riga {n}: voce {voce!r} non valida, usa una di {sorted(VOCI_VALIDE)}')
            voci[voce] = {}
            continue
        chiave, _, valore = riga.partition(':')
        chiave, valore = chiave.strip(), valore.strip()
        try:
            if voce is None and chiave == 'verificato':
                meta.setdefault('verificati', set()).update(valore.split())
            elif voce is None:
                meta[chiave] = valore
            else:
                voci[voce][chiave] = [
                    (None if nota == 'r' else altezza(nota), float(durata), nota)
                    for nota, durata in (tok.rsplit(':', 1) for tok in valore.split())
                ]
        except ValueError as e:
            sys.exit(f'riga {n}: {e}')
    return meta, voci


def controlla(meta, voci):
    """Ferma tutto se le voci non tornano: meglio un errore qui che una traccia sfasata."""
    battuta = float(meta.get('battuta', 4))
    forma = meta['forma'].split()
    for sezione in dict.fromkeys(forma):
        durate = {}
        for voce, sezioni in voci.items():
            if sezione not in sezioni:
                sys.exit(f'la voce {voce} non ha la sezione {sezione!r} usata in "forma"')
            durate[voce] = sum(d for _, d, _ in sezioni[sezione])
            if durate[voce] % battuta and 'anacrusi' not in meta:
                sys.exit(f'{voce}, sezione {sezione}: {durate[voce]} semiminime, non è un numero intero di battute da {battuta:g}')
        if len(set(durate.values())) > 1:
            sys.exit(f'sezione {sezione}: le voci hanno durate diverse {durate}')


# Estensioni tipiche per voce (MIDI). Fuori da qui è quasi sempre un errore
# d'ottava — soprattutto il tenore scritto all'altezza della chiave di violino.
ESTENSIONE = {
    'soprano': (60, 81), 'mezzosoprano': (57, 77), 'contralto': (53, 74),
    'tenore': (48, 69), 'baritono': (45, 65), 'basso': (40, 62),
}
NOMI = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
NOMI_BEMOLLE = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']


def nome(nota: int, bemolli: bool = False) -> str:
    return f'{(NOMI_BEMOLLE if bemolli else NOMI)[nota % 12]}{nota // 12 - 1}'


def posizione(meta, t: float):
    """Istante in semiminime (ordine di stampa) → (battuta stampata, tempo).
    Con l'anacrusi la battuta in levare è la 0, come negli spartiti."""
    battuta = float(meta.get('battuta', 4))
    anacrusi = float(meta.get('anacrusi', 0))
    t += (battuta - anacrusi) % battuta
    return int(t // battuta) + (0 if anacrusi else 1), t % battuta + 1


def in_partitura(meta, voci):
    """Note di ogni voce nell'ordine dello spartito (ogni sezione una volta
    sola, come stampata), con l'istante d'inizio in semiminime."""
    ordine = list(dict.fromkeys(meta['forma'].split()))
    risultato = {}
    for voce, sezioni in voci.items():
        t, note = 0.0, []
        for s in ordine:
            for nota, durata, _ in sezioni[s]:
                note.append((t, nota, durata))
                t += durata
        risultato[voce] = note
    return risultato


def avvisi(meta, voci):
    """Controlli musicali: non fermano la generazione, ma ogni avviso va
    verificato sul PDF. Una nota sbagliata di solito ne fa scattare almeno uno
    (fuori estensione, alterazione inattesa, salto strano o dissonanza)."""
    partitura = in_partitura(meta, voci)
    bemolli = 'b' in meta.get('armatura', '')
    nm = lambda n: nome(n, bemolli)
    dove = lambda t: 'b. {}, tempo {:g}'.format(*posizione(meta, t))
    # Codice stabile di ogni avviso, da copiare in una riga "verificato:"
    # della trascrizione dopo averlo controllato sul PDF.
    codice = lambda t, *chi: 'b{}t{:g}-'.format(*posizione(meta, t)) + '-'.join(chi)
    out = []

    diatoniche = {NOTE[n] for n in NOTE}
    for alt in meta.get('armatura', '').split():
        diatoniche.discard(NOTE[alt[0]])
        diatoniche.add((NOTE[alt[0]] + (1 if alt[1] == '#' else -1)) % 12)

    for voce, note in partitura.items():
        basso, alto = ESTENSIONE[voce]
        prec = None
        for t, nota, _ in note:
            if nota is None:
                continue
            if not basso <= nota <= alto:
                out.append((codice(t, voce, 'estensione'), f'{voce}, {dove(t)}: {nm(nota)} fuori estensione ({nm(basso)}–{nm(alto)}) — ottava giusta?'))
            if 'armatura' in meta and nota % 12 not in diatoniche:
                out.append((codice(t, voce, 'alterazione'), f'{voce}, {dove(t)}: {nm(nota)} non è in armatura — c\'è davvero l\'alterazione?'))
            if prec is not None and abs(nota - prec) > 12:
                out.append((codice(t, voce, 'salto'), f'{voce}, {dove(t)}: salto di {abs(nota - prec)} semitoni da {nm(prec)} a {nm(nota)}'))
            prec = nota

    # Dissonanze sui tempi forti, dove una voce attacca una nota nuova.
    # Seconde, settime e tritoni lì sono rari in questo repertorio: un errore
    # di una riga o di uno spazio in una voce tipicamente ne crea uno.
    def suona(note, t):
        for inizio, nota, durata in note:
            if inizio <= t < inizio + durata:
                return nota, inizio == t
        return None, False

    fine = max(t + d for note in partitura.values() for t, _, d in note[-1:])
    t = 0.0
    while t < fine:
        suoni = {v: suona(n, t) for v, n in partitura.items()}
        voci_t = [v for v, (n, _) in suoni.items() if n is not None]
        for i, a in enumerate(voci_t):
            for b in voci_t[i + 1:]:
                (na, attacca_a), (nb, attacca_b) = suoni[a], suoni[b]
                if (attacca_a or attacca_b) and abs(na - nb) % 12 in (1, 2, 6, 10, 11):
                    out.append((codice(t, a, b), f'{dove(t)}: {a} {nm(na)} contro {b} {nm(nb)} — dissonanza, controlla entrambe'))
        t += 1.0
    return out


def differenze(prima, seconda):
    """Confronta due trascrizioni dello stesso spartito battuta per battuta."""
    def per_battuta(meta, voci):
        out = {}
        for voce, note in in_partitura(meta, voci).items():
            for t, nota, durata in note:
                testo = 'r' if nota is None else nome(nota)
                out.setdefault(voce, {}).setdefault(posizione(meta, t)[0], []).append(f'{testo}:{durata:g}')
        return out

    def esecuzione(meta, voci):
        # Battute stampate nell'ordine in cui si eseguono: confronta ritornelli
        # e da capo senza dipendere da come ognuno ha chiamato le sezioni.
        voce = next(iter(voci.values()))
        ordine = list(dict.fromkeys(meta['forma'].split()))
        inizio, t = {}, 0.0
        for s in ordine:
            inizio[s] = t
            t += sum(d for _, d, _ in voce[s])
        out = []
        for s in meta['forma'].split():
            fine = inizio[s] + sum(d for _, d, _ in voce[s])
            out.append(f'{posizione(meta, inizio[s])[0]}-{posizione(meta, fine - 1e-6)[0]}')
        return ' '.join(out)

    (ma, va), (mb, vb) = prima, seconda
    # Un campo vuoto e uno assente valgono uguale (armatura senza alterazioni).
    out = [f'{k}: {ma.get(k)!r} ≠ {mb.get(k)!r}' for k in ('battuta', 'armatura', 'anacrusi')
           if (ma.get(k) or '').split() != (mb.get(k) or '').split()]
    ea, eb = esecuzione(ma, va), esecuzione(mb, vb)
    if ea.split() != eb.split():
        # Stesse battute in sezioni divise diversamente: confronta la sequenza espansa.
        espandi = lambda e: [b for tratto in e.split() for b in range(int(tratto.split('-')[0]), int(tratto.split('-')[1]) + 1)]
        if espandi(ea) != espandi(eb):
            out.append(f'ordine di esecuzione (battute):  1) {ea}   2) {eb}')
    a, b = per_battuta(ma, va), per_battuta(mb, vb)
    for voce in dict.fromkeys([*a, *b]):
        if voce not in a or voce not in b:
            out.append(f'{voce}: presente solo in una delle due trascrizioni')
            continue
        for n in sorted(set(a[voce]) | set(b[voce])):
            x, y = a[voce].get(n, []), b[voce].get(n, [])
            if x != y:
                out.append(f'{voce}, b. {n}:  1) {" ".join(x)}   2) {" ".join(y)}')
    return out


# --- Partitura di controllo -------------------------------------------------
# La trascrizione viene reimpaginata come partitura (Humdrum **kern, disegnata
# da Verovio) con il numero su ogni battuta: messa accanto al PDF originale si
# confronta battuta per battuta, voce per voce. È il controllo che non si può
# automatizzare: che le note siano *quelle stampate*.

CHIAVI = {'soprano': 'G2', 'mezzosoprano': 'G2', 'contralto': 'G2',
          'tenore': 'Gv2', 'baritono': 'F4', 'basso': 'F4'}
VALORI = [6, 4, 3, 2, 1.5, 1, .75, .5, .375, .25, .125]  # in semiminime


def figura(durata: float) -> str:
    """Durata in semiminime → figura **kern (4 = semiminima, 2. = minima puntata)."""
    for puntata in ('', '.'):
        base = durata / (1.5 if puntata else 1)
        if base and (4 / base).is_integer():
            return f'{int(4 / base)}{puntata}'
    raise ValueError(durata)


def spezza(durata: float):
    """Scompone una durata in figure scrivibili, da legare tra loro."""
    parti = []
    while durata > 1e-9:
        v = next(v for v in VALORI if v <= durata + 1e-9)
        parti.append(v)
        durata -= v
    return parti


def nota_kern(grafia: str) -> str:
    lettera, alt, ottava = re.fullmatch(r'([A-G])(#|b)?(-?\d)', grafia).groups()
    ottava = int(ottava)
    testo = lettera.lower() * (ottava - 3) if ottava >= 4 else lettera * (4 - ottava)
    return testo + {'#': '#', 'b': '-', None: ''}[alt]


def kern(meta, voci) -> str:
    battuta = float(meta.get('battuta', 4))
    scarto = (battuta - float(meta.get('anacrusi', battuta))) % battuta
    ordine = list(dict.fromkeys(meta['forma'].split()))
    eventi = {}  # voce -> {istante: token}
    for voce, sezioni in voci.items():
        t, ev = 0.0, {}
        for nota, durata, grafia in (n for s in ordine for n in sezioni[s]):
            # Spezza sulle stanghette e in figure scrivibili, con le legature.
            pezzi, resto, inizio = [], durata, t
            while resto > 1e-9:
                fino_stanghetta = battuta - ((inizio + scarto) % battuta)
                tratto = min(resto, fino_stanghetta)
                for v in spezza(tratto):
                    pezzi.append((inizio, v))
                    inizio += v
                resto -= tratto
            for i, (quando, v) in enumerate(pezzi):
                if nota is None:
                    ev[quando] = figura(v) + 'r'
                    continue
                legatura = '' if len(pezzi) == 1 else '[' if i == 0 else ']' if i == len(pezzi) - 1 else '_'
                tok = figura(v) + nota_kern(grafia)
                ev[quando] = (legatura + tok) if legatura in ('[', '_') else (tok + legatura)
            t += durata
        eventi[voce] = ev
    righe_voci = list(reversed(list(voci)))  # in **kern la prima colonna è il rigo più basso
    fine = max(max(ev) for ev in eventi.values()) + 1
    armatura = ''.join(a[0].lower() + ('#' if a[1] == '#' else '-') for a in meta.get('armatura', '').split())
    metro = meta.get('metro', f'{battuta:g}/4')
    riga = lambda f: '\t'.join(f(v) for v in righe_voci)
    out = [riga(lambda v: '**kern'),
           riga(lambda v: f'*I"{v.capitalize()}'),
           riga(lambda v: f'*clef{CHIAVI[v]}'),
           riga(lambda v: f'*k[{armatura}]'),
           riga(lambda v: f'*M{metro}')]
    istanti = sorted({t for ev in eventi.values() for t in ev})
    for t in istanti:
        if t and ((t + scarto) % battuta) < 1e-9:
            out.append(riga(lambda v: f'={posizione(meta, t)[0]}'))
        out.append(riga(lambda v: eventi[v].get(t, '.')))
    out.append(riga(lambda v: '=='))
    out.append(riga(lambda v: '*-'))
    return '\n'.join(out) + '\n'


def vlq(n: int) -> bytes:
    b = [n & 0x7F]
    n >>= 7
    while n:
        b.insert(0, 0x80 | (n & 0x7F))
        n >>= 7
    return bytes(b)


def traccia_midi(note, canale: int) -> bytes:
    ev = bytearray(vlq(0) + bytes([0xC0 | canale, STRUMENTO]))
    attesa = 0
    for nota, durata, _ in note:
        tick = int(durata * TPQ)
        if nota is None:
            attesa += tick
            continue
        # 10 tick di stacco tra note ripetute, altrimenti si fondono in una sola
        ev += vlq(attesa) + bytes([0x90 | canale, nota, 90])
        ev += vlq(tick - 10) + bytes([0x80 | canale, nota, 0])
        attesa = 10
    ev += vlq(attesa) + b'\xff\x2f\x00'
    return b'MTrk' + struct.pack('>I', len(ev)) + ev


def scrivi_midi(percorso: Path, parti, tempo: int, battuta: int):
    us = int(60e6 / tempo)
    ev = (vlq(0) + b'\xff\x51\x03' + us.to_bytes(3, 'big')
          + vlq(0) + b'\xff\x58\x04' + bytes([battuta, 2, 24, 8])
          + vlq(0) + b'\xff\x2f\x00')
    tracce = [b'MTrk' + struct.pack('>I', len(ev)) + ev]
    tracce += [traccia_midi(note, i) for i, note in enumerate(parti)]
    percorso.write_bytes(b'MThd' + struct.pack('>IHHH', 6, 1, len(tracce), TPQ) + b''.join(tracce))


def esegui(*cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        sys.exit(f'errore eseguendo {cmd[0]}:\n{r.stderr or r.stdout}')
    return r.stdout


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('trascrizione', type=Path)
    ap.add_argument('--carica', action='store_true', help='carica su R2 e registra in D1')
    args = ap.parse_args()

    args.trascrizione = args.trascrizione.resolve()
    meta, voci = leggi(args.trascrizione)
    spartito = int(meta['spartito'])
    out = QUI / '.out' / str(spartito)
    out.mkdir(parents=True, exist_ok=True)

    # Controllo 1 — struttura: battute intere, voci della stessa durata.
    controlla(meta, voci)
    print('✓ 1/3  Struttura: battute complete e voci allineate')

    # Partitura ricostruita dalla trascrizione, per confrontarla a occhio col
    # PDF mentre si risolvono i controlli 2 e 3.
    krn = out / 'partitura.krn'
    krn.write_text(kern(meta, voci))
    if (QUI / 'node_modules' / 'verovio').exists():
        esegui('node', str(QUI / 'partitura.mjs'), str(krn), str(out / 'partitura.html'))
        print(f'       Partitura di controllo: {(out / "partitura.html").relative_to(RADICE)}')
    else:
        print('       (Per la partitura di controllo: npm install --prefix tracce)')

    bloccanti = 0

    # Controllo 2 — doppia trascrizione indipendente, identica nota per nota.
    bis = args.trascrizione.with_name(args.trascrizione.stem + '.bis.txt')
    if not bis.exists():
        print(f'✗ 2/3  Doppia trascrizione: manca {bis.relative_to(RADICE)}')
        print('       Serve una seconda trascrizione dello stesso PDF, fatta senza guardare la prima.')
        bloccanti += 1
    else:
        meta_bis, voci_bis = leggi(bis)
        controlla(meta_bis, voci_bis)
        diff = differenze((meta, voci), (meta_bis, voci_bis))
        if diff:
            print(f'✗ 2/3  Doppia trascrizione: {len(diff)} battute diverse, ricontrollale sul PDF')
            for d in diff:
                print(f'         {d}')
            bloccanti += 1
        else:
            print('✓ 2/3  Doppia trascrizione: le due versioni coincidono nota per nota')

    # Controllo 3 — ogni avviso musicale verificato sul PDF e segnato.
    lista = avvisi(meta, voci)
    verificati = meta.get('verificati', set())
    aperti = [(c, m) for c, m in lista if c not in verificati]
    if aperti:
        print(f'✗ 3/3  Avvisi musicali: {len(aperti)} da verificare sul PDF (su {len(lista)})')
        for c, m in aperti:
            print(f'         {c:<28} {m}')
        print('       Se sul PDF è proprio così, aggiungi alla trascrizione:')
        print(f'         verificato: {" ".join(c for c, _ in aperti)}')
        print('       altrimenti correggi la nota (in entrambe le trascrizioni).')
        bloccanti += 1
    else:
        print(f'✓ 3/3  Avvisi musicali: {len(lista)} avvisi, tutti verificati sul PDF')
    superflui = verificati - {c for c, _ in lista}
    if superflui:
        print(f'       (righe "verificato" non più necessarie: {" ".join(sorted(superflui))})')

    if bloccanti:
        sys.exit(f'\nAudio NON generato: {bloccanti} controlli su 3 non superati.')
    print()
    tempo = int(meta.get('tempo', 92))
    battuta = int(float(meta.get('battuta', 4)))
    forma = meta['forma'].split()
    complete = {v: [n for s in forma for n in sez[s]] for v, sez in voci.items()}

    if not SOUNDFONT.exists():
        CACHE.mkdir(exist_ok=True)
        print('Scarico il soundfont MuseScore General (~40 MB, una volta sola)...')
        urllib.request.urlretrieve(SOUNDFONT_URL, SOUNDFONT)

    uscite = {'tutti': list(complete.values()), **{v: [n] for v, n in complete.items()}}
    for nome, parti in uscite.items():
        mid, wav, mp3 = (out / f'{nome}.{e}' for e in ('mid', 'wav', 'mp3'))
        scrivi_midi(mid, parti, tempo, battuta)
        esegui('fluidsynth', '-ni', '-g', '0.8', '-r', '44100', '-F', str(wav), str(SOUNDFONT), str(mid))
        # Toglie solo il silenzio in coda (il riverbero che sfuma): le pause
        # interne restano, altrimenti le parti si sfasano tra loro.
        esegui('ffmpeg', '-y', '-loglevel', 'error', '-i', str(wav),
               '-af', 'areverse,silenceremove=start_periods=1:start_threshold=-60dB,areverse',
               '-ac', '1', '-b:a', '96k', str(mp3))
        wav.unlink()
        durata = float(esegui('ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(mp3)))
        print(f'  {mp3.relative_to(RADICE)}  {durata:.0f}s')

    if not args.carica:
        print(f'\nAscoltale in {out.relative_to(RADICE)}/, poi rilancia con --carica.')
        return

    righe = []
    for ordine, nome in enumerate(uscite):
        chiave = f'spartiti/{spartito}/{nome}.mp3'
        esegui('npx', 'wrangler', 'r2', 'object', 'put', f'quartetto-privato/{chiave}',
               '--file', str(out / f'{nome}.mp3'), '--content-type', 'audio/mpeg', '--remote')
        righe.append(f"({spartito}, '{nome}', '{chiave}', {ordine})")
    esegui('npx', 'wrangler', 'd1', 'execute', 'quartetto-db', '--remote', '--command',
           f'DELETE FROM tracce_audio WHERE spartito_id = {spartito}; '
           f'INSERT INTO tracce_audio (spartito_id, voce, audio_key, ordine) VALUES {", ".join(righe)};')
    print(f'\nCaricate {len(righe)} tracce per lo spartito {spartito}.')


if __name__ == '__main__':
    main()
