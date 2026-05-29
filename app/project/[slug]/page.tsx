import ProjectDetailDispatch from "@/components/projects/ProjectDetailDispatch"
import { ogImageUrl } from "@/lib/og-metadata"
import { getProjectBySlug, projects } from "@/lib/project"
import { getProjectDetail } from "@/lib/project-details"
import { Metadata } from "next"
import { notFound } from "next/navigation"

interface Props {
    params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
    return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const project = getProjectBySlug(slug)
    if (!project) return { title: "Project Not Found" }
    const image = ogImageUrl({
        title: `${project.title}@abhishekkushwaha`,
        eyebrow: "Project by Abhishek Kushwaha",
        background: "PROJECT",
    })

    return {
        title: `${project.title} - ${project.tagline}`,
        description: project.description,
        keywords: [project.title, project.judgment, ...project.stack].join(", "),
        openGraph: {
            title: project.title,
            description: project.description,
            images: [image],
        },
        twitter: {
            card: "summary_large_image",
            title: project.title,
            description: project.description,
            images: [image],
        },
    }
}

export default async function ProjectDetailPage({ params }: Props) {
    const { slug } = await params
    const project = getProjectBySlug(slug)
    const detail = getProjectDetail(slug)

    if (!project || !detail) notFound()

    return <ProjectDetailDispatch project={project} detail={detail} />
}
