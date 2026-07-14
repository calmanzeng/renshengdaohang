'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';

const TOPICS = [
  { id: 'what-is-zwds', icon: '🔮', title: '什么是紫微斗数', subtitle: '起源、核心思想与实用价值', desc: '一门古老而精密的人生导航系统，帮你更好地认识自己' },
  { id: 'how-to-read', icon: '📜', title: '如何看懂紫微命盘', subtitle: '12宫位、14主星、空宫与三方四正', desc: '一张命盘 = 一个浓缩的人生舞台' },
  { id: 'sihua-basics', icon: '🔄', title: '什么是四化（禄权科忌）', subtitle: '命运的关键转折点标记', desc: '化禄是好事、化忌是警示，四化解读入门' },
  { id: 'time-basics', icon: '⏳', title: '大限与流年入门', subtitle: '命盘不是静止的照片，而是流动的电影', desc: '大限看10年框架，流年看每年运势' },
];

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }} viewport={{ once: true }}>
      {children}
    </motion.div>
  );
}

export default function BasicsPage() {
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
      <div className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${c.border}` }}>
        <Link href="/learn" style={{ fontSize: '12px', color: c.gold, letterSpacing: '0.3em', textDecoration: 'none' }}>
          ← 科普中心
        </Link>
        <div style={{ fontSize: '12px', color: c.text2, letterSpacing: '0.2em' }}>
          基础知识
        </div>
        <Link href="/learn/faq" style={{ fontSize: '12px', color: c.gold, letterSpacing: '0.2em', textDecoration: 'none' }}>
          常见问题 →
        </Link>
      </div>

      <div className="text-center px-6 py-14">
        <FadeIn>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${c.gold})` }} />
            <span className="text-[10px] tracking-[0.4em]" style={{ color: c.gold }}>
              基础知识 · BASICS
            </span>
            <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${c.gold})` }} />
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: c.text, letterSpacing: '0.05em', marginBottom: '12px' }}>
            紫微斗数基础知识
          </h1>
          <p style={{ fontSize: '14px', color: c.text2, maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
            从零开始，系统学习紫微斗数的核心概念
          </p>
        </FadeIn>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 gap-4">
          {TOPICS.map((t, i) => (
            <FadeIn key={t.id} delay={i * 0.1}>
              <Link href={`/learn/basics/${t.id}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="rounded-xl p-6"
                  style={{
                    background: c.card,
                    border: `1px solid ${c.border}`,
                    boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <div className="flex items-center gap-4">
                    <span style={{ fontSize: '36px' }}>{t.icon}</span>
                    <div className="flex-1">
                      <div style={{ fontSize: '18px', fontWeight: 600, color: c.text, marginBottom: '4px' }}>
                        {t.title}
                      </div>
                      <div style={{ fontSize: '12px', color: c.gold, marginBottom: '6px', letterSpacing: '0.05em' }}>
                        {t.subtitle}
                      </div>
                      <div style={{ fontSize: '12px', color: c.text2, lineHeight: 1.6 }}>
                        {t.desc}
                      </div>
                    </div>
                    <div style={{ color: c.text2, fontSize: '18px' }}>→</div>
                  </div>
                </motion.div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
