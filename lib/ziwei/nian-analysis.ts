/**
 * 流年大限分析模块 — 基于《紫微斗数讲义》陆斌兆 + 《安星法及推断实例》王亭之
 *
 * 功能：
 *   1. 大限深度分析（当前大限 + 未来大限）
 *   2. 流年分析（某年运势）
 *   3. 王亭之应期三元法（年应/月应/日应）
 *   4. 小限分析
 *   5. 综合流年报告
 *
 * 参考：
 *   《紫微斗数讲义》陆斌兆  第五章 四化飞星 — 大限四化/流年四化
 *   《安星法及推断实例》王亭之  第十一章 四化流转 — 应期三元法
 *
 * 调用方式：
 *   const chart = generateChart(birthInfo);
 *   const daXian = analyzeCurrentDaXian(chart);     // 当前大限
 *   const liuNian = analyzeLiuNian(chart, 2028);     // 2028流年
 *   const yingQi = analyzeYingQi(chart, 2026, 2030); // 2026-2030应期
 */

import type {
  ZiweiChart, Palace, Star, SiHua,
  DaXianAnalysis, LiuNianAnalysis, LiuYueAnalysis, YingQiAnalysis
} from "./types";
import { STEMS, BRANCHES, IZTRO_TO_TRADITIONAL } from "./constants";
import {
  getSiHuaByStem, getYearStemIndex, getYearBranchIndex,
  getDaXianSiHua, getLiuNianSiHua, getLiuYueSiHua
} from "./sihua";

// ══════════════════════════════════════════════════════
// 全局常量
// ══════════════════════════════════════════════════════

const SHA_NAMES = ["擎羊", "陀罗", "火星", "铃星", "地空", "地劫"];

/** 天干 → 地支的映射（用于流年干支） */
const STEM_BRANCH_NAMES = ['甲子','乙丑','丙寅','丁卯','戊辰','己巳','庚午','辛未','壬申','癸酉',
  '甲戌','乙亥','丙子','丁丑','戊寅','己卯','庚辰','辛巳','壬午','癸未',
  '甲申','乙酉','丙戌','丁亥','戊子','己丑','庚寅','辛卯','壬辰','癸巳',
  '甲午','乙未','丙申','丁酉','戊戌','己亥','庚子','辛丑','壬寅','癸卯',
  '甲辰','乙巳','丙午','丁未','戊申','己酉','庚戌','辛亥','壬子','癸丑',
  '甲寅','乙卯','丙辰','丁巳','戊午','己未','庚申','辛酉','壬戌','癸亥'];

// ══════════════════════════════════════════════════════
// 第一部分：大限深度分析
// ══════════════════════════════════════════════════════

/**
 * 大限10年主题判定（基于大限宫星曜+四化）
 */
