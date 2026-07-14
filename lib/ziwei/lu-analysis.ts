/**
 * 陆斌兆《紫微斗数讲义》本命盘与十二宫分析模块
 *
 * 本模块基于陆斌兆先生紫微斗数中州派教学体系，提供：
 *   1. 本命盘综合论（命宫格局 + 三方四正 + 四化 + 空宫煞星）
 *   2. 十二宫逐宫详解（星曜组合 + 宫位特性 + 陆斌兆断语）
 *   3. 星曜互涉分析（14主星组合要义）
 *   4. 四化入十二宫详解
 *   5. 庙旺利陷综合判断
 *
 * 参考：
 *   《紫微斗数讲义》陆斌兆 著（香港中文大学，1981年出版）
 *   《骨髓赋》《女命骨髓赋》等古籍
 *
 * 与 wang-analysis.ts 的关系：
 *   wang-analysis.ts = 王亭之实战口诀（暗合宫/煞星量化/中州派专属格）
 *   lu-analysis.ts   = 陆斌兆系统教材（本命盘深化/十二宫系统分析/星曜互涉）
 *   两者互补，应同时调用以获得最完整的分析
 */

import type { ZiweiChart, Palace, Star, SiHua } from "./types";
import { STEMS, BRANCHES, PALACE_NAMES_ORDER, IZTRO_TO_TRADITIONAL } from "./constants";

// ══════════════════════════════════════════════════════
// 第一部分：本命盘综合论（陆斌兆三步断盘法）
// ══════════════════════════════════════════════════════

/**
 * 陆斌兆命盘等级评定
 * 第一看命宫格局高低 → 第二看三方四正气象 → 第三看煞星空宫数量
 */
export type ChartLevel = "上等" | "中上" | "中等" | "中下" | "下等";

export interface OverallChartAnalysis {
  /** 命宫主星 */
  mingMajorStars: string[];
  /** 命宫空宫？ */
  mingIsEmpty: boolean;
  /** 命宫亮度 */
  mingBrightness: "bright" | "normal" | "dim";
  /** 格局等级 */
  level: ChartLevel;
  /** 三方四正主星列表 */
  sanFangStars: string[];
  /** 三方四正煞星数量 */
  sanFangShaCount: number;
  /** 空宫数（12宫中无主星的宫位数） */
  emptyPalaceCount: number;
  /** 化忌进入的宫位 */
  siHuaJiPalaces: string[];
  /** 四化总览 */
  siHuaSummary: { lu: string[]; quan: string[]; ke: string[]; ji: string[] };
  /** 综合断语 */
  conclusion: string;
  /** 忠告 */
  advice: string;
}

/**
 * 命宫亮度判定
 */
function getMingBrightness(chart: ZiweiChart): "bright" | "normal" | "dim" {
  const ming = chart.palaces.find((p) => p.isMingGong);
  if (!ming) return "normal";
  const majors = ming.stars.filter((s) => s.type === "major");
  if (majors.length === 0) return "normal"; // 空宫，借迁移宫

  // 取命宫主星中最亮的那个
  const hasBright = majors.some((s) => s.brightness === "bright");
  const hasDim = majors.every((s) => s.brightness === "dim");

  if (hasBright) return "bright";
  if (hasDim) return "dim";
  return "normal";
}

/**
 * 命盘等级评定（陆斌兆体系）
 */
function assessLevel(
  mingStars: string[],
  isEmpty: boolean,
  mingBrightness: "bright" | "normal" | "dim",
  sanFangStars: string[],
  sanFangSha: number,
  emptyCount: number,
  jiList: string[]
): { level: ChartLevel; conclusion: string; advice: string } {
  let score = 50; // 基准分

  // 命宫主星权重
  if (!isEmpty) {
    score += 10; // 有主星
    if (mingBrightness === "bright") score += 15;
    else if (mingBrightness === "dim") score -= 10;
  } else {
    score -= 8; // 空宫
  }

  // 高贵主星加分
  const nobleStars = ["紫微", "天府", "太阳", "天相"];
  if (mingStars.some((s) => nobleStars.includes(s))) score += 10;

  // 三方四正
  const goodGroups = ["左辅", "右弼", "文昌", "文曲", "天魁", "天钺", "禄存"];
  const goodCount = sanFangStars.filter((s) => goodGroups.includes(s)).length;
  score += goodCount * 5;

  // 煞星减分
  score -= sanFangSha * 4;

  // 空宫减分
  score -= emptyCount * 3;

  // 化忌减分
  score -= jiList.length * 5;

  // 等级
  let level: ChartLevel;
  if (score >= 75) level = "上等";
  else if (score >= 60) level = "中上";
  else if (score >= 45) level = "中等";
  else if (score >= 30) level = "中下";
  else level = "下等";

  // 断语
  const conclusionMap: Record<ChartLevel, string> = {
    上等: "命盘格局上乘，主星有力、辅星得位、四化顺遂。一生机遇佳，能得贵人提携，宜创大业。",
    中上: "命盘格局良好，虽有少许瑕疵但不影响大局。主星得力，人生有明确方向，能稳步向上。",
    中等: "命盘格局中等，吉凶参半。有发展潜力但需后天努力弥补先天不足，宜持中守正。",
    中下: "命盘格局偏弱，空宫较多或煞星过重。人生较多波折，宜修身养性、以静制动。",
    下等: "命盘格局较弱，煞忌交冲。人生挑战较多，宜谨慎行事、积德行善以转命。",
  };

  const adviceMap: Record<ChartLevel, string> = {
    上等: "先天条件优厚，但仍需后天努力方能成就。命宫成格者忌骄傲自满，空劫冲破则需防大意失荆州。",
    中上: "基础良好，重点补强化忌所在的宫位——那正是你一生的修行课题。",
    中等: "不需妄自菲薄，中等命盘占了大多数。关键在于找准自己的优势宫位（星曜最亮处）发力。",
    中下: "宜从化忌宫位寻找人生功课，煞星集中处就是需要修行的领域。宜稳不宜冒进。",
    下等: "建议先从修身养性做起。命盘可改，运由心生。煞忌交汇处正是成长空间最大处。",
  };

  return {
    level,
    conclusion: conclusionMap[level],
    advice: adviceMap[level],
  };
}

