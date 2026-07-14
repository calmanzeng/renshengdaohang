'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import { FAQ_LIST, FAQ_CATEGORIES, type FaqItem } from '@/lib/knowledge/faq';

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }} viewport={{ once: true }}>
      {children}
    </motion.div>
  );
}

function FaqCard({ item, index }: { item: FaqItem; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      layout
      style={{
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: open ? 'var(--ac-bdr)' : 'var(--bdr)',
        background: 'var(--bg-card)',
        boxShadow: 'var(--sh-xs)',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          cursor: 'pointer',
          border: 'none',
          background: 'transparent',
          textAlign: 'left',
          fontFamily: 'inherit',
        }}
      >
        <div className="flex items-center gap-3">
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: open ? 'var(--ac)' : 'var(--tx-3)',
            flexShrink: 0,
          }} />
          <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--tx-0)', lineHeight: 1.5 }}>
            {item.question}
          </div>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ color: 'var(--tx-3)', fontSize: '14px', flexShrink: 0 }}
        >
          ▾
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '12px 20px 16px',
              fontSize: '13px',
              lineHeight: 1.8,
              color: 'var(--tx-1)',
              whiteSpace: 'pre-line',
              borderTop: '1px solid var(--bdr)',
              margin: '0 20px',
            }}>
              {item.answer}
            </div>
            <div style={{ padding: '0 20px 14px 20px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {item.tags.map(tag => (
                <span key={tag} style={{
                  fontSize: '10px',
                  padding: '2px 10px',
                  borderRadius: '999px',
                  background: 'var(--ac-bg)',
                  color: 'var(--ac)',
                  border: '1px solid var(--ac-bdr)',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FaqPage() {
  const { theme } = useTheme();
  const [category, setCategory] = useState<string | null>(null);

  const filtered = category
    ? FAQ_LIST.filter(faq => FAQ_CATEGORIES.find(c => c.name === category)?.ids.includes(faq.id))
    : FAQ_LIST;

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <div className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--bdr)' }}>
        <Link href="/learn" style={{ fontSize: '12px', color: 'var(--ac)', letterSpacing: '0.3em', textDecoration: 'none' }}>
          ← 科普中心
        </Link>
        <div style={{ fontSize: '12px', color: 'var(--tx-3)', letterSpacing: '0.2em' }}>
          常见问题
        </div>
        <Link href="/blog" style={{ fontSize: '12px', color: 'var(--ac)', letterSpacing: '0.2em', textDecoration: 'none' }}>
          科普文章 →
        </Link>
      </div>

      <div className="text-center px-6 py-14">
        <FadeIn>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12" style={{ background: 'linear-gradient(to right, transparent, var(--ac))' }} />
            <span className="text-[10px] tracking-[0.4em]" style={{ color: 'var(--ac)' }}>
              常见问题 · FAQ
            </span>
            <div className="h-px w-12" style={{ background: 'linear-gradient(to left, transparent, var(--ac))' }} />
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: 'var(--tx-0)', marginBottom: '12px' }}>
            紫微斗数常见问题
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--tx-2)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
            你心中关于紫微斗数的疑问，这里都有答案
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="flex gap-2 justify-center flex-wrap mt-8">
            <button
              onClick={() => setCategory(null)}
              style={{
                padding: '6px 18px',
                borderRadius: '999px',
                border: '1px solid',
                borderColor: category === null ? 'var(--ac)' : 'var(--bdr)',
                background: category === null ? 'var(--ac-bg)' : 'transparent',
                color: category === null ? 'var(--ac)' : 'var(--tx-3)',
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: 'inherit',
              }}
            >
              全部
            </button>
            {FAQ_CATEGORIES.map(cat => (
              <button
                key={cat.name}
                onClick={() => setCategory(cat.name)}
                style={{
                  padding: '6px 18px',
                  borderRadius: '999px',
                  border: '1px solid',
                  borderColor: category === cat.name ? 'var(--ac)' : 'var(--bdr)',
                  background: category === cat.name ? 'var(--ac-bg)' : 'transparent',
                  color: category === cat.name ? 'var(--ac)' : 'var(--tx-3)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontFamily: 'inherit',
                }}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </FadeIn>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-20">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map((faq, i) => (
            <FadeIn key={faq.id} delay={i * 0.04}>
              <FaqCard item={faq} index={i} />
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
