/**
 * 王亭之《安星法及推断实例》分析模块
 *
 * 本模块基于王亭之（谈锡永）中州派紫微斗数体系，
 * 提供暗合宫检测、煞星量化评分、口诀映射、中州派格局分析等工具。
 *
 * 参考：
 *   《安星法及推断实例》王亭之 著（1985，香港博益出版）
 *   《中州派紫微斗数》王亭之 著
 *
 * 与 algorithm.ts 的关系：
 *   algorithm.ts 负责 iztro 调用 + 基础排盘（是"骨架"）
 *   wang-analysis.ts 负责基于排盘结果的深度分析（是"血肉"）
 *   两模块相互独立，分析层注入到 patterns.ts 中使用
 */

import type { ZiweiChart, Palace, Star, SiHua } from "./types";
import type {
  DarkHarmony,
  ShaScore,
  WangKouJue,
  WangPattern,
} from "./types";
import { STEMS, BRANCHES, PALACE_NAMES_ORDER, SI_HUA_TABLE } from "./constants";

// ══════════════════════════════════════════════════════
// 第一部分：暗合宫（王亭之秘传技法）
// ══════════════════════════════════════════════════════

/**
 * 地支暗合配对表
 * 王亭之《安星法及推断实例》中篇·暗合章：
 * 暗合是不明显但重要的隐性关联，藏于地支本质关系中
 *
 * 暗合规则：
 *   寅↔午（火局暗合）
 *   卯↔巳（木生火暗合）
 *   辰↔酉（金局暗合）
 *   戌↔巳（火库暗合）
 *   申↔亥（水局暗合）
 *   子↔丑（土局暗合）
 *   未↔午（火土暗合）
 */
const DARK_HARMONY_PAIRS: [number, number][] = [
  [2, 6],   // 寅↔午
  [3, 5],   // 卯↔巳
  [4, 9],   // 辰↔酉
  [10, 5],  // 戌↔巳
  [8, 11],  // 申↔亥
  [0, 1],   // 子↔丑
  [7, 6],   // 未↔午
];

/**
 * 宫位暗合（王亭之核心发明）
 * 命宫暗合的是哪一宫，那一宫的宫位性质会"暗化"命宫
 * 特别用于推断隐性收入和隐秘婚姻
 *
 * 暗合宫位配对（以地支暗合为基础扩展）：
 *   命宫 ↔ 官禄宫（互为暗合）
 *   夫妻宫 ↔ 疾厄宫
 *   财帛宫 ↔ 田宅宫
 *   迁移宫 ↔ 交友宫
 *   子女宫 ↔ 父母宫
 *   兄弟宫 ↔ 福德宫
 */
const PALACE_DARK_HARMONY: Record<string, string> = {
  "命宫":   "官禄宫",
  "官禄宫": "命宫",
  "夫妻宫": "疾厄宫",
  "疾厄宫": "夫妻宫",
  "财帛宫": "田宅宫",
  "田宅宫": "财帛宫",
  "迁移宫": "交友宫",
  "交友宫": "迁移宫",
  "子女宫": "父母宫",
  "父母宫": "子女宫",
  "兄弟宫": "福德宫",
  "福德宫": "兄弟宫",
};

/**
 * 检测指定宫位的暗合宫
 * @param chart 命盘
 * @param palaceName 要检测的宫名（如 "命宫"、"夫妻宫"）
 * @returns 暗合宫信息数组
 */
export function detectDarkHarmony(
  chart: ZiweiChart,
  palaceName: string
): DarkHarmony[] {
  const results: DarkHarmony[] = [];
  const palace = chart.palaces.find((p) => p.name === palaceName);
  if (!palace) return results;

  // 1) 地支暗合检测
  for (const [a, b] of DARK_HARMONY_PAIRS) {
    if (palace.branch === a) {
      const target = chart.palaces.find((p) => p.branch === b);
      if (target) {
        results.push({
          sourceBranch: palace.branch,
          targetBranch: b,
          targetName: target.name,
          type: "branch_harmony",
        });
      }
    } else if (palace.branch === b) {
      const target = chart.palaces.find((p) => p.branch === a);
      if (target) {
        results.push({
          sourceBranch: palace.branch,
          targetBranch: a,
          targetName: target.name,
          type: "branch_harmony",
        });
      }
    }
  }

  // 2) 宫位暗合检测（王亭之独门）
  const darkMatch = PALACE_DARK_HARMONY[palaceName];
  if (darkMatch) {
    const target = chart.palaces.find((p) => p.name === darkMatch);
    if (target) {
      results.push({
        sourceBranch: palace.branch,
        targetBranch: target.branch,
        targetName: target.name,
        type: "palace_harmony",
      });
    }
  }

  return results;
}

