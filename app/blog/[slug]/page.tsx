import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BLOG_ARTICLES, getArticleBySlug } from '@/lib/knowledge/blog';

export function generateStaticParams() {
  return BLOG_ARTICLES.map(a => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: `${article.title} · 紫微斗数科普`,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: 'article',
      publishedTime: article.date,
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* 顶栏 */}
      <div className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--bdr)' }}>
        <Link href="/blog" style={{ fontSize: '12px', color: 'var(--ac)', letterSpacing: '0.3em', textDecoration: 'none' }}>
          ← 文章列表
        </Link>
        <div style={{ fontSize: '12px', color: 'var(--tx-3)', letterSpacing: '0.2em' }}>
          科普文章
        </div>
        <Link href="/learn" style={{ fontSize: '12px', color: 'var(--ac)', letterSpacing: '0.2em', textDecoration: 'none' }}>
          科普中心 →
        </Link>
      </div>

      {/* 文章内容 */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div style={{ fontSize: '48px', marginBottom: '12px', lineHeight: 1 }}>{article.coverEmoji}</div>

        <h1 style={{
          fontSize: 'clamp(26px, 3.5vw, 38px)',
          fontWeight: 700,
          color: 'var(--tx-0)',
          marginBottom: '8px',
          lineHeight: 1.3,
        }}>
          {article.title}
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'var(--tx-2)',
          marginBottom: '16px',
        }}>
          {article.subtitle}
        </p>
        <div style={{
          display: 'flex',
          gap: '12px',
          fontSize: '12px',
          color: 'var(--tx-3)',
          marginBottom: '32px',
          paddingBottom: '20px',
          borderBottom: '1px solid var(--bdr)',
        }}>
          <span>{article.date}</span>
          <span>·</span>
          <span>{article.category}</span>
          <span>·</span>
          <span>{article.readMinutes}分钟阅读</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {article.content.map((sec, i) => (
            <div key={i}
              style={{
                padding: '20px',
                borderRadius: '12px',
                background: 'var(--bg-card)',
                border: '1px solid var(--bdr)',
                boxShadow: 'var(--sh-sm)',
              }}
            >
              <h2 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--ac)',
                marginBottom: '10px',
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

        {/* 底部导航 */}
        <div style={{
          marginTop: '40px',
          padding: '20px',
          borderRadius: '12px',
          background: 'var(--ac-bg)',
          border: '1px solid var(--ac-bdr)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <Link href="/chart" style={{
            fontSize: '13px',
            color: 'var(--ac)',
            textDecoration: 'none',
            fontWeight: 500,
          }}>
            🔮 起盘看你的命盘 →
          </Link>

          <Link href="/learn" style={{
            fontSize: '13px',
            color: 'var(--tx-2)',
            textDecoration: 'none',
          }}>
            返回科普中心 →
          </Link>
        </div>
      </div>
    </div>
  );
}
