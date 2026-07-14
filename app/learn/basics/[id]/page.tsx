import { notFound } from 'next/navigation';
import Link from 'next/link';
import { WHAT_IS_ZWDS, HOW_TO_READ_CHART, SIHUA_BASICS, TIME_BASICS, type BasicsTopic } from '@/lib/knowledge/basics';

const TOPICS: Record<string, BasicsTopic> = {
  'what-is-zwds': WHAT_IS_ZWDS,
  'how-to-read': HOW_TO_READ_CHART,
  'sihua-basics': SIHUA_BASICS,
  'time-basics': TIME_BASICS,
};

export function generateStaticParams() {
  return Object.keys(TOPICS).map(id => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = TOPICS[id];
  if (!topic) return {};
  return {
    title: `${topic.title} · 紫微斗数科普`,
    description: topic.subtitle,
  };
}

export default async function TopicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = TOPICS[id];
  if (!topic) notFound();

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* 顶栏 */}
      <div className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--bdr)' }}>
        <Link href="/learn/basics" style={{ fontSize: '12px', color: 'var(--ac)', letterSpacing: '0.3em', textDecoration: 'none' }}>
          ← 基础入门
        </Link>
        <div style={{ fontSize: '12px', color: 'var(--tx-3)', letterSpacing: '0.2em' }}>
          紫微科普
        </div>
        <Link href="/learn/faq" style={{ fontSize: '12px', color: 'var(--ac)', letterSpacing: '0.2em', textDecoration: 'none' }}>
          常见问题 →
        </Link>
      </div>

      {/* 正文 */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div style={{ fontSize: '48px', marginBottom: '16px', lineHeight: 1 }}>{topic.icon}</div>
        <h1 style={{
          fontSize: 'clamp(28px, 3.5vw, 40px)',
          fontWeight: 700,
          color: 'var(--tx-0)',
          marginBottom: '8px',
        }}>
          {topic.title}
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'var(--tx-2)',
          marginBottom: '32px',
          letterSpacing: '0.05em',
        }}>
          {topic.subtitle}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {topic.sections.map((sec, i) => (
            <div key={i}
              style={{
                padding: '24px',
                borderRadius: '12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--bdr)',
                boxShadow: 'var(--sh-sm)',
              }}
            >
              <h2 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--ac)',
                marginBottom: '12px',
                letterSpacing: '0.03em',
              }}>
                {sec.heading}
              </h2>
              <div style={{
                fontSize: '14px',
                lineHeight: 1.85,
                color: 'var(--tx-1)',
                whiteSpace: 'pre-line',
              }}>
                {sec.body}
              </div>
            </div>
          ))}
        </div>

        {/* 相关问题 */}
        {topic.relatedQuestions.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--tx-2)', marginBottom: '12px', letterSpacing: '0.05em' }}>
              相关问题 →
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {topic.relatedQuestions.map((q, i) => (
                <Link
                  key={i}
                  href={`/learn/faq?q=${encodeURIComponent(q)}`}
                  style={{
                    fontSize: '13px',
                    color: 'var(--ac)',
                    textDecoration: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'var(--ac-bg)',
                    border: '1px solid var(--ac-bdr)',
                    display: 'inline-block',
                    width: 'fit-content',
                  }}
                >
                  {q}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