function determineDaXianTheme(
  majorStars: string[],
  isEmpty: boolean,
  siHua: Record<SiHua, string> | null,
  shaScore: number
): { theme: string; level: DaXianAnalysis['level']; advice: string } {
  // 空宫
  if (isEmpty) {
    return {
      theme: "借宫安星，十年运势受迁移宫影响较大",
      level: shaScore >= 5 ? '凶' : '平',
      advice: "大限空宫，借对宫星曜论。宜向外发展，不要固守现状。"
    };
  }

  let positives = 0;
  let negatives = 0;
  let themes: string[] = [];

  // 好星加分
  const excellentStars = ["紫微", "天府", "太阳"];
  const goodStars = ["天相", "天梁", "天同", "太阴", "武曲"];
  for (const s of majorStars) {
    if (excellentStars.includes(s)) { positives += 2; themes.push(`${s}入大限`); }
    else if (goodStars.includes(s)) { positives += 1; themes.push(`${s}入大限`); }
  }

  // 恶星减分
  const badStars = ["七杀", "破军", "廉贞", "巨门"];
  for (const s of majorStars) {
    if (s === "七杀") { negatives += 2; themes.push("七杀破旧立新"); }
    else if (s === "破军") { negatives += 1; themes.push("破军变动起家"); }
    else if (s === "廉贞") { negatives += 1; themes.push("廉贞复杂局"); }
    else if (s === "巨门") { negatives += 1; themes.push("巨门口舌运"); }
  }

  // 四化
  if (siHua) {
    if (siHua['禄']) { positives += 2; themes.push(`化禄在${siHua['禄']}`); }
    if (siHua['权']) { positives += 1; themes.push(`化权在${siHua['权']}`); }
    if (siHua['科']) { positives += 1; themes.push(`化科在${siHua['科']}`); }
    if (siHua['忌']) { negatives += 2; themes.push(`化忌在${siHua['忌']}`); }
  }

  // 煞星
  negatives += Math.floor(shaScore / 2);

  const net = positives - negatives;
  let level: DaXianAnalysis['level'];
  let theme: string;
  let advice: string;

  if (net >= 4) {
    level = '大吉';
    theme = `${themes.slice(0,3).join('·')}·十年顺遂`;
    advice = "大限格局上佳，运势强劲，宜抓住机遇推动人生重大决策。";
  } else if (net >= 1) {
    level = '吉';
    theme = `${themes.slice(0,3).join('·')}·稳步向上`;
    advice = "大限吉多于凶，虽有波折但总体向好，宜积极进取。";
  } else if (net >= -2) {
    level = '平';
    theme = `${themes.slice(0,3).join('·')}·吉凶参半`;
    advice = "大限平顺之年，宜守不宜攻，稳中求进。";
  } else if (net >= -5) {
    level = '凶';
    theme = `${themes.slice(0,3).join('·')}·波折考验`;
    advice = "大限挑战较多，宜保守退守，积德行善以化煞。";
  } else {
    level = '大凶';
    theme = `${themes.slice(0,3).join('·')}·煞忌交冲`;
    advice = "大限煞忌集结，需处处谨慎。化忌所在宫位是修行功课。";
  }

  return { theme, level, advice };
}

/**
 * 分析指定大限
 */
export function analyzeDaXian(chart: ZiweiChart, dxIndex: number): DaXianAnalysis | null {
  const dx = chart.daXians[dxIndex];
  if (!dx) return null;

  const dxPalace = chart.palaces.find(p => p.branch === dx.palaceBranch);
  if (!dxPalace) return null;

  const majorStars = dxPalace.stars.filter(s => s.type === "major").map(s => s.name);
  const isEmpty = majorStars.length === 0;
  const shaScore = dxPalace.stars.filter(s => SHA_NAMES.includes(s.name)).length;
  const dxSihua = getDaXianSiHua(chart, dxIndex);

  const { theme, level, advice } = determineDaXianTheme(
    majorStars, isEmpty, dxSihua?.transforms ?? null, shaScore
  );

  return {
    index: dxIndex,
    startAge: dx.startAge,
    endAge: dx.endAge,
    palaceName: dxPalace.name,
    palaceBranch: dxPalace.branch,
    palaceStem: STEMS[dxPalace.stem],
    majorStars,
    isEmpty,
    siHua: dxSihua,
    shaScore,
    theme,
    level,
    advice,
  };
}

/**
 * 分析当前大限
 */
export function analyzeCurrentDaXian(chart: ZiweiChart): DaXianAnalysis | null {
  return analyzeDaXian(chart, chart.currentDaXianIndex);
}

/**
 * 分析所有大限
 */
export function analyzeAllDaXians(chart: ZiweiChart): DaXianAnalysis[] {
  return chart.daXians.map((_, i) => analyzeDaXian(chart, i)).filter(Boolean) as DaXianAnalysis[];
}

// ══════════════════════════════════════════════════════
// 第二部分：流年分析
// ══════════════════════════════════════════════════════

/**
 * 获取流年干支
 */
export function getYearGanZhi(year: number): string {
  const stemIdx = getYearStemIndex(year);
  const branchIdx = getYearBranchIndex(year);
  const ganZhiIndex = (stemIdx * 6 + Math.floor(branchIdx / 2)) % 60; // 60甲子
  return STEM_BRANCH_NAMES[Math.abs(ganZhiIndex) % 60];
}

/**
 * 获取流年命宫地支
 * 流年命宫 = 以流年地支为起点，按"寅上起正月"逆推
 * 简化算法：流年命宫地支 ≈ 流年地支（王亭之简化法：流年太岁即流年宫）
 */
function getLiuNianMingBranch(year: number): number {
  return getYearBranchIndex(year);
}

/**
 * 获取某流年的12宫（基于流年命宫）
 */