/**
 * 检测全盘所有暗合
 * @returns 宫名 → 暗合列表 的映射
 */
export function detectAllDarkHarmonies(
  chart: ZiweiChart
): Record<string, DarkHarmony[]> {
  const result: Record<string, DarkHarmony[]> = {};
  for (const p of chart.palaces) {
    const harmonies = detectDarkHarmony(chart, p.name);
    if (harmonies.length > 0) {
      result[p.name] = harmonies;
    }
  }
  return result;
}

/**
 * 暗合命宫（王亭之最重视的暗合关系）
 * 命宫的暗合宫影响被暗合宫的主管领域
 */
export function detectDarkHarmonyOfMingGong(
  chart: ZiweiChart
): { palaceHarmony: DarkHarmony[]; branchHarmonies: DarkHarmony[] } {
  const all = detectDarkHarmony(chart, "命宫");
  return {
    palaceHarmony: all.filter((h) => h.type === "palace_harmony"),
    branchHarmonies: all.filter((h) => h.type === "branch_harmony"),
  };
}

// ══════════════════════════════════════════════════════
// 第二部分：煞星量化评分（王亭之独创打分法）
// ══════════════════════════════════════════════════════

/**
 * 煞星评分表（王亭之《安星法及推断实例》中篇）
 *
 *   擎羊 = 3分（最烈，见血光）
 *   陀罗 = 2分（连绵，主暗患）
 *   火星 = 2分（爆发，主急症）
 *   铃星 = 1分（暗损，主慢性）
 *   地空 = 2分（突如其来）
 *   地劫 = 2分（慢慢流失）
 *
 * 评分标准：
 *   ≥5 + 化忌 = 大凶 (danger)
 *   ≥5         = 明显凶 (warning)
 *   3-4        = 有明显阻碍 (caution)
 *   0-2        = 有惊无险 (safe)
 */
const SHA_SCORE_TABLE: Record<string, number> = {
  擎羊: 3,
  陀罗: 2,
  火星: 2,
  铃星: 1,
  地空: 2,
  地劫: 2,
};

function shaLevel(totalScore: number, hasSiHuaJi: boolean): ShaScore["level"] {
  if (totalScore >= 5 && hasSiHuaJi) return "danger";
  if (totalScore >= 5) return "warning";
  if (totalScore >= 3) return "caution";
  return "safe";
}

/**
 * 计算某宫位的煞星评分
 * @param palace 宫位
 * @returns 煞星评分详情
 */
export function scoreShaInPalace(palace: Palace): Omit<ShaScore, "level"> & {
  hasSiHuaJi: boolean;
} {
  let totalScore = 0;
  const details: { starName: string; score: number; palace: string }[] = [];
  let hasSiHuaJi = false;

  for (const star of palace.stars) {
    const score = SHA_SCORE_TABLE[star.name];
    if (score) {
      totalScore += score;
      details.push({ starName: star.name, score, palace: palace.name });
    }
    if (star.siHua === "忌") {
      hasSiHuaJi = true;
    }
  }

  return { totalScore, details, hasSiHuaJi };
}

/**
 * 计算某宫位的完整煞星评分（含等级判定）
 */
export function evaluateShaInPalace(palace: Palace): ShaScore {
  const { totalScore, details, hasSiHuaJi } = scoreShaInPalace(palace);
  return {
    totalScore,
    details,
    level: shaLevel(totalScore, hasSiHuaJi),
  };
}

/**
 * 计算全盘各宫的煞星评分
 * @returns 宫名 → 评分 的映射
 */
