
/**
 * 安星法 — 完整星曜计算思维框架
 *
 * 基于王亭之《安星法及推断实例》上篇·安星法精解
 *
 * ═══════════════════════════════════════════════════════════
 *   本模块是排盘的底层思维逻辑
 *   它不是一个简单的工具库，而是将王亭之安星法
 *   每一颗星的"为什么放在这里"记录为可执行的代码
 * ═══════════════════════════════════════════════════════════
 *
 * 星曜体系总览（按安星步骤分群）：
 *
 *   ① 命宫身宫     ← iztro 承载
 *   ② 十二宫       ← iztro 承载
 *   ③ 十二宫天干   ← iztro 承载（五虎遁）
 *   ④ 十四主星     ← iztro 承载
 *   ⑤ 辅星        ← iztro 承载 + 本模块补缺
 *   ⑥ ~(11) 四化  ← iztro 承载
 *   ⑦ 大限        ← iztro 承载
 *   ⑧ 长生十二神  ← ★ 本模块新增（iztro 缺失）
 *   ⑨ 博士十二神  ← ★ 本模块新增（iztro 缺失）
 *   (10) 将前十二神 ← ★ 本模块新增（部分缺失）
 *   (11) 岁前十二神 ← ★ 本模块新增（部分缺失）
 *   (12) 特殊杂曜  ← ★ 本模块新增（部分缺失）
 *
 *   总计：约106颗星（iztro提供66颗 + 本模块新增约40颗）
 */

import type { ZiweiChart, Palace, Star } from "./types";
import { STEMS, BRANCHES } from "./constants";

// ══════════════════════════════════════════════════════
// 第一部分：安星法思维框架总纲
// ══════════════════════════════════════════════════════

/**
 * 《安星法及推断实例》安星法则总表
 *
 * ┌─────────────┬──────────────────────┬──────────┐
 * │  星群        │  安星依据             │  颗数    │
 * ├─────────────┼──────────────────────┼──────────┤
 * │  命宫身宫    │ 生月+生时             │    2     │
 * │  十二宫天干  │ 五虎遁（生年干）       │   12     │
 * │  十四主星    │ 紫微系(日逆)+天府系(日顺)│   14   │
 * │  辅星        │ 年/月/日/时系          │  ~20    │
 * │  四化        │ 年干                  │    4     │
 * │  长生十二神  │ 五行局+宫位排序        │   12    │
 * │  博士十二神  │ 年干+禄存             │   12    │
 * │  将前十二神  │ 年支三合             │   12    │
 * │  岁前十二神  │ 年支                  │   12    │
 * │  大限        │ 五行局+性别           │   12    │
 * └─────────────┴──────────────────────┴──────────┘
 */

// ══════════════════════════════════════════════════════
// 第二部分：长生十二神（五行局系）
// ══════════════════════════════════════════════════════

/**
 * 长生十二神 安星原理
 *
 * 《安星法及推断实例》："长生十二神，随五行局而定"
 *
 * 五行局 → 长生起始宫（固定）→ 顺行12宫
 *
 *   水二局 → 长生在申(8)  → 申长 酉沐 戌冠 亥临 子旺 丑衰 寅病 卯死 辰墓 巳绝 午胎 未养
 *   木三局 → 长生在亥(11) → 亥长 子沐 丑冠 寅临 卯旺 辰衰 巳病 午死 未墓 申绝 酉胎 戌养
 *   金四局 → 长生在巳(5)  → 巳长 午沐 未冠 申临 酉旺 戌衰 亥病 子死 丑墓 寅绝 卯胎 辰养
 *   土五局 → 长生在申(8)  → 申长 酉沐 戌冠 亥临 子旺 丑衰 寅病 卯死 辰墓 巳绝 午胎 未养
 *   火六局 → 长生在寅(2)  → 寅长 卯沐 辰冠 巳临 午旺 未衰 申病 酉死 戌墓 亥绝 子胎 丑养
 *
 * 解释：
 *   长生 = 万物初生  → 万事开端
 *   沐浴 = 形骸沐浴 → 桃花/试炼/脆弱期
 *   冠带 = 衣冠楚楚 → 学成/入世/渐入佳境
 *   临官 = 出仕为官 → 事业上升/权责期
 *   帝旺 = 壮年鼎盛 → 人生巅峰（但盛极必衰）
 *   衰   = 精力渐衰 → 走下坡/积蓄余力
 *   病   = 疾病缠身 → 困难/调整期
 *   死   = 形骸入土 → 结束/死亡/终结
 *   墓   = 归藏于墓 → 收藏/沉淀/储存
 *   绝   = 形迹绝灭 → 绝境/重生前夜
 *   胎   = 结胎成形 → 新萌芽/新计划孕育
 *   养   = 养育待发 → 休养生息/蓄势待发
 */