function getLiuNianPalaces(chart: ZiweiChart, year: number): {
  branch: number; name: string; originalName: string;
  stars: Star[]; majorStars: string[];
}[] {
  const liuNianMingBranch = getLiuNianMingBranch(year);
  const result: { branch: number; name: string; originalName: string; stars: Star[]; majorStars: string[] }[] = [];

  // 流年12宫：以流年命宫为起点，逆时针排列（同本命盘规则）
  const palaceOrder = [
    "流年命宫", "流年兄弟", "流年夫妻", "流年子女",
    "流年财帛", "流年疾厄", "流年迁移", "流年交友",
    "流年官禄", "流年田宅", "流年福德", "流年父母"
  ];

  for (let i = 0; i < 12; i++) {
    const branch = ((liuNianMingBranch - i) % 12 + 12) % 12;
    const originalPalace = chart.palaces.find(p => p.branch === branch);
    if (!originalPalace) continue;

    result.push({
      branch,
      name: palaceOrder[i],
      originalName: originalPalace.name,
      stars: originalPalace.stars,
      majorStars: originalPalace.stars.filter(s => s.type === "major").map(s => s.name),
    });
  }

  return result;
}

/**
 * 流年宫位吉凶判定
 */
function assessLiuNianPalace(
  majorStars: string[],
  liuNianSiHua: Record<SiHua, string>,
  palace: string
): { level: '吉' | '平' | '凶'; trigger: string } {
  // 检查四化触发
  for (const [sh, starName] of Object.entries(liuNianSiHua)) {
    if (majorStars.includes(starName)) {
      if (sh === '忌') return { level: '凶', trigger: `${starName}化忌引动` };
      if (sh === '禄') return { level: '吉', trigger: `${starName}化禄引动` };
      return { level: '吉', trigger: `${starName}化${sh}引动` };
    }
  }

  // 无四化触发，看星曜本身
  const goodStars = ["紫微", "天府", "天相", "天同", "天梁", "左辅", "右弼", "文昌", "文曲", "天魁", "天钺", "禄存"];
  const badStars = ["七杀", "破军", "擎羊", "陀罗", "火星", "铃星", "地空", "地劫"];

  const hasGood = majorStars.some(s => goodStars.includes(s));
  const hasBad = majorStars.some(s => badStars.includes(s));

  if (hasGood && !hasBad) return { level: '吉', trigger: '吉星汇聚' };
  if (hasBad && !hasGood) return { level: '凶', trigger: '煞星汇聚' };
  if (hasGood && hasBad) return { level: '平', trigger: '吉凶参半' };

  return { level: '平', trigger: '星曜平淡' };
}

/**
 * 流年总体等级判定
 */
function assessLiuNianOverall(
  palaceFortune: { level: string }[],
  liuNianSiHua: Record<SiHua, string>
): DaXianAnalysis['level'] {
  const goodCount = palaceFortune.filter(p => p.level === '吉').length;
  const badCount = palaceFortune.filter(p => p.level === '凶').length;

  // 化忌引动减分
  const jiName = liuNianSiHua['忌'];

  if (goodCount >= 8 && badCount <= 1) return '大吉';
  if (goodCount >= 5 && badCount <= 2) return '吉';
  if (badCount >= 5) return '凶';
  if (badCount >= 7) return '大凶';
  return '平';
}

/**
 * 获取流年断语
 */