/**
 * 本命盘综合论（陆斌兆三步断盘法第一步）
 *
 * 第一步：观全局
 *   1. 看命宫主星定格局基调
 *   2. 看三方四正定整体气象
 *   3. 看四化定人生主旋律
 *   4. 看空宫数定命盘稳定度
 */
export function analyzeOverallChart(chart: ZiweiChart): OverallChartAnalysis {
  const ming = chart.palaces.find((p) => p.isMingGong)!;

  // 命宫主星
  const mingMajorStars = ming.stars
    .filter((s) => s.type === "major")
    .map((s) => s.name);
  const mingIsEmpty = mingMajorStars.length === 0;
  const mingBrightness = getMingBrightness(chart);

  // 三方四正（命宫+财帛+官禄+迁移）
  const branches = [
    chart.mingGongBranch,
    (chart.mingGongBranch + 4) % 12,
    (chart.mingGongBranch + 8) % 12,
    (chart.mingGongBranch + 6) % 12,
  ];
  const sanFangPalaces = chart.palaces.filter((p) =>
    branches.includes(p.branch)
  );

  const sanFangStars = [
    ...new Set(
      sanFangPalaces.flatMap((p) =>
        p.stars.filter((s) => s.type === "major").map((s) => s.name)
      )
    ),
  ];

  const SHA = ["擎羊", "陀罗", "火星", "铃星", "地空", "地劫"];
  const sanFangShaCount = sanFangPalaces.reduce(
    (sum, p) =>
      sum + p.stars.filter((s) => SHA.includes(s.name)).length,
    0
  );

  // 空宫数
  const emptyPalaceCount = chart.palaces.filter((p) => {
    const majors = p.stars.filter((s) => s.type === "major");
    return majors.length === 0;
  }).length;

  // 四化汇总
  const siHuaSummary: OverallChartAnalysis["siHuaSummary"] = {
    lu: [],
    quan: [],
    ke: [],
    ji: [],
  };
  const siHuaJiPalaces: string[] = [];

  for (const p of chart.palaces) {
    for (const s of p.stars) {
      if (s.siHua === "禄") siHuaSummary.lu.push(`${s.name}在${p.name}`);
      if (s.siHua === "权") siHuaSummary.quan.push(`${s.name}在${p.name}`);
      if (s.siHua === "科") siHuaSummary.ke.push(`${s.name}在${p.name}`);
      if (s.siHua === "忌") {
        siHuaSummary.ji.push(`${s.name}在${p.name}`);
        siHuaJiPalaces.push(p.name);
      }
    }
  }

  // 命盘等级
  const { level, conclusion, advice } = assessLevel(
    mingMajorStars,
    mingIsEmpty,
    mingBrightness,
    sanFangStars,
    sanFangShaCount,
    emptyPalaceCount,
    siHuaJiPalaces
  );

  return {
    mingMajorStars,
    mingIsEmpty,
    mingBrightness,
    level,
    sanFangStars,
    sanFangShaCount,
    emptyPalaceCount,
    siHuaJiPalaces,
    siHuaSummary,
    conclusion,
    advice,
  };
}

// ══════════════════════════════════════════════════════
// 第二部分：十二宫逐宫分析（陆斌兆《讲义》第四章）
// ══════════════════════════════════════════════════════

/**
 * 单宫分析结果
 */
export interface PalaceAnalysis {
  /** 宫名 */
  name: string;
  /** 地支 */
  branch: string;
  /** 天干 */
  stem: string;
  /** 主星 */
  majorStars: string[];
  /** 辅星 */
  minorStars: string[];
  /** 煞星 */
  shaStars: string[];
  /** 吉星 */
  luckyStars: string[];
  /** 四化 */
  siHua: { star: string; type: SiHua }[];
  /** 空宫？ */
  isEmpty: boolean;
  /** 亮度评定 */
  brightness: "bright" | "normal" | "dim";
  /** 陆斌兆断语 */
  interpretation: string;
  /** 需注意的问题 */
  caution?: string;
  /** 吉利暗示 */
  blessing?: string;
}

/**
 * 陆斌兆十二宫断语系统
 *
 * 每宫的分析逻辑：
 *   1. 看星曜组合 → 定宫位格局
 *   2. 看三方四正 → 定外部影响
 *   3. 看四化 → 定吉凶方向
 *   4. 看煞星 → 定隐患
 */

// ─── 各宫断语引擎 ───

/**
 * 命宫分析（灵魂之宫）
 */