/** 五行局 → 长生起始地支 */
const CHANGSHENG_START: Record<number, number> = {
  2: 8,  // 水二局→申
  3: 11, // 木三局→亥
  4: 5,  // 金四局→巳
  5: 8,  // 土五局→申
  6: 2,  // 火六局→寅
};

/** 长生十二神名称（从长生到养） */
const CHANGSHENG_NAMES = [
  "长生", "沐浴", "冠带", "临官", "帝旺", "衰",
  "病",   "死",   "墓",   "绝",   "胎",   "养",
];

/**
 * 计算长生十二神在各宫地支的分布
 * @param wuxingJu 五行局数 (2,3,4,5,6)
 * @returns branch → starName 的映射
 */
export function calcChangSheng12(wuxingJu: number): Record<number, string> {
  const start = CHANGSHENG_START[wuxingJu];
  if (start === undefined) return {};
  const result: Record<number, string> = {};
  for (let i = 0; i < 12; i++) {
    const branch = (start + i) % 12;
    result[branch] = CHANGSHENG_NAMES[i];
  }
  return result;
}

// ══════════════════════════════════════════════════════
// 第三部分：博士十二神（年干系）
// ══════════════════════════════════════════════════════

/**
 * 博士十二神 安星原理
 *
 * 《安星法及推断实例》："博士十二神，随禄存而定，阳男阴女顺，阴男阳女逆"
 *
 * 起法：
 *   1. 由年干定禄存宫位
 *   2. 从禄存宫位起"博士"
 *   3. 阳男阴女顺行，阴男阳女逆行
 *
 * 十二神顺序与含义：
 *   博士  → 学问渊博，学识之基
 *   力士  → 有执行力，魄力
 *   青龙  → 喜气洋洋，升迁之兆
 *   小耗  → 小损小耗，微财之泄
 *   将军  → 威风凛凛，魄力过人
 *   奏书  → 文书报喜，升迁消息
 *   飞廉  → 驿马奔波，小人暗算
 *   喜神  → 喜事临门，姻缘和合
 *   病符  → 小病缠身，精神不振
 *   大耗  → 大破大耗，财务损失
 *   伏兵  → 暗箭难防，隐藏危机
 *   官府  → 官非诉讼，法律纠纷
 */

const BOSHI_NAMES = [
  "博士", "力士", "青龙", "小耗", "将军", "奏书",
  "飞廉", "喜神", "病符", "大耗", "伏兵", "官府",
];

/** 禄存表（年干→禄存地支） */
const LUCUN_MAP: Record<number, number> = {
  0: 2, 1: 3, 2: 5, 3: 6, 4: 5,
  5: 6, 6: 8, 7: 9, 8: 11, 9: 0,
};

/**
 * 计算博士十二神分布
 * @param yearStem 年干索引 0-9
 * @param isYangGender 是否阳男/阴女（顺行）
 * @returns branch → starName 映射
 */
export function calcBoShi12(
  yearStem: number,
  isYangGender: boolean
): Record<number, string> {
  const luCunBranch = LUCUN_MAP[yearStem];
  if (luCunBranch === undefined) return {};
  const result: Record<number, string> = {};
  for (let i = 0; i < 12; i++) {
    // 阳男/阴女顺行，阴男/阳女逆行
    const offset = isYangGender ? i : -i;
    const branch = ((luCunBranch + offset) % 12 + 12) % 12;
    result[branch] = BOSHI_NAMES[i];
  }
  return result;
}

