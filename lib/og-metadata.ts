import type { Metadata } from "next"

const siteHandle = "abhishekkushwaha"

export function ogImageUrl({
    title,
    eyebrow,
    background,
}: {
    title: string
    eyebrow?: string
    background?: string
}) {
    const params = new URLSearchParams({
        title,
        eyebrow: eyebrow ?? "Abhishek Kushwaha",
        background: background ?? title,
    })

    return `/api/og?${params.toString()}`
}

export function pageSocialMetadata({
    page,
    title,
    description,
}: {
    page: string
    title: string
    description: string
}): Pick<Metadata, "openGraph" | "twitter"> {
    const label = `${page}@${siteHandle}`
    const image = ogImageUrl({
        title: label,
        eyebrow: title,
        background: page.toUpperCase(),
    })

    return {
        openGraph: {
            title: label,
            description,
            images: [image],
        },
        twitter: {
            card: "summary_large_image",
            title: label,
            description,
            images: [image],
        },
    }
}

export function blogSocialMetadata({
    title,
    description,
}: {
    title: string
    description: string
}): Pick<Metadata, "openGraph" | "twitter"> {
    const image = ogImageUrl({
        title,
        eyebrow: "Blog by Abhishek Kushwaha",
        background: "BLOG",
    })

    return {
        openGraph: {
            title,
            description,
            type: "article",
            images: [image],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [image],
        },
    }
}
