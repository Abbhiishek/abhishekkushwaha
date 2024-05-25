export type RecentBlogs = Blog[];

export type Blog = {
    slug: string;
    url: string;
    title: string;
    public_reactions_count: number;
};
