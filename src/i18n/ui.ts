/**
 * 全站双语文案。中文为默认语言（/），英文在 /en/。
 * 产品功能表述以 tokenmetry 主仓库 README 与代码为准，不虚构能力（PRD §32/§33）。
 */
export type Locale = 'zh' | 'en';

export const locales: Locale[] = ['zh', 'en'];
export const defaultLocale: Locale = 'zh';

const zh = {
  meta: {
    title: 'Tokenmetry — 看清你的 Token 花在了哪里',
    description:
      'Tokenmetry 是一款开源的 AI 编程用量分析工具：直读 19 个 Agent 的本地日志，聚合成一套本地仪表盘，打开就知道花了多少钱。',
    ogAlt: 'Tokenmetry 总览界面',
  },
  nav: {
    features: '功能',
    how: '原理',
    github: 'GitHub',
    download: '下载',
    langLabel: 'English',
    langAria: 'Switch to English',
    themeAria: '切换深浅主题',
    menuAria: '打开导航菜单',
  },
  hero: {
    title: '看清你的 Token 花在了哪里。',
    subtitle:
      'Tokenmetry 是一款开源的 AI 编程用量分析工具：直读 19 个 Agent 的本地日志，聚合成一套本地仪表盘，打开就知道花了多少钱。',
    download: '下载 Tokenmetry',
    github: 'GitHub',
    badges: ['开源', '免费', 'AGPL-3.0'],
    platforms: 'Windows · macOS · Linux',
    shotAlt:
      'Tokenmetry 总览视图：总 Token、估算成本等 KPI 卡，按日汇总的 Token 使用趋势图，以及 Agent 使用占比环形图',
  },
  values: {
    title: '为什么需要 Tokenmetry',
    items: [
      {
        title: '所有 Agent，一套账本',
        desc: 'Claude Code、Codex、Gemini CLI……各家日志格式不同、位置分散，混用时说不清今天烧了多少钱。Tokenmetry 直读 19 个数据源，聚合成一套固定视图。',
      },
      {
        title: '可对账的成本数字',
        desc: '内置定价引擎三级回退：用户覆盖 → models.dev 远程刷新 → 内置价格快照。缺价模型显示「未知」，不折零、不混入合计；口径与 ccusage 对齐，随时核对。',
      },
      {
        title: '本地优先，打开即出数',
        desc: '不上传、不登录、不云同步，断网功能完整；增量扫描写入本地 SQLite，不做每次全量重扫。',
      },
    ],
  },
  features: {
    title: '看懂 Token 用量所需的一切',
    subtitle: '每个功能都以当前版本实际实现为准',
    items: [
      {
        title: '时间分析',
        desc: '按小时分布、活跃日历与星期分布，识别高峰时段、最活跃日与长会话。',
        visual: 'time' as const,
      },
      {
        title: '诚实的成本分析',
        desc: '日志自带计费直接采用；缺价模型显示「未知」，绝不折零混入合计。',
        visual: 'cost' as const,
      },
      {
        title: '数据与计价透明',
        desc: '模型价格可查看、可覆盖，models.dev 后台刷新永不阻塞界面；数据源状态与记录数一目了然。',
        visual: 'pricing' as const,
      },
      {
        title: '托盘常驻',
        desc: '后台自动刷新，异常成本即时通知，5 秒知道今天的状态。',
        visual: 'tray' as const,
      },
      {
        title: '19 源直读',
        desc: '只读本地日志与数据库，零配置自动探测，不调用外部进程。',
      },
      {
        title: '9 个固定视图',
        desc: '总览、会话、Agent、模型、项目、时间、成本、数据与计价、设置；时间范围与 Agent 筛选贯穿所有视图。',
      },
    ],
  },
  how: {
    title: '工作原理',
    steps: [
      {
        title: '自动发现',
        desc: '启动时自动探测本机已安装 Agent 的日志与数据库，零配置、不改动任何原始文件。',
      },
      {
        title: '增量索引',
        desc: '按文件变动记账，只重扫有变化的部分，聚合事实写入本地 SQLite。',
      },
      {
        title: '打开即看',
        desc: '固定视图呈现趋势、构成与异常，成本口径与 ccusage 逐日逐模型对账。',
      },
    ],
  },
  open: {
    title: '开源。免费。可审计。',
    body: 'Tokenmetry 以 AGPL-3.0 发布：源码公开，任何人都可以审查实现、报告问题或参与贡献。没有订阅，没有付费墙。你的数据留在本机——只存聚合事实与配置，不存 prompt、代码或会话内容。',
    cta: '在 GitHub 查看源码',
    points: ['源码公开，实现可审查', '欢迎贡献与问题反馈', '无需订阅，没有付费墙'],
  },
  download: {
    title: '准备好看清 Token 的去向了吗？',
    subtitle: '从 GitHub Releases 下载适合你平台的安装包，解压即用。',
    cta: '下载 Tokenmetry',
    note: '开源 · 免费 · AGPL-3.0',
    platforms: 'Windows · macOS · Linux',
  },
  github: {
    title: '在公开中构建。',
    body: '源码、问题追踪与路线图都在 GitHub 上——欢迎报告问题、提出建议或参与贡献。',
    cta: 'View on GitHub',
  },
  footer: {
    tagline: '开源的 AI 编程用量分析。',
    links: { github: 'GitHub', releases: 'Releases', license: 'License' },
    copyright: '© 2026 Tokenmetry · 以 AGPL-3.0 许可发布',
  },
};

