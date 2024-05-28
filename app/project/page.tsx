import ProjectsWobbleCard from "@/components/ProjectsWobbleCard"
// import { projects } from "@/lib/project"
import { Metadata } from "next"


export const metadata: Metadata = {
    title: "Projects",
    description: "All my projects and repositories.",
    keywords: "projects, repositories, open-source, github",
}

const projects = [
    {
        title: "DevResume.",
        description: "Craft your developer Portfolio within Few Seconds.",
        image: "/devresume.png",
        gridSpan: "col-span-3 lg:col-span-2",
        backgroundColor: "bg-green-800/20 hover:bg-green-800/40",
        imageposition: "-right-4 lg:-right-[20%] -bottom-4 lg:-bottom-[20%]",
        url: "https://github.com/Abbhiishek/dresume",
    },
    {
        title: "Wiidgets",
        description: "Only Api endpoint you need for GitHub widgets",
        image: "/wiidgets.png",
        gridSpan: "col-span-3 lg:col-span-1",
        backgroundColor: "bg-violet-900/20 hover:bg-violet-900/40",
        imageposition: "-left-4 lg:-left-[30%] -bottom-4 lg:-bottom-[10%]",
        url: "https://github.com/Abbhiishek/codecommunitymusic",
    },
    {
        title: "Code Community Music",
        description: "CodeCommunityMusic is a community of developers and musicians who are passionate about music and code.",
        image: "/ccm.png",
        gridSpan: "col-span-3",
        backgroundColor: "bg-blue-900/20 hover:bg-blue-900/40",
        imageposition: "-right-4 lg:-right-[10%] -bottom-4 lg:-bottom-[5%]",
        url: "https://github.com/Abbhiishek/Widgets",
    },
    {
        title: "Todoska",
        description: "Todoska is a simple Cli Todo-Tracker.",
        image: "/todoska.gif",
        gridSpan: "col-span-3 lg:col-span-2",
        backgroundColor: "bg-yellow-900/60 dark:bg-yellow-900/20 hover:bg-yellow-900/70 dark:hover:bg-yellow-900/40",
        imageposition: "-right-4 lg:-right-[10%] -bottom-4 lg:-bottom-[35%]",
        url: "https://github.com/Abbhiishek/Todoska",
    },
    {
        title: "Bashy",
        description: "Bashy is a url shortener on steroids 💪.",
        image: "/bashy.png",
        gridSpan: "col-span-3 lg:col-span-1",
        backgroundColor: "bg-cyan-900/20 hover:bg-cyan-900/40",
        imageposition: "-right-4 lg:-right-[30%] -bottom-4 lg:-bottom-[10%]",
        url: "https://github.com/Abbhiishek/Bashy",
    },
    {
        title: "Code.sh",
        description: "Code.sh is a simple and easy to use code sharing platform.",
        image: "/bashy.png",
        gridSpan: "col-span-3 lg:col-span-1",
        backgroundColor: "bg-indigo-900/20 hover:bg-indigo-900/40",
        imageposition: "-right-4 lg:-right-[30%] -bottom-4 lg:-bottom-[10%]",
        url: "https://github.com/Abbhiishek/codesh",
    },
    {
        title: "Atom",
        description: "Event hosting platform for developers and tech enthusiasts.",
        image: "/bashy.png",
        gridSpan: "col-span-3 lg:col-span-2",
        backgroundColor: "bg-sky-900/20 hover:bg-sky-900/40",
        imageposition: "-right-4 lg:-right-[30%] -bottom-4 lg:-bottom-[10%]",
        url: "https://github.com/Abbhiishek/Bashy",
    },
    {
        title: "Raise",
        description: "Raise is a one to one platform for startup founders to raise funds without any hassle.",
        image: "/bashy.png",
        gridSpan: "col-span-3",
        backgroundColor: "bg-yellow-900/20 hover:bg-yellow-900/40",
        imageposition: "-right-4 lg:-right-[30%] -bottom-4 lg:-bottom-[10%]",
        url: "https://github.com/Abbhiishek/Raise",
    },
]

function ProjectPage() {
    return (
        <div className="w-full min-h-screen h-full p-8 flex flex-col items-center relative">
            <section className="flex flex-col w-full justify-between mt-16 lg:mt-0 md:mt-0  gap-6 mb-12">
                <div>
                    <h1 className="dark:text-zinc-200 text-zinc-900 leading-none mb-3 text-6xl font-adlam">Projects</h1>
                    <p className="dark:text-zinc-400 text-zinc-800 m-0 leading-tight">
                        Projects I&rsquo;ve worked on, or currently working on.
                        (Most of them are open-source, feel free to contribute! 🚀)
                        <br />
                        Dumbest ideas are the best ideas. 🤪
                    </p>
                </div>
                <div className="grid grid-cols-3 gap-4 max-w-7xl mx-auto w-full">
                    {projects.map((project, index) => (
                        <ProjectsWobbleCard
                            key={index}
                            title={project.title}
                            description={project.description}
                            image={project.image}
                            gridSpan={project.gridSpan}
                            backgroundColor={project.backgroundColor}
                            imageposition={project.imageposition}
                            url={project.url}
                        />
                    ))}
                </div>
            </section>
        </div>
    )
}

export default ProjectPage