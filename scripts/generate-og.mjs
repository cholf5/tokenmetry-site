/**
 * 生成 OG 分享图（1200×630，中英各一张）→ public/og-{zh,en}.png
 * 用法：node scripts/generate-og.mjs
 * 构建前自动运行（见 package.json build 脚本）。
 */
import { Resvg } from '@resvg/resvg-js';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const W = 1200;
const H = 630;

// 与产品视觉一致：bg / 面板 / 文字取自 Tokens.axaml Dark 值
const C = {
  bg: '#0b1120',
  panel: '#111c2e',
  line: '#22324a',
  text: '#e8eef9',
  muted: '#8293ad',
  blue: '#4c8dff',
  purple: '#a779ff',
  teal: '#12b886',
  amber: '#ffad4d',
};

const zh = {
  headline: '看清你的 Token 花在了哪里。',
  sub: '开源的 AI 编程用量分析 · 直读 19 个 Agent 本地日志',
  badges: '开源 · 免费 · AGPL-3.0 · Windows / macOS / Linux',
  sans: 'PingFang SC, Hiragino Sans GB, Noto Sans CJK SC, sans-serif',
};

const en = {
  headline: 'Understand where your tokens go.',
  sub: 'Open-source token analytics for AI development · reads 19 coding agents',
  badges: 'Open source · Free · AGPL-3.0 · Windows / macOS / Linux',
  sans: 'Helvetica Neue, Arial, PingFang SC, sans-serif',
};

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// 装饰性柱状图（呼应产品趋势图）
function bars(x, yBase, widths) {
  const bw = 16;
  const gap = 7;
  return widths
    .map((h, i) => {
      const color = i === widths.length - 4 ? C.blue : '#2d4b7a';
      return `<rect x="${x + i * (bw + gap)}" y="${yBase - h}" width="${bw}" height="${h}" rx="3" fill="${color}"/>`;
    })
    .join('');
}

function svg(d) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#3986ed"/><stop offset="1" stop-color="#8a68e9"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.72" cy="0" r="0.85">
      <stop offset="0" stop-color="${C.blue}" stop-opacity="0.16"/>
      <stop offset="0.6" stop-color="${C.blue}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- brand -->
  <rect x="96" y="86" width="66" height="66" rx="17" fill="url(#lg)"/>
  <path d="M114 108h30M129 108v26" stroke="#fff" stroke-width="6.5" stroke-linecap="round"/>
  <text x="184" y="116" font-family="${d.sans}" font-size="34" font-weight="700" fill="${C.text}" letter-spacing="-0.5">Tokenmetry</text>
  <text x="185" y="146" font-family="${d.sans}" font-size="16" fill="${C.muted}">tokenmetry.app</text>

  <!-- headline -->
  <text x="96" y="330" font-family="${d.sans}" font-size="56" font-weight="700" fill="${C.text}" letter-spacing="-1">${esc(d.headline)}</text>
  <text x="97" y="388" font-family="${d.sans}" font-size="25" fill="${C.muted}">${esc(d.sub)}</text>

  <!-- badges -->
  <rect x="96" y="446" width="560" height="46" rx="23" fill="${C.panel}" stroke="${C.line}"/>
  <circle cx="126" cy="469" r="5" fill="${C.teal}"/>
  <text x="144" y="476" font-family="${d.sans}" font-size="17" fill="#b9c8de">${esc(d.badges)}</text>

  <!-- 装饰柱状图（右下，呼应产品趋势视图） -->
  ${bars(760, 520, [34, 58, 44, 92, 66, 118, 84, 140, 104, 156])}
  <line x1="752" y1="520.5" x2="1090" y2="520.5" stroke="${C.line}"/>

  <!-- 右上装饰系列色点 -->
  <circle cx="1064" cy="108" r="6" fill="${C.blue}"/>
  <circle cx="1086" cy="108" r="6" fill="${C.amber}"/>
  <circle cx="1108" cy="108" r="6" fill="${C.purple}"/>
</svg>`;
}

const outDir = new URL('../public', import.meta.url).pathname;
mkdirSync(outDir, { recursive: true });

for (const [locale, d] of [['zh', zh], ['en', en]]) {
  const png = new Resvg(svg(d), {
    fitTo: { mode: 'width', value: W },
    font: { loadSystemFonts: true, defaultFontFamily: d.sans.split(',')[0] },
  }).render().asPng();
  const out = join(outDir, `og-${locale}.png`);
  writeFileSync(out, png);
  console.log(`✓ ${out}`);
}
