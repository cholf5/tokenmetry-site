// Assemble the self-contained promo page: fragments + timeline + CSS + JS.
// Usage: node build-page.mjs [en|zh] — copy strings come straight from
// src/i18n/ui.ts so the PV text always matches the site dictionary.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const promo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lang = process.argv[2] && ['en', 'zh'].includes(process.argv[2]) ? process.argv[2] : 'en';
const { ui, LANGUAGES } = await import(`../../src/i18n/ui.ts`);
const { site } = await import(`../../src/config/site.ts`);

const t = ui[lang];
const langAttr = LANGUAGES[lang]?.hreflang || lang; // zh → zh-CN
const tour = Object.fromEntries(t.tour.stops.filter(x => x.visual).map(x => [x.visual, x.title]));

const read = p => fs.readFileSync(p, 'utf8');
const fragDir = path.join(promo, lang === 'zh' ? 'ui-zh' : 'ui');
const frag = n => read(path.join(fragDir, `${n}.html`));

const TL = JSON.parse(read(path.join(promo, 'assets', 'timeline.json')));
const distCssDir = path.join(promo, '..', 'dist', '_astro');
const cssFile = fs.readdirSync(distCssDir).find(f => f.endsWith('.css'));
if (!cssFile) throw new Error('run `pnpm build` first — dist/_astro/*.css not found');
const distCss = read(path.join(distCssDir, cssFile));
const promoCss = read(path.join(promo, 'src', 'promo.css'));
const promoJs = read(path.join(promo, 'src', 'promo.js'));

/* PV copy — composed from dict facts; hook line/sub are the only
   hand-authored strings (anchored to the same demo numbers as the site). */
const S = {
  en: {
    hookTyped: `${site.sourceCount} agents · 432 sessions · last 30 days`,
    hookNum: '$137.49',
    hookSub: 'Do you know where it went?',
    logoTag: 'Know what your AI coding costs.',
    overviewCap: t.hero.title + ' ' + t.hero.titleLine2 + '.',
    trayCapSub: t.tray.subtitle,
    ctaFoot: t.outro.title,
    clock: 'Wed 7:42 PM',
  },
  zh: {
    hookTyped: `${site.sourceCount} 个数据源 · 432 个会话 · 最近 30 天`,
    hookNum: '$137.49',
    hookSub: '你知道它们花在哪儿了吗？',
    logoTag: t.hero.title + t.hero.titleLine2 + '。',
    overviewCap: t.hero.title + t.hero.titleLine2 + '。',
    trayCapSub: t.tray.subtitle,
    ctaFoot: t.outro.title,
    clock: '周三 19:42',
  },
}[lang];
S.ctaTag = t.footer.tagline;
S.montage = ['time', 'models', 'agents', 'cost'].map(n => tour[n]);

// brand mark svg (geometry from src/components/Logo.astro / app-icon.svg)
const bmark = (cls, px) => `
  <span class="bmark ${cls}" style="width:${px}px;height:${px}px">
    <svg width="${px}" height="${px}" viewBox="0 0 1024 1024" aria-hidden="true">
      <defs>
        <linearGradient id="pvbg-${px}" x1="150" y1="0" x2="874" y2="1024" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#14263f"></stop>
          <stop offset="1" stop-color="#0a1322"></stop>
        </linearGradient>
      </defs>
      <rect width="1024" height="1024" rx="239" fill="url(#pvbg-${px})"></rect>
      <rect class="bar" x="177" y="530" width="170" height="290" rx="85" fill="#1d9e79"></rect>
      <rect class="bar" x="427" y="365" width="170" height="455" rx="85" fill="#27c496"></rect>
      <rect class="bar" x="677" y="200" width="170" height="620" rx="85" fill="#38d6a4"></rect>
    </svg>
  </span>`;

