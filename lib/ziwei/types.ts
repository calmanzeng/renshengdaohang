export interface BirthInfo {
  year: number;      // Gregorian year
  month: number;     // Gregorian month (1-12)
  day: number;       // Gregorian day
  hour: number;      // 时辰 branch index (0=子, 1=丑, ... 11=亥)
  gender: 'male' | 'female';
  name?: string;
  province?: string;   // 出生省份
  city?: string;       // 出生城市
  longitude?: number;  // 出生地经度（用于真太阳时校正）
}

export interface LunarInfo {
  lunarYear: number;
  lunarMonth: number;    // positive = normal, negative = leap month
  lunarDay: number;
  yearStem: number;      // 0-9 (甲乙丙丁戊己庚辛壬癸)
  yearBranch: number;    // 0-11 (子丑寅卯辰巳午未申酉戌亥)
  isLeapMonth: boolean;
}

export type SiHua = '禄' | '权' | '科' | '忌';

export interface Star {
  name: string;
  type: 'major' | 'minor' | 'lucky' | 'sha';
  siHua?: SiHua;
  brightness?: 'bright' | 'normal' | 'dim';  // 庙旺利陷
}

export interface SelfSihuaMark {
  siHua: SiHua;       // 禄/权/科/忌
  starName: string;   // 自化的星
}

export interface Palace {
  branch: number;      // 0-11 (地支索引)
  stem: number;        // 0-9 (天干索引)
  name: string;        // 宫名
  stars: Star[];
  daXianAge?: [number, number];   // 大限年龄段
  isCurrentDaXian?: boolean;
  isMingGong?: boolean;
  isShenGong?: boolean;
  /** 宫干自化（倪师体系核心） */
  selfSihua?: SelfSihuaMark[];
  /** 对宫地支索引（永远 = (branch + 6) % 12） */
  oppositeBranch?: number;
  /** 是否空宫（无主星） */
  isEmpty?: boolean;
  /** 若为空宫，借自哪个宫的地支索引 = oppositeBranch */
  borrowedFromBranch?: number;
  /** 若为空宫，借自哪个宫名 */
  borrowedFromName?: string;
  /** 若为空宫，借到的对宫主星名列表（结构化数据，文案层不再需要从文本反查） */
  borrowedStars?: string[];
}

export interface DaXianSiHua {
  stemIndex: number;
  stemName: string;
  lu: string;    // 化禄星名
  quan: string;  // 化权星名
  ke: string;    // 化科星名
  ji: string;    // 化忌星名
}

export interface DaXian {
  startAge: number;
  endAge: number;
  palaceBranch: number;
  palaceName: string;
  stemIndex?: number;    // 大限宫的天干索引（用于大限四化）
  stemName?: string;
  siHua?: DaXianSiHua;   // 该大限四化（基于宫干）
}

// ─── 王亭之《安星法及推断实例》分析类型 ─────────────────
/** 暗合宫信息 */
export interface DarkHarmony {
  /** 本宫地支 */
  sourceBranch: number;
  /** 暗合宫地支 */
  targetBranch: number;
  /** 暗合宫名 */
  targetName: string;
  /** 暗合类型：地支暗合/宫位暗合 */
  type: 'branch_harmony' | 'palace_harmony';
}

/** 煞星量化评分（王亭之独创打分法） */
export interface ShaScore {
  /** 擎羊(3) 陀罗(2) 火星(2) 铃星(1) 地空(2) 地劫(2) */
  totalScore: number;
  /** 各煞星得分明细 */
  details: { starName: string; score: number; palace: string }[];
  /** 评定等级 */
  level: 'safe' | 'caution' | 'warning' | 'danger';
}

/** 王亭之推断口诀条目 */
export interface WangKouJue {
  /** 口诀文本 */
  text: string;
  /** 适用条件 */
  conditions: string[];
  /** 适用宫位 */
  palacces?: string[];
  /** 适用星曜 */
  stars?: string[];
  /** 吉凶 */
  nature: 'good' | 'bad' | 'mixed';
}

/** 中州派格局（王亭之体系） */
export interface WangPattern {
  name: string;
  type: 'excellent' | 'good' | 'caution' | 'danger';
  description: string;
  relatedPalaces: string[];
  source: string;  // 出处
}


