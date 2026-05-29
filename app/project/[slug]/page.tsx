import ProjectDetailDispatch from "@/components/projects/ProjectDetailDispatch"
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

    return {
        title: `${project.title} - ${project.tagline}`,
        description: project.description,
        keywords: [project.title, project.judgment, ...project.stack].join(", "),
    }
}

export default async function ProjectDetailPage({ params }: Props) {
    const { slug } = await params
    const project = getProjectBySlug(slug)
    const detail = getProjectDetail(slug)

    if (!project || !detail) notFound()

    return <ProjectDetailDispatch project={project} detail={detail} />
}
