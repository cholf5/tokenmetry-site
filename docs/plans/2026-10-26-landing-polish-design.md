# 官网视觉打磨——设计决策记录（2026-10-26）

来源：2026-10-26 全页艺术指导评审（代码走读 + 深浅双主题/移动端渲染截图验证）。
用户确认「继续」后落地其中四项；第五项（08 计价预告移入视图巡礼做全宽呼吸位）为信息架构变更，暂缓。

## 改动一：浅色主题分离度修正

**问题（渲染截图确认）**：浅色下产品截图「白上白」——#eef2f8 底 + 0.18 透明度阴影 + 1px #d8e0eb 边框，Hero 与视图巡礼的截图几乎融进页面；对账区渐变大数字的青色端（--series-4 #48bde3）在浅底上失去对比；1px 结构线与 full-bleed 色带界限消失。页面呈「深色精心、浅色将就」。

**决策**：
- `--line` #d8e0eb → **#c9d4e3**，`--line-soft` #e4eaf2 → **#d7dfe9**（结构线整体加深一档；`--muted` #66788f → **#5d7089**，改善 12–13.5px 小字在浅底上的可读性）。
- 浅色下所有真实截图外框统一加强：边框用加深后的线色，阴影提高到 0 20px 44px rgba(30,50,90,0.22) 一档（Hero `.shot` 用 0 0 0 1px 描边 + drop-shadow 组合，其余 visual 容器走 border + box-shadow）。
- 对账大数字渐变浅色端点由 `--series-4`（青）改为 **#7c4fd8**（浅色紫，即浅色 --purple 值）：蓝→紫两端在浅底均有对比。深色不动。
- full-bleed 浅色底 #eef2f8 → **#e9eef7**，配合加深边框后三个节拍（对账/托盘/获取）重新可辨。
- `--hero-glow` 浅色 0.08 → 0.12（顺手，微调）。

**替代方案与否决**：给浅色截图垫深色底框（对产品截图自身的浅色 UI 侵入感太强、像换了个产品）；只加深边框不动阴影（评审截图证明边框单独不够）。

## 改动二：托盘区块去 CSS 布景

**问题**：TrayMoment 用 CSS 画了 macOS 菜单栏（含苹果形、电池、Wi-Fi 字形）+ 渐变桌面 + 弹层悬浮，是全页唯一「画出来而非截出来」的场景，与「只用真实截图」（AGENTS.md #5）冲突，且易读出廉价感。

**决策**：删除 menubar/desktop/popover-wrap 整套合成布景与对应 CSS（含 .apple/.battery/.wifi 字形），改为**真实弹层截图直接放大展示**（沿用现有 tray-{locale}-{theme}.png 双语双主题资产，展示宽度约 420–480px，按新浅色规范加框加影）。文案栏（kicker/标题/三点）不动。

**替代方案与否决**：从产品主仓库补真实桌面场景截图（本仓库无该资产，无法在本次落地，留作后续增强——产品侧出图后可直接替换）。

## 改动三：数据源墙圆点语义化

**问题**：19 个圆点按 `i % 7` 循环取系列色——装饰性，而全站其它圆点（对账五分量、Hero 徽章）都承担系列色语义，口径不一致。

**决策**：圆点改为按**读取方式三分类**着色，与 subtitle 的既有口径（「JSONL/JSON 流式解析或 SQLite 只读连接」）对齐：
- 流式解析（method 含 "JSON"）：`--series-0` 蓝；
- SQLite 只读（method 含 "SQLite"）：`--series-1` 绿；
- 专用格式（zstd、会话目录等其余）：`--series-2` 橙。

分类在组件内由 method 字符串推导（OpenClaw「SQLite + 双格式」、Antigravity「SQLite 多根去重」归 SQLite 类），不改 ui.ts 数据结构。subtitle 下加一行三色图例（文案入 ui.ts：zh「流式解析 / SQLite 只读 / 专用格式」，en「streamed parsing / SQLite read-only / proprietary formats」）。

**替代方案与否决**：19 源每源一色（无语义且更花）；全部单色（丢掉 wall 的数据感）。

## 改动四：导航瘦身

**问题**：单页站导航 9 个可交互项（4 锚点 + GitHub + English + 主题 + 下载），过载。

**决策**：
- 链接收敛为 **视图 / 对账 / 数据源** 3 个锚点；「本地优先」与 GitHub 从导航移除（GitHub 在 Hero、Outro、Footer 均有入口）。
- ≤780px 时语言切换显示短标签（zh 页 "EN"、en 页「中」，文案键 `nav.langShort` 入 ui.ts），缓解移动端导航拥挤。
- `nav.github`、`nav.local` 键从 ui.ts 同步删除（zh/en 都删，避免死文案）。

**替代方案与否决**：语言切换整体移到 Footer（改动面大且降低可发现性，本次不做）；汉堡菜单（违反零框架 JS 的克制基调，单页站不需要）。

## 不做什么

- 不引入任何新字体、动效、渐变或装饰元素。
- 不动信息架构（区块顺序、计价预告位置保持现状）。
- 不动产品侧资产；托盘真实桌面截图留待产品仓库产出后替换。

## 验证

1. `npx -y pnpm@12.4.2 build` 通过（含 OG 生成）。
2. dev server 渲染截图对比：浅色 Hero / 视图巡礼（截图分离度）、深色托盘（新构图）、数据源墙（图例与三色）、双主题切换无回归。

## 审查范围

- `src/styles/global.css`（浅色令牌）
- `src/components/Hero.astro`、`src/components/ViewsTour.astro`（浅色截图框）
- `src/components/Reconciliation.astro`（浅色渐变端点）
- `src/components/TrayMoment.astro`（去 CSS 布景，重写）
- `src/components/SourcesWall.astro`（圆点三分类 + 图例）
- `src/components/Nav.astro`（3 锚点 + 语言短标签）
- `src/i18n/ui.ts`（nav 删/增键、sources.legend 双语）
- `scripts/generate-og.mjs`（Windows 盘符路径修复，fileURLToPath）

