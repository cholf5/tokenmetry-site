# tokenmetry-site

[Tokenmetry](https://github.com/cholf5/tokenmetry) 官网（[tokenmetry.app](https://tokenmetry.app)）：双语（中文默认 / English）、明暗双主题的静态 Landing Page。

## 技术栈

- [Astro](https://astro.build)（纯静态输出，零框架 JS）
- 站内唯一运行时 JS：主题初始化 + 切换（内联，约 20 行）
- Hero 产品图为真实截图（随主题/语言切换）；功能卡配图为 HTML/SVG 复刻组件，观感对齐产品 UI
- OG 分享图由 `scripts/generate-og.mjs` 在构建时用 resvg 生成

## 开发

```bash
pnpm install
pnpm dev      # http://localhost:4321
pnpm build    # 生成 OG 图 + 静态构建 → dist/
pnpm preview  # 本地预览 dist/
```

## 结构

```text
src/
  config/site.ts        # 所有外部链接集中于此（GitHub / Releases / License）
  i18n/ui.ts            # 双语文案（含复刻组件使用的应用内真实字符串）
  layouts/Layout.astro  # SEO / hreflang / 主题系统
  components/           # 页面区块
  components/visuals/   # 功能配图复刻组件（时间 / 成本 / 计价 / 托盘）
  styles/               # 全局令牌（取自产品 Tokens.axaml 真实值）+ 复刻共享样式
scripts/generate-og.mjs # OG 图生成
```

## 内容维护约定

- 产品功能表述以 [tokenmetry 主仓库](https://github.com/cholf5/tokenmetry) 的 README 与代码为准，不虚构功能。
- 颜色令牌与产品 `src/Tokenmetry.App/Styles/Tokens.axaml` 保持同源；产品改版时同步更新 `src/styles/global.css`。

## License

[AGPL-3.0-or-later](LICENSE)。Tokenmetry 名称与图标属于项目品牌标识，不在本许可证授权范围内。