export function evaluateAllSha(chart: ZiweiChart): Record<string, ShaScore> {
  const result: Record<string, ShaScore> = {};
  for (const p of chart.palaces) {
    result[p.name] = evaluateShaInPalace(p);
  }
  return result;
}

/**
 * 计算三方四正范围内的总煞星评分
 * 用于格局破格判定
 */
export function scoreShaInSanFang(
  chart: ZiweiChart,
  centerBranch: number
): ShaScore {
  const involved = [centerBranch, (centerBranch + 4) % 12, (centerBranch + 8) % 12, (centerBranch + 6) % 12];
  let totalScore = 0;
  const details: { starName: string; score: number; palace: string }[] = [];
  let hasSiHuaJi = false;

  for (const branch of involved) {
    const palace = chart.palaces.find((p) => p.branch === branch);
    if (!palace) continue;
    for (const star of palace.stars) {
      const score = SHA_SCORE_TABLE[star.name];
      if (score) {
        totalScore += score;
        details.push({ starName: star.name, score, palace: palace.name });
      }
      if (star.siHua === "忌") hasSiHuaJi = true;
    }
  }

  return { totalScore, details, level: shaLevel(totalScore, hasSiHuaJi) };
}

/**
 * 提取全盘化忌信息（王亭之重化忌）
 */
export function collectAllSiHuaJi(chart: ZiweiChart): {
  palace: Palace;
  stars: Star[];
}[] {
  const result: { palace: Palace; stars: Star[] }[] = [];
  for (const p of chart.palaces) {
    const jiStars = p.stars.filter((s) => s.siHua === "忌");
    if (jiStars.length > 0) {
      result.push({ palace: p, stars: jiStars });
    }
  }
  return result;
}

// ══════════════════════════════════════════════════════
// 第三部分：王亭之《安星法及推断实例》口诀查询系统
// ══════════════════════════════════════════════════════

/**
 * 王亭之夫妻宫口诀（摘录自《安星法及推断实例》中篇）
 */
export const MARRIAGE_KOUJUE: WangKouJue[] = [
  { text: "紫微在夫妻，配偶大器晚成", conditions: ["紫微在夫妻宫"], nature: "good" },
  { text: "天机在夫妻，婚姻多变须防", conditions: ["天机在夫妻宫"], nature: "bad" },
  { text: "太阳在夫妻，配偶豪爽明理", conditions: ["太阳在夫妻宫"], nature: "good" },
  { text: "武曲在夫妻，配偶刚烈晚婚", conditions: ["武曲在夫妻宫"], nature: "mixed" },
  { text: "天同在夫妻，婚姻和美福寿", conditions: ["天同在夫妻宫"], nature: "good" },
  { text: "廉贞在夫妻，防范第三者介入", conditions: ["廉贞在夫妻宫"], nature: "bad" },
  { text: "天府在夫妻，稳定保守婚姻", conditions: ["天府在夫妻宫"], nature: "good" },
  { text: "太阴在夫妻，配偶温柔善良", conditions: ["太阴在夫妻宫"], nature: "good" },
  { text: "贪狼在夫妻，桃花旺盛须防", conditions: ["贪狼在夫妻宫"], nature: "bad" },
  { text: "巨门在夫妻，口舌是非不停", conditions: ["巨门在夫妻宫"], nature: "bad" },
  { text: "天相在夫妻，婚姻和顺美满", conditions: ["天相在夫妻宫"], nature: "good" },
  { text: "天梁在夫妻，配偶年长有助", conditions: ["天梁在夫妻宫"], nature: "mixed" },
  { text: "七杀在夫妻，婚姻多波折考验", conditions: ["七杀在夫妻宫"], nature: "bad" },
  { text: "破军在夫妻，离异之兆先破后成", conditions: ["破军在夫妻宫"], nature: "bad" },
];

/**
 * 王亭之财帛宫口诀
 */
