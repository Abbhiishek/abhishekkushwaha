'use client';

import {
  FadeInView,
  StaggerContainer,
  StaggerItem,
} from '@/components/ui/motion';
import { caseStudies } from '@/lib/case-studies';
import { cn } from '@/utils/cn';
import { adlam_display } from '@/utils/font';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function CaseStudies() {
  return (
    <section className="flex flex-col gap-8" aria-label="Engineering notes">
      <FadeInView>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
              03 / Engineering notes
            </span>
            <span className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <h2
              className={cn(
                'text-3xl sm:text-4xl lg:text-5xl tracking-tight text-zinc-900 dark:text-white',
                adlam_display.className
              )}
            >
              Systems worth reading into
            </h2>
            <Link
              href="/blog"
              data-cuelume-hover="tick"
              className="self-start sm:self-auto text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Writing archive
            </Link>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">
            A tighter set of technical essays and case-study notes: search,
            recommendations, self-hosted systems, and relevance loops that show
            how I think through products end to end.
          </p>
        </div>
      </FadeInView>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
        {caseStudies.map((c) => (
          <StaggerItem key={c.id}>
            <article
              className={cn(
                'group relative flex flex-col gap-4 p-6 rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-800',
                'bg-white/60 dark:bg-zinc-950/40 hover:ring-zinc-400 dark:hover:ring-zinc-700 transition-colors h-full'
              )}
            >
              <h3 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {c.title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {c.summary}
              </p>

              {c.readMore && (
                <Link
                  href={c.readMore.href}
                  data-cuelume-hover="chime"
                  className="mt-auto inline-flex items-center gap-1 text-sm text-brand-pink dark:text-brand-peach hover:underline underline-offset-4"
                >
                  {c.readMore.label}
                  <ArrowUpRight size={14} />
                </Link>
              )}
            </article>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}
