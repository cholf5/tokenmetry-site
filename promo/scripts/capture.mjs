// Frame-capture the promo page with headless Chromium.
// Usage:
//   node capture.mjs en              → full render to promo/frames/en/*.png (30 fps)
//   node capture.mzh zh 0.5,6.5,11   → stills only to promo/stills/zh/
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const promo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lang = ['en', 'zh'].includes(process.argv[2]) ? process.argv[2] : 'en';
const pageUrl = 'file://' + path.join(promo, 'page', `promo-${lang}.html`);
const FPS = 30;
const W = 1920, H = 1080;
const CLIP = { x: 0, y: 0, width: W, height: H };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.goto(pageUrl);
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => { window.PROMO.fit(); return window.PROMO.ready; });

const stills = process.argv[3];
if (stills) {
  const dir = path.join(promo, 'stills', lang);
  fs.mkdirSync(dir, { recursive: true });
  for (const t of stills.split(',').map(Number)) {
    await page.evaluate(t => window.PROMO.render(t), t);
    const f = path.join(dir, `s_${t.toFixed(2).replace('.', '_')}.png`);
    await page.screenshot({ path: f, clip: CLIP });
    console.log('still', t.toFixed(2), '→', path.basename(f));
  }
} else {
  const { DUR } = await page.evaluate(() => ({ DUR: window.PROMO.DUR }));
  const N = Math.round(DUR * FPS);
  const dir = path.join(promo, 'frames', lang);
  fs.rmSync(dir, { recursive: true, force: true }); // no stale frames from prior renders
  fs.mkdirSync(dir, { recursive: true });
  const t0 = Date.now();
  for (let i = 0; i < N; i++) {
    await page.evaluate(t => window.PROMO.render(t), i / FPS);
    await page.screenshot({ path: path.join(dir, `f${String(i).padStart(5, '0')}.png`), clip: CLIP });
    if (i % 120 === 0) {
      const rate = (i + 1) / ((Date.now() - t0) / 1000);
      console.log(`${i}/${N}  (${rate.toFixed(1)} fps capture)`);
    }
  }
  console.log(`done: ${N} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
await browser.close();
