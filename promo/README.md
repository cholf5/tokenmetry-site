# promo/ — 发布 PV 工具链

为 v0.3.2 首发制作的卡点宣传视频（37.5s / 1920×1080 / 30fps / space-city 115 BPM / −14 LUFS）的完整再生成管线。中英双版：成片文案直读 `src/i18n/ui.ts` 字典，画面直接切片 `dist` 构建产物里的 UI 复刻组件——**站点改版后重跑一遍，PV 自动跟上**。

## 再生成顺序

```bash
pnpm build                            # 产出 dist（含最新复刻组件 + CSS）
python3 promo/scripts/cut_fragments.py en    # 从 dist/index.html 切片 UI 片段 → promo/ui/
python3 promo/scripts/cut_fragments.py zh    # 中文版 → promo/ui-zh/
python3 promo/scripts/make_timeline.py space-city   # 测 BPM/选能量段落 → assets/timeline.json
node promo/scripts/build-page.mjs en && node promo/scripts/build-page.mjs zh
node promo/scripts/capture.mjs en && node promo/scripts/capture.mjs zh   # 逐帧渲染（~70s/版）
bash promo/scripts/mux.sh en && bash promo/scripts/mux.sh zh             # 合成 → out/*.mp4
```

试听页：`python3 promo/scripts/make_playlist.py` → `promo/playlist.html`（本地打开试听 CC0 候选）。

## 换曲

`make_timeline.py <slug>` 的 slug 对应 `promo/music/<slug>/<slug>.*`。曲库未入库（63MB），
从 [OpenGameArt](https://opengameart.org/) 按 slug 重新下载即可（页面 `https://opengameart.org/content/<slug>`，
文件 URL 在页面源码里，均为 CC0）。候选分析：`python3 promo/scripts/analyze_music.py`。
换曲后时间轴/切点/字幕节奏全自动重排；18 小节结构适合 ~100–135 BPM 的曲子，超出范围需手调 BARS_NEEDED。

## 结构

- `scripts/` — analyze_music.py（onset 自相关测 BPM）、make_timeline.py（能量段落 + 小节网格）、
  cut_fragments.py（平衡标签切片器）、build-page.mjs（组装自包含动画页）、capture.mjs（Playwright 逐帧）、
  mux.sh（裁音轨 + loudnorm −14 LUFS + 合成）、make_playlist.py（试听页）
- `src/` — promo.css（舞台样式）/ promo.js（确定性渲染器：一切动画都是绝对时间 t 的纯函数，逐帧渲染不掉帧）
- `assets/timeline.json` — 当前曲目的节拍网格 + 场景切点（mux 也从这里读曲文件路径）

## 已知约定

- 数字与文案不虚构：Hook 的 $137.49 / 432 sessions 锚定站点演示数据集（SiteShots 手记），其余文案全部来自字典原文。
- fit() 会裁掉复刻组件声明设计高里的空白尾（按 --u 换算），窗口按高度 ≤976 / 宽度 ≤1740 求最大尺寸后满居中。
- 成片在 `out/`（不入库），发推物料 = mp4 + poster。