function interpretMingPalace(
  stars: Star[],
  isEmpty: boolean,
  brightness: "bright" | "normal" | "dim"
): { interpretation: string; caution?: string; blessing?: string } {
  const majors = stars.filter((s) => s.type === "major").map((s) => s.name);
  const shaStars = stars.filter((s) => ["擎羊","陀罗","火星","铃星","地空","地劫"].includes(s.name));
  const luckyStars = stars.filter((s) => ["左辅","右弼","文昌","文曲","天魁","天钺","禄存","天马"].includes(s.name));

  if (isEmpty) {
    return {
      interpretation: "命宫空宫无主星，需借对宫迁移宫星曜论断。人生格局受外在环境和他人的影响较大，容易缺乏明确的人生方向。",
      caution: "空宫之命容易随波逐流，建议多培养自我意识，找到坚定的人生目标。",
      blessing: "空宫也有好处——可塑性极强，不局限于一格，适合多元发展。",
    };
  }

  let interpretation = "";
  let caution: string | undefined;
  let blessing: string | undefined;

  // 主星断语
  const mingKouJue: Record<string, string> = {
    紫微: "紫微坐命，帝王之相，贵不可言。主尊贵、独立、有领导才能。",
    天机: "天机坐命，智慧超群，善谋略。但容易思虑过重，宜培养定力。",
    太阳: "太阳坐命，光明磊落，慷慨大方。庙旺则贵，陷地则劳碌。",
    武曲: "武曲坐命，刚毅果决，财星入命。庙旺富足，陷地孤克。",
    天同: "天同坐命，福寿绵长，性情温和。最喜化忌，反而能激发斗志。",
    廉贞: "廉贞坐命，才艺过人，但本性复杂。宜向学术艺术发展，忌投机取巧。",
    天府: "天府坐命，稳重保守，财库丰盈。但易过于安逸，缺乏进取。",
    太阴: "太阴坐命，温柔细腻，富艺术气息。庙旺主富，陷地主感情困扰。",
    贪狼: "贪狼坐命，多才多艺交际广。但欲望强烈，宜修心养性。",
    巨门: "巨门坐命，口才了得，善辩是非。但易犯口舌，宜谨言慎行。",
    天相: "天相坐命，辅佐之才，温和稳健。最喜天魁天钺，主贵人提拔。",
    天梁: "天梁坐命，清高傲气，有荫护他人之心。庙旺寿长，陷地孤寂。",
    七杀: "七杀坐命，敢作敢当，将星入命。宜武职创业，不宜守成。",
    破军: "破军坐命，开创性强，破而后立。一生变动较大，先败后成。",
  };

  interpretation = majors.map((m) => mingKouJue[m] || "").filter(Boolean).join("");

  // 亮度修饰
  if (brightness === "bright") {
    interpretation += "星曜庙旺得地，力量能够充分发挥。";
  } else if (brightness === "dim") {
    interpretation += "星曜陷地失辉，力量受限，需后天加倍努力。";
  }

  // 辅星修饰
  if (luckyStars.length >= 2) {
    interpretation += "辅星吉曜汇聚，贵人运佳。";
    blessing = "命宫得吉曜辅佐，一生遇贵人相助。";
  }

  // 煞星警示
  if (shaStars.length >= 2) {
    caution = `命宫煞星过多（${shaStars.map(s=>s.name).join("、")}），性格上可能有较极端的面向，需注意情绪管理。`;
  }

  return { interpretation, caution, blessing };
}

/**
 * 兄弟宫分析
 */
function interpretBrotherPalace(stars: Star[], isEmpty: boolean): { interpretation: string; caution?: string } {
  const majors = stars.filter(s => s.type === "major").map(s => s.name);
  if (isEmpty) return { interpretation: "兄弟宫无主星，与兄弟姐妹缘分较淡，或各奔东西。兄弟对你人生的影响力较弱。" };
  const map: Record<string, string> = {
    紫微: "兄弟中有能力强者，但可能有尊卑之分。",
    天机: "兄弟聪明，手足情深，但聚少离多。",
    太阳: "兄弟正直慷慨，能得兄弟之助。陷地则兄弟操劳。",
    武曲: "兄弟刚强，但可能性格不合。庙旺和，陷地争。",
    天同: "兄弟和睦，手足情深。",
    廉贞: "兄弟关系复杂，可能有竞争或隔阂。",
    天府: "兄弟稳定可靠，可得照顾。",
    太阴: "兄弟温和，可能有姐妹缘强于兄弟缘。",
    贪狼: "兄弟中有交际广阔者，但易因利益起纷争。",
    巨门: "兄弟间易有口舌是非，须多沟通。",
    天相: "兄弟和睦互助，关系中你多扮演协调者。",
    天梁: "兄弟正直有荫护之心，年长者尤其得力。",
    七杀: "兄弟性格刚烈，可能关系疏淡。",
    破军: "兄弟多变，聚散无常。",
  };
  return {
    interpretation: majors.map(m => map[m] || "").filter(Boolean).join(""),
    caution: stars.some(s => ["擎羊","陀罗","火星","铃星"].includes(s.name))
      ? "兄弟宫见煞，注意手足关系中的摩擦和误会" : undefined,
  };
}

/**
 * 夫妻宫分析
 */
function interpretMarriagePalace(stars: Star[], isEmpty: boolean): { interpretation: string; caution?: string; blessing?: string } {
  const majors = stars.filter(s => s.type === "major").map(s => s.name);
  if (isEmpty) {
    return {
      interpretation: "夫妻宫空宫，婚姻观念易受外在影响，或配偶性格受借星影响大。",
      caution: "空宫婚姻较不稳定，建议晚婚，婚前充分了解。",
    };
  }
  const map: Record<string, string> = {
    紫微: "配偶气度大、有领导能力，可能是晚婚或配偶年龄稍长。",
    天机: "配偶聪明机敏，但婚姻中容易有变化，需用心经营。",
    太阳: "配偶性格开朗豪爽，庙旺婚姻美满，陷地配偶劳碌。",
    武曲: "配偶刚毅果决，庙旺配偶能掌财，陷地婚姻易冷淡。",
    天同: "婚姻和顺美满，夫妻感情深厚，是福气之兆。",
    廉贞: "须防范第三者介入，婚姻中需要高度互信。",
    天府: "婚姻稳定保守，配偶持家有道。",
    太阴: "配偶温柔体贴，庙旺婚姻极美。陷地易有感情困扰。",
    贪狼: "桃花旺盛，婚姻中需防外界诱惑。",
    巨门: "夫妻间易有口舌是非，贵在坦诚沟通。",
    天相: "婚姻和顺，配偶是贤内助。",
    天梁: "配偶年龄较长或思想成熟，能得配偶荫护。",
    七杀: "婚姻波折较多，须经历考验方能稳定。",
    破军: "婚姻有离异之兆或先破后成，现代解读为经历波折后更加珍惜。",
  };
  const shaStars = stars.filter(s => ["擎羊","陀罗","火星","铃星","地空","地劫"].includes(s.name));
  return {
    interpretation: majors.map(m => map[m] || "").filter(Boolean).join(""),
    caution: shaStars.length >= 2 ? "夫妻宫煞星过重，婚姻需格外用心经营" : undefined,
    blessing: stars.some(s => ["左辅","右弼","文昌","文曲","天魁","天钺"].includes(s.name))
      ? "夫妻宫有吉星辅佐，婚姻可以得到贵人祝福" : undefined,
  };
}

