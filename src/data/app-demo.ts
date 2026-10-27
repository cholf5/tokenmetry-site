/**
 * 官网 UI 复刻（src/components/visuals/）的演示数据与数字格式化。
 *
 * 数据出处（不虚构）：
 * - 总览（overview-*）：真机手记数字，与原 overview-{locale}-{theme}.png 逐字一致；
 * - 其余视图：主仓库 tests/Tokenmetry.App.Headless.Tests/Shell/SiteShotsTests.cs 的
 *   SiteData 受控演示数据（截图渲染于 2026-10-25，星期分布 / 最活跃日与该日历一致）。
 *
 * FormatCompact / FormatCost 移植自主仓库 Controls/TrendChart.axaml.cs（尾数 ≥1000 取整、
 * ≥100 一位小数、其余两位，越档尾数升档），保证两语言数字与产品逐字相同。
 */
import type { VisualLocale } from '../i18n/ui';

/* ── 数字格式化（移植 TrendChart.FormatCompact / FormatCostUsd）── */

const zhUnits = [
  { threshold: 1e4, divisor: 1e4, unit: '万' },
  { threshold: 1e8, divisor: 1e8, unit: '亿' },
  { threshold: 1e12, divisor: 1e12, unit: '万亿' },
];

const enUnits = [
  { threshold: 1e3, divisor: 1e3, unit: 'K' },
  { threshold: 1e6, divisor: 1e6, unit: 'M' },
  { threshold: 1e9, divisor: 1e9, unit: 'B' },
  { threshold: 1e12, divisor: 1e12, unit: 'T' },
];

export function fmtCompact(value: number, locale: VisualLocale): string {
  const units = locale === 'zh' ? zhUnits : enUnits;
  const abs = Math.abs(value);
  let index = -1;
  for (let i = units.length - 1; i >= 0; i--) {
    if (abs >= units[i].threshold) {
      index = i;
      break;
    }
  }
  if (index < 0) return value.toString();
  // 尾数取整达到本档上限（9999.5万 → 10000万）时升入上一档（上限 = 下一档阈值 / 本档除数）
  if (index + 1 < units.length && Math.round(abs / units[index].divisor) >= units[index + 1].threshold / units[index].divisor) index++;
  const scaled = value / units[index].divisor;
  const digits = Math.abs(scaled) >= 1000 ? 0 : Math.abs(scaled) >= 100 ? 1 : 2;
  let text = scaled.toFixed(digits);
  if (text.includes('.')) text = text.replace(/0+$/, '').replace(/\.$/, '');
  return text + units[index].unit;
}

export const fmtCost = (known: number | null, hasUnknown = false): string | null =>
  known === null ? null : `$${known.toFixed(2)}${hasUnknown ? '+' : ''}`;

export const fmtN0 = (n: number): string => n.toLocaleString('en-US');

export const fmtPct1 = (share: number): string => `${(share * 100).toFixed(1)}%`;

/* ── 总览（真机手记，与原截图逐字一致）── */

export const overview = {
  totalText: { zh: '35.22亿', en: '3.52B' } as Record<VisualLocale, string>,
  /** KPI 与脚注：值 + 涨跌方向 + 百分比文案 */
  kpis: {
    tokens: { delta: '158.2%', dir: 'up' as const },
    cost: { delta: '128.3%', dir: 'up' as const, value: '$137.49' },
    sessions: { delta: '163.4%', dir: 'up' as const, value: '432' },
    cache: { delta: '0.4%', dir: 'down' as const, value: '96.6%' },
  },
  /** 按日汇总 10/1–10/25（单位 M），与原趋势图逐点校准 */
  trendM: [
    95, 108, 105, 105, 107, 148, 127, 62, 80, 155, 205, 405, 295, 48, 130, 122, 425, 95, 65, 30, 5, 0, 45, 200, 125,
  ],
  /** 轴刻度标签恒为 ASCII 短单位（ScottPlot 无 CJK 字形，两语言一致） */
  trendXLabels: ['10/1/2026', '10/4/2026', '10/7/2026', '10/10/2026', '10/13/2026', '10/16/2026', '10/19/2026', '10/22/2026', '10/25/2026'],
  trendYLabels: ['0', '100M', '200M', '300M', '400M'],
  agentDonut: {
    segments: [
      { name: 'ZCode', share: 97.9, color: 'var(--series-0)' },
      { name: 'OpenCode', share: 2.1, color: 'var(--series-1)' },
    ],
  },
  models: [
    { logo: 'zai', name: 'glm-5-3-flash', tokens: '3,386,191,480', share: '96.2%' },
    { logo: 'deepseek', name: 'deepseek-flash', tokens: '95,470,684', share: '2.7%' },
    { logo: 'zai', name: 'glm-5-3', tokens: '39,842,526', share: '1.1%' },
    { logo: 'zai', name: 'ark-code-latest', tokens: '344,941', share: '0.0%' },
  ],
  typeDonut: {
    segments: [
      { share: 2.8, color: '#4c8dff' },
      { share: 0.6, color: '#a779ff' },
      { share: 96.6, color: '#38d6a4' },
    ],
  },
  updated: { zh: '19:39', en: '19:44' } as Record<VisualLocale, string>,
};