export const WEALTH_KOUJUE: WangKouJue[] = [
  { text: "紫微守财宫，大财稳发有积累", conditions: ["紫微在财帛宫"], nature: "good" },
  { text: "武曲守财宫，财源广进金玉满堂", conditions: ["武曲在财帛宫"], nature: "good" },
  { text: "太阴守财宫，积聚之财置产立业", conditions: ["太阴在财帛宫"], nature: "good" },
  { text: "天府守财宫，库藏丰盈守成为上", conditions: ["天府在财帛宫"], nature: "good" },
  { text: "廉贞守财宫，财来财去大起大落", conditions: ["廉贞在财帛宫"], nature: "bad" },
  { text: "破军守财宫，先破后成变动起家", conditions: ["破军在财帛宫"], nature: "mixed" },
  { text: "贪狼守财宫，偏财运旺投机得利", conditions: ["贪狼在财帛宫"], nature: "mixed" },
  { text: "禄存在财宫，守财不破聚财有方", conditions: ["禄存在财帛宫"], nature: "good" },
];

/**
 * 王亭之疾厄宫口诀
 */
export const HEALTH_KOUJUE: WangKouJue[] = [
  { text: "火星入疾厄，热病火伤发炎急症", conditions: ["火星在疾厄宫"], nature: "bad" },
  { text: "铃星入疾厄，暗疾难愈缠绵反复", conditions: ["铃星在疾厄宫"], nature: "bad" },
  { text: "巨门入疾厄，消化系统胃肠问题", conditions: ["巨门在疾厄宫"], nature: "bad" },
  { text: "武曲入疾厄，肺疾骨伤呼吸系统", conditions: ["武曲在疾厄宫"], nature: "bad" },
  { text: "天机入疾厄，神经衰弱失眠多虑", conditions: ["天机在疾厄宫"], nature: "bad" },
  { text: "太阴入疾厄，肾水妇科眼目之疾", conditions: ["太阴在疾厄宫"], nature: "bad" },
  { text: "太阳入疾厄，眼目心脏病高血压", conditions: ["太阳在疾厄宫"], nature: "bad" },
  { text: "擎羊入疾厄，血光手术外伤急性", conditions: ["擎羊在疾厄宫"], nature: "bad" },
  { text: "陀罗入疾厄，慢性缠绵久病不愈", conditions: ["陀罗在疾厄宫"], nature: "bad" },
];

/**
 * 所有口诀合并索引
 */
export const ALL_KOUJUE: WangKouJue[] = [
  ...MARRIAGE_KOUJUE,
  ...WEALTH_KOUJUE,
  ...HEALTH_KOUJUE,
];

/**
 * 根据条件匹配口诀
 * @param conditions 匹配条件（例如 ["天机在夫妻宫"]）
 * @returns 匹配到的口诀
 */
export function matchKouJue(conditions: string[]): WangKouJue[] {
  return ALL_KOUJUE.filter((k) =>
    conditions.some((c) => k.conditions.includes(c))
  );
}

// ══════════════════════════════════════════════════════
// 第四部分：身宫断事（王亭之独到见解）
// ══════════════════════════════════════════════════════

/**
 * 身宫入十二宫释义（《安星法及推断实例》上篇）
 */
export const SHEN_GONG_MEANING: Record<string, { focus: string; desc: string }> = {
  "命宫":   { focus: "自我实现", desc: "一生为自己活，自我意识强，注重个人发展" },
  "兄弟宫": { focus: "人际为重", desc: "一生依靠朋友手足，人脉决定成就" },
  "夫妻宫": { focus: "婚姻为重", desc: "配偶对人生影响极大，婚姻质量决定命运" },
  "子女宫": { focus: "儿孙为重", desc: "为子女奉献一生，晚年子女发展是福气来源" },
  "财帛宫": { focus: "财富为重", desc: "一生为财忙，赚钱是人生主要动力" },
  "疾厄宫": { focus: "健康要紧", desc: "注重养生但体质偏弱，健康是首位关注" },
  "迁移宫": { focus: "外出发展", desc: "离家在外方有成就，适合异地发展事业" },
  "交友宫": { focus: "人脉为王", desc: "靠人际关系成事，社交能力决定高度" },
  "官禄宫": { focus: "事业为主", desc: "工作狂特质，事业心重且以事业定义自我" },
  "田宅宫": { focus: "家宅为重", desc: "守财置产，家庭是人生重心" },
  "福德宫": { focus: "精神享受", desc: "重精神不重物质，注重内心世界修养" },
  "父母宫": { focus: "家世影响", desc: "家庭背景对人生影响深远，依靠父母起家" },
};

