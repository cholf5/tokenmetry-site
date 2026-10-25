# AGENTS.md

Tokenmetry 官网（tokenmetry.app）：Astro 5 纯静态落地页，双语（zh 默认 `/`、en 在 `/en`）、明暗双主题。本仓库只含网站，产品本体在 [cholf5/tokenmetry](https://github.com/cholf5/tokenmetry) 主仓库。

## 命令

```bash
pnpm install
pnpm dev       # http://localhost:4321
pnpm build     # 先 node scripts/generate-og.mjs 再 astro build → dist/
pnpm preview   # 预览 dist/
pnpm og        # 仅重新生成 OG 分享图（public/og-{zh,en}.png，已 gitignore）
```

包管理器用 pnpm。无测试、无 lint；不要虚构 lint/test 命令。

## 结构与分层

- `src/config/site.ts` — **所有外部链接与站点常量集中于此**，组件不得硬编码 URL（sourceCount=19、viewCount=9 等数字以主仓库为准）。
- `src/i18n/ui.ts` — 全站双语文案，`Locale = 'zh' | 'en'`。组件不复制两份，统一接收 `locale` prop 从 `ui[locale]` 取文案。
- `src/layouts/Layout.astro` — SEO / canonical / hreflang / OG meta + 主题系统。
- `src/components/` — 页面区块（Nav、Hero、Values、Features、HowItWorks、OpenSource、DownloadCta、GithubCta、Footer）。
- `src/assets/shots/` — 真实产品 UI 截图，命名 `{view}-{locale}-{theme}.png`（如 `overview-zh-dark.png`）。Hero/Features 同时引入 dark+light 两张，用 CSS `theme-dual` 切换。
- `src/styles/global.css` — 设计令牌。
- `scripts/generate-og.mjs` — 构建时用 resvg 生成 OG 图。

## 硬性约定

1. **双语同步**：`src/pages/index.astro`（zh）与 `src/pages/en/index.astro`（en）结构必须逐区块一致，新增/调整区块要同时改两个页面。
2. **文案改动**改 `src/i18n/ui.ts`，不是改组件里的字符串；**链接改动**改 `src/config/site.ts`。
3. **零框架 JS**：站内唯一运行时 JS 是 Layout.astro 里两段内联脚本（主题初始化必须首帧前执行防闪烁 + `[data-theme-toggle]` 事件委托切换，localStorage key 为 `tk-theme`）。不要引入前端框架或额外脚本。
4. **内容不虚构**：产品功能表述以主仓库 README 与代码为准；配色令牌与主仓库 `src/Tokenmetry.App/Styles/Tokens.axaml` 同源，产品改版需同步 `global.css`。图表系列色（`--series-*`）明暗共用，不随主题翻转。
5. 功能配图用 `src/assets/shots/` 的真实截图（headless 渲染产物），不要用 HTML/SVG 复刻组件替代——复刻方案已刻意移除（commit 2e69663）。
6. 默认主题为 dark（`<html data-theme="dark">`）；`trailingSlash: 'never'`，canonical 拼接遵循 Layout 中的 `path` 约定（zh 为 `''`，en 为 `'/en'`）。

## 已知坑

- README「结构」一节仍提到 `src/components/visuals/`（复刻组件），该目录已删除，以本文件和实际目录为准。
- `public/og-*.png` 是构建产物且被 gitignore，改动 OG 文案后跑 `pnpm og` 重新生成。
- `pnpm-workspace.yaml` 的 `allowBuilds`（esbuild、sharp）是 pnpm 构建脚本白名单，勿删。
