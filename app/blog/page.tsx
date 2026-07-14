'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import { BLOG_ARTICLES, BLOG_CATEGORIES } from '@/lib/knowledge/blog';

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }} viewport={{ once: true }}>
      {children}
    </motion.div>
  );
}

export default function BlogPage() {
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
          科普文章
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
              科普文章 · ARTICLES
            </span>
            <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${c.gold})` }} />
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: c.text, marginBottom: '12px' }}>
            紫微斗数科普文章
          </h1>
          <p style={{ fontSize: '14px', color: c.text2, maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
            深入浅出，用通俗的语言读懂紫微智慧
          </p>
        </FadeIn>
      </div>

      {/* 分类标签 */}
      <div className="max-w-4xl mx-auto px-6 mb-8">
        <div className="flex gap-2 flex-wrap justify-center">
          {BLOG_CATEGORIES.map((cat, i) => (
            <span key={cat} style={{
              fontSize: '11px',
              padding: '4px 14px',
              borderRadius: '999px',
              background: 'rgba(212,168,67,0.08)',
              border: '1px solid rgba(212,168,67,0.2)',
              color: c.gold,
            }}>
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* 文章卡片 */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BLOG_ARTICLES.map((article, i) => (
            <FadeIn key={article.slug} delay={i * 0.06}>
              <Link href={`/blog/${article.slug}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="rounded-xl overflow-hidden h-full flex flex-col"
                  style={{
                    background: c.card,
                    border: `1px solid ${c.border}`,
                    boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.05)',
                  }}
                >
                  {/* Cover */}
                  <div style={{
                    padding: '28px 24px 20px',
                    background: `linear-gradient(135deg, ${isDark ? 'rgba(212,168,67,0.06)' : 'rgba(212,168,67,0.03)'}, transparent)`,
                    borderBottom: `1px solid ${c.border}`,
                  }}>
                    <div style={{ fontSize: '36px', marginBottom: '8px' }}>{article.coverEmoji}</div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: c.text, lineHeight: 1.4, marginBottom: '6px' }}>
                      {article.title}
                    </div>
                    <div style={{ fontSize: '11px', color: c.gold, letterSpacing: '0.03em' }}>
                      {article.category} · {article.date} · {article.readMinutes}分钟阅读
                    </div>
                  </div>
                  {/* Body */}
                  <div style={{ padding: '16px 24px 20px', flex: 1 }}>
                    <p style={{ fontSize: '12px', color: c.text2, lineHeight: 1.7 }}>
                      {article.summary}
                    </p>
                    <div style={{ marginTop: '12px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {article.tags.map(tag => (
                        <span key={tag} style={{
                          fontSize: '10px',
                          color: c.text2,
                          opacity: 0.7,
                          padding: '1px 8px',
                          borderRadius: '999px',
                          border: `1px solid ${c.border}`,
                        }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
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