// ─── 流年大限分析类型（nian-analysis.ts）─────────────────

/** 大限十年主题分析 */
export interface DaXianAnalysis {
  /** 大限索引 */
  index: number;
  /** 起始年龄 */
  startAge: number;
  /** 结束年龄 */
  endAge: number;
  /** 所在宫名 */
  palaceName: string;
  /** 所在宫地支 */
  palaceBranch: number;
  /** 大限宫干 */
  palaceStem: string;
  /** 大限命宫主星 */
  majorStars: string[];
  /** 大限宫是否空宫 */
  isEmpty: boolean;
  /** 大限四化 */
  siHua: { stemIndex: number; stemName: string; transforms: Record<SiHua, string> } | null;
  /** 大限煞星评分 */
  shaScore: number;
  /** 大限吉凶主题 */
  theme: string;
  /** 大限等级 */
  level: '大吉' | '吉' | '平' | '凶' | '大凶';
  /** 大限重点提示 */
  advice: string;
}

/** 流年分析（某一年） */
export interface LiuNianAnalysis {
  /** 公历年份 */
  year: number;
  /** 流年天干地支 */
  ganZhi: string;
  /** 用户该年年龄 */
  age: number;
  /** 所在大限 */
  currentDaXian: { palaceName: string; startAge: number; endAge: number };
  /** 流年命宫主星 */
  mingMajorStars: string[];
  /** 流年命宫亮度 */
  mingBrightness: 'bright' | 'normal' | 'dim';
  /** 流年命宫是否空宫 */
  mingIsEmpty: boolean;
  /** 流年四化（年干四化） */
  liuNianSiHua: Record<SiHua, string>;
  /** 各宫流年吉凶（王亭之应期三元法之"年应"） */
  palaceFortune: { palace: string; majorStars: string[]; level: '吉' | '平' | '凶'; trigger: string }[];
  /** 流年总体等级 */
  overallLevel: '大吉' | '吉' | '平' | '凶' | '大凶';
  /** 流年总体断语 */
  overallInterpretation: string;
  /** 流年重点注意事项 */
  cautions: string[];
  /** 流年吉利提示 */
  blessings: string[];
}

/** 流月分析（某年某月） */
export interface LiuYueAnalysis {
  year: number;
  month: number;
  /** 月柱干支 */
  ganZhi: string;
  /** 流月四化 */
  siHua: Record<SiHua, string>;
  /** 引动的宫位 */
  triggeredPalaces: string[];
  /** 吉凶提示 */
  interpretation: string;
}

/** 应期三元法结果（王亭之秘传） */
export interface YingQiAnalysis {
  /** 某年是否有重大事件 */
  hasMajorEvent: boolean;
  /** 重大事件年份列表 */
  majorEventYears: { year: number; event: string; level: '吉' | '凶' }[];
  /** 应期依据 */
  basis: string[];
}



// ─── 安星法完整星曜类型（anxingfa.ts）─────────────────
export interface CompleteStarInfo {
  name: string;
  group: 'major' | 'minor' | 'lucky' | 'sha' | 'longevity' | 'boshi' | 'jiangqian' | 'suigian' | 'adjective';
  branch: number;
  basis: string;
  meaning?: string;
}

export interface AnXingResult {
  computedStars: CompleteStarInfo[];
  groups: {
    changSheng12: Record<number, string>;
    boShi12: Record<number, string>;
    jiangQian12: Record<number, string>;
    suiQian12: Record<number, string>;
  };
  framework: string;
}

export interface ZiweiChart {
  birthInfo: BirthInfo;
  lunarInfo: LunarInfo;
  mingGongBranch: number;    // 命宫地支
  shenGongBranch: number;    // 身宫地支
  wuxingJu: number;          // 五行局 (2,3,4,5,6)
  wuxingJuName: string;      // e.g. '水二局'
  ziweiPos: number;          // 紫微星位置
  palaces: Palace[];         // 12宫，按地支0-11排序
  daXians: DaXian[];
  currentAge: number;
  currentDaXianIndex: number;
}
