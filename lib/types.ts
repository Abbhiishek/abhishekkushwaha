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

export interface Project {
    title: string
    description: string
    image: string
    gridSpan: string
    backgroundColor: string
    imageposition: string
    url: string
    featured?: boolean
}