/* ── 会话/Agent/模型/项目/时间/成本（SiteData，周口径：36.44M token / $81.22+ / 214 会话）── */

export const week = {
  tokens: 36_440_000,
  cacheRead: 28_430_000,
  knownCost: 81.22,
  hasUnknownCost: true,
  sessions: 214,
  cacheShare: 0.78,
  prev: { tokens: 33_100_000, cost: 74.9, sessions: 198, cacheShare: 0.76 },
};

export const agentRows = [
  { key: 'Claude Code', logo: 'claudeCode', sessions: 86, input: 1_912_800, output: 797_000, total: 15_940_000, cost: 38.62 },
  { key: 'Codex', logo: 'codex', sessions: 54, input: 1_179_600, output: 491_500, total: 9_830_000, cost: 23.15 },
  { key: 'ZCode', logo: 'zai', sessions: 33, input: 625_200, output: 260_500, total: 5_210_000, cost: 12.08 },
  { key: 'Gemini CLI', logo: 'geminiCli', sessions: 24, input: 400_800, output: 167_000, total: 3_340_000, cost: 7.42 },
  { key: 'Kimi Code', logo: 'kimi', sessions: 17, input: 254_400, output: 106_000, total: 2_120_000, cost: null },
] as const;

export const modelRows = [
  { key: 'claude-sonnet-4-5', logo: 'claude', provider: 'Anthropic', agent: 'Claude Code', agentLogo: 'claudeCode', agentExtra: 0, input: 1_711_200, output: 713_000, cacheRead: 11_122_800, total: 14_260_000, cost: 34.85 },
  { key: 'gpt-5.1', logo: 'openai', provider: 'OpenAI', agent: 'Codex', agentLogo: 'codex', agentExtra: 0, input: 1_098_000, output: 457_500, cacheRead: 7_137_000, total: 9_150_000, cost: 21.53 },
  { key: 'glm-5.3', logo: 'zai', provider: 'Z.ai', agent: 'ZCode', agentLogo: 'zai', agentExtra: 0, input: 571_200, output: 238_000, cacheRead: 3_712_800, total: 4_760_000, cost: 11.02 },
  { key: 'gemini-2.5-pro', logo: 'gemini', provider: 'Google', agent: 'Gemini CLI', agentLogo: 'geminiCli', agentExtra: 0, input: 381_600, output: 159_000, cacheRead: 2_480_400, total: 3_180_000, cost: 7.06 },
  { key: 'kimi-k2.5', logo: 'kimi', provider: 'Moonshot', agent: 'Kimi Code', agentLogo: 'kimi', agentExtra: 0, input: 254_400, output: 106_000, cacheRead: 1_653_600, total: 2_120_000, cost: null },
  { key: 'qwen3-coder-plus', logo: 'qwen', provider: 'Alibaba', agent: 'ZCode', agentLogo: 'zai', agentExtra: 2, input: 230_400, output: 96_000, cacheRead: 1_497_600, total: 1_920_000, cost: 4.81 },
  { key: 'claude-haiku-4.5', logo: 'claude', provider: 'Anthropic', agent: 'Claude Code', agentLogo: 'claudeCode', agentExtra: 2, input: 126_000, output: 52_500, cacheRead: 819_000, total: 1_050_000, cost: 0.95 },
] as const;

export const modelTotals = { input: 4_372_800, output: 1_822_000, cacheRead: 28_423_200, total: 36_440_000, cost: 80.22 };

export const projectRows = [
  { key: 'checkout-api', sessions: 38, total: 11_820_000, cost: 27.41, share: 0.324, avg: 311_053 },
  { key: 'tokenmetry', sessions: 52, total: 9_640_000, cost: 22.18, share: 0.265, avg: 185_385 },
  { key: 'billing-etl', sessions: 41, total: 6_350_000, cost: 14.52, share: 0.174, avg: 154_878 },
  { key: 'rag-playground', sessions: 47, total: 5_230_000, cost: 11.84, share: 0.144, avg: 111_277 },
  { key: 'cholf-site', sessions: 36, total: 3_400_000, cost: 5.27, share: 0.093, avg: 94_444 },
] as const;

