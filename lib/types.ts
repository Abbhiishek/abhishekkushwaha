export interface BlogPost {
    slug: string
    title: string
    description: string
    date: string
    tags: string[]
    coverImage: string
    featured: boolean
    readingTime: number
}

export interface BlogPostWithContent extends BlogPost {
    html: string
}

export type ProjectLayout = "product" | "developer-ref" | "editorial" | "terminal" | "utility-product"

export type ProjectStatus = "shipped" | "ongoing" | "archived" | "sunset"

export interface Project {
    slug: string
    title: string
    tagline: string
    description: string
    judgment: string
    stack: string[]
    image: string
    accent: string
    layout: ProjectLayout
    status: ProjectStatus
    period: string
    githubUrl?: string
    liveUrl?: string
    featured?: boolean
}
