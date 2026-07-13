'use client';

import {
  FadeInView,
  StaggerContainer,
  StaggerItem,
} from '@/components/ui/motion';
import type { BlogPost } from '@/lib/types';
import { cn } from '@/utils/cn';
import { adlam_display } from '@/utils/font';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function SelectedWriting({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="flex flex-col gap-8" aria-label="Selected writing">
      <FadeInView>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
              04 · Writing
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
              Selected writing
            </h2>
            <Link
              href="/blog"
              data-cuelume-hover="tick"
              className="self-start sm:self-auto inline-flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Full archive
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Posts on the parts of shipping AI that don&apos;t fit in a tweet —
            guardrails, voice pipelines, semantic caching, LLM evals,
            embeddings, and the multi-tenant SaaS plumbing.
          </p>
        </div>
      </FadeInView>

      <StaggerContainer
        data-sound-density="dense"
        className="flex flex-col border-t border-zinc-200 dark:border-zinc-800"
      >
        {posts.map((post, i) => (
          <StaggerItem key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              data-cuelume-hover="whisper"
              className="group grid grid-cols-[3rem_1fr_auto] items-center gap-3 sm:gap-6 py-5 border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/30 transition-colors -mx-2 px-2 rounded"
            >
              <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-400 dark:text-zinc-600">
                {String(i + 1).padStart(2, '0')}
              </span>

              <div className="flex flex-col gap-1 min-w-0">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-brand-pink dark:group-hover:text-brand-peach transition-colors truncate">
                  {post.title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-1">
                  {post.description}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 font-mono text-[11px] text-zinc-500">
                <span>{post.readingTime}m</span>
                <ArrowUpRight
                  size={14}
                  className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 group-hover:translate-x-0.5 transition-all"
                />
              </div>
            </Link>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}