/** 周一..周日（截图渲染周 2026-10-19..10-25），share 单位 % */
export const weekdayRows = [
  { tokens: 4_600_000, share: 12.6 },
  { tokens: 7_200_000, share: 19.8 },
  { tokens: 5_400_000, share: 14.8 },
  { tokens: 8_100_000, share: 22.2 },
  { tokens: 6_500_000, share: 17.8 },
  { tokens: 2_400_000, share: 6.6 },
  { tokens: 2_240_000, share: 6.1 },
] as const;

/** 按小时分布 0..23 时（单位 M；14 时为高峰 2.4M = 12.2%） */
export const hourlyM = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0.9, 2.1, 1.8, 0.8, 1.2, 2.4, 2.0, 1.7, 1.1, 0.5, 0.9, 1.9, 1.6, 0.7, 0];

export const hourlyYLabels = ['0', '500K', '1M', '1.5M', '2M', '2.5M'];

export const timeKpi = {
  peak: '14:00—15:00',
  peakShare: '12.2%',
  peakDay: '2026-10-22',
  peakDayTokens: 8_100_000,
  dailyAvg: 5_205_714,
  activeDays: 7,
};

export type SessionRow = {
  project: string;
  sessionId: string;
  agent: string;
  agentLogo: string;
  model: string;
  tokens: number;
  cost: number | null;
  hoursAgo: number;
};

/** 与 SiteData.Sessions() 同序；会话 ID 每次 headless 渲染重新生成，取自原截图留档 */
export const sessionRows: Record<VisualLocale, SessionRow[]> = {
  zh: [
    { project: 'checkout-api', sessionId: 'c1d18efd-605d-46c3-b4ed-ba2c6e78f0de', agent: 'Claude Code', agentLogo: 'claudeCode', model: 'claude-sonnet-4-5', tokens: 2_410_000, cost: 5.87, hoursAgo: 9 },
    { project: 'checkout-api', sessionId: '34bd5246-0805-45ec-8ff8-ff3a846bfe09', agent: 'Codex', agentLogo: 'codex', model: 'gpt-5.1', tokens: 860_000, cost: 2.03, hoursAgo: 11 },
    { project: 'tokenmetry', sessionId: 'fd8b51ff-ff11-4b8e-9097-f13566d1ea9f', agent: 'ZCode', agentLogo: 'zai', model: 'glm-5.3', tokens: 1_730_000, cost: 4.01, hoursAgo: 8 },
    { project: 'tokenmetry', sessionId: '4aeba7ab-1f07-4c1c-b9d2-8482c017f069', agent: 'Claude Code', agentLogo: 'claudeCode', model: 'claude-sonnet-4-5', tokens: 1_180_000, cost: 2.88, hoursAgo: 6 },
    { project: 'rag-playground', sessionId: '0547ae73-8302-45c5-be22-1d6715990cc', agent: 'Gemini CLI', agentLogo: 'geminiCli', model: 'gemini-2.5-pro', tokens: 640_000, cost: 1.42, hoursAgo: 7 },
    { project: 'billing-etl', sessionId: 'b75d10b5-805d-4022-9c89-c73e52d705be', agent: 'Kimi Code', agentLogo: 'kimi', model: 'kimi-k2.5', tokens: 720_000, cost: null, hoursAgo: 5 },
    { project: 'billing-etl', sessionId: 'fadea944-f538-45a2-a2bb-1e31e22e1aaa', agent: 'Codex', agentLogo: 'codex', model: 'gpt-5.1', tokens: 1_050_000, cost: 2.47, hoursAgo: 4 },
    { project: 'cholf-site', sessionId: '32648997-8b78-4fa6-8c56-54afaccc88ef', agent: 'Claude Code', agentLogo: 'claudeCode', model: 'claude-haiku-4.5', tokens: 310_000, cost: 0.28, hoursAgo: 3 },
    { project: 'cholf-site', sessionId: '927985b2-50c9-450f-b0d8-09e471cde478', agent: 'ZCode', agentLogo: 'zai', model: 'glm-5.3', tokens: 540_000, cost: 1.25, hoursAgo: 2 },
    { project: 'rag-playground', sessionId: 'd41d09e2-6b34-4f60-9f2e-0c83ab51e7c2', agent: 'Claude Code', agentLogo: 'claudeCode', model: 'claude-sonnet-4-5', tokens: 940_000, cost: 2.29, hoursAgo: 0 },
  ],
  en: [
    { project: 'checkout-api', sessionId: '33b0a49e-9550-4317-b940-5c98e6da512f', agent: 'Claude Code', agentLogo: 'claudeCode', model: 'claude-sonnet-4-5', tokens: 2_410_000, cost: 5.87, hoursAgo: 9 },
    { project: 'checkout-api', sessionId: '4a807aa6-9786-493a-8dbd-3135dcfdf726', agent: 'Codex', agentLogo: 'codex', model: 'gpt-5.1', tokens: 860_000, cost: 2.03, hoursAgo: 11 },
    { project: 'tokenmetry', sessionId: 'a76efef9-0d56-4c9e-9b08-551553de907c', agent: 'ZCode', agentLogo: 'zai', model: 'glm-5.3', tokens: 1_730_000, cost: 4.01, hoursAgo: 8 },
    { project: 'tokenmetry', sessionId: '53823a68-7ac0-49df-92cd-4a29e4605cb0', agent: 'Claude Code', agentLogo: 'claudeCode', model: 'claude-sonnet-4-5', tokens: 1_180_000, cost: 2.88, hoursAgo: 6 },
    { project: 'rag-playground', sessionId: '6fbf0f29-92de-4d12-bff9-b693966627d1', agent: 'Gemini CLI', agentLogo: 'geminiCli', model: 'gemini-2.5-pro', tokens: 640_000, cost: 1.42, hoursAgo: 7 },
    { project: 'billing-etl', sessionId: '9704a339-3d57-48d2-baec-f5da7c4d97d4', agent: 'Kimi Code', agentLogo: 'kimi', model: 'kimi-k2.5', tokens: 720_000, cost: null, hoursAgo: 5 },
    { project: 'billing-etl', sessionId: '3b399071-676f-4efd-b0f2-9f5c0dd290b6', agent: 'Codex', agentLogo: 'codex', model: 'gpt-5.1', tokens: 1_050_000, cost: 2.47, hoursAgo: 4 },
    { project: 'cholf-site', sessionId: '05a624d5-0981-4521-965e-626c5395f61a', agent: 'Claude Code', agentLogo: 'claudeCode', model: 'claude-haiku-4.5', tokens: 310_000, cost: 0.28, hoursAgo: 3 },
    { project: 'cholf-site', sessionId: '1feaa790-2e24-44ee-b6a2-76e248dbbee9', agent: 'ZCode', agentLogo: 'zai', model: 'glm-5.3', tokens: 540_000, cost: 1.25, hoursAgo: 2 },
    { project: 'rag-playground', sessionId: '8c2f4b7d-51a9-4c3e-a6d8-2f90cb37e154', agent: 'Claude Code', agentLogo: 'claudeCode', model: 'claude-sonnet-4-5', tokens: 940_000, cost: 2.29, hoursAgo: 0 },
  ],
};

