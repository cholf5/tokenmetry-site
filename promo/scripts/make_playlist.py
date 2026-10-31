#!/usr/bin/env python3
"""Generate promo/playlist.html — a local audition page for all CC0
candidates, sorted by beat steadiness. Normalizes filenames to <slug>.<ext>
first so file:// audio sources are browser-safe."""
import html
import json
import re
import shutil
from pathlib import Path

PROMO = Path(__file__).resolve().parent.parent
MUSIC = PROMO / "music"


def author_of(page: Path) -> str:
    if not page.exists():
        return "?"
    h = page.read_text(errors="ignore")
    m = re.search(r'Author:\s*<[^>]*>\s*<a href="/users/[^"]+"[^>]*>([^<]+)</a>', h)
    if not m:
        m = re.search(r'href="/users/[^"]+"[^>]*>([^<]+)</a>', h)
    return html.unescape(m.group(1)) if m else "?"


def main():
    analysis = json.loads((MUSIC / "analysis.json").read_text())
    rows = []
    for a in analysis:
        src = PROMO / a["file"]
        d = src.parent
        slug = d.name
        ext = src.suffix
        norm = d / f"{slug}{ext}"
        if src.name != norm.name:
            shutil.move(src, norm)
        a["file"] = str(norm.relative_to(PROMO))
        author = author_of(d / "page.html")
        rows.append({**a, "slug": slug, "author": author,
                     "audio": str(norm.relative_to(PROMO))})
    (MUSIC / "analysis.json").write_text(json.dumps(analysis, indent=2) + "\n")

    rows.sort(key=lambda r: -(r["steadiness"] if r["steadiness"] > 0 else -999))
    current = json.loads((PROMO / "assets" / "timeline.json").read_text())["track"].split(" ")[0]
    verdict = lambda s: (" excellent" if s > 100 else " great" if s > 25 else
                         " ok" if s > 8 else " weak" if s > 0 else " none")

    cards = []
    for i, r in enumerate(rows):
        dur_ok = "✓" if r["duration_s"] >= 38 else "✗ too short"
        cur = ' <span class="now">▶ current pick</span>' if r["slug"] == current else ""
        cards.append(f"""
    <div class="card{' dim' if r['duration_s'] < 38 or r['steadiness'] <= 0 else ''}">
      <div class="head">
        <span class="idx">#{i + 1}</span>
        <div class="tt">
          <div class="name">{html.escape(r['slug'])}{cur}</div>
          <div class="by">by {html.escape(r['author'])} · CC0 ·
            <a href="https://opengameart.org/content/{r['slug']}">opengameart.org</a></div>
        </div>
        <div class="stats">
          <span class="pill bpm">{r['bpm']:.0f} BPM</span>
          <span class="pill st{verdict(r['steadiness']).replace(' ', '-')}">grid{verdict(r['steadiness'])}</span>
          <span class="pill dur">{r['duration_s']:.0f}s {dur_ok}</span>
        </div>
      </div>
      <audio controls preload="none" src="{r['audio']}"></audio>
    </div>""")

    page = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Tokenmetry PV — CC0 music audition</title>
<style>
  body {{ background:#0f1118; color:#e8eef9; font:15px/1.5 -apple-system, "SF Pro Text", Helvetica, Arial, sans-serif;
         max-width: 860px; margin: 0 auto; padding: 40px 24px 80px; }}
  h1 {{ font-size: 26px; letter-spacing: -0.02em; }}
  p.sub {{ color: #9fb0c3; margin-top: -8px; }}
  .card {{ background:#171c25; border:1px solid #2c3440; border-radius:14px; padding:16px 20px; margin:14px 0; }}
  .card.dim {{ opacity:.45; }}
  .head {{ display:flex; align-items:center; gap:16px; margin-bottom:10px; }}
  .idx {{ color:#5b6b7d; font-family: ui-monospace, Menlo, monospace; }}
  .tt {{ flex:1; }}
  .name {{ font-weight:650; font-size:17px; }}
  .now {{ color:#38d6a4; font-size:12px; font-weight:600; }}
  .by {{ color:#8fa3b8; font-size:13px; }}
  .by a {{ color:#4c8dff; text-decoration:none; }}
  .stats {{ display:flex; gap:8px; }}
  .pill {{ font:12px ui-monospace, Menlo, monospace; padding:4px 10px; border-radius:999px;
           border:1px solid #2c3440; color:#b8c6d8; white-space:nowrap; }}
  .pill.st-excellent {{ border-color:#38d6a4; color:#38d6a4; }}
  .pill.st-great {{ border-color:#7fd6a8; color:#7fd6a8; }}
  .pill.st-ok {{ border-color:#e0b458; color:#e0b458; }}
  .pill.st-weak, .pill.st-none {{ border-color:#5b6b7d; color:#5b6b7d; }}
  audio {{ width:100%; height:36px; }}
  .note {{ background:rgba(56,214,164,.08); border:1px solid rgba(56,214,164,.3); border-radius:12px;
           padding:14px 18px; color:#bfe8d8; font-size:14px; }}
</style></head><body>
<h1>🎵 Tokenmetry PV — CC0 music audition</h1>
<p class="sub">All tracks verified CC0 (commercial use, no attribution required). Sorted by beat-grid
steadiness — the higher it is, the tighter the scene cuts lock to the beat. Dimmed cards: too short
(&lt;38s) or no detectable steady grid. Pick one and tell me the slug.</p>
<div class="note"><b>Current pick:</b> space-city — 115 BPM, stable grid, high-energy section chosen
programmatically. The whole timeline (scene cuts, count-ups, chip cascades) re-quantizes automatically
to whichever track you choose.</div>
{''.join(cards)}
</body></html>
"""
    (PROMO / "playlist.html").write_text(page)
    print(f"playlist: {PROMO / 'playlist.html'}  ({len(rows)} tracks)")
    for i, r in enumerate(rows):
        print(f"  #{i+1:2d} {r['slug']:42s} {r['bpm']:6.1f} BPM  grid={r['steadiness']:7.1f}  {r['duration_s']:6.1f}s  by {r['author']}")


if __name__ == "__main__":
    main()