/**
 * 获取身宫断事
 */
export function getShenGongMeaning(chart: ZiweiChart): {
  palaceName: string;
  focus: string;
  desc: string;
} | null {
  const shenPalace = chart.palaces.find((p) => p.isShenGong);
  if (!shenPalace) return null;
  const meaning = SHEN_GONG_MEANING[shenPalace.name];
  if (!meaning) return null;
  return { palaceName: shenPalace.name, ...meaning };
}

// ══════════════════════════════════════════════════════
// 第五部分：中州派独特格局识别
// ══════════════════════════════════════════════════════

/**
 * 中州派特殊48格精选（王亭之体系特有）
 * 区别于三合派的通用格局，这些是中州派独有的断法
 */
export function detectWangPatterns(chart: ZiweiChart): WangPattern[] {
  const patterns: WangPattern[] = [];
  const ming = chart.palaces.find((p) => p.isMingGong);
  if (!ming) return patterns;

  const majorInMing = ming.stars
    .filter((s) => s.type === "major")
    .map((s) => s.name);

  // 辅助函数
  const hasMajors = (names: string[]) =>
    names.every((n) => majorInMing.includes(n));
  const hasMajor = (name: string) => majorInMing.includes(name);
  const hasSha = (names: string[]) =>
    ming.stars.some((s) => names.includes(s.name));
  const hasStarIn = (
    starName: string,
    palaceName: string
  ): boolean => {
    const p = chart.palaces.find((p) => p.name === palaceName);
    return p?.stars.some((s) => s.name === starName) ?? false;
  };
  const hasSiHua = (starName: string, sh: SiHua): boolean => {
    return ming.stars.some((s) => s.name === starName && s.siHua === sh);
  };
  const hasAnySiHua = (sh: SiHua): boolean => {
    return ming.stars.some((s) => s.siHua === sh);
  };

  // ---- 吉格 ----

  // 1. 科权禄拱命（上上格）
  if (hasAnySiHua("科") || hasAnySiHua("权") || hasAnySiHua("禄")) {
    patterns.push({
      name: "科权禄拱命",
      type: "excellent",
      description: hasSiHua("禄", "禄") || hasSiHua("权", "权") || hasSiHua("科", "科")
        ? "三奇嘉会科权禄齐聚命宫或合拱，一生富贵不可限量"
        : "科权禄拱照命宫三方，主一生有贵气、有财源",
      relatedPalaces: ["命宫"],
      source: "《安星法及推断实例》中篇",
    });
  }

  // 2. 禄马交驰
  if (hasStarIn("禄存", "财帛宫") && hasStarIn("天马", "迁移宫")) {
    patterns.push({
      name: "禄马交驰",
      type: "good",
      description: "禄存守财帛而天马在迁移，主远行发财，现代尤应于贸易、国际业务、物流运输行业",
      relatedPalaces: ["财帛宫", "迁移宫"],
      source: "《安星法及推断实例》中篇",
    });
  }

  // 3. 辅弼拱主
  if (hasStarIn("左辅", "父母宫") && hasStarIn("右弼", "福德宫")) {
    patterns.push({
      name: "辅弼拱主",
      type: "excellent",
      description: "左右辅弼在命宫前后相夹，主得贵人相助，职位崇高",
      relatedPalaces: ["命宫", "父母宫", "福德宫"],
      source: "《安星法及推断实例》中篇",
    });
  }

  // 4. 魁钺夹贵
  if (hasStarIn("天魁", "父母宫") && hasStarIn("天钺", "福德宫")) {
    patterns.push({
      name: "魁钺夹贵",
      type: "good",
      description: "魁钺夹命宫，科甲成名，考试运佳",
      relatedPalaces: ["命宫", "父母宫", "福德宫"],
      source: "《安星法及推断实例》中篇",
    });
  }

  // ---- 凶格 ----

  // 5. 火铃夹命
  if (hasStarIn("火星", "父母宫") && hasStarIn("铃星", "福德宫")) {
    patterns.push({
      name: "火铃夹命",
      type: "caution",
      description: "火铃夹命宫，一生多是非刑伤、突发意外",
      relatedPalaces: ["命宫", "父母宫", "福德宫"],
      source: "《安星法及推断实例》中篇",
    });
  }

  // 6. 羊陀夹命
  if (hasStarIn("擎羊", "父母宫") && hasStarIn("陀罗", "福德宫")) {
    patterns.push({
      name: "羊陀夹命",
      type: "caution",
      description: "羊陀夹命宫，终年多灾厄、波折不断",
      relatedPalaces: ["命宫", "父母宫", "福德宫"],
      source: "《安星法及推断实例》中篇",
    });
  }

  // 7. 日月反背
  if (hasStarIn("太阳", "父母宫") && hasStarIn("太阴", "兄弟宫")) {
    patterns.push({
      name: "日月反背",
      type: "caution",
      description: "日月反背，一生多波折。太阳在戌亥子丑失辉，太阴在辰巳午未失照，王亭之注：现代未必全凶，可能是工作性质特殊（夜班/演艺/海外）",
      relatedPalaces: ["父母宫", "兄弟宫"],
      source: "《安星法及推断实例》中篇",
    });
  }

  // ---- 星曜组合口诀对应 ----

  // 8. 杀破狼
  if (hasMajors(["七杀", "破军", "贪狼"])) {
    patterns.push({
      name: "杀破狼",
      type: "caution",
      description: "七杀、破军、贪狼三正星会照命宫三方，变动之王格。主一生大起大落、开辟新局，武职或创业大利，安定守成则不利",
      relatedPalaces: ["命宫", "财帛宫", "官禄宫"],
      source: "《安星法及推断实例》中篇",
    });
  }

  // 9. 巨火擎羊
  if (hasMajor("巨门") && hasSha(["火星", "擎羊"])) {
    patterns.push({
      name: "巨火擎羊",
      type: "caution",
      description: "巨门+火星+擎羊会命宫，暴发暴败之格，须防诉讼官非",
      relatedPalaces: ["命宫"],
      source: "《安星法及推断实例》中篇",
    });
  }

  // 10. 泛水桃花
  if (hasMajor("贪狼") && hasStarIn("文昌", "子女宫")) {
    patterns.push({
      name: "泛水桃花",
      type: "caution",
      description: "贪狼+桃花星群在子午宫，贪色破家之象，艺术界可化解",
      relatedPalaces: ["命宫", "子女宫"],
      source: "《安星法及推断实例》中篇",
    });
  }

  return patterns;
}