/* ── 托盘弹层（今日口径：2.24M / $9.31+ / 79.0%）── */

export const tray = {
  tokens: 2_240_000,
  knownCost: 9.31,
  hasUnknownCost: true,
  cacheShare: 0.79,
  segs: [
    { labelKey: 'input', full: 268_800, pct: '12.0%', color: '#4c8dff' },
    { labelKey: 'output', full: 112_000, pct: '5.0%', color: '#a779ff' },
    { labelKey: 'cache', full: 1_859_200, pct: '83.0%', color: '#38d6a4' },
  ],
  agents: [
    { key: 'Claude Code', logo: 'claudeCode', tokens: 980_000, cost: 4.12, bar: 1 },
    { key: 'Codex', logo: 'codex', tokens: 610_000, cost: 1.47, bar: 0.62 },
    { key: 'ZCode', logo: 'zai', tokens: 430_000, cost: 0.99, bar: 0.44 },
    { key: 'Kimi Code', logo: 'kimi', tokens: 220_000, cost: null, bar: 0.22 },
  ],
} as const;

/* ── 数据与计价（来源扫描快照，最近扫描 21:53）── */

export const sourceRows = [
  { key: 'Claude Code', logo: 'claudeCode', status: 'ok', scan: '21:53', records: 2_184 },
  { key: 'Codex', logo: 'codex', status: 'ok', scan: '21:53', records: 1_462 },
  { key: 'ZCode', logo: 'zai', status: 'ok', scan: '21:53', records: 938 },
  { key: 'DSH', logo: 'dsh', status: 'ok', scan: '21:53', records: 421 },
  { key: 'Gemini CLI', logo: 'geminiCli', status: 'ok', scan: '21:53', records: 356 },
  { key: 'Copilot CLI', logo: 'copilot', status: 'partial', scan: '21:53', records: 128 },
  { key: 'Kimi Code', logo: 'kimi', status: 'nodata', scan: '21:53', records: 0 },
  { key: 'Hermes', logo: 'hermes', status: 'notscanned', scan: null, records: null },
] as const;

/** 复刻页设计稿宽度（--dw，供 app-ui.css 的 --u 换算） */
export const designWidth = {
  overview: 1280,
  sessions: 1280,
  cost: 1280,
  models: 1280,
  projects: 1280,
  agents: 1280,
  time: 1280,
  'data-pricing': 1180,
  tray: 420,
} as const;
