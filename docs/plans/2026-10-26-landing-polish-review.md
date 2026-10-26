# 官网视觉打磨——代码审查记录（2026-10-26）

对应实施：docs/plans/2026-10-26-landing-polish-design.md
改动：9 文件，+95 / -146（净 -51，主要为 TrayMoment 删除 CSS 布景）。

## 审查统计

- 已审查文件：设计文档「审查范围」所列 9 个改动文件（逐文件 diff 复核）。
- 验证：`pnpm build` 通过（含 OG 生成）；浅色 Hero/中部、深色托盘/数据源共 4 张渲染截图视觉复验通过；导航响应式（390px/1440px）DOM 状态验证通过。
- 发现问题：P0 × 0，P1 × 0，P2 × 2（均低于报告门槛，仅记录）。

## 已确认的非问题（设计决策，非遗漏）

1. **导航移除 GitHub 与「本地优先」锚点**：GitHub 在 Hero 按钮、Outro 按钮、Footer 三处仍有入口；`#local` 区块保留 id 可深链，仅导航不再指向。评审时已明确此决策。
2. **Hero 浅色描边用 `drop-shadow(0 0 1px)` 而非 border**：drop-shadow 跟随截图 PNG 自带圆角；box-border 会把圆角截成方角。视觉复验确认描边清晰。
3. **Footer 与 Nav 同用 `.links` 类名**：Astro 作用域样式隔离，实测 390px 下仅头部导航隐藏、Footer 不受影响。
4. **`--green` 令牌在 TrayMoment 中不再被引用**：令牌与产品 Tokens.axaml 同源，按约定保留在 global.css。

## P2（低于报告门槛；用户选择修复，均已落地并复验）

1. `SourcesWall.astro` items map 的回调参数 `i` 已无引用——已删除。
2. `TrayMoment.astro` 的 `.shot-wrap` 包裹层无样式职责——已拍平，`.visual` 直接作网格子项（DOM 几何复验：460px、右列、无横向溢出）。

## 亮点（对后续改动的约束提醒）

- `ui.ts` 中 `en: typeof zh` 的类型约束保证双语键对称——今后增删文案必须两侧同步，否则构建即报错。
- 圆点三分类的颜色索引（0 蓝/1 绿/2 橙）在 legend 与 `familyOf()` 两处共用 `familyColors`，若调整分类需同步 subtitle 文案口径。
