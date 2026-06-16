import { getBlogMarkdownContent, getBlogMarkdownEntries } from "./content"
import { estimateReadingTime, parseMarkdownContent } from "./markdown"
import { profileImagePath } from "./site"
import type { BlogPost, BlogPostWithContent } from "./types"

function markdownToBlogPost(slug: string, content: string): BlogPost {
    const { frontmatter, raw } = parseMarkdownContent(content)
    return {
        slug,
        title: frontmatter.title ?? slug,
        description: frontmatter.description ?? "",
        date: frontmatter.date ?? "",
        tags: frontmatter.tags ? frontmatter.tags.split(",").map((t) => t.trim()) : [],
        coverImage: frontmatter.coverImage ?? profileImagePath,
        featured: frontmatter.featured === "true",
        readingTime: estimateReadingTime(raw),
    }
}

export function getAllBlogPosts(): BlogPost[] {
    return getBlogMarkdownEntries()
        .map(({ slug, content }) => markdownToBlogPost(slug, content))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getBlogPostBySlug(slug: string): BlogPostWithContent | null {
    const content = getBlogMarkdownContent(slug)
    if (!content) return null

    try {
        const { frontmatter, html, raw } = parseMarkdownContent(content)
        return {
            slug,
            title: frontmatter.title ?? slug,
            description: frontmatter.description ?? "",
            date: frontmatter.date ?? "",
            tags: frontmatter.tags ? frontmatter.tags.split(",").map((t) => t.trim()) : [],
            coverImage: frontmatter.coverImage ?? profileImagePath,
            featured: frontmatter.featured === "true",
            readingTime: estimateReadingTime(raw),
            html,
        }
    } catch {
        return null
    }
}

export function getFeaturedBlogPosts(): BlogPost[] {
    return getAllBlogPosts().filter((p) => p.featured)
}