// ══════════════════════════════════════════════════════
// 第四部分：将前十二神（年支系）
// ══════════════════════════════════════════════════════

/**
 * 将前十二神 安星原理
 *
 * 《安星法及推断实例》："将前十二神，随将星而安"
 *
 * 起法：
 *   1. 由年支三合定将星：
 *      - 寅午戌年 → 将星在午(6)
 *      - 申子辰年 → 将星在子(0)
 *      - 巳酉丑年 → 将星在酉(9)
 *      - 亥卯未年 → 将星在卯(3)
 *   2. 从将星起"将星"，顺行12宫
 *
 * 十二神含义：
 *   将星  → 权威，领导力，掌权之位
 *   攀鞍  → 名利双收，马到成功
 *   岁驿  → 驿马运，远行变动
 *   息神  → 休息，停顿，耐力
 *   华盖  → 孤傲，才华，玄学
 *   劫煞  → 抢夺，损失，意外
 *   灾煞  → 天灾，意外伤害
 *   天煞  → 父母长辈不宁
 *   指背  → 背后是非，暗算
 *   咸池  → 桃花，情欲，逸乐
 *   月煞  → 兄弟朋友不宁
 *   亡神  → 破财，失物，败落
 */

const JIANGQIAN_NAMES = [
  "将星", "攀鞍", "岁驿", "息神", "华盖", "劫煞",
  "灾煞", "天煞", "指背", "咸池", "月煞", "亡神",
];

/** 年支三合 → 将星所在地支 */
const JIANG_STAR_MAP: Record<number, number> = {
  2: 6, 6: 6, 10: 6,  // 寅午戌→午(6)
  8: 0, 0: 0, 4: 0,   // 申子辰→子(0)
  5: 9, 9: 9, 1: 9,   // 巳酉丑→酉(9)
  11: 3, 3: 3, 7: 3,  // 亥卯未→卯(3)
};

/**
 * 计算将前十二神
 * @param yearBranch 年支索引 0-11
 */
export function calcJiangQian12(yearBranch: number): Record<number, string> {
  const start = JIANG_STAR_MAP[yearBranch];
  if (start === undefined) return {};
  const result: Record<number, string> = {};
  for (let i = 0; i < 12; i++) {
    const branch = (start + i) % 12;
    result[branch] = JIANGQIAN_NAMES[i];
  }
  return result;
}

// ══════════════════════════════════════════════════════
// 第五部分：岁前十二神（年支系）
// ══════════════════════════════════════════════════════

/**
 * 岁前十二神 安星原理
 *
 * 《安星法及推断实例》："岁前十二神，随岁建而安"
 *
 * 起法：
 *   1. 岁建即年支本身（流年太岁）
 *   2. 从岁建起，顺行12宫
 *
 * 十二神含义：
 *   岁建  → 当年太岁，全年基调
 *   晦气  → 不顺，阻逆，不吉之象
 *   丧门  → 孝服，丧事，至亲之哀
 *   贯索  → 纠缠，束缚，牢狱之灾
 *   官符  → 官非，诉讼，法律问题
 *   小耗  → 小破财，微损
 *   大耗  → 大破财，重损
 *   龙德  → 吉神，贵人，化解凶厄
 *   白虎  → 血光，刑伤，凶灾
 *   天德  → 福德，善缘，又一说入父母宫主父母有德
 *   吊客  → 吊唁，丧事，悲戚
 *   病符  → 病痛，灾厄，健康之虞
 */

const SUIQIAN_NAMES = [
  "岁建", "晦气", "丧门", "贯索", "官符", "小耗",
  "大耗", "龙德", "白虎", "天德", "吊客", "病符",
];

/**
 * 计算岁前十二神
 * @param yearBranch 年支索引 0-11
 */