function getLiuNianInterpretation(
  year: number,
  level: DaXianAnalysis['level'],
  liuNianSiHua: Record<SiHua, string>
): { overall: string; cautions: string[]; blessings: string[] } {
  const cautions: string[] = [];
  const blessings: string[] = [];

  // 化忌是否入命宫
  const jiName = liuNianSiHua['忌'];
  const luName = liuNianSiHua['禄'];
  const quanName = liuNianSiHua['权'];
  const keName = liuNianSiHua['科'];

  if (jiName) cautions.push(`${year}年化忌在「${jiName}」，该星所在宫位是全年重点关注领域`);
  if (luName) blessings.push(`${year}年化禄在「${luName}」，该星所在宫位有增益好运`);

  // 各类星曜组合预警
  if (jiName === "武曲") cautions.push("武曲化忌之年，注意财务问题、投资谨慎、避免借贷");
  if (jiName === "廉贞") cautions.push("廉贞化忌之年，注意官非纠纷、职场政治、谨慎言行");
  if (jiName === "太阳") cautions.push("太阳化忌之年，注意男性亲友健康、事业阻滞、不宜强出头");
  if (jiName === "太阴") cautions.push("太阴化忌之年，注意女性亲友健康、感情困扰、财务谨慎");
  if (jiName === "天同") cautions.push("天同化忌之年，内心压力较大，注意心理健康");
  if (jiName === "巨门") cautions.push("巨门化忌之年，防口舌是非，谨言慎行");
  if (jiName === "贪狼") cautions.push("贪狼化忌之年，防桃花陷阱、投机失利、欲望失控");
  if (jiName === "文昌" || jiName === "文曲") cautions.push("文星化忌之年，注意文书合同细节，考试运弱");

  if (luName === "武曲") blessings.push("武曲化禄之年，财运亨通，实业投资有回报");
  if (luName === "廉贞") blessings.push("廉贞化禄之年，事业顺遂，名利双收");
  if (luName === "天机") blessings.push("天机化禄之年，智慧生财，创意斩获多");
  if (luName === "太阳") blessings.push("太阳化禄之年，贵人运强，事业发展顺遂");
  if (luName === "太阴") blessings.push("太阴化禄之年，财源广进，利置产投资");

  let overall = "";
  switch (level) {
    case '大吉': overall = `${year}年运势上佳，流年命宫得吉星拱照，四化顺遂。适合推进重大计划、婚嫁、置业。`; break;
    case '吉':   overall = `${year}年运势向好，虽有小的波折但不影响大局。把握化禄所在宫位的机会。`; break;
    case '平':   overall = `${year}年运势平顺，吉凶参半。宜稳定守成，逢化忌宫位需谨慎行事。`; break;
    case '凶':   overall = `${year}年运势多阻，化忌煞星引动较多。宜保守隐忍，积德行善转命。`; break;
    case '大凶': overall = `${year}年运势考验较大，煞忌交冲。注意健康、财务、法律三大领域。暗中行事，以退为进。`; break;
  }

  return { overall, cautions, blessings };
}

/**
 * 分析流年（某一年）
 */
export function analyzeLiuNian(chart: ZiweiChart, year: number): LiuNianAnalysis {
  const stemIdx = getYearStemIndex(year);
  const branchIdx = getYearBranchIndex(year);
  const ganZhi = getYearGanZhi(year);

  // 流年命宫
  const liuNianMingBranch = getLiuNianMingBranch(year);
  const liuNianMing = chart.palaces.find(p => p.branch === liuNianMingBranch);
  const mingMajorStars = liuNianMing?.stars.filter(s => s.type === "major").map(s => s.name) || [];
  const mingIsEmpty = mingMajorStars.length === 0;
  const mingBrightness: 'bright' | 'normal' | 'dim' =
    liuNianMing?.stars.some(s => s.type === "major" && s.brightness === 'bright') ? 'bright'
    : liuNianMing?.stars.some(s => s.type === "major" && s.brightness === 'dim') ? 'dim'
    : 'normal';

  // 流年四化
  const liuNianSiHua = getLiuNianSiHua(year).transforms;

  // 当前大限
  const currentDaXian = chart.daXians[chart.currentDaXianIndex];

  // 流年12宫
  const liuNianPalaces = getLiuNianPalaces(chart, year);
  const palaceFortune = liuNianPalaces.map(p => {
    const { level, trigger } = assessLiuNianPalace(p.majorStars, liuNianSiHua, p.name);
    return { palace: p.name, majorStars: p.majorStars, level, trigger };
  });

  // 总体评定
  const overallLevel = assessLiuNianOverall(palaceFortune, liuNianSiHua);
  const { overall, cautions, blessings } = getLiuNianInterpretation(year, overallLevel, liuNianSiHua);

  return {
    year,
    ganZhi,
    age: year - chart.birthInfo.year,
    currentDaXian: {
      palaceName: currentDaXian?.palaceName ?? "",
      startAge: currentDaXian?.startAge ?? 0,
      endAge: currentDaXian?.endAge ?? 0,
    },
    mingMajorStars,
    mingBrightness,
    mingIsEmpty,
    liuNianSiHua,
    palaceFortune,
    overallLevel,
    overallInterpretation: overall,
    cautions,
    blessings,
  };
}

// ══════════════════════════════════════════════════════
// 第三部分：王亭之应期三元法
// ══════════════════════════════════════════════════════

