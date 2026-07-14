'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BLOG_ARTICLES } from '@/lib/knowledge/blog';

// ─── 工具组件 ──────────────────────────
function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true, margin: '-40px' }}
    >
      {children}
    </motion.div>
  );
}

// ─── 颜色 ──────────────────────────────
const C = {
  bg: '#FAFAF8',
  card: '#FFFFFF',
  border: '#E8E5DE',
  text: '#1A1A18',
  text2: '#6B6B64',
  text3: '#9C9C94',
  accent: '#B8922A',
  accentLight: '#F5F0E0',
  accentBorder: '#E8DFC0',
};

// ─── 导航 ──────────────────────────────
const NAV = [
  { label: '科普文章', href: '/blog' },
  { label: '基础知识', href: '/learn' },
  { label: '免费起盘', href: '/chart' },
  { label: 'VIP 分析', href: '#vip', highlight: true },
];

export default function HomePage() {
  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: '-apple-system, "PingFang SC", "Helvetica Neue", sans-serif' }}>

      {/* ══ 顶栏 ════════════════════════════════════ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: C.bg,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{
          maxWidth: '960px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px',
        }}>
          <Link href="/" style={{
            fontSize: '15px', fontWeight: 700, color: C.text,
            textDecoration: 'none', letterSpacing: '0.05em',
          }}>
            紫微命盘
          </Link>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {NAV.map(item => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  fontSize: '13px',
                  padding: item.highlight ? '6px 16px' : '6px 12px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: item.highlight ? '#fff' : C.text2,
                  background: item.highlight ? C.accent : 'transparent',
                  fontWeight: item.highlight ? 500 : 400,
                  transition: 'background 0.15s',
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* ══ Hero ════════════════════════════════════ */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '60px 20px 48px' }}>
        <FadeIn>
          <div style={{ marginBottom: '12px' }}>
            <span style={{
              fontSize: '11px', color: C.accent, letterSpacing: '0.3em',
              background: C.accentLight, padding: '3px 12px', borderRadius: '999px',
            }}>
              紫微斗数 · 倪海夏体系
            </span>
          </div>
          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 700, color: C.text,
            lineHeight: 1.15, marginBottom: '12px',
            letterSpacing: '-0.02em',
          }}>
            了解自己的命运<br />
            从认识命盘开始
          </h1>
          <p style={{
            fontSize: '15px', color: C.text2,
            lineHeight: 1.7, maxWidth: '560px', marginBottom: '28px',
          }}>
            基于倪海夏正宗紫微斗数体系的科普学习平台。<br />
            马上排盘解读 · AI 命理问答 · VIP 深度陪聊分析
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link href="/chart" style={{
              padding: '10px 28px', borderRadius: '10px',
              background: C.accent, color: '#fff',
              fontSize: '14px', fontWeight: 500,
              textDecoration: 'none', letterSpacing: '0.03em',
            }}>
              ✦ 马上排盘解读
            </Link>
            <Link href="/learn" style={{
              padding: '10px 28px', borderRadius: '10px',
              border: `1px solid ${C.border}`,
              color: C.text2, fontSize: '14px', fontWeight: 400,
              textDecoration: 'none',
            }}>
              📖 科普知识
            </Link>
          </div>
        </FadeIn>
      </div>

      {/* ══ 服务入口 ═══════════════════════════════ */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 20px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          
          {/* 科普知识卡片 */}
          <FadeIn>
            <div style={{
              background: C.card, borderRadius: '12px',
              border: `1px solid ${C.border}`,
              padding: '28px', height: '100%',
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📖</div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: C.text, marginBottom: '8px' }}>
                紫微斗数科普
              </h3>
              <p style={{ fontSize: '13px', color: C.text2, lineHeight: 1.7, marginBottom: '16px' }}>
                从零开始学习紫微斗数：14主星性格解读、12宫位人生地图、四化<br />
                禄权科忌、大限流年运势分析——所有知识免费开放。
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Link href="/learn" style={chipStyle}>基础知识</Link>
                <Link href="/blog" style={chipStyle}>科普文章</Link>
                <Link href="/learn/faq" style={chipStyle}>常见问题</Link>
              </div>
            </div>
          </FadeIn>

          {/* VIP陪聊卡片（突出） */}
          <FadeIn delay={0.1}>
            <div style={{
              background: `linear-gradient(135deg, ${C.accentLight} 0%, #FFF 60%)`,
              borderRadius: '12px',
              border: `1px solid ${C.accentBorder}`,
              padding: '28px', height: '100%',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: '-20px', right: '-20px',
                width: '120px', height: '120px', borderRadius: '50%',
                background: `radial-gradient(circle, ${C.accent}15, transparent)`,
              }} />
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>💬</div>
              <h3 style={{
                fontSize: '18px', fontWeight: 600,
                color: C.text, marginBottom: '8px',
              }}>
                VIP 命理陪聊分析
              </h3>
              <p style={{ fontSize: '13px', color: C.text2, lineHeight: 1.7, marginBottom: '16px' }}>
                针对你的命盘进行深度解读，AI 命理师一对一陪聊：
                事业方向、感情婚姻、财富运势、当前大限、流年运势。
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Link href="#vip" style={{
                  ...chipStyle, background: C.accent, color: '#fff', borderColor: C.accent,
                }}>
                  💬 开始咨询
                </Link>
                <Link href="/chart" style={chipStyle}>先起盘</Link>
              </div>
            </div>
          </FadeIn>

        </div>
      </div>

      {/* ══ 最新文章 ════════════════════════════════ */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 20px 48px' }} id="vip">
        <FadeIn>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: C.text }}>
              最新科普文章
            </h2>
            <Link href="/blog" style={{
              fontSize: '13px', color: C.accent, textDecoration: 'none',
            }}>
              查看全部 →
            </Link>
          </div>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {BLOG_ARTICLES.slice(0, 3).map((article, i) => (
            <FadeIn key={article.slug} delay={i * 0.06}>
              <Link href={`/blog/${article.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: C.card, borderRadius: '10px',
                  border: `1px solid ${C.border}`,
                  padding: '20px', height: '100%',
                  transition: 'box-shadow 0.15s',
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{article.coverEmoji}</div>
                  <div style={{
                    fontSize: '14px', fontWeight: 600, color: C.text,
                    marginBottom: '6px', lineHeight: 1.4,
                  }}>
                    {article.title}
                  </div>
                  <div style={{
                    fontSize: '12px', color: C.text3,
                    marginBottom: '8px',
                  }}>
                    {article.category} · {article.readMinutes}分钟阅读
                  </div>
                  <p style={{
                    fontSize: '12px', color: C.text2, lineHeight: 1.6,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {article.summary}
                  </p>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* ══ VIP 人工付费分析 ═══════════════════════ */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 20px 48px' }} id="vip">
        <FadeIn>
          <div style={{
            background: `linear-gradient(135deg, ${C.accentLight} 0%, #FFF 60%)`,
            borderRadius: '14px',
            border: `1px solid ${C.accentBorder}`,
            padding: '36px 28px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>👨‍🏫</div>
            <h2 style={{
              fontSize: '20px', fontWeight: 700, color: C.text,
              marginBottom: '8px',
            }}>
              VIP 人工深度命理分析
            </h2>
            <p style={{
              fontSize: '13px', color: C.text2, lineHeight: 1.8,
              maxWidth: '480px', marginBottom: '4px',
            }}>
              十多年手动排盘分析经验，软件排盘有误差，AI 解读也有误，我还是坚持手动排盘准确率比较高。
            </p>
            <div style={{
              fontSize: '24px', fontWeight: 700, color: C.accent,
              marginBottom: '16px',
            }}>
              每次 <span style={{ fontSize: '32px' }}>388</span> 元
            </div>
            <div style={{
              background: '#fff', borderRadius: '12px',
              padding: '12px', marginBottom: '16px',
              border: `1px solid ${C.border}`,
            }}>
              <img src="/wechat-qr.jpg" alt="微信咨询"
                style={{ width: '180px', height: '180px', display: 'block' }} />
            </div>
            <div style={{
              fontSize: '14px', fontWeight: 600, color: C.accent,
              marginBottom: '4px',
            }}>
              请加微信咨询
            </div>

          </div>
        </FadeIn>
      </div>

      {/* ══ 快速入口 ════════════════════════════════ */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 20px 48px' }}>
        <FadeIn>
          <h2 style={{
            fontSize: '16px', fontWeight: 600, color: C.text,
            marginBottom: '16px',
          }}>
            快速入口
          </h2>
        </FadeIn>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
          {[
            { icon: '🔮', label: '免费起盘', href: '/chart' },
            { icon: '📖', label: '基础知识', href: '/learn/basics' },
            { icon: '📝', label: '科普文章', href: '/blog' },
            { icon: '❓', label: '常见问题', href: '/learn/faq' },
            { icon: '📚', label: '知识库', href: '/knowledge' },
            { icon: '📜', label: '古籍原典', href: '/library' },
            { icon: '💑', label: '合盘分析', href: '/heming' },
          ].map((item, i) => (
            <FadeIn key={item.href} delay={i * 0.04}>
              <Link href={item.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: C.card, borderRadius: '10px',
                  border: `1px solid ${C.border}`,
                  padding: '16px', textAlign: 'center',
                  transition: 'box-shadow 0.15s',
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>{item.icon}</div>
                  <div style={{ fontSize: '12px', color: C.text2 }}>{item.label}</div>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* ══ Footer ══════════════════════════════════ */}
      <footer style={{
        borderTop: `1px solid ${C.border}`,
        padding: '28px 20px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{
            fontSize: '12px', color: C.text3, lineHeight: 1.8,
            marginBottom: '8px',
          }}>
            紫微命盘 · 基于倪海夏《天纪》体系 · 仅供学习参考
          </div>
          <div style={{ fontSize: '11px', color: C.text3 }}>
            <Link href="/terms" style={{ color: C.text3, textDecoration: 'underline' }}>服务条款</Link>
            {' · '}
            <Link href="/privacy" style={{ color: C.text3, textDecoration: 'underline' }}>隐私政策</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

// ─── 共用样式 ──────────────────────────
const chipStyle: React.CSSProperties = {
  fontSize: '12px', padding: '4px 14px', borderRadius: '999px',
  border: `1px solid ${C.border}`, color: C.text2,
  textDecoration: 'none', display: 'inline-block',
  transition: 'background 0.1s',
};
