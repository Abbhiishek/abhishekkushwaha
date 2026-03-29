import path from "path"
import { estimateReadingTime, getMarkdownFiles, parseMarkdownFile } from "./markdown"
import type { BlogPost, BlogPostWithContent } from "./types"

const BLOG_DIR = path.join(process.cwd(), "content", "blog")

function fileToBlogPost(filePath: string): BlogPost {
    const { frontmatter, raw } = parseMarkdownFile(filePath)
    const slug = path.basename(filePath, ".md")

    return {
        slug,
        title: frontmatter.title ?? slug,
        description: frontmatter.description ?? "",
        date: frontmatter.date ?? "",
        tags: frontmatter.tags ? frontmatter.tags.split(",").map((t) => t.trim()) : [],
        coverImage: frontmatter.coverImage ?? "/thumbnail.jpg",
        featured: frontmatter.featured === "true",
        readingTime: estimateReadingTime(raw),
    }
}

export function getAllBlogPosts(): BlogPost[] {
    return getMarkdownFiles(BLOG_DIR)
        .map(fileToBlogPost)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getBlogPostBySlug(slug: string): BlogPostWithContent | null {
    const filePath = path.join(BLOG_DIR, `${slug}.md`)
    try {
        const { frontmatter, html, raw } = parseMarkdownFile(filePath)
        return {
            slug,
            title: frontmatter.title ?? slug,
            description: frontmatter.description ?? "",
            date: frontmatter.date ?? "",
            tags: frontmatter.tags ? frontmatter.tags.split(",").map((t) => t.trim()) : [],
            coverImage: frontmatter.coverImage ?? "/thumbnail.jpg",
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