/**
 * 子女宫分析
 */
function interpretChildrenPalace(stars: Star[], isEmpty: boolean): { interpretation: string; caution?: string } {
  const majors = stars.filter(s => s.type === "major").map(s => s.name);
  if (isEmpty) return { interpretation: "子女宫无主星，与子女缘分较薄，或以精神层面交流为主。" };
  const map: Record<string, string> = {
    紫微: "子女有领导才能、自尊心强，需以引导代替管教。",
    天机: "子女聪明伶俐，但也容易叛逆。",
    太阳: "子女活泼外向，庙旺子女有成。",
    武曲: "子女刚强独立，管教需刚柔并济。",
    天同: "子女温和孝顺，让父母省心。",
    廉贞: "子女个性复杂，教育需格外用心。",
    天府: "子女稳重可靠，能守家业。",
    太阴: "子女温柔细心，与母亲缘分较深。",
    贪狼: "子女多才多艺但好动，需因材施教。",
    巨门: "子女善辩，年少时较难管教。",
    天相: "子女乖巧和睦，父母较省心。",
    天梁: "子女早熟懂事，有荫护父母之心。",
    七杀: "子女个性刚烈，适合严格但用心的教育。",
    破军: "子女变动性大、有开创精神，不走寻常路。",
  };
  return {
    interpretation: majors.map(m => map[m] || "").filter(Boolean).join(""),
    caution: stars.some(s => s.name === "擎羊" || s.name === "陀罗")
      ? "子女宫见煞，需注意子女成长过程中的健康或教育问题" : undefined,
  };
}

/**
 * 财帛宫分析
 */
function interpretWealthPalace(stars: Star[], isEmpty: boolean): { interpretation: string; caution?: string; blessing?: string } {
  const majors = stars.filter(s => s.type === "major").map(s => s.name);
  if (isEmpty) return { interpretation: "财帛宫空宫，财运受环境影响较大，收入波动或不稳定。" };
  const map: Record<string, string> = {
    紫微: "财运亨通，有稳定的大财源，但需注意理财。",
    天机: "以智谋生财，适合脑力工作、咨询、策划类行业。",
    太阳: "财源光明正大，正财收入，不宜投机。",
    武曲: "正财运强，尤其适合金融、实业、管理类。庙旺大富。",
    天同: "财运平稳，不旺不衰，福气带来的财富。",
    廉贞: "财来财去，有较大的财务起伏，宜保守理财。",
    天府: "聚财能力极强，是理财高手。",
    太阴: "以积存致富，擅长理财和置产。庙旺为富格。",
    贪狼: "偏财运旺，有投机眼光，但不宜沉迷。",
    巨门: "以口才、专业、咨询求财，正偏财均有但易有纠纷。",
    天相: "以服务、协调求财，财务相对稳定。",
    天梁: "财路较正，清高不爱财，但也不缺财。",
    七杀: "以冒险求财，成败大起大落。",
    破军: "财富先破后成，适合创业型求财。",
  };
  return {
    interpretation: majors.map(m => map[m] || "").filter(Boolean).join(""),
    caution: stars.some(s => ["火星","铃星","地空","地劫"].includes(s.name))
      ? "财帛宫见火铃空劫，财务易有大起大落，需做好风险控制" : undefined,
    blessing: stars.some(s => s.name === "禄存" || s.siHua === "禄")
      ? "财帛宫见禄，财运亨通，聚财有方" : undefined,
  };
}

/**
 * 疾厄宫分析
 */
function interpretHealthPalace(stars: Star[], isEmpty: boolean): { interpretation: string; caution?: string } {
  const majors = stars.filter(s => s.type === "major").map(s => s.name);
  const shaStars = stars.filter(s => ["擎羊","陀罗","火星","铃星"].includes(s.name));

  if (isEmpty) return { interpretation: "疾厄宫空宫，无明显先天体质弱点，但需注意借星带来的健康暗示。" };

  const map: Record<string, string> = {
    紫微:  "体质较好，但老年要注意脾胃、心血管问题。",
    天机:  "易有神经衰弱、失眠、肝胆问题。思虑过多影响健康。",
    太阳:  "注意眼睛、心脏、血压问题。",
    武曲:  "注意肺、呼吸道、骨骼关节问题。",
    天同:  "体质偏弱但无大碍，注意肾脏、泌尿系统。",
    廉贞:  "易有血液、生殖系统问题，注意无名肿毒。",
    天府:  "体质较好，但需注意胃部问题。",
    太阴:  "注意妇科（女）/前列腺（男）、眼睛、肾水系统。",
    贪狼:  "注意肝、内分泌问题，需节制欲望。",
    巨门:  "消化系统、肠胃问题，多思多虑影响脾胃。",
    天相:  "体质较好，无明显先天弱点。",
    天梁:  "健康运较好，有自愈能力，老年需防慢性病。",
    七杀:  "注意意外伤害、血光之灾。",
    破军:  "注意突发性健康问题、骨伤。",
  };

  let caution: string | undefined;
  if (shaStars.length >= 1) {
    const shaNames = shaStars.map(s => s.name).join("、");
    caution = `疾厄宫见煞（${shaNames}）：${shaStars.some(s=>s.name==="擎羊")?"注意血光外伤；":""}${shaStars.some(s=>s.name==="陀罗")?"注意慢性病；":""}${shaStars.some(s=>s.name==="火星")?"注意急症炎症；":""}${shaStars.some(s=>s.name==="铃星")?"注意暗疾难愈。":""}`;
  }

  return {
    interpretation: majors.map(m => map[m] || "").filter(Boolean).join(""),
    caution,
  };
}

/**
 * 迁移宫分析
 */
