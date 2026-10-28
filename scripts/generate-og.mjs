/**
 * 生成 OG 分享图（1200×630，中英各一张）→ public/og-{zh,en}.png
 * 用法：node scripts/generate-og.mjs
 * 构建前自动运行（见 package.json build 脚本）。
 */
import { Resvg } from '@resvg/resvg-js';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const W = 1200;
const H = 630;

// 与产品视觉一致：bg / 面板 / 文字取自 Tokens.axaml Dark 值（Q-019 降饱和批次后）
const C = {
  bg: '#0f1118',
  panel: '#171c25',
  line: '#2a323d',
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
    <!-- D-018 定稿应用图标底：深蓝黑方角渐变，坐标同 Logo.astro（userSpaceOnUse 走 1024 视图空间） -->
    <linearGradient id="tkapp" x1="150" y1="0" x2="874" y2="1024" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#14263f"/><stop offset="1" stop-color="#0a1322"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.72" cy="0" r="0.85">
      <stop offset="0" stop-color="${C.blue}" stop-opacity="0.16"/>
      <stop offset="0.6" stop-color="${C.blue}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- brand：D-018 绿柱图标整组缩放 66/1024（几何与 src/components/Logo.astro 同源） -->
  <g transform="translate(96 86) scale(0.0644531)">
    <rect width="1024" height="1024" rx="239" fill="url(#tkapp)"/>
    <rect x="177" y="530" width="170" height="290" rx="85" fill="#1d9e79"/>
    <rect x="427" y="365" width="170" height="455" rx="85" fill="#27c496"/>
    <rect x="677" y="200" width="170" height="620" rx="85" fill="#38d6a4"/>
  </g>
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

// URL.pathname 在 Windows 上是 "/E:/..."，会被当成相对路径拼出 E:\E:\；必须走 fileURLToPath
const outDir = fileURLToPath(new URL('../public', import.meta.url));
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
