// Render README screenshots from the site's UI replica fragments.
// Serves dist/ over a throwaway http server (so the bundled /_astro fonts
// resolve), wraps promo/ui{-zh}/*.html in a rounded + drop-shadowed window
// frame, and element-screenshots with a transparent background at 2× —
// the PNGs drop onto both GitHub light and dark themes unedited.
//
// Usage: node capture-readme.mjs <outDir> [--scale 2] [--only id,id,…]
// Requires `pnpm build` first (dist/_astro/*.css) and `python3
// scripts/cut_fragments.py en|zh` for fresh fragments.
import { chromium } from 'playwright';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const distDir = path.join(siteRoot, 'dist');
const outDir = process.argv[2] && !process.argv[2].startsWith('--')
  ? path.resolve(process.argv[2])
  : path.resolve(siteRoot, '..', 'tokenmetry', 'docs', 'screenshots');
const onlyArg = process.argv.includes('--only')
  ? process.argv[process.argv.indexOf('--only') + 1].split(',') : null;
const SCALE = process.argv.includes('--scale')
  ? Number(process.argv[process.argv.indexOf('--scale') + 1]) : 2;

const cssFile = fs.readdirSync(path.join(distDir, '_astro')).find(f => f.endsWith('.css'));
if (!cssFile) throw new Error('run `pnpm build` first — dist/_astro/*.css not found');
const distCss = fs.readFileSync(path.join(distDir, '_astro', cssFile), 'utf8');
const read = p => fs.readFileSync(p, 'utf8');
const frag = (lang, name) => read(path.join(siteRoot, 'promo', lang === 'zh' ? 'ui-zh' : 'ui', `${name}.html`));

/* name → [design width, filename] — widths from app-demo.ts designWidth.
   time is left out: its activity-calendar card is a deliberate stub
   (legend + note only), which reads as a rendering bug in a still. */
const VIEWS = {
  overview: [1280, 'overview'],
  sessions: [1280, 'views-sessions'],
  models: [1280, 'views-models'],
  cost: [1280, 'views-cost'],
  pricing: [1180, 'views-pricing'],
  tray: [420, 'tray'],
};
const LANGS = { en: 'en', zh: 'zh-CN' };

/* overview renders in both themes (GitHub <picture> switches); the
   gallery and tray ship dark-only to keep the repo lean and the look
   consistent. */
const THEMES = { overview: ['dark', 'light'], tray: ['dark'], default: ['dark'] };
const shotId = (v, theme) => `${v}-${theme}`;
const shotFile = (v, lang, theme) => `${VIEWS[v][1]}-${lang}-${theme}.png`;

const PAD = 72; // room for the drop shadow inside the screenshot element
const page = (lang, shots) => `<!doctype html>
<html lang="${LANGS[lang]}" data-theme="dark">
<head><meta charset="utf-8"><title>readme shots (${lang})</title>
<style>${distCss}</style>
<style>
  body { margin: 0; background: transparent; }
  .wrap { display: inline-block; padding: ${PAD}px; }
  .win { overflow: hidden; border-radius: 16px; }
  .wrap[data-theme=dark] .win {
    box-shadow: 0 0 0 2px rgba(255,255,255,.06), 0 30px 80px rgba(2,8,20,.55),
                0 8px 26px rgba(2,8,20,.38);
  }
  .wrap[data-theme=light] .win {
    box-shadow: 0 0 0 2px rgba(30,50,90,.10), 0 24px 64px rgba(30,50,90,.22),
                0 6px 18px rgba(30,50,90,.12);
  }
  .wrap[data-kind=tray] { padding: ${Math.round(PAD * 1.4)}px; }
  .wrap[data-kind=tray] .win { border-radius: 10px; background: transparent; }
  .wrap[data-kind=tray] .tapp { background: transparent; }
</style></head>
<body>
${shots.map(s => `  <div class="wrap" id="${shotId(s.view, s.theme)}" data-theme="${s.theme}" data-kind="${s.view === 'tray' ? 'tray' : 'view'}">
    <div class="win" style="width:${VIEWS[s.view][0]}px">${frag(lang, s.view)}</div>
  </div>`).join('\n')}
</body></html>`;

const server = http.createServer((req, res) => {
  const url = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const file = path.join(distDir, decodeURIComponent(url));
  if (!file.startsWith(distDir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404).end(); return;
  }
  const type = { '.html': 'text/html', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml' }[path.extname(file)] || 'application/octet-stream';
  res.writeHead(200, { 'content-type': type }).end(fs.readFileSync(file));
});
await new Promise(res => server.listen(0, '127.0.0.1', res));
const base = `http://127.0.0.1:${server.address().port}`;

fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
let done = 0;
for (const [lang, htmlLang] of Object.entries(LANGS)) {
  const wanted = Object.keys(VIEWS).filter(v => !onlyArg
    || (THEMES[v] ?? THEMES.default).some(th => onlyArg.some(o => shotFile(v, lang, th).includes(o))));
  const combos = wanted.flatMap(view => (THEMES[view] ?? THEMES.default).map(theme => ({ view, theme })));
  const pageFile = path.join(distDir, `_readme-shots-${lang}.html`);
  fs.writeFileSync(pageFile, page(lang, combos));
  const p = await browser.newPage({ viewport: { width: 1500, height: 900 }, deviceScaleFactor: SCALE });
  await p.goto(`${base}/_readme-shots-${lang}.html`);
  await p.evaluate(() => document.fonts.ready);
  // same content-height measurement as promo.js fit(): views declare a
  // design height that can exceed their content — crop the blank tail so
  // stills end at the last painted card (+10 design px of breathing room).
  await p.evaluate(() => {
    document.querySelectorAll('.tapp').forEach(tapp => {
      const tappR = tapp.getBoundingClientRect();
      if (!tappR.width) return;
      let maxBottom = 0;
      tapp.querySelectorAll('*').forEach(el => {
        const er = el.getBoundingClientRect();
        if (er.height > 0) maxBottom = Math.max(maxBottom, er.bottom - tappR.top);
      });
      const dwM = (tapp.getAttribute('style') || '').match(/--dw:\s*([\d.]+)/);
      const u = tappR.width / (dwM ? parseFloat(dwM[1]) : 1280);
      if (tappR.height - maxBottom > 40) {
        tapp.style.height = `calc(${(maxBottom / u + 10).toFixed(1)} * var(--u))`;
      }
    });
  });
  await p.waitForTimeout(120);
  for (const view of wanted) {
    for (const theme of THEMES[view] ?? THEMES.default) {
      if (onlyArg && !onlyArg.some(o => shotFile(view, lang, theme).includes(o))) continue;
      const target = p.locator(`#${shotId(view, theme)}`);
      await target.scrollIntoViewIfNeeded();
      await p.waitForTimeout(30);
      const out = path.join(outDir, shotFile(view, lang, theme));
      const raw = path.join(outDir, 'raw-' + shotFile(view, lang, theme));
      await target.screenshot({ path: raw, omitBackground: true });
      // palette quantization (libimagequant) — flat UI colors shrink ~70%
      await sharp(raw)
        .png({ palette: true, quality: 92, effort: 10 })
        .toFile(out);
      fs.rmSync(raw);
      const kb = (fs.statSync(out).size / 1024).toFixed(0);
      console.log(`${out.replace(outDir + path.sep, '')}  ${kb} KB`);
      done++;
    }
  }
  await p.close();
  fs.rmSync(pageFile);
}
await browser.close();
server.close();
console.log(`done: ${done} shots → ${outDir}`);
