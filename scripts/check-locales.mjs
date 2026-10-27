/**
 * 构建前校验 src/i18n/locales/*.ts 与 zh 字典的结构一致性：
 * - key 集合一致（多/缺 key 都报错）；
 * - 数组逐层长度一致；
 * - zh 字符串里的 {0} 类占位符在译文中保留；
 * - app 段注入正确（zh-hant → zh.app，其余 → en.app）；
 * - 尚为 PLACEHOLDER（英文占位）的语种给出提醒（不阻断构建）。
 * 依赖 Node ≥ 23.6 的原生 TS 类型剥离直接 import .ts。
 */
import { ui, locales } from '../src/i18n/ui.ts';

let failed = false;
let problems = 0;

function walk(path, base, other) {
  if (Array.isArray(base)) {
    if (!Array.isArray(other)) {
      console.error(`✗ ${path}: 应为数组`);
      problems++;
      return;
    }
    if (base.length !== other.length) {
      console.error(`✗ ${path}: 数组长度 ${base.length} ≠ ${other.length}`);
      problems++;
      return;
    }
    base.forEach((v, i) => walk(`${path}[${i}]`, v, other[i]));
    return;
  }
  if (base && typeof base === 'object') {
    if (!other || typeof other !== 'object' || Array.isArray(other)) {
      console.error(`✗ ${path}: 应为对象`);
      problems++;
      return;
    }
    for (const k of Object.keys(base)) {
      if (!(k in other)) {
        console.error(`✗ ${path}.${k}: 缺失`);
        problems++;
      }
    }
    for (const k of Object.keys(other)) {
      if (!(k in base)) {
        console.error(`✗ ${path}.${k}: 多余`);
        problems++;
      }
    }
    for (const k of Object.keys(base)) {
      if (k in other) walk(`${path}.${k}`, base[k], other[k]);
    }
    return;
  }
  if (typeof base !== typeof other) {
    console.error(`✗ ${path}: 类型 ${typeof base} ≠ ${typeof other}`);
    problems++;
    return;
  }
  if (typeof base === 'string') {
    if (other.trim() === '') {
      console.error(`✗ ${path}: 空字符串`);
      problems++;
    }
    for (const ph of base.match(/\{\d+\}/g) ?? []) {
      if (!other.includes(ph)) {
        console.error(`✗ ${path}: 缺占位符 ${ph}`);
        problems++;
      }
    }
  }
}

const zh = ui.zh;
for (const l of locales) {
  walk(l, zh, ui[l]);
}

/* app 段注入约定（见 src/i18n/ui.ts 头注） */
if (ui['zh-hant'].app !== zh.app) {
  console.error('✗ zh-hant.app 应注入 zh.app');
  problems++;
}
for (const l of locales.filter((x) => x !== 'en' && x !== 'zh' && x !== 'zh-hant')) {
  if (ui[l].app !== ui.en.app) {
    console.error(`✗ ${l}.app 应注入 en.app`);
    problems++;
  }
}

failed = problems > 0;
console.log(failed ? `✗ 结构校验未通过（${problems} 处）` : `✓ ${locales.length} 个语种结构与 zh 对齐`);

import { readFileSync } from 'node:fs';
for (const l of locales) {
  if (l === 'zh' || l === 'en') continue;
  const src = readFileSync(new URL(`../src/i18n/locales/${l}.ts`, import.meta.url), 'utf8');
  if (src.includes('PLACEHOLDER')) {
    console.warn(`⚠ ${l}.ts 仍为英文占位（PLACEHOLDER），翻译完成前不要发布该语种`);
  }
}

process.exit(failed ? 1 : 0);