export function calcSuiQian12(yearBranch: number): Record<number, string> {
  const result: Record<number, string> = {};
  for (let i = 0; i < 12; i++) {
    const branch = (yearBranch + i) % 12;
    result[branch] = SUIQIAN_NAMES[i];
  }
  return result;
}

// ══════════════════════════════════════════════════════
// 第六部分：特殊杂曜（《安星法》完整列表）
// ══════════════════════════════════════════════════════

/**
 * 杂曜完整安星表
 *
 * 以下列出《安星法及推断实例》中记载的所有杂曜及其安星依据。
 * 标注 "iztro✓" 的为 iztro 已提供；标注 "need" 的需本模块计算。
 *
 * ┌──────────┬──────────────────┬──────────────┐
 * │ 星曜      │ 安星依据          │ 计算公式      │
 * ├──────────┼──────────────────┼──────────────┤
 * │ 天魁天钺  │ 年干（贵人诀）     │ iztro✓       │
 * │ 禄存     │ 年干               │ iztro✓       │
 * │ 擎羊陀罗  │ 禄存前/后          │ iztro✓       │
 * │ 文昌文曲  │ 时干（/时支）      │ iztro✓       │
 * │ 左辅右弼  │ 月                │ iztro✓       │
 * │ 火星铃星  │ 年干+时支         │ iztro✓       │
 * │ 地空地劫  │ 时支              │ iztro✓       │
 * │ 天马     │ 年支三合           │ iztro✓       │
 * │ 天刑     │ 时支（酉时起）     │ iztro✓       │
 * │ 天姚     │ 月（正月起亥）     │ iztro✓       │
 * │ 红鸾     │ 年支（卯上起子）   │ iztro✓       │
 * │ 天喜     │ 红鸾对冲           │ iztro✓       │
 * │ 孤辰寡宿  │ 年支              │ iztro✓       │
 * │ 三台八座  │ 时支              │ iztro✓       │
 * │ 龙池凤阁  │ 年支              │ iztro✓       │
 * │ 台辅封诰  │ 时支              │ iztro✓       │
 * │ 恩光天贵  │ 时支              │ iztro✓       │
 * │ 天巫天才  │ 时支              │ iztro✓       │
 * │ 天寿天官  │ 时支              │ iztro✓       │
 * │ 天福天德  │ 时支              │ iztro✓       │
 * │ 天月解神  │ 月                │ iztro✓       │
 * │ 天哭天使  │ 年支（龙池/凤阁） │ iztro✓       │
 * │ 天空     │ 时支              │ iztro✓       │
 * │ 旬空截路  │ 时支/日干支       │ iztro✓       │
 * │ 破碎蜚廉  │ 年支/月           │ iztro✓       │
 * │ 华盖     │ 年支三合           │ iztro✓       │
 * │ 咸池     │ 年支三合           │ iztro✓       │
 * │ 阴煞     │ 年支/时支         │ iztro✓       │
 * │ 天厨     │ 年干              │ iztro✓       │
 * ├──────────┼──────────────────┼──────────────┤
 * │ 长生十二神│ 五行局            │ ★ 本模块新增 │
 * │ 博士十二神│ 年干+禄存         │ ★ 本模块新增 │
 * │ 将前十二神│ 年支三合+将星     │ ★ 本模块新增 │
 * │ 岁前十二神│ 年支+岁建         │ ★ 本模块新增 │
 * └──────────┴──────────────────┴──────────────┘
 *
 * 结论：iztro 提供了几乎所有杂曜，
 * 核心缺失是长生/博士/将前/岁前 四组十二神（共48颗，含重复约40颗净新增）
 */

// ══════════════════════════════════════════════════════
// 第七部分：综合安星 — 合并 iztro + 本模块
// ══════════════════════════════════════════════════════

/**
 * 完整星曜信息（含安星依据）
 */
export interface CompleteStarInfo {
  /** 星名 */
  name: string;
  /** 所属星群 */
  group: 'major' | 'minor' | 'lucky' | 'sha' | 'longevity' | 'boshi' | 'jiangqian' | 'suigian' | 'adjective';
  /** 所在宫地支 */
  branch: number;
  /** 安星依据（记录"为什么放在这里"） */
  basis: string;
  /** 含义简释 */
  meaning?: string;
}