function interpretMigrationPalace(stars: Star[], isEmpty: boolean): { interpretation: string; caution?: string; blessing?: string } {
  const majors = stars.filter(s => s.type === "major").map(s => s.name);
  if (isEmpty) return { interpretation: "迁移宫空宫，外出发展机遇一般，适合在家乡或熟悉的环境发展。" };
  const map: Record<string, string> = {
    紫微: "外出受尊重，适合到大城市或机构发展。",
    天机: "外出多变，适合频繁出差或变动性的工作。",
    太阳: "外出发展有贵人，海外或异地发展有利。",
    武曲: "适合外地创业发展，庙旺远行得利。",
    天同: "外出有福气，能遇贵人。",
    廉贞: "外出交际广泛，但需防在外惹是非。",
    天府: "外出稳定，适合在外守成发展。",
    太阴: "外出有女性贵人，庙旺宜在外置产。",
    贪狼: "外出际遇丰富，桃花交际多。",
    巨门: "外出易有口舌，注意言辞。",
    天相: "外出平顺，多得他人帮助。",
    天梁: "外出有长辈贵人，遇到困难能化解。",
    七杀: "外出多变动，但能在变动中获成功。",
    破军: "外出多变，频频换环境。",
  };
  return {
    interpretation: majors.map(m => map[m] || "").filter(Boolean).join(""),
    caution: stars.some(s => ["擎羊","陀罗","火星","铃星"].includes(s.name))
      ? "迁移宫见煞，外出需注意安全，尤其交通安全" : undefined,
    blessing: stars.some(s => s.name === "天马")
      ? "天马入迁移宫，宜外出发展，动中得利" : undefined,
  };
}

/**
 * 交友宫分析
 */
function interpretFriendPalace(stars: Star[], isEmpty: boolean): { interpretation: string; caution?: string } {
  const majors = stars.filter(s => s.type === "major").map(s => s.name);
  if (isEmpty) return { interpretation: "交友宫无主星，朋友对你人生影响不大，社交圈相对简单。" };
  const map: Record<string, string> = {
    紫微: "交友广阔，朋友中有权贵之人。",
    天机: "朋友以智相交，多谋士型的友人。",
    太阳: "朋友多正直之人，能得朋友之力。",
    武曲: "朋友多刚直之人，以义相交。",
    天同: "朋友和睦，人际关系融洽。",
    廉贞: "朋友关系复杂，有利益之交也有真诚之友。",
    天府: "朋友稳定，能得朋友经济上的帮助。",
    太阴: "朋友多温良，有女性朋友相助。",
    贪狼: "交友广杂，三教九流都有，需慎选朋友。",
    巨门: "朋友间易有是非，需注意口舌之灾。",
    天相: "朋友协助力强，人际关系持平。",
    天梁: "朋友有长者之风，能提供帮助和建议。",
    七杀: "朋友不多但情义深，讲义气。",
    破军: "朋友变动大，有始无终者多。",
  };
  return {
    interpretation: majors.map(m => map[m] || "").filter(Boolean).join(""),
    caution: stars.some(s => ["擎羊","陀罗","火星","铃星"].includes(s.name))
      ? "交友宫见煞，慎选朋友，易因朋友招灾" : undefined,
  };
}

/**
 * 官禄宫分析
 */
function interpretCareerPalace(stars: Star[], isEmpty: boolean): { interpretation: string; caution?: string; blessing?: string } {
  const majors = stars.filter(s => s.type === "major").map(s => s.name);
  if (isEmpty) return { interpretation: "官禄宫空宫，事业方向较灵活但缺乏聚焦，适合多元发展或在他人事业中出力。" };
  const map: Record<string, string> = {
    紫微: "适合管理层、政界、高层决策职位。",
    天机: "适合策划、咨询、教育、IT、媒体等脑力行业。",
    太阳: "适合公职、教育、公益、传播等公众事业。",
    武曲: "适合金融、实业、管理、军警。庙旺事业大成。",
    天同: "事业福气，适合不太激烈的行业，如文化、艺术。",
    廉贞: "适合法律、政治、艺术。事业心强但多波折。",
    天府: "适合财务、管理、仓储、后勤。稳中有升。",
    太阴: "适合地产、财务、艺术、女性相关行业。",
    贪狼: "适合娱乐、艺术、外交、公关。事业多彩。",
    巨门: "适合法律、咨询、教育、传媒。口才生财。",
    天相: "适合行政管理、协调、服务类工作。",
    天梁: "适合教育、医疗、慈善、研究。清贵之格。",
    七杀: "适合军警、创业、管理。有魄力和执行力。",
    破军: "适合创业、开拓型工作。一生事业多变。",
  };
  return {
    interpretation: majors.map(m => map[m] || "").filter(Boolean).join(""),
    caution: stars.some(s => ["擎羊","陀罗","火星","铃星"].includes(s.name))
      ? "官禄宫见煞，事业多波折，需有忍耐力" : undefined,
    blessing: stars.some(s => ["左辅","右弼","文昌","文曲","天魁","天钺"].includes(s.name))
      ? "官禄宫得吉星辅佐，事业发展顺遂，有贵人提携" : undefined,
  };
}

/**
 * 田宅宫分析
 */
function interpretHomePalace(stars: Star[], isEmpty: boolean): { interpretation: string; caution?: string } {
  const majors = stars.filter(s => s.type === "major").map(s => s.name);
  if (isEmpty) return { interpretation: "田宅宫无主星，置产运一般，需靠后天努力积累。" };
  const map: Record<string, string> = {
    紫微: "能继承祖业或自创产业，住宅宽敞。",
    天机: "房产多变动，适合投资快进快出。",
    太阳: "住宅阳光充足，置产运佳。",
    武曲: "能通过努力置产，房产财运好。",
    天同: "住宅舒适，晚年有福可享。",
    廉贞: "家宅易有纠纷，注意邻里关系。",
    天府: "置产能力强，是房地产的好格局。",
    太阴: "极有利于置产，尤其女性掌管家宅财运。",
    贪狼: "住宅品味高，但也易因购置房产而有财务压力。",
    巨门: "家宅多口舌，注意沟通。",
    天相: "家宅和睦稳定。",
    天梁: "家宅有荫护，祖上余荫多。",
    七杀: "家宅变动较多，换房频繁。",
    破军: "家宅破而后立，先租后买或先小后大。",
  };
  return {
    interpretation: majors.map(m => map[m] || "").filter(Boolean).join(""),
    caution: stars.some(s => ["地空","地劫"].includes(s.name))
      ? "田宅宫见空劫，置产需格外谨慎，易有产权问题" : undefined,
  };
}

