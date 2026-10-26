# AGENTS.md

Tokenmetry 官网（tokenmetry.app）：Astro 5 纯静态落地页，双语（zh 默认 `/`、en 在 `/en`）、明暗双主题。本仓库只含网站，产品本体在 [cholf5/tokenmetry](https://github.com/cholf5/tokenmetry) 主仓库。

## 命令

```bash
pnpm install
pnpm dev       # http://localhost:4321
pnpm build     # 先 node scripts/generate-og.mjs 再 astro build → dist/
pnpm preview   # 预览 dist/
pnpm og        # 仅重新生成 OG 分享图（public/og-{zh,en}.png，已 gitignore）
pnpm icons     # 重新烘焙站点图标（public/favicon-{16,32}.png、apple-touch-icon.png，入库提交）
```

包管理器用 pnpm。无测试、无 lint；不要虚构 lint/test 命令。

## 结构与分层

- `src/config/site.ts` — **所有外部链接与站点常量集中于此**，组件不得硬编码 URL（sourceCount=19、viewCount=9 等数字以主仓库为准）。
- `src/i18n/ui.ts` — 全站双语文案，`Locale = 'zh' | 'en'`。组件不复制两份，统一接收 `locale` prop 从 `ui[locale]` 取文案；`app` 段是 UI 复刻用的应用内文案（对齐主仓库 `Translations.cs`）。
- `src/layouts/Layout.astro` — SEO / canonical / hreflang / OG meta + 主题系统。
- `src/components/` — 页面区块（Nav、Hero、Why、Reconciliation、ViewsTour、TrayMoment、SourcesWall、LocalFirst、Outro、Footer）。
- `src/components/visuals/` — 产品 UI 的 HTML 复刻（9 个视图 + Mark.astro 品牌 logo），Hero/ViewsTour/TrayMoment 消费；几何取自主仓库 lobe-icons 资源。
- `src/data/app-demo.ts` — 复刻演示数据与数字格式化（FormatCompact 移植自主仓库 TrendChart）。
- `src/assets/brand/app-icon.svg` — 站点图标唯一母版（主仓库 D-018 定稿 v1 绿柱）；`Logo.astro` 内联同几何，favicon 由 `scripts/generate-icons.mjs` 从它烘焙。
- `src/styles/global.css` — 设计令牌；`src/styles/app-ui.css` — UI 复刻层（产品令牌明暗翻转 + `--u` 容器查询缩放）。
- `scripts/generate-og.mjs` — 构建时用 resvg 生成 OG 图。

## 硬性约定

1. **双语同步**：`src/pages/index.astro`（zh）与 `src/pages/en/index.astro`（en）结构必须逐区块一致，新增/调整区块要同时改两个页面。
2. **文案改动**改 `src/i18n/ui.ts`，不是改组件里的字符串；**链接改动**改 `src/config/site.ts`。
3. **零框架 JS**：站内唯一运行时 JS 是 Layout.astro 里两段内联脚本（主题初始化必须首帧前执行防闪烁 + `[data-theme-toggle]` 事件委托切换，localStorage key 为 `tk-theme`）。不要引入前端框架或额外脚本。
4. **内容不虚构**：产品功能表述以主仓库 README 与代码为准；配色令牌与主仓库 `src/Tokenmetry.App/Styles/Tokens.axaml` 同源，产品改版需同步 `global.css` 与 `app-ui.css`。图表系列色（`--series-*`）明暗共用，不随主题翻转。
5. 功能配图用 `src/components/visuals/` 的 HTML 复刻（一套组件随 `[data-theme]`/`locale` 出明暗双语四变体，矢量清晰、零图片请求；2e69663 的截图方案已于 2026-10-26 回撤，`src/assets/shots/` 已删）。复刻的数字与文案不许虚构：stub 视图以主仓库 `tests/Tokenmetry.App.Headless.Tests/Shell/SiteShotsTests.cs` 的 `SiteData` 为准，总览为真机手记数字；产品 UI 改版需同步复刻组件。
6. 默认主题为 dark（`<html data-theme="dark">`）；`trailingSlash: 'never'`，canonical 拼接遵循 Layout 中的 `path` 约定（zh 为 `''`，en 为 `'/en'`）。

## 已知坑

- `src/components/visuals/` 复刻的锚定数据是主仓库 `SiteShotsTests.SiteData`（截图渲染日 2026-10-25：星期分布、最活跃日 2026-10-22 等相对量都锚定该日）；总览为真机手记（35.22亿 / $137.49 / 432 会话，zh「最近更新 19:39」、en「19:44」）。改数字先对 SiteData，别凭印象。
- `public/og-*.png` 是构建产物且被 gitignore，改动 OG 文案后跑 `pnpm og` 重新生成。
- 改品牌图标的同步点：`src/assets/brand/app-icon.svg`（母版）→ `Logo.astro`（内联几何）→ `pnpm icons` 重烘焙 favicon 并提交。apple-touch-icon 是方角全出血版（iOS 自裁圆角），由脚本自动处理。
- `pnpm-workspace.yaml` 的 `allowBuilds`（esbuild、sharp、workerd）是 pnpm 构建脚本白名单，勿删。workerd 是给 Cloudflare CI 用的：构建时它会往项目里临时装 wrangler，其依赖 workerd 的构建脚本须放行，否则 pnpm 12 报 `ERR_PNPM_IGNORED_BUILDS`。
- `package.json` 的 `packageManager` 钉住 pnpm 版本，勿删：Cloudflare 靠它选 pnpm，否则按 `lockfileVersion: 9.0` 推断成 pnpm 9，会因 `pnpm-workspace.yaml` 无 `packages` 字段报 "packages field missing or empty"。改动该字段后需重跑 `pnpm install` 刷新 lockfile 里的 `packageManagerDependencies`，否则 frozen 安装失败。
