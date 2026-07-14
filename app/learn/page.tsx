'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';

// ─── 科普模块 ──────────────────────────
const MODULES = [
  {
    id: 'basics',
    icon: '📖',
    title: '基础知识',
    subtitle: '从零开始，系统学习紫微斗数',
    desc: '什么是紫微斗数、如何看待命盘、14主星入门、12宫位解析、四化详解、大限流年',
    href: '/learn/basics',
    color: '#d4a843',
  },
  {
    id: 'faq',
    icon: '❓',
    title: '常见问题',
    subtitle: '你心中的疑问，这里都有答案',
    desc: '紫微斗数是迷信吗？和八字有什么区别？出生时辰记不准怎么办？空宫好不好？化忌一定是坏事吗？',
    href: '/learn/faq',
    color: '#60a5fa',
  },
  {
    id: 'blog',
    icon: '📝',
    title: '科普文章',
    subtitle: '深入浅出，读懂紫微智慧',
    desc: '14主星人格指南、12宫位人生地图、四化深度解析、大限解读、五行局入门',
    href: '/blog',
    color: '#4ade80',
  },
  {
    id: 'knowledge',
    icon: '📚',
    title: '知识库',
    subtitle: '14主星 × 13宫位完整论断',
    desc: '基于倪海夏《天纪》体系与古籍编纂的182个独立解读页面',
    href: '/knowledge',
    color: '#c084fc',
  },
  {
    id: 'library',
    icon: '📜',
    title: '古籍原典',
    subtitle: '紫微斗数全集/全书/骨髓赋',
    desc: '倪海夏体系引证来源，全文检索查阅',
    href: '/library',
    color: '#fb923c',
  },
  {
    id: 'chart',
    icon: '🔮',
    title: '起盘解读',
    subtitle: '输入生辰，生成你的专属命盘',
    desc: '用倪海夏正宗安星法排盘，AI深度解读你的命格',
    href: '/chart',
    color: '#f87171',
  },
];

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  );
}

export default function LearnPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const c = {
    bg: isDark ? '#020810' : '#fbf6e8',
    card: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
    border: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
    text: isDark ? '#e8eef6' : '#1a1a18',
    text2: isDark ? '#9db0d0' : '#4a4a45',
    gold: '#d4a843',
  };

  return (
    <div style={{ background: c.bg, minHeight: '100vh' }}>
      {/* 顶栏 */}
      <div className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${c.border}` }}>
        <Link href="/" style={{ fontSize: '12px', color: c.gold, letterSpacing: '0.3em', textDecoration: 'none' }}>
          ← 首页
        </Link>
        <div style={{ fontSize: '12px', color: c.text2, letterSpacing: '0.2em' }}>
          紫微斗数科普中心
        </div>
        <div style={{ width: '60px' }} />
      </div>

      {/* Hero */}
      <div className="text-center px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${c.gold})` }} />
            <span className="text-[10px] tracking-[0.4em]" style={{ color: c.gold }}>
              紫微科普 · LEARNING
            </span>
            <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${c.gold})` }} />
          </div>
          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 700,
            color: c.text,
            letterSpacing: '0.05em',
            marginBottom: '16px',
          }}>
            紫微斗数科普中心
          </h1>
          <p style={{
            fontSize: '14px',
            color: c.text2,
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.8,
          }}>
            一门古老而精密的人生导航系统，帮你更好地认识自己、理解人生。<br />
            从零基础到能看懂命盘，这里有一切你需要的知识。
          </p>
        </motion.div>

        {/* CTA 快速入口 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8 flex gap-3 justify-center flex-wrap"
        >
          <Link href="/chart" style={{
            padding: '10px 28px',
            borderRadius: '999px',
            background: c.gold,
            color: '#fff',
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textDecoration: 'none',
          }}>
            ✦ 免费起盘解读
          </Link>

        </motion.div>
      </div>

      {/* 模块网格 */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((mod, i) => (
            <FadeIn key={mod.id} delay={i * 0.08}>
              <Link href={mod.href} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="rounded-xl p-6 h-full flex flex-col"
                  style={{
                    background: c.card,
                    border: `1px solid ${mod.color}30`,
                    boxShadow: isDark
                      ? '0 2px 12px rgba(0,0,0,0.3)'
                      : '0 2px 12px rgba(0,0,0,0.05)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span style={{ fontSize: '28px' }}>{mod.icon}</span>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: c.text }}>
                        {mod.title}
                      </div>
                      <div style={{ fontSize: '11px', color: c.text2, marginTop: '2px' }}>
                        {mod.subtitle}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1" />
                  <p style={{ fontSize: '12px', lineHeight: 1.7, color: c.text2 }}>
                    {mod.desc}
                  </p>
                </motion.div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