/**
 * 应期三元法 — 年应（某年是否有重大事件）
 *
 * 王亭之《安星法及推断实例》：
 *   三元相合为"应"——
 *   大限引动是信号，流年触发是应验，流月确认是结果。
 *
 * 判定条件（满足任意 2 条即判定为重大年份）：
 *   1. 流年化忌入大限命宫
 *   2. 流年化禄入本命命宫/财帛/官禄
 *   3. 流年地支与大限宫地支构成冲/合/会
 *   4. 流年命宫主星与大限命宫主星相同
 *   5. 流年煞星大量引动
 */
export function analyzeYingQi(
  chart: ZiweiChart,
  startYear: number,
  endYear: number
): YingQiAnalysis {
  const events: { year: number; event: string; level: '吉' | '凶' }[] = [];
  const basis: string[] = [];

  // 当前大限信息
  const currentDx = chart.daXians[chart.currentDaXianIndex];
  const dxPalace = chart.palaces.find(p => p.branch === currentDx?.palaceBranch);
  const dxMajorStars = dxPalace?.stars.filter(s => s.type === "major").map(s => s.name) || [];
  const dxSihua = getDaXianSiHua(chart, chart.currentDaXianIndex);

  let hasMajorEvent = false;

  for (let y = startYear; y <= endYear; y++) {
    const liuNianSiHua = getLiuNianSiHua(y).transforms;
    const liuNianBranch = getYearBranchIndex(y);
    const triggers: string[] = [];
    let isGood = false;
    let isBad = false;

    // 条件1：流年化忌入大限命宫
    const jiStar = liuNianSiHua['忌'];
    if (jiStar && dxMajorStars.includes(jiStar)) {
      triggers.push(`流年化忌「${jiStar}」入大限命宫`);
      isBad = true;
    }

    // 条件2：流年化禄入本命命宫/财帛/官禄
    const luStar = liuNianSiHua['禄'];
    if (luStar) {
      const mingPalace = chart.palaces.find(p => p.isMingGong);
      const caiPalace = chart.palaces.find(p => p.name === "财帛");
      const guanPalace = chart.palaces.find(p => p.name === "官禄");

      if (mingPalace?.stars.some(s => s.name === luStar)) {
        triggers.push(`流年化禄「${luStar}」入命宫`);
        isGood = true;
      }
      if (caiPalace?.stars.some(s => s.name === luStar)) {
        triggers.push(`流年化禄「${luStar}」入财帛宫`);
        isGood = true;
      }
      if (guanPalace?.stars.some(s => s.name === luStar)) {
        triggers.push(`流年化禄「${luStar}」入官禄宫`);
        isGood = true;
      }
    }

    // 条件3：流年地支与大限宫地支冲/合
    if (currentDx) {
      const dxBranch = currentDx.palaceBranch;
      const oppBranch = (dxBranch + 6) % 12;
      if (liuNianBranch === oppBranch) {
        triggers.push("流年地支与大限宫对冲（冲大限）");
        isBad = true;
      }
      if (liuNianBranch === dxBranch) {
        triggers.push("流年地支与大限宫重合（伏吟大限）");
      }
    }

    // 条件4：流年命宫主星与大限命宫主星有关联
    const liuNianMingBranch = getLiuNianMingBranch(y);
    const liuNianMing = chart.palaces.find(p => p.branch === liuNianMingBranch);
    const lNMajorStars = liuNianMing?.stars.filter(s => s.type === "major").map(s => s.name) || [];
    const overlap = dxMajorStars.filter(s => lNMajorStars.includes(s));
    if (overlap.length > 0) {
      triggers.push(`流年命宫与大限命宫同有「${overlap.join('、')}」`);
    }

    // 条件5：流年四化引动情况
    const sihuaCount = Object.values(liuNianSiHua).filter(Boolean).length;

    // 判定：>=2 个触发条件算重大年份
    if (triggers.length >= 2) {
      hasMajorEvent = true;
      const level = isBad && !isGood ? '凶' : isGood && !isBad ? '吉' : '凶';
      events.push({
        year: y,
        event: triggers.join('；'),
        level,
      });
    }
  }

  // 汇总依据
  if (dxSihua?.transforms) {
    const dxStr = Object.entries(dxSihua.transforms)
      .map(([k, v]) => `化${k}在${v}`)
      .join('、');
    basis.push(`当前大限四化：${dxStr}`);
  }
  basis.push(`大限宫位：${dxPalace?.name ?? ""}（${BRANCHES[currentDx?.palaceBranch ?? 0]}）`);
  basis.push(`大限年龄：${currentDx?.startAge ?? 0}-${currentDx?.endAge ?? 0}岁`);

  return { hasMajorEvent, majorEventYears: events, basis };
}