const en: typeof zh = {
  meta: {
    title: 'Tokenmetry — Understand Where Your Tokens Go',
    description:
      'Tokenmetry is an open-source tool for understanding your AI token usage — it reads local logs from 19 coding agents into one local dashboard.',
    ogAlt: 'Tokenmetry overview interface',
  },
  nav: {
    features: 'Features',
    how: 'How it works',
    github: 'GitHub',
    download: 'Download',
    langLabel: '中文',
    langAria: '切换到中文',
    themeAria: 'Toggle color theme',
    menuAria: 'Open navigation menu',
  },
  hero: {
    title: 'Understand where your tokens go.',
    subtitle:
      'Tokenmetry is an open-source tool for understanding and analyzing your AI token usage. It reads local logs from 19 coding agents and turns them into one local dashboard.',
    download: 'Download Tokenmetry',
    github: 'GitHub',
    badges: ['Open source', 'Free', 'AGPL-3.0'],
    platforms: 'Windows · macOS · Linux',
    shotAlt:
      'Tokenmetry overview: KPI cards for total tokens and estimated cost, a daily token trend chart, and an agent share donut',
  },
  values: {
    title: 'Why Tokenmetry',
    items: [
      {
        title: 'Every agent, one ledger',
        desc: 'Claude Code, Codex, Gemini CLI… each tool writes logs in its own format, scattered across your disk. Tokenmetry reads 19 sources directly and aggregates them into one set of fixed views.',
      },
      {
        title: 'Cost numbers you can verify',
        desc: 'A built-in pricing engine with three-tier fallback: your overrides → models.dev refresh → bundled snapshot. Missing prices show “unknown” — never zeroed into totals — and the methodology reconciles with ccusage.',
      },
      {
        title: 'Local-first, opens instantly',
        desc: 'No upload, no login, no cloud sync — fully functional offline. Incremental scans land in a local SQLite database instead of re-reading every file.',
      },
    ],
  },
  features: {
    title: 'Everything you need to understand your token usage',
    subtitle: 'Every feature reflects what the current release actually does',
    items: [
      {
        title: 'Time analysis',
        desc: 'Hourly distribution, activity calendar and weekday breakdown to spot peak hours, busiest days and long sessions.',
        visual: 'time' as const,
      },
      {
        title: 'Honest cost analysis',
        desc: 'Costs from logs are used as-is; models without prices stay “unknown” and are never zeroed into totals.',
        visual: 'cost' as const,
      },
      {
        title: 'Transparent data & pricing',
        desc: 'Model prices are viewable and overridable; models.dev refreshes in the background without ever blocking the UI.',
        visual: 'pricing' as const,
      },
      {
        title: 'Lives in your tray',
        desc: 'Refreshes in the background and notifies you the moment spend looks abnormal.',
        visual: 'tray' as const,
      },
      {
        title: 'Reads 19 agent sources',
        desc: 'Read-only access to local logs and databases, auto-detected with zero config. No external processes spawned.',
      },
      {
        title: '9 fixed views',
        desc: 'Overview, sessions, agents, models, projects, time, cost, data & pricing, settings — with time-range and agent filters running through every view.',
      },
    ],
  },
  how: {
    title: 'How it works',
    steps: [
      {
        title: 'Auto-detect',
        desc: 'On launch, Tokenmetry finds the local logs and databases of installed agents. Zero config, and original files are never modified.',
      },
      {
        title: 'Index incrementally',
        desc: 'File changes are tracked so only what changed gets re-scanned; aggregated facts land in a local SQLite database.',
      },
      {
        title: 'Understand',
        desc: 'Fixed views surface trends, composition and anomalies — with cost methodology reconciled against ccusage, day by day and model by model.',
      },
    ],
  },
  open: {
    title: 'Open source. Free to use.',
    body: 'Tokenmetry is released under AGPL-3.0: the source is public, and anyone can inspect the implementation, report issues or contribute. No subscription, no paywall. Your data stays on your machine — only aggregated facts and settings are stored, never prompts, code or conversation content.',
    cta: 'View source on GitHub',
    points: ['Public source, auditable implementation', 'Issues and contributions welcome', 'No subscription, no paywall'],
  },
  download: {
    title: 'Ready to see where your tokens go?',
    subtitle: 'Download the build for your platform from GitHub Releases — unzip and run.',
    cta: 'Download Tokenmetry',
    note: 'Open source · Free · AGPL-3.0',
    platforms: 'Windows · macOS · Linux',
  },
  github: {
    title: 'Built in the open.',
    body: 'The source, issue tracker and roadmap live on GitHub — bug reports, ideas and contributions are welcome.',
    cta: 'View on GitHub',
  },
  footer: {
    tagline: 'Open-source token analytics for AI development.',
    links: { github: 'GitHub', releases: 'Releases', license: 'License' },
    copyright: '© 2026 Tokenmetry · Released under the AGPL-3.0 License',
  },
};

export const ui = { zh, en };
export type UI = typeof zh;
