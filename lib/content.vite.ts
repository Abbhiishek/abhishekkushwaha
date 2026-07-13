const markdownModules = import.meta.glob('../content/**/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>;

const markdownContent = Object.fromEntries(
  Object.entries(markdownModules).map(([path, content]) => [
    path.replace(/^\.\.\/content\//, ''),
    content,
  ])
);

export function getMarkdownContent(contentPath: string): string | null {
  return markdownContent[contentPath] ?? null;
}

export function getBlogMarkdownEntries(): Array<{
  slug: string;
  content: string;
}> {
  return Object.entries(markdownContent)
    .filter(
      ([contentPath]) =>
        contentPath.startsWith('blog/') && contentPath.endsWith('.md')
    )
    .map(([contentPath, content]) => ({
      slug: contentPath.replace(/^blog\//, '').replace(/\.md$/, ''),
      content,
    }));
}

export function getBlogMarkdownContent(slug: string): string | null {
  return getMarkdownContent(`blog/${slug}.md`);
}
