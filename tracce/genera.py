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
            if voce is None:
                meta[chiave] = valore
            else:
                voci[voce][chiave] = [
                    (None if nota == 'r' else altezza(nota), float(durata))
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
            durate[voce] = sum(d for _, d in sezioni[sezione])
            if durate[voce] % battuta:
                sys.exit(f'{voce}, sezione {sezione}: {durate[voce]} semiminime, non è un numero intero di battute da {battuta:g}')
        if len(set(durate.values())) > 1:
            sys.exit(f'sezione {sezione}: le voci hanno durate diverse {durate}')


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
    for nota, durata in note:
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

    meta, voci = leggi(args.trascrizione)
    controlla(meta, voci)
    spartito = int(meta['spartito'])
    tempo = int(meta.get('tempo', 92))
    battuta = int(float(meta.get('battuta', 4)))
    forma = meta['forma'].split()
    complete = {v: [n for s in forma for n in sez[s]] for v, sez in voci.items()}

    if not SOUNDFONT.exists():
        CACHE.mkdir(exist_ok=True)
        print('Scarico il soundfont MuseScore General (~40 MB, una volta sola)...')
        urllib.request.urlretrieve(SOUNDFONT_URL, SOUNDFONT)

    out = QUI / '.out' / str(spartito)
    out.mkdir(parents=True, exist_ok=True)
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