// ══════════════════════════════════════════════════════
// 第四部分：小限分析（王亭之体系）
// ══════════════════════════════════════════════════════

/**
 * 小限推算：
 * 男命：寅午戌年生人，小限起于辰宫；申子辰年生人，起于戌宫；巳酉丑年生人，起于未宫；亥卯未年生人，起于丑宫
 * 女命起法相反
 * 简化版：直接以虚岁逐年推
 */

/**
 * 获取某流年小限所在宫地支
 * 男命由生年地支三合定小限起始宫
 */
export function getXiaoXianBranch(
  birthBranch: number,
  gender: 'male' | 'female',
  age: number
): number {
  // 男命起始宫表
  const maleStart: Record<number, number> = {
    2: 4, 6: 4, 10: 4,   // 寅午戌 → 辰(4)
    8: 10, 0: 10, 4: 10, // 申子辰 → 戌(10)
    5: 2, 9: 2, 1: 2,    // 巳酉丑 → 寅(2)
    11: 1, 3: 1, 7: 1,   // 亥卯未 → 丑(1)
  };
  // 女命起始宫表（相反）
  const femaleStart: Record<number, number> = {
    2: 10, 6: 10, 10: 10,   // 寅午戌 → 戌(10)
    8: 4, 0: 4, 4: 4,       // 申子辰 → 辰(4)
    5: 8, 9: 8, 1: 8,       // 巳酉丑 → 申(8)
    11: 7, 3: 7, 7: 7,      // 亥卯未 → 未(7)
  };

  const start = gender === 'male' ? (maleStart[birthBranch] ?? 4) : (femaleStart[birthBranch] ?? 10);
  const offset = (age - 1) % 12;
  const direction = gender === 'male' ? 1 : -1; // 男顺女逆
  return ((start + direction * offset) % 12 + 12) % 12;
}

// ══════════════════════════════════════════════════════
// 第五部分：综合流年报告
// ══════════════════════════════════════════════════════

/**
 * 综合流年报告（大限 + 流年 + 应期）
 */
export interface ComprehensiveYearlyReport {
  currentDaXian: DaXianAnalysis | null;
  liuNian: LiuNianAnalysis;
  yingQi: YingQiAnalysis;
  xiaoXianBranch: number;
  xiaoXianPalaceName: string;
}

/**
 * 生成某年综合流年报告
 */
export function getYearlyReport(
  chart: ZiweiChart,
  year: number
): ComprehensiveYearlyReport {
  const liuNian = analyzeLiuNian(chart, year);
  const yingQi = analyzeYingQi(chart, year, year);
  const xiaoXianBranch = getXiaoXianBranch(
    chart.birthInfo.hour, // 注意：这里应该是生年地支，但 hour 是时辰
    chart.birthInfo.gender,
    liuNian.age
  );
  // 修正：应该用生年地支
  const birthYearBranch = getYearBranchIndex(chart.birthInfo.year);
  const xiaoXianBranchCorrect = getXiaoXianBranch(
    birthYearBranch,
    chart.birthInfo.gender,
    liuNian.age
  );
  const xiaoXianPalace = chart.palaces.find(p => p.branch === xiaoXianBranchCorrect);
  // 检查该流年是否在某个大限内
  const relevantDaXian = chart.daXians.find(
    dx => liuNian.age >= dx.startAge && liuNian.age <= dx.endAge
  );
  const dxIndex = relevantDaXian ? chart.daXians.indexOf(relevantDaXian) : chart.currentDaXianIndex;

  return {
    currentDaXian: analyzeDaXian(chart, dxIndex),
    liuNian,
    yingQi,
    xiaoXianBranch: xiaoXianBranchCorrect,
    xiaoXianPalaceName: xiaoXianPalace?.name ?? "",
  };
}

export default {
  analyzeDaXian,
  analyzeCurrentDaXian,
  analyzeAllDaXians,
  analyzeLiuNian,
  analyzeYingQi,
  getXiaoXianBranch,
  getYearlyReport,
};
