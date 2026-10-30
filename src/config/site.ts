/**
 * 集中管理所有外部链接与站点常量（PRD §27）。
 * 组件中不得硬编码 URL。
 */
export const site = {
  name: 'Tokenmetry',
  domain: 'tokenmetry.app',
  url: 'https://tokenmetry.app',
  /** 产品主仓库 */
  repo: 'https://github.com/cholf5/tokenmetry',
  /** 下载入口 = GitHub Releases（PRD §2） */
  releases: 'https://github.com/cholf5/tokenmetry/releases',
  license: 'https://github.com/cholf5/tokenmetry/blob/main/LICENSE',
  licenseShort: 'AGPL-3.0',
  author: 'cholf5',
  authorUrl: 'https://github.com/cholf5',
  /** CI 实际产出的三平台包（README 快速开始：macOS arm64/x64 .app zip、Windows/Linux 单文件 zip） */
  platforms: ['Windows', 'macOS', 'Linux'] as const,
  /** 数据源数量，以主仓库采集管道注册表为准（当前 20，含 Cindy） */
  sourceCount: 20,
  /** 固定视图数量，以 src/Tokenmetry.App/Views 为准（README 特性节写 9，架构节写 8，代码为 9） */
  viewCount: 9,
} as const;