const cap = (t2, s = '') => `<div class="cap"><div class="t">${t2}</div>${s ? `<div class="s">${s}</div>` : ''}</div>`;
/* Window replicas carry their own titles inside the UI — no external
   captions there. Only tray gets external copy (split composition). */

const montage = S.montage.map((title, i) => `
    <section class="scene" data-scene="${['time', 'models', 'agents', 'cost'][i]}">
      <div class="slot slot-montage slot-${['time', 'models', 'agents', 'cost'][i]}">${frag(['time', 'models', 'agents', 'cost'][i])}</div>
    </section>`).join('');

const page = `<!doctype html>
<html lang="${langAttr}" data-theme="dark">
<head>
<meta charset="utf-8">
<title>Tokenmetry — Launch PV (${lang})</title>
<style>${distCss}</style>
<style>${promoCss}</style>
</head>
<body>
<div class="stage">
  <div class="camera">

    <section class="scene" data-scene="hook">
      <div class="hook-type"><span class="typed" data-text="${S.hookTyped}"></span><span class="cursor"></span></div>
      <div class="hook-num">${S.hookNum}</div>
      <div class="hook-rule"></div>
      <div class="hook-sub">${S.hookSub}</div>
    </section>

    <section class="scene" data-scene="logo">
      <div class="logo-wrap">
        ${bmark('logo-mark', 170)}
        <div class="logo-word">Tokenmetry</div>
        <div class="logo-tag">${S.logoTag}</div>
      </div>
    </section>

    <section class="scene" data-scene="overview">
      <div class="slot slot-overview">${frag('overview')}</div>
    </section>

    ${montage}

    <section class="scene" data-scene="sources">
      <div class="slot-sources">${frag('sources')}</div>
    </section>

    <section class="scene" data-scene="tray">
      <div class="menubar">
        <svg class="glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2.5 9.5C8 4.5 16 4.5 21.5 9.5"/><path d="M5.5 13c4-3.4 9-3.4 13 0"/><path d="M8.7 16.4c2-1.7 4.6-1.7 6.6 0"/><circle cx="12" cy="19.4" r="1.15" fill="currentColor" stroke="none"/></svg>
        <svg class="glyph" viewBox="0 0 26 22" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="1" y="3" width="20" height="16" rx="3.5"/><rect x="23" y="8.5" width="2.4" height="5" rx="1.1" fill="currentColor" stroke="none"/><rect x="3.2" y="5.2" width="15.6" height="11.6" rx="1.8" fill="currentColor" stroke="none" opacity=".28"/></svg>
        <span class="clock">${S.clock}</span>
        <span class="tk-icon">${bmark('tray-mark', 28)}</span>
      </div>
      <div class="slot-tray">${frag('tray')}</div>
      <div class="tray-copy">
        <div class="t">${t.tray.title}</div>
        <div class="s">${S.trayCapSub}</div>
      </div>
    </section>

    <section class="scene" data-scene="cta">
      <div class="cta-wrap">
        ${bmark('cta-mark', 150)}
        <div class="cta-word">Tokenmetry</div>
        <div class="cta-tag">${S.ctaTag}</div>
        <div class="cta-chips">
          <span class="chip">v0.3.2</span>
          <span class="chip hi">tokenmetry.app</span>
          <span class="chip">github.com/cholf5/tokenmetry</span>
        </div>
        <div class="cta-foot">${S.ctaFoot}</div>
      </div>
    </section>

  </div>
  <div class="vignette"></div>
  <div class="flash"></div>
  <div class="fadeout"></div>
</div>
<script>window.TIMELINE = ${JSON.stringify(TL)};</script>
<script>${promoJs}</script>
</body>
</html>
`;

fs.mkdirSync(path.join(promo, 'page'), { recursive: true });
fs.writeFileSync(path.join(promo, 'page', `promo-${lang}.html`), page);
console.log(`promo-${lang}.html written (${(page.length / 1024).toFixed(0)} KB, lang=${langAttr})`);
