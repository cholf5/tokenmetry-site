/**
 * 烘焙站点图标 → public/favicon-{16,32}.png、public/apple-touch-icon.png
 * 源：src/assets/brand/app-icon.svg（主仓库 D-018 定稿 v1 绿柱母版）
 * 用法：node scripts/generate-icons.mjs（或 pnpm icons）
 * 产物入库（与 og-*.png 不同）；改品牌图标：先改母版、同步 Logo.astro，再跑本脚本。
 */
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const master = readFileSync(join(root, 'src/assets/brand/app-icon.svg'), 'utf8');

// apple-touch-icon 要方角全出血（iOS 自行裁圆角）；母版是圆角盘
const square = master.replace('rx="239"', 'rx="0"');
if (square === master) throw new Error('母版结构变了：找不到 rx="239"');

const targets = [
  { svg: master, size: 32, file: 'favicon-32.png' },
  { svg: master, size: 16, file: 'favicon-16.png' },
  { svg: square, size: 180, file: 'apple-touch-icon.png' },
];

for (const { svg, size, file } of targets) {
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();
  writeFileSync(join(root, 'public', file), png);
  console.log(`✓ public/${file} (${size}×${size})`);
}
