import CaseStudies from '@/components/home/CaseStudies';
import ContactCTA from '@/components/home/ContactCTA';
import CurrentFocus from '@/components/home/CurrentFocus';
import Hero from '@/components/home/Hero';
import SelectedWriting from '@/components/home/SelectedWriting';
import { getFeaturedBlogPosts } from '@/lib/blogs';
import { parseMarkdownFile } from '@/lib/markdown';
import path from 'path';

export default function Home() {
  const filePath = path.join(process.cwd(), "content", "now.md")
  const { html } = parseMarkdownFile(filePath)
  const featuredPosts = getFeaturedBlogPosts()

  return (
    <main className="flex flex-col gap-16 lg:gap-24 mt-6 lg:mt-10 px-2 lg:px-4 w-full pb-28 lg:pb-24">
      <Hero />
      <CaseStudies />
      <SelectedWriting posts={featuredPosts} />
      <CurrentFocus html={html} />
      <ContactCTA />
    </main>
  );
}