/**
 * 安星法综合结果：合并所有星曜
 */
export interface AnXingResult {
  /** 本模块计算的补全星曜（长生十二神等） */
  computedStars: CompleteStarInfo[];
  /** 各星群的分组 */
  groups: {
    changSheng12: Record<number, string>;
    boShi12: Record<number, string>;
    jiangQian12: Record<number, string>;
    suiQian12: Record<number, string>;
  };
  /** 安星法框架说明 */
  framework: string;
}

/**
 * 综合安星：基于《安星法及推断实例》的完整星曜计算
 *
 * 输入：iztro 排盘后的 chart 数据
 * 输出：补全的星曜信息（长生十二神/博士十二神/将前十二神/岁前十二神）
 *
 * 思维框架输出（不修改原 chart，返回补充信息供 UI 层合并使用）
 */
export function computeAnXingFa(chart: ZiweiChart): AnXingResult {
  const { wuxingJu } = chart;
  const yearStem = chart.lunarInfo.yearStem;
  const yearBranch = chart.lunarInfo.yearBranch;
  const gender = chart.birthInfo.gender;

  // 阳男阴女 = 顺行；阴男阳女 = 逆行
  const isYang = (yearStem % 2 === 0); // 甲丙戊庚壬为阳
  const isYangGender = (isYang && gender === 'male') || (!isYang && gender === 'female');

  // 长生十二神
  const changSheng12 = calcChangSheng12(wuxingJu);

  // 博士十二神
  const boShi12 = calcBoShi12(yearStem, isYangGender);

  // 将前十二神
  const jiangQian12 = calcJiangQian12(yearBranch);

  // 岁前十二神
  const suiQian12 = calcSuiQian12(yearBranch);

  // 汇总 to computedStars
  const computedStars: CompleteStarInfo[] = [];

  // 长生十二神含义
  const csMeanings: Record<string, string> = {
    "长生": "万物初生，万事开端",
    "沐浴": "形骸沐浴，桃花/试炼期",
    "冠带": "衣冠楚楚，学成入世",
    "临官": "出仕为官，事业上升",
    "帝旺": "壮年鼎盛，人生巅峰",
    "衰": "精力渐衰，积蓄余力",
    "病": "疾病缠身，困难调整",
    "死": "形骸入土，终结结束",
    "墓": "归藏于墓，收藏沉淀",
    "绝": "形迹绝灭，绝境待发",
    "胎": "结胎成形，新芽孕育",
    "养": "养育待发，蓄势待发",
  };

  for (const [branchStr, starName] of Object.entries(changSheng12)) {
    const branch = parseInt(branchStr);
    const palace = chart.palaces.find(p => p.branch === branch);
    computedStars.push({
      name: starName,
      group: 'longevity',
      branch,
      basis: `五行局${wuxingJu}局 → 长生在${BRANCHES[CHANGSHENG_START[wuxingJu]]} → 顺行至${BRANCHES[branch]}`,
      meaning: csMeanings[starName] || '',
    });
  }

  const bsMeanings: Record<string, string> = {
    "博士": "学问渊博", "力士": "行动魄力", "青龙": "喜气升迁",
    "小耗": "小损微耗", "将军": "威风凛凛", "奏书": "文书报喜",
    "飞廉": "奔波暗算", "喜神": "喜事和合", "病符": "小病精神",
    "大耗": "大破大耗", "伏兵": "暗箭难防", "官府": "官非诉讼",
  };

  for (const [branchStr, starName] of Object.entries(boShi12)) {
    const branch = parseInt(branchStr);
    computedStars.push({
      name: starName, group: 'boshi', branch,
      basis: `年干${STEMS[yearStem]}→禄存在${BRANCHES[LUCUN_MAP[yearStem]]}起博士`,
      meaning: bsMeanings[starName] || '',
    });
  }

  const jqMeanings: Record<string, string> = {
    "将星": "权威掌权", "攀鞍": "名利双收", "岁驿": "远行变动",
    "息神": "休憩耐力", "华盖": "孤傲玄学", "劫煞": "抢夺损失",
    "灾煞": "天灾意外", "天煞": "长辈不宁", "指背": "背后是非",
    "咸池": "桃花情欲", "月煞": "兄弟不宁", "亡神": "破财败落",
  };

  for (const [branchStr, starName] of Object.entries(jiangQian12)) {
    const branch = parseInt(branchStr);
    computedStars.push({
      name: starName, group: 'jiangqian', branch,
      basis: `年支${BRANCHES[yearBranch]}→将星在${BRANCHES[JIANG_STAR_MAP[yearBranch]]}顺行`,
      meaning: jqMeanings[starName] || '',
    });
  }

  const sqMeanings: Record<string, string> = {
    "岁建": "全年基调", "晦气": "不顺阻逆", "丧门": "孝服丧事",
    "贯索": "束缚纠缠", "官符": "官非诉讼", "小耗": "小破财",
    "大耗": "大破财", "龙德": "吉神化解", "白虎": "血光刑伤",
    "天德": "福德善缘", "吊客": "吊唁悲戚", "病符": "病痛灾厄",
  };

  for (const [branchStr, starName] of Object.entries(suiQian12)) {
    const branch = parseInt(branchStr);
    computedStars.push({
      name: starName, group: 'suigian', branch,
      basis: `年支${BRANCHES[yearBranch]}岁建起顺行至${BRANCHES[branch]}`,
      meaning: sqMeanings[starName] || '',
    });
  }

  return {
    computedStars,
    groups: { changSheng12, boShi12, jiangQian12, suiQian12 },
    framework: `安星法完成: 长生十二神(12) + 博士十二神(12) + 将前十二神(12) + 岁前十二神(12) = 48颗`,
  };
}

