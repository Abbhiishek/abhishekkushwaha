import BentoGridHeroSection from '@/components/home/BentoGridSection';
import FeaturedBlogPosts from '@/components/home/FeaturedBlogPosts';
import FeaturedProjects from '@/components/home/FeaturedProjects';
import WhatsCooking from '@/components/home/WhatsCooking';
import { getFeaturedBlogPosts } from '@/lib/blogs';
import { parseMarkdownFile } from '@/lib/markdown';
import { getFeaturedProjects } from '@/lib/project';
import path from 'path';

export default function Home() {
  const filePath = path.join(process.cwd(), "content", "now.md")
  const { html } = parseMarkdownFile(filePath)
  const featuredProjects = getFeaturedProjects()
  const featuredPosts = getFeaturedBlogPosts()

  return (
    <main className="flex flex-col gap-20 mt-8 lg:mt-16 px-4 lg:px-8 w-full pb-28 lg:pb-20">
      <section className="min-h-[80vh] flex items-center">
        <BentoGridHeroSection />
      </section>
      <WhatsCooking html={html} />
      <FeaturedProjects projects={featuredProjects} />
      <FeaturedBlogPosts posts={featuredPosts} />
    </main>
  );
}