/**
 * 福德宫分析
 */
function interpretFortunePalace(stars: Star[], isEmpty: boolean): { interpretation: string; caution?: string } {
  const majors = stars.filter(s => s.type === "major").map(s => s.name);
  if (isEmpty) return { interpretation: "福德宫空宫，精神世界受外在影响较大，需自我培养内在力量。" };
  const map: Record<string, string> = {
    紫微: "精神境界高，晚年福泽深厚。",
    天机: "心思活络易烦恼，宜修行静心。",
    太阳: "心地光明，精神高尚。",
    武曲: "精神刚强，但性格孤高。",
    天同: "心胸宽广，知足常乐，晚年福厚。",
    廉贞: "精神世界复杂，追求完美易焦虑。",
    天府: "晚年安乐，精神满足。",
    太阴: "精神细腻敏感，有艺术感受力。",
    贪狼: "精神享受欲望高，注意过度放纵。",
    巨门: "思想负担重，常感郁闷。",
    天相: "心地善良，精神平和。",
    天梁: "清高思想，有佛道缘分。",
    七杀: "精神紧张，好胜心强。",
    破军: "思想不停变革，不满足于现状。",
  };
  return {
    interpretation: majors.map(m => map[m] || "").filter(Boolean).join(""),
    caution: stars.some(s => s.name === "地空" || s.name === "地劫")
      ? "福德宫见空劫，精神易有空虚感，注意心理健康" : undefined,
  };
}

/**
 * 父母宫分析
 */
function interpretParentPalace(stars: Star[], isEmpty: boolean): { interpretation: string; caution?: string } {
  const majors = stars.filter(s => s.type === "major").map(s => s.name);
  if (isEmpty) return { interpretation: "父母宫无主星，与父母缘分较淡或交流较少，靠自我成长。" };
  const map: Record<string, string> = {
    紫微: "父母中有权威者，家教较严。",
    天机: "父母聪明开明，关系较平等。",
    太阳: "父母正直慷慨，父缘较深。庙旺父母有成。",
    武曲: "父母性格刚强，管教严格。",
    天同: "父母温和慈祥，家庭氛围融洽。",
    廉贞: "与父母关系较复杂，可能有代沟。",
    天府: "父母稳重可靠，经济条件较好。",
    太阴: "父母温柔，母缘较深。",
    贪狼: "父母交际广泛，但可能疏于管教。",
    巨门: "父母爱唠叨，家庭中口舌较多。",
    天相: "父母和睦，家庭氛围好。",
    天梁: "父母正直有德，家教良好。",
    七杀: "父母性格刚烈，家庭管教严格。",
    破军: "父母关系或家庭环境有过变动。",
  };
  return {
    interpretation: majors.map(m => map[m] || "").filter(Boolean).join(""),
    caution: stars.some(s => ["擎羊","陀罗"].includes(s.name))
      ? "父母宫见煞，注意与父母的沟通方式" : undefined,
  };
}

/**
 * 十二宫综合分析（陆斌兆三步断盘法第二步）
 *
 * 第二步：查宫位
 *   1. 逐宫检视星曜组合
 *   2. 重点关注"星宫是否得位"
 *   3. 注意煞星夹宫、冲宫
 *   4. 看各宫四化流转
 */
export function analyzeAllPalaces(chart: ZiweiChart): PalaceAnalysis[] {
  const results: PalaceAnalysis[] = [];

  for (const p of chart.palaces) {
    const majorStars = p.stars.filter((s) => s.type === "major").map((s) => s.name);
    const minorStars = p.stars
      .filter((s) => s.type === "minor")
      .map((s) => s.name);
    const shaStars = p.stars
      .filter((s) => ["擎羊","陀罗","火星","铃星","地空","地劫"].includes(s.name))
      .map((s) => s.name);
    const luckyStars = p.stars
      .filter((s) => ["左辅","右弼","文昌","文曲","天魁","天钺","禄存","天马"].includes(s.name))
      .map((s) => s.name);
    const siHua = p.stars
      .filter((s) => s.siHua)
      .map((s) => ({ star: s.name, type: s.siHua as SiHua }));

    const isEmpty = majorStars.length === 0;

    const brightness: "bright" | "normal" | "dim" =
      p.stars.some((s) => s.type === "major" && s.brightness === "bright")
        ? "bright"
        : p.stars.some((s) => s.type === "major" && s.brightness === "dim")
        ? "dim"
        : "normal";

    // 调用对应宫分析器
    let interp: { interpretation: string; caution?: string; blessing?: string } = {
      interpretation: "",
    };

    switch (p.name) {
      case "命宫":
        interp = interpretMingPalace(p.stars, isEmpty, brightness);
        break;
      case "兄弟宫":
        interp = interpretBrotherPalace(p.stars, isEmpty);
        break;
      case "夫妻宫":
        interp = interpretMarriagePalace(p.stars, isEmpty);
        break;
      case "子女宫":
        interp = interpretChildrenPalace(p.stars, isEmpty);
        break;
      case "财帛宫":
        interp = interpretWealthPalace(p.stars, isEmpty);
        break;
      case "疾厄宫":
        interp = interpretHealthPalace(p.stars, isEmpty);
        break;
      case "迁移宫":
        interp = interpretMigrationPalace(p.stars, isEmpty);
        break;
      case "交友宫":
        interp = interpretFriendPalace(p.stars, isEmpty);
        break;
      case "官禄宫":
        interp = interpretCareerPalace(p.stars, isEmpty);
        break;
      case "田宅宫":
        interp = interpretHomePalace(p.stars, isEmpty);
        break;
      case "福德宫":
        interp = interpretFortunePalace(p.stars, isEmpty);
        break;
      case "父母宫":
        interp = interpretParentPalace(p.stars, isEmpty);
        break;
      default:
        interp = { interpretation: "" };
    }

    // 宫名标准化：iztro 名 → 传统名
    const tradName = IZTRO_TO_TRADITIONAL[p.name] || p.name;
    results.push({
      name: tradName,
      branch: BRANCHES[p.branch],
      stem: STEMS[p.stem],
      majorStars,
      minorStars,
      shaStars,
      luckyStars,
      siHua,
      isEmpty,
      brightness,
      ...interp,
    });
  }

  return results;
}

