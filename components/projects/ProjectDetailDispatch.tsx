import type { ProjectDetail } from "@/lib/project-details"
import type { Project } from "@/lib/types"
import CommunityMusicLayout from "./CommunityMusicLayout"
import DevResumeLayout from "./DevResumeLayout"
import TodoskaLayout from "./TodoskaLayout"
import WiidgetsLayout from "./WiidgetsLayout"

interface Props {
    project: Project
    detail: ProjectDetail
}

export default function ProjectDetailDispatch({ project, detail }: Props) {
    switch (project.layout) {
        case "product":
            return <DevResumeLayout project={project} detail={detail} />
        case "developer-ref":
            return <WiidgetsLayout project={project} detail={detail} />
        case "editorial":
            return <CommunityMusicLayout project={project} detail={detail} />
        case "terminal":
            return <TodoskaLayout project={project} detail={detail} />
        default:
            return <DevResumeLayout project={project} detail={detail} />
    }
}
