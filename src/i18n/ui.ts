/**
 * i18n 聚合层。字典本体在 src/i18n/locales/{locale}.ts，本文件只做装配：
 *
 * - Locale 联合类型 + 语种元数据（URL 前缀 / hreflang / html lang / og:locale / 本名 / 移动端短码）；
 * - 默认语言为 en（根路径 /），zh 与其余语种在 /{id}；
 * - app 段（产品内 UI 复刻文案）不随站点语种走：产品本体目前只有 zh/en 两种语言，
 *   复刻组件只出 zh/en——zh-hant 注入 zh.app，其余语种注入 en.app。
 *   visualLocale() 是唯一映射点；新增产品内语言时才需要动它。
 *
 * 结构约定：
 * - 字典结构以 locales/zh.ts 为基准，逐 key 对齐（scripts/check-locales.mjs 在构建前校验）；
 * - 除 zh/en 外的字典文件不含 app 段（Omit<Dict, 'app'>），由本文件注入；
 * - 产品功能表述以 tokenmetry 主仓库 README 与代码为准，不虚构能力（PRD §32/§33）。
 */
import zhDict from './locales/zh.ts';
import enDict from './locales/en.ts';
import zhHantDict from './locales/zh-hant.ts';
import jaDict from './locales/ja.ts';
import koDict from './locales/ko.ts';
import ptBrDict from './locales/pt-br.ts';
import ruDict from './locales/ru.ts';
import esDict from './locales/es.ts';
import deDict from './locales/de.ts';
import frDict from './locales/fr.ts';

/** 站点语种；id 同时是 URL 前缀（小写），en 为默认语言占根路径 */
export type Locale = 'en' | 'zh' | 'zh-hant' | 'ja' | 'ko' | 'pt-br' | 'ru' | 'es' | 'de' | 'fr';

/** 复刻组件（visuals/）支持的产品内语言 */
export type VisualLocale = 'zh' | 'en';

export interface LanguageMeta {
  id: Locale;
  /** URL 前缀；默认语言为 ''（根路径） */
  path: string;
  /** hreflang 与 <html lang> 用的 BCP 47 标签 */
  tag: string;
  /** og:locale 值（下划线格式） */
  ogLocale: string;
  /** 语言切换器里的语言本名（不翻译） */
  nativeName: string;
  /** 移动端短码 */
  short: string;
}

export const defaultLocale: Locale = 'en';

/** 语言切换器展示顺序（en 在首位） */
export const LANGUAGES: LanguageMeta[] = [
  { id: 'en', path: '', tag: 'en', ogLocale: 'en_US', nativeName: 'English', short: 'EN' },
  { id: 'zh', path: '/zh', tag: 'zh-CN', ogLocale: 'zh_CN', nativeName: '简体中文', short: '简' },
  { id: 'zh-hant', path: '/zh-hant', tag: 'zh-Hant', ogLocale: 'zh_TW', nativeName: '繁體中文', short: '繁' },
  { id: 'ja', path: '/ja', tag: 'ja', ogLocale: 'ja_JP', nativeName: '日本語', short: '日' },
  { id: 'ko', path: '/ko', tag: 'ko', ogLocale: 'ko_KR', nativeName: '한국어', short: '한' },
  { id: 'pt-br', path: '/pt-br', tag: 'pt-BR', ogLocale: 'pt_BR', nativeName: 'Português (BR)', short: 'BR' },
  { id: 'ru', path: '/ru', tag: 'ru', ogLocale: 'ru_RU', nativeName: 'Русский', short: 'RU' },
  { id: 'es', path: '/es', tag: 'es', ogLocale: 'es_ES', nativeName: 'Español', short: 'ES' },
  { id: 'de', path: '/de', tag: 'de', ogLocale: 'de_DE', nativeName: 'Deutsch', short: 'DE' },
  { id: 'fr', path: '/fr', tag: 'fr', ogLocale: 'fr_FR', nativeName: 'Français', short: 'FR' },
];

export const locales: Locale[] = LANGUAGES.map((l) => l.id);

/** 站内链接用：默认语言回根路径，其余语种加前缀 */
export const localePath = (l: Locale): string => LANGUAGES.find((lang) => lang.id === l)?.path ?? '';

/** 站点语种 → 复刻组件语种（app 段不随站点语种走，见文件头注） */
export const visualLocale = (l: Locale): VisualLocale => (l === 'zh' || l === 'zh-hant' ? 'zh' : 'en');

export type Dict = typeof zhDict;

export const ui: Record<Locale, Dict> = {
  en: enDict,
  zh: zhDict,
  'zh-hant': { ...zhHantDict, app: zhDict.app },
  ja: { ...jaDict, app: enDict.app },
  ko: { ...koDict, app: enDict.app },
  'pt-br': { ...ptBrDict, app: enDict.app },
  ru: { ...ruDict, app: enDict.app },
  es: { ...esDict, app: enDict.app },
  de: { ...deDict, app: enDict.app },
  fr: { ...frDict, app: enDict.app },
};
