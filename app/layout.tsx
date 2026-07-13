import NavbarLayout from '@/components/NavbarLayout';
import { SoundProvider } from '@/components/SoundProvider';
import { Noise } from '@/components/ui/noise';
import { ogImageUrl } from '@/lib/og-metadata';
import { getSiteUrl } from '@/lib/site';
import { cn } from '@/utils/cn';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import './globals.css';

const description =
  'AI product engineer building real-time intelligent systems — voice agents, LLM evaluation, guardrails, semantic caching, WebRTC, and the multi-tenant SaaS plumbing behind them. Currently leading engineering at HyrecruitAI.';
const name = 'Abhishek Kushwaha';
const tagline = 'AI product engineer · Real-time intelligent systems';
const homeOgImage = ogImageUrl({
  title: 'home@abhishekkushwaha',
  eyebrow: 'AI product engineer',
  background: 'HOME',
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${name} — ${tagline}`,
    absolute: `${name} — AI product engineer`,
    template: `%s | ${name}`,
  },
  description,
  keywords: [
    'Abhishek Kushwaha',
    'AI product engineer',
    'AI engineer portfolio',
    'real-time AI systems',
    'voice agents',
    'LLM evaluation',
    'AI guardrails',
    'semantic caching',
    'pgvector',
    'embeddings',
    'WebRTC engineer',
    'multi-tenant SaaS',
    'Next.js engineer',
    'TypeScript AI',
    'product engineer',
    'senior AI engineer',
    'HyrecruitAI',
    'Abhishek Kushwaha Portfolio',
    'Abhishek Kushwaha Blog',
    'Abhishek Kushwaha Projects',
    'Abhishek Kushwaha Writing',
  ],
  applicationName: name,
  openGraph: {
    title: `${name} — ${tagline}`,
    description,
    type: 'website',
    locale: 'en_US',
    emails: ['abhishekkushwaha1479@gmail.com'],
    url: siteUrl,
    images: [
      {
        url: homeOgImage,
        width: 1200,
        height: 630,
        alt: `${name} — AI product engineer`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${name} — ${tagline}`,
    description,
    creator: '@abbhishekstwt',
    images: [homeOgImage],
  },
  robots: {
    index: true,
    follow: true,
    noarchive: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          `relative overflow-hidden bg-white text-zinc-900 dark:bg-brand-dark dark:text-zinc-100 font-sans transition-colors duration-200`
        )}
      >
        <ThemeProvider attribute="class">
          <SoundProvider>
            <Noise />
            <NavbarLayout>{children}</NavbarLayout>
          </SoundProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