// ══════════════════════════════════════════════════════
// 第六部分：综合命盘分析（王亭之体系）
// ══════════════════════════════════════════════════════

/**
 * 王亭之体系综合命盘分析
 * 整合：暗合宫 + 煞星评分 + 身宫断事 + 中州派格局 + 化忌汇总
 */
export function wangComprehensiveAnalysis(chart: ZiweiChart): {
  darkHarmonies: Record<string, DarkHarmony[]>;
  shaScores: Record<string, ShaScore>;
  shenGong: ReturnType<typeof getShenGongMeaning>;
  patterns: WangPattern[];
  siHuaJis: ReturnType<typeof collectAllSiHuaJi>;
  sanFangShaScore: ShaScore;
} {
  return {
    darkHarmonies: detectAllDarkHarmonies(chart),
    shaScores: evaluateAllSha(chart),
    shenGong: getShenGongMeaning(chart),
    patterns: detectWangPatterns(chart),
    siHuaJis: collectAllSiHuaJi(chart),
    sanFangShaScore: scoreShaInSanFang(chart, chart.mingGongBranch),
  };
}

export default {
  detectDarkHarmony,
  detectAllDarkHarmonies,
  detectDarkHarmonyOfMingGong,
  scoreShaInPalace,
  evaluateShaInPalace,
  evaluateAllSha,
  scoreShaInSanFang,
  collectAllSiHuaJi,
  matchKouJue,
  getShenGongMeaning,
  detectWangPatterns,
  wangComprehensiveAnalysis,
};