// ══════════════════════════════════════════════════════
// 第三部分：星曜互涉分析（陆斌兆《讲义》3.2节）
// ══════════════════════════════════════════════════════

/**
 * 双星组合分析结果
 */
export interface StarCombination {
  stars: string[];
  palace: string;
  interpretation: string;
  nature: "good" | "mixed" | "bad";
}

/**
 * 星曜互涉组合含义（陆斌兆体系）
 */
const COMBINATION_MAP: Record<string, { text: string; nature: "good" | "mixed" | "bad" }> = {
  "紫微天府":   { text: "紫府同宫，帝王气象，但天府忌空劫。主贵气但需看禄存是否同宫。", nature: "good" },
  "紫微天相":   { text: "辅佐得力，科甲有望。忌刑忌夹印（被刑星忌星相夹则破格）。", nature: "good" },
  "紫微七杀":   { text: "紫微制七杀之威，将星得帝座调御。主权威，但内心压力大。", nature: "mixed" },
  "紫微破军":   { text: "帝威扫地，先败后成。大器晚成格，需经历极大变动后方见成功。", nature: "mixed" },
  "紫微贪狼":   { text: "桃花泛水，可向艺术界发展。帝星遇桃花星，一生风流。", nature: "mixed" },
  "天机太阴":   { text: "机谋巧算，细腻善变。加煞则流于奸狡，加吉则为智谋之士。", nature: "mixed" },
  "天机巨门":   { text: "口舌为用，言论界成家。善辩但易招惹是非。", nature: "mixed" },
  "天机天梁":   { text: "善谈兵，学术有成。加煞则空谈误事。", nature: "mixed" },
  "太阳太阴":   { text: "日月同宫，光明磊落。特定宫位看亮度配合，丑未宫最佳。", nature: "good" },
  "太阳巨门":   { text: "阳巨口舌光明，正大光明人。口才佳且心地光明。", nature: "good" },
  "太阳天梁":   { text: "阳梁昌禄之基础组合。考试运佳，学术有成。", nature: "good" },
  "武曲天府":   { text: "财库充盈，守成为上。武曲之财+天府之库，富格。", nature: "good" },
  "武曲贪狼":   { text: "武贪少年暴发，中年守成。偏财大旺但需防贪婪失财。", nature: "mixed" },
  "武曲七杀":   { text: "武杀勇猛直前，血光不可免。武职最佳，从文则多灾。", nature: "mixed" },
  "武曲破军":   { text: "变动求财，先败后成。适合创业开疆。", nature: "mixed" },
  "武曲天相":   { text: "财印交驰，富局。但被夹则破格（被忌星两夹）。", nature: "good" },
  "天同太阴":   { text: "同阴在午宫，富贵必双全。福德之格。", nature: "good" },
  "天同巨门":   { text: "同巨在丑未，福寿可绵长。但有口福也有口舌。", nature: "mixed" },
  "天同天梁":   { text: "福荫相随，晚年大吉。幼年可能体弱。", nature: "good" },
  "廉贞七杀":   { text: "廉杀在未宫，积富之人。但过程艰辛，先苦后甘。", nature: "mixed" },
  "廉贞破军":   { text: "廉破在卯酉，一生多变迁。不宜安定工作。", nature: "mixed" },
  "廉贞天府":   { text: "廉府在辰戌，掌权又富贵。才华得库，名实相副。", nature: "good" },
  "廉贞贪狼":   { text: "廉贪好色不利，宜向艺术界发展。情欲与才华并存。", nature: "bad" },
  "廉贞天相":   { text: "廉相在子午，有辅佐之力。但防刑囚夹印。", nature: "mixed" },
  "廉贞天刑":   { text: "刑囚夹印的构成之一。见官非之兆，需安分守己。", nature: "bad" },
};

/**
 * 检测命盘中所有双星组合
 */
export function detectCombinations(chart: ZiweiChart): StarCombination[] {
  const results: StarCombination[] = [];

  for (const p of chart.palaces) {
    const majors = p.stars
      .filter((s) => s.type === "major")
      .map((s) => s.name);

    if (majors.length >= 2) {
      // 生成所有可能的双星组合
      for (let i = 0; i < majors.length - 1; i++) {
        for (let j = i + 1; j < majors.length; j++) {
          const key1 = `${majors[i]}${majors[j]}`;
          const key2 = `${majors[j]}${majors[i]}`;
          const match = COMBINATION_MAP[key1] || COMBINATION_MAP[key2];
          if (match) {
            // 宫名标准化：iztro 名 → 传统名
    const tradName = IZTRO_TO_TRADITIONAL[p.name] || p.name;
    results.push({
              stars: [majors[i], majors[j]],
              palace: p.name,
              interpretation: match.text,
              nature: match.nature,
            });
          }
        }
      }
    }
  }

  return results;
}

// ══════════════════════════════════════════════════════
// 第四部分：四化入十二宫（陆斌兆《讲义》5.7节）
// ══════════════════════════════════════════════════════

/**
 * 化禄入宫断语
 */
const LU_IN_PALACE: Record<string, string> = {
  命宫: "化禄入命宫，一生福禄、顺遂，为人慷慨大方，不愁吃穿。",
  兄弟宫: "兄弟姐妹对你有所帮助，或在经济上支持你。",
  夫妻宫: "配偶带来财运，婚姻幸福，因配偶而生活改善。",
  子女宫: "子女有福气，养育不费心，或可因子女发达。",
  财帛宫: "财运亨通，赚钱轻松顺利，一生不缺钱花。",
  疾厄宫: "病痛较少，即使生病也容易痊愈。",
  迁移宫: "外出发展得利，能在外地发财。",
  交友宫: "因朋友得利，朋友多财力雄厚。",
  官禄宫: "事业顺遂有财，职位带来经济利益。",
  田宅宫: "置产顺利，家宅兴旺，房产升值。",
  福德宫: "精神生活丰富，晚年享福。",
  父母宫: "父母经济条件好，得父母荫庇。",
};

