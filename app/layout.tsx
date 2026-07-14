import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: '紫微命盘 · 倪海夏正宗紫微斗数',
  description: '紫微斗数科普知识+AI命理问答+个人命盘解读——基于倪海夏正宗紫微斗数体系，学习命理知识，了解自身格局',
  keywords: '紫微斗数, 倪海夏, 倪海厦, 紫微斗数全集, 紫微斗数全书, 骨髓赋, 命盘, 命理, 14主星, 12宫位, 紫微科普, 命理问答, 紫微学习',
  metadataBase: new URL('https://wdyziweidoushu666.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: '紫微命盘 · 倪海夏正宗紫微斗数',
    description: '紫微斗数科普知识+AI命理问答+个人命盘解读——基于倪海夏正宗紫微斗数体系，学习命理知识，了解自身格局',
    url: 'https://wdyziweidoushu666.com',
    siteName: '紫微研究',
    locale: 'zh_CN',
    type: 'website',
  },
  // 站长平台验证（拿到 verification code 后填入对应字段，重新部署即可）
  verification: {
    // Google Search Console: 在 https://search.google.com/search-console 添加站点后获取
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || undefined,
    // Bing Webmaster Tools: 在 https://www.bing.com/webmasters 添加站点后获取
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_VERIFICATION || '808FFC6023A2C359B375DD860FEDA856',
      // 百度站长（等执照下来后）
      'baidu-site-verification': process.env.NEXT_PUBLIC_BAIDU_VERIFICATION || '',
      // 360 站长（等执照下来后）
      '360-site-verification': process.env.NEXT_PUBLIC_360_VERIFICATION || '',
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('ziwei-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t);else document.documentElement.setAttribute('data-theme','dark');}catch(e){}})();` }} />
      </head>
      <body className="min-h-screen">
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
