import axios from "axios";

export async function getBlogs() {
    const res = await axios.get("https://dev.to/api/articles?username=abbhiishek");

    const blogs = res.data.slice(0, 8);

    return blogs.map((blog: any) => {
        return {
            slug: blog.slug,
            url: blog.url,
            title: blog.title,
            public_reactions_count: blog.public_reactions_count,
        };
    });
}
