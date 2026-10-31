#!/usr/bin/env python3
"""Build the PV timeline from the winning track's beat grid.

Picks the highest-energy sustained section, quantizes start/end to bar
boundaries (4/4), and writes assets/timeline.json consumed by the animation
page and the audio cut script.
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from analyze_music import SR, decode_mono, onset_envelope, estimate_bpm, lock_phase

MUSIC_DIR = Path(__file__).resolve().parent.parent / "music"
OUT = Path(__file__).resolve().parent.parent / "assets" / "timeline.json"
BARS_NEEDED = 18


def track_file(slug: str) -> Path:
    """Locate the normalized audio file music/<slug>/<slug>.*"""
    hits = sorted(MUSIC_DIR.glob(f"{slug}/{slug}.*"))
    hits = [h for h in hits if h.suffix in (".mp3", ".ogg", ".wav")]
    if not hits:
        raise SystemExit(f"no audio for slug '{slug}' under {MUSIC_DIR}")
    return hits[0]


def main():
    slug = sys.argv[1] if len(sys.argv) > 1 else "space-city"
    track = track_file(slug)
    x = decode_mono(track)
    env = onset_envelope(x)
    bpm, period, steadiness = estimate_bpm(env)
    phase, _ = lock_phase(env, period)
    bar = period * 4.0

    # bar-level energy: rms in each bar window
    dur = len(x) / SR
    n_bars = int((dur - phase) / bar)
    sec = int(SR)
    energies = []
    for b in range(n_bars):
        t0 = phase + b * bar
        i0, i1 = int(t0 * sec), int((t0 + bar) * sec)
        energies.append(float(np.sqrt(np.mean(x[i0:i1] ** 2) + 1e-12)))
    energies = np.array(energies)

    # sustained energy: mean over the needed span, pick best start bar
    smooth = np.convolve(energies, np.ones(4) / 4.0, mode="valid")
    # skip the first bar (possible count-in artifacts)
    start_bar = int(np.argmax(smooth[1:])) + 1
    start_bar = min(start_bar, n_bars - BARS_NEEDED - 1)
    start = phase + start_bar * bar
    end = start + BARS_NEEDED * bar

    # relative to video start (t=0) for the animation page;
    # top-level start_s/end_s stay absolute for the audio cut
    beats = [round(i * period, 4) for i in range(BARS_NEEDED * 4 + 1)]
    bars = [round(i * bar, 4) for i in range(BARS_NEEDED + 1)]

    # scene cut points on bar boundaries (18 bars -> 7 scenes)
    spans = [2, 2, 2, 4, 3, 2, 3]  # hook logo overview montage sources tray cta
    scenes, t = [], 0
    for name, n in zip(
        ["hook", "logo", "overview", "montage", "sources", "tray", "cta"], spans
    ):
        scenes.append({"name": name, "start_bar": t, "bars": n,
                       "start_s": bars[t], "end_s": bars[t + n]})
        t += n

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({
        "track": f"{slug} (OpenGameArt, CC0)",
        "track_file": str(track.relative_to(OUT.parent.parent)),
        "bpm": round(bpm, 2),
        "period_s": round(period, 4),
        "first_beat_s": round(phase, 4),
        "start_s": round(start, 4),
        "end_s": round(end, 4),
        "duration_s": round(end - start, 4),
        "beats": beats,
        "bars": bars,
        "scenes": scenes,
    }, indent=2) + "\n")
    print(f"bpm={bpm:.2f} steadiness={steadiness:.1f} start_bar={start_bar} "
          f"start={start:.2f}s end={end:.2f}s dur={end - start:.2f}s")
    for s in scenes:
        print(f"  {s['name']:9s} bars {s['start_bar']:2d}+{s['bars']}  "
              f"{s['start_s']:6.2f} -> {s['end_s']:6.2f}")


if __name__ == "__main__":
    main()
