#!/usr/bin/env python3
"""Analyze candidate tracks: BPM, beat grid, steadiness, energy profile.

Decodes audio via ffmpeg to mono 22.05 kHz PCM, computes a spectral-flux
onset envelope, estimates tempo by autocorrelation, locks the beat phase,
and reports stats. Output: analysis.json next to the audio files.
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

SR = 22050
HOP = 512
NFFT = 2048
BPM_MIN, BPM_MAX = 70.0, 180.0


def decode_mono(path: Path) -> np.ndarray:
    cmd = [
        "ffmpeg", "-v", "error", "-i", str(path),
        "-ac", "1", "-ar", str(SR), "-f", "f32le", "-",
    ]
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def onset_envelope(x: np.ndarray) -> np.ndarray:
    n = (len(x) - NFFT) // HOP
    win = np.hanning(NFFT).astype(np.float32)
    frames = np.lib.stride_tricks.as_strided(
        x, shape=(n, NFFT),
        strides=(x.strides[0] * HOP, x.strides[0]),
    ).copy()
    mag = np.abs(np.fft.rfft(frames * win, axis=1))
    flux = np.maximum(0.0, np.diff(mag, axis=0)).sum(axis=1)
    flux = np.concatenate([[0.0], flux])
    # normalize + remove slow local trend so quiet intros still count
    env = flux / (flux.max() + 1e-9)
    trend = np.convolve(env, np.ones(87) / 87.0, mode="same")
    return np.maximum(0.0, env - 0.5 * trend)


def estimate_bpm(env: np.ndarray):
    fps = SR / HOP  # envelope frames per second
    lo = int(fps * 60.0 / BPM_MAX)
    hi = int(fps * 60.0 / BPM_MIN)
    e = env - env.mean()
    ac = np.correlate(e, e, mode="full")[len(e) - 1:]
    ac[:lo] = 0.0
    window = ac[lo:hi + 1]
    k = int(np.argmax(window)) + lo
    # parabolic interpolation around the peak for sub-frame period accuracy
    if 1 <= k < len(ac) - 1:
        a, b, c = ac[k - 1], ac[k], ac[k + 1]
        denom = a - 2 * b + c
        shift = 0.5 * (a - c) / denom if denom != 0 else 0.0
    else:
        shift = 0.0
    period = (k + shift) / fps  # seconds per beat
    bpm = 60.0 / period
    # steadiness: peak vs local mean of the autocorrelation
    steadiness = float(ac[k] / (np.mean(ac[lo:hi]) + 1e-9))
    return bpm, period, steadiness


def lock_phase(env: np.ndarray, period: float):
    """Find beat-grid offset maximizing onset energy on beat positions."""
    fps = SR / HOP
    n = len(env)
    best = (0.0, -1.0)
    grid_times = None
    for phase in np.arange(0.0, period, 0.01):
        times = np.arange(phase, n / fps, period)
        idx = np.round(times * fps).astype(int)
        idx = idx[idx < n]
        score = float(env[idx].sum())
        if score > best[1]:
            best = (float(phase), score)
            grid_times = times
    return best[0], grid_times


def beat_strength(env: np.ndarray, times: np.ndarray) -> float:
    fps = SR / HOP
    idx = np.round(times * fps).astype(int)
    idx = idx[idx < len(env)]
    strong = env[idx]
    return float(strong.mean() / (env.mean() + 1e-9))


def analyze(path: Path) -> dict:
    x = decode_mono(path)
    dur = len(x) / SR
    env = onset_envelope(x)
    bpm, period, steadiness = estimate_bpm(env)
    phase, times = lock_phase(env, period)
    # RMS per second -> first/last 10 s vs the middle
    sec = int(SR)
    n_sec = int(dur)
    rms = np.array([np.sqrt(np.mean(x[i * sec:(i + 1) * sec] ** 2) + 1e-12)
                    for i in range(n_sec)])
    mid = rms[n_sec // 5: n_sec * 4 // 5] if n_sec > 10 else rms
    intro = rms[: min(8, n_sec)]
    peak = np.max(mid) if len(mid) else 1.0
    # onset density: peaks in the envelope
    thr = np.percentile(env, 96)
    above = env > thr
    onsets = int(np.sum(above[1:] & ~above[:-1]))
    return {
        "file": str(path.relative_to(path.parent.parent.parent)),
        "duration_s": round(dur, 2),
        "bpm": round(bpm, 2),
        "period_s": round(period, 4),
        "first_beat_s": round(phase, 4),
        "steadiness": round(steadiness, 2),
        "beat_strength": round(beat_strength(env, times), 2),
        "onsets_per_sec": round(onsets / dur, 2),
        "intro_ratio": round(float(intro.mean() / (peak + 1e-9)), 2),
    }


def main():
    music_dir = Path(__file__).resolve().parent.parent / "music"
    files = []
    for ext in ("ogg", "mp3", "wav"):
        files += sorted(music_dir.glob(f"*/*.{ext}"))
    files = [f for f in files if "audio_preview" not in f.name]
    if len(sys.argv) > 1:
        files = [f for f in files if sys.argv[1] in str(f)]
    results = [analyze(f) for f in files]
    out = music_dir / "analysis.json"
    out.write_text(json.dumps(results, indent=2) + "\n")
    hdr = ("file", "bpm", "dur", "stead", "bstr", "onst/s", "intro")
    print(f"{'file':42s} {'bpm':>6s} {'dur':>6s} {'stead':>6s} "
          f"{'bstr':>5s} {'onst/s':>6s} {'intro':>5s}")
    for r in results:
        print(f"{r['file']:42s} {r['bpm']:6.1f} {r['duration_s']:6.1f} "
              f"{r['steadiness']:6.2f} {r['beat_strength']:5.2f} "
              f"{r['onsets_per_sec']:6.2f} {r['intro_ratio']:5.2f}")
    print(f"\nwritten: {out}")


if __name__ == "__main__":
    main()