/**
 * 化权入宫断语
 */
const QUAN_IN_PALACE: Record<string, string> = {
  命宫: "化权入命宫，有领导欲和掌控力，自主性强，不甘人下。",
  兄弟宫: "兄弟姐妹中有权威人士或你在兄弟中做主。",
  夫妻宫: "配偶有能力、能担事，或在婚姻中占主导地位。",
  子女宫: "子女个性强、有主见，管教需方式。",
  财帛宫: "有掌控钱财的能力，能守财也能生财。",
  疾厄宫: "身体底子好，自愈力强，但也容易硬扛。",
  迁移宫: "外出能掌权，有领导他人之命。",
  交友宫: "朋友中有掌权者，或你常做朋友的主。",
  官禄宫: "事业握权，有管理地位，但易有工作压力。",
  田宅宫: "在家中做主，家宅事务由你决定。",
  福德宫: "主观意识强，精神独立，不依赖他人。",
  父母宫: "父母严肃有权威，家教较严。",
};

/**
 * 化科入宫断语
 */
const KE_IN_PALACE: Record<string, string> = {
  命宫: "化科入命宫，聪明好学，有名望声誉，一生贵人相助。",
  兄弟宫: "兄弟姐妹学历较高或有社会声誉。",
  夫妻宫: "配偶气质好、有教养，婚姻美满。",
  子女宫: "子女聪明好学，有出息。",
  财帛宫: "以才艺或学识获取财富，财路正派。",
  疾厄宫: "病情较轻或能遇良医。",
  迁移宫: "外出有贵人赏识，人缘好。",
  交友宫: "与良师益友往来，能提升自身修养。",
  官禄宫: "事业有成且有社会声誉，适合文职。",
  田宅宫: "家世清白，家庭有书香气息。",
  福德宫: "精神境界高，注重生活品质和修养。",
  父母宫: "父母有学问修养，文化氛围好。",
};

/**
 * 化忌入宫断语
 */
const JI_IN_PALACE: Record<string, string> = {
  命宫: "化忌入命宫，人生多波折挑战，此乃磨砺之命。需自强不息。",
  兄弟宫: "兄弟姐妹缘分薄，可能在财务或情感上有所亏欠。",
  夫妻宫: "婚姻多障碍，感情之路不平顺，需用心经营。",
  子女宫: "子女需多费心，养育较辛苦。",
  财帛宫: "钱财多破耗，不易积存，宜保守理财。",
  疾厄宫: "体质较弱，注意对应星曜五行所属的疾病系统。",
  迁移宫: "外出多不顺，不宜远行发展。",
  交友宫: "易因朋友受牵连或吃亏，交友宜谨慎。",
  官禄宫: "事业多坎坷，付出多回报少。",
  田宅宫: "家宅不宁或置产不顺。",
  福德宫: "精神压力大，自寻烦恼，需修行放宽心。",
  父母宫: "父母健康需关注，或与父母缘分较薄。",
};

/**
 * 四化入十二宫综合解析
 */
export function analyzeSiHuaInPalaces(chart: ZiweiChart): {
  lu: { palace: string; star: string; interpretation: string }[];
  quan: { palace: string; star: string; interpretation: string }[];
  ke: { palace: string; star: string; interpretation: string }[];
  ji: { palace: string; star: string; interpretation: string }[];
} {
  const result = { lu: [] as any[], quan: [] as any[], ke: [] as any[], ji: [] as any[] };

  for (const p of chart.palaces) {
    for (const s of p.stars) {
      if (s.siHua === "禄") {
        result.lu.push({
          palace: p.name,
          star: s.name,
          interpretation: LU_IN_PALACE[p.name] || "化禄入" + p.name + "，该宫位有财禄增益之意。",
        });
      }
      if (s.siHua === "权") {
        result.quan.push({
          palace: p.name,
          star: s.name,
          interpretation: QUAN_IN_PALACE[p.name] || "化权入" + p.name + "，该宫位有掌控力增强之意。",
        });
      }
      if (s.siHua === "科") {
        result.ke.push({
          palace: p.name,
          star: s.name,
          interpretation: KE_IN_PALACE[p.name] || "化科入" + p.name + "，该宫位有名誉提升之意。",
        });
      }
      if (s.siHua === "忌") {
        result.ji.push({
          palace: p.name,
          star: s.name,
          interpretation: JI_IN_PALACE[p.name] || "化忌入" + p.name + "，该宫位有障碍亏欠之意。",
        });
      }
    }
  }

  return result;
}

// ══════════════════════════════════════════════════════
// 第五部分：陆斌兆综合命盘分析（三步断盘法完整版）
// ══════════════════════════════════════════════════════

/**
 * 陆斌兆综合命盘分析
 *
 * 第一步：观全局（命盘等级+三方四正+四化）
 * 第二步：查宫位（十二宫逐宫分析）
 * 第三步：断吉凶（星曜互涉+双星组合+四化入宫）
 */
export function luComprehensiveAnalysis(chart: ZiweiChart): {
  overall: OverallChartAnalysis;
  palaces: PalaceAnalysis[];
  combinations: StarCombination[];
  siHuaInPalaces: ReturnType<typeof analyzeSiHuaInPalaces>;
} {
  return {
    overall: analyzeOverallChart(chart),
    palaces: analyzeAllPalaces(chart),
    combinations: detectCombinations(chart),
    siHuaInPalaces: analyzeSiHuaInPalaces(chart),
  };
}

export default {
  analyzeOverallChart,
  analyzeAllPalaces,
  detectCombinations,
  analyzeSiHuaInPalaces,
  luComprehensiveAnalysis,
};
