#!/usr/bin/env python3
"""Cut UI replica fragments out of the built dist/index.html.

Each replica sits in a `div.visual` wrapper starting with `div.tapp-frame`;
fragments are cut with a balanced-tag scanner so nested divs survive.
Outputs promo/ui/*.html + a manifest of aria-labels.
"""
import json
import re
import sys
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent.parent
OUT = SITE / "promo" / "ui"

LANGS = {
    "en": {
        "dist": SITE / "dist" / "index.html",
        "keys": [
            ("overview:", "overview"),
            ("sessions view", "sessions"),
            ("models view", "models"),
            ("agents view", "agents"),
            ("time analysis", "time"),
            ("cost analysis", "cost"),
            ("pricing view", "pricing"),
            ("projects view", "projects"),
            ("tray", "tray"),
        ],
    },
    "zh": {
        "dist": SITE / "dist" / "zh" / "index.html",
        "keys": [
            ("总览视图", "overview"),
            ("会话明细", "sessions"),
            ("模型统计", "models"),
            ("Agent 统计", "agents"),
            ("时间分析", "time"),
            ("成本分析", "cost"),
            ("计价视图", "pricing"),
            ("项目统计", "projects"),
            ("托盘", "tray"),
        ],
    },
}


def balanced_block(html: str, start: int, tag: str) -> str:
    """Extract html[start:] from the opening tag of `tag` to its match."""
    open_pat = re.compile(rf"<{tag}(?=[\s>])")
    close_pat = re.compile(rf"</{tag}\s*>")
    depth = 0
    pos = start
    while pos < len(html):
        m_open = open_pat.search(html, pos)
        m_close = close_pat.search(html, pos)
        if m_close and (not m_open or m_close.start() < m_open.start()):
            depth -= 1
            if depth == 0:
                return html[start:m_close.end()]
            pos = m_close.end()
        elif m_open:
            depth += 1
            pos = m_open.end()
        else:
            break
    raise ValueError(f"unbalanced {tag} at {start}")


def main():
    lang = sys.argv[1] if len(sys.argv) > 1 else "en"
    dist = LANGS[lang]["dist"]
    keys = LANGS[lang]["keys"]
    out = SITE / "promo" / ("ui-zh" if lang == "zh" else "ui")
    html = dist.read_text()
    out.mkdir(parents=True, exist_ok=True)
    manifest = {}

    # every tapp-frame with its nearest preceding aria-label
    frames = []
    for m in re.finditer(r'<div class="tapp-frame"', html):
        back = html.rfind('aria-label="', 0, m.start())
        label = html[back + 12 : html.find('"', back + 12)] if back != -1 else "?"
        frames.append((m.start(), label))

    used = set()
    for start, label in frames:
        low = label.lower()
        name = None
        for key, slug in keys:
            if key.lower() in low and slug not in used:
                name = slug
                break
        if not name:
            continue
        block = balanced_block(html, start, "div")
        (out / f"{name}.html").write_text(block)
        manifest[name] = {"aria": label, "bytes": len(block)}
        used.add(name)

    # sources wall: whole section
    i = html.find('<section id="sources"')
    if i != -1:
        block = balanced_block(html, i, "section")
        (out / "sources.html").write_text(block)
        manifest["sources"] = {"aria": "sources wall section", "bytes": len(block)}

    # brand logo anchor from nav
    m = re.search(r'<a class="brand"', html)
    if m:
        block = balanced_block(html, m.start(), "a")
        (out / "brand.html").write_text(block)
        manifest["brand"] = {"aria": "nav brand", "bytes": len(block)}

    (out / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"[{lang}] {dist.name} → {out.name}")
    for name, info in manifest.items():
        print(f"{name:10s} {info['bytes']:7d}B  {info['aria'][:70]}")


if __name__ == "__main__":
    main()
