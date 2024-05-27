export type RecentBlogs = Blog[];

export type Blog = {
    slug: string;
    url: string;
    title: string;
    public_reactions_count: number;
    tags: string[];
    published_at: string;
    cover_image: string;
    comments_count: number;
    description: string;
};
