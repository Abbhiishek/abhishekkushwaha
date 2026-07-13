'use client';

import { FadeIn } from '@/components/ui/motion';
import { links } from '@/lib/links';
import { profileImagePath } from '@/lib/site';
import { cn } from '@/utils/cn';
import { adlam_display } from '@/utils/font';
import { motion } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';
import Link from 'next/link';

const socialOrder = ['GitHub', 'Twitter', 'Dev.to', 'NPM', 'Hashnode'];

export default function Hero() {
  const socialLinks = socialOrder
    .map((name) => links.find((link) => link.name === name))
    .filter((link): link is NonNullable<typeof link> => Boolean(link));

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start lg:items-center w-full pt-2 lg:pt-4">
      <div className="lg:col-span-7 flex flex-col gap-7 order-1">
        <FadeIn delay={0.15}>
          <h1
            className={cn(
              'max-w-2xl leading-[1.08] tracking-tight text-zinc-900 dark:text-white text-[clamp(1.9rem,3.6vw,3rem)]',
              adlam_display.className
            )}
          >
            AI engineer building
            <br />
            <span className="text-brand-pink dark:text-brand-peach">
              reliable AI products.
            </span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.3}>
          <p className="text-base sm:text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-xl">
            Founding engineer building AI products across voice agents,
            evaluation systems, semantic search, and multi-tenant SaaS. I care
            about the part where models become reliable products. Currently
            leading engineering at{' '}
            <Link
              href="/work"
              data-cuelume-hover="whisper"
              className="text-zinc-900 dark:text-zinc-100 underline decoration-zinc-400 dark:decoration-zinc-600 underline-offset-4 hover:decoration-brand-pink dark:hover:decoration-brand-peach transition-colors"
            >
              HyrecruitAI
            </Link>
            .
          </p>
        </FadeIn>

        <FadeIn delay={0.5}>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/work"
              data-cuelume-hover="chime"
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-white transition-colors"
            >
              See the systems I&apos;ve shipped
              <ArrowRight
                size={16}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
            <a
              href="mailto:abhishekkushwaha1479@gmail.com"
              data-cuelume-hover="chime"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md ring-1 ring-zinc-300 dark:ring-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:ring-zinc-900 dark:hover:ring-zinc-100 transition-colors"
            >
              <Mail size={15} />
              Talk shop
            </a>
          </div>
        </FadeIn>

        <FadeIn delay={0.6}>
          <div className="flex items-center gap-5 pt-1">
            {socialLinks.map((link) => (
              <motion.a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.name}
                data-cuelume-hover="sparkle"
                whileHover={{ y: -2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                className="text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                <link.icon size={18} />
              </motion.a>
            ))}
          </div>
        </FadeIn>
      </div>

      <div className="hidden lg:block lg:col-span-5 w-full order-2">
        <FadeIn delay={0.25} y={12}>
          <aside
            className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white/65 p-4 shadow-[0_30px_110px_-90px_rgba(24,24,27,0.65)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/50 dark:shadow-black/40"
            aria-label="Abhishek Kushwaha profile summary"
          >
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-peach/70 to-transparent"
            />
            <div className="grid gap-3">
              <div
                className="relative aspect-[16/11] overflow-hidden rounded-xl bg-zinc-100 bg-cover bg-[center_36%] saturate-[0.9] dark:bg-zinc-900"
                style={{ backgroundImage: `url(${profileImagePath})` }}
                role="img"
                aria-label="Abhishek Kushwaha"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/86 via-zinc-950/22 to-zinc-950/8" />
                <div className="absolute left-4 right-4 bottom-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/60">
                      Portfolio
                    </span>
                    <strong className="text-xl font-semibold tracking-tight text-white">
                      Abhishek Kushwaha
                    </strong>
                  </div>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                I build AI products where latency, evaluation quality, and
                product judgment all matter.
              </p>
            </div>
          </aside>
        </FadeIn>
      </div>
    </section>
  );
}
