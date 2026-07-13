import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const contentDirectory = path.join(process.cwd(), 'content');
const blogDirectory = path.join(contentDirectory, 'blog');

function resolveContentPath(contentPath: string): string | null {
  const resolvedPath = path.resolve(contentDirectory, contentPath);
  const relativePath = path.relative(contentDirectory, resolvedPath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return null;
  }

  return resolvedPath;
}

export function getMarkdownContent(contentPath: string): string | null {
  const resolvedPath = resolveContentPath(contentPath);
  if (!resolvedPath) return null;

  try {
    return readFileSync(resolvedPath, 'utf8');
  } catch {
    return null;
  }
}

export function getBlogMarkdownEntries(): Array<{
  slug: string;
  content: string;
}> {
  try {
    return readdirSync(blogDirectory, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
      .map((entry) => ({
        slug: path.basename(entry.name, '.md'),
        content: readFileSync(path.join(blogDirectory, entry.name), 'utf8'),
      }));
  } catch {
    return [];
  }
}

export function getBlogMarkdownContent(slug: string): string | null {
  return getMarkdownContent(`blog/${slug}.md`);
}