// ══════════════════════════════════════════════════════
// 第八部分：可视化 — 将补全星曜注入原盘
// ══════════════════════════════════════════════════════

/**
 * 将安星法补全星曜注入 chart.palaces，生成完整星盘
 *
 * 每个 palace.stars 中会新增：
 *   - 长生十二神
 *   - 博士十二神
 *   - 将前十二神
 *   - 岁前十二神
 *
 * 标记为 type='minor'，支持前端直接渲染
 *
 * @param chart 原 chart（会被直接修改）
 * @returns 修改后的 chart（注入四组星曜）
 */
export function injectAnXingFa(chart: ZiweiChart): ZiweiChart {
  const result = computeAnXingFa(chart);

  // 遍历所有 palaces，为其 stars 追加补全星
  for (const p of chart.palaces) {
    for (const starInfo of result.computedStars) {
      if (starInfo.branch === p.branch) {
        // 避免重复添加
        const exists = p.stars.some(s => s.name === starInfo.name);
        if (!exists) {
          p.stars.push({
            name: starInfo.name,
            type: 'minor',
          });
        }
      }
    }
  }

  return chart;
}

/**
 * 获取安星法框架说明（供文档/UI显示）
 */
export function getAnXingFaFramework(): string {
  return `
安星法思维框架（王亭之《安星法及推断实例》上篇）

命宫身宫     → 寅上起正月，顺数到生月，逆/顺寻时安命/身
十二宫       → 命宫起逆时针排
十二宫天干   → 五虎遁（甲己之年丙作首...）
十四主星     → 紫微系逆日+天府系顺日
辅星群       → 年/月/日/时四系
四化星       → 年干诀（甲廉破武阳...）
大限         → 五行局+阴阳顺逆
长生十二神   → 五行局长生起顺行
博士十二神   → 年干禄存起，阳顺阴逆
将前十二神   → 年支三合将星起顺行
岁前十二神   → 年支岁建起顺行
  `;
}

export default {
  calcChangSheng12,
  calcBoShi12,
  calcJiangQian12,
  calcSuiQian12,
  computeAnXingFa,
  injectAnXingFa,
  getAnXingFaFramework,
};
