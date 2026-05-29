export interface Challenge {
    title: string
    problem: string
    approach: string
    outcome?: string
}

export interface VlogEntry {
    date: string
    title: string
    body: string
}

export interface ProjectDetail {
    slug: string
    goals: string[]
    vision: string
    challenges: Challenge[]
    learnings: string[]
    vlog: VlogEntry[]
}

export const projectDetails: Record<string, ProjectDetail> = {
    devresume: {
        slug: "devresume",
        vision:
            "DevResume was a web platform for building and publishing a developer portfolio, not a CLI template. The product idea was simple: a developer signs in, adds profile, resume, project, blog, and social data, then publishes a real website under a generated subdomain or their own DNS-backed domain.",
        goals: [
            "Make portfolio publishing feel like using a product, not cloning and editing a template.",
            "Support generated subdomains and custom domains through DNS records like CNAME and apex records.",
            "Keep the portfolio content structured: projects, work experience, education, certificates, blog posts, resume files, and tech stack.",
            "Give users a normal hosted website experience with authentication, analytics, images, and theme controls.",
        ],
        challenges: [
            {
                title: "Turning a portfolio into a hosted product",
                problem:
                    "A portfolio builder has to manage more than pages. It needs users, sites, resume data, projects, blog posts, media, analytics, themes, and public routing.",
                approach:
                    "Modeled the product around users and sites in Prisma/Postgres, with separate tables for projects, resume files, education, work experience, certificates, blog posts, and analytics.",
                outcome:
                    "The project became a proper portfolio platform instead of a static starter template.",
            },
            {
                title: "Custom domain publishing",
                problem:
                    "Developers care about owning their domain. That means the product has to think about subdomains, custom domains, CNAME records, apex records, and routing on Vercel.",
                approach:
                    "Made subdomain and customDomain part of the site model, then designed the publishing flow around DNS-backed ownership instead of treating domains as an afterthought.",
                outcome:
                    "DevResume could represent both generated project URLs and personal domains in the product data model.",
            },
            {
                title: "Content editing without design drag",
                problem:
                    "The target user wants a polished portfolio but does not want to spend every weekend adjusting card layouts and spacing.",
                approach:
                    "Kept the editor structured around the objects developers already understand: projects, skills, work, education, certificates, resume, and blog content.",
                outcome:
                    "The hard design decisions moved into the platform, while users focused on the story they wanted to publish.",
            },
        ],
        learnings: [
            "A portfolio builder is closer to a small SaaS product than a design template.",
            "Custom domains sound like a small feature until DNS, routing, verification, and user guidance enter the room.",
            "Structured content wins when the user wants to publish quickly and still look polished.",
        ],
        vlog: [
            {
                date: "Build note 01",
                title: "The product was the publishing workflow",
                body: "The interesting part of DevResume was not another portfolio layout. It was making sign in, content entry, publishing, and domain ownership feel like one flow.",
            },
            {
                date: "Build note 02",
                title: "DNS became part of the UX",
                body: "Once custom domains entered the project, the UI had to explain CNAME and apex records without making the user feel like they were debugging infrastructure.",
            },
            {
                date: "Build note 03",
                title: "Data shape mattered",
                body: "The Prisma schema forced clarity. A portfolio is made of projects, experience, education, certificates, writing, files, and analytics. Once those objects were explicit, the product became easier to reason about.",
            },
        ],
    },
    wiidgets: {
        slug: "wiidgets",
        vision:
            "Wiidgets was built around one developer-friendly promise: hit an endpoint and get a visual asset you can paste into a GitHub README, profile, website, or docs page. Instead of installing a package or embedding a heavy client, the API returns SVG widgets for GitHub data and profile surfaces.",
        goals: [
            "Make widgets usable from plain markdown with a single image URL.",
            "Return SVG so the result works inside GitHub README files and static pages.",
            "Support practical widgets like banners, repository cards, Buy Me a Coffee cards, and themed GitHub visuals.",
            "Keep customization in URL parameters so developers can change text, theme, owner, repo, and profile data quickly.",
        ],
        challenges: [
            {
                title: "SVG over HTML",
                problem:
                    "A GitHub README cannot run a normal interactive web component. The output has to be portable and safe to embed.",
                approach:
                    "Designed the API around SVG responses, so a widget could be used directly in markdown, websites, and profile READMEs.",
                outcome:
                    "A widget became as easy to use as an image tag pointing at a URL.",
            },
            {
                title: "Endpoint design",
                problem:
                    "Each widget needed different inputs without forcing users to read a long integration guide.",
                approach:
                    "Used clear route patterns and query parameters for examples like banner title/bio/twitter, repo owner/repo/theme, and Buy Me a Coffee slug.",
                outcome:
                    "The API stayed copy-paste friendly for README use cases.",
            },
            {
                title: "Customizable visual styles",
                problem:
                    "README widgets need to match different profiles, themes, and personal brands.",
                approach:
                    "Added theme parameters and CSS/SVG styling so generated cards could change look without changing the endpoint contract.",
                outcome:
                    "The project could ship many visual variants while keeping the same API surface.",
            },
        ],
        learnings: [
            "For developer tools, distribution can be the product. A URL that works in markdown is a powerful interface.",
            "SVG is a constraint, but it is also what makes the output portable.",
            "Good endpoint naming lowers the adoption cost more than a fancy dashboard would.",
        ],
        vlog: [
            {
                date: "Build note 01",
                title: "The README was the target surface",
                body: "Wiidgets made sense because the target environment was narrow: GitHub READMEs and profile pages. That constraint made SVG endpoints the obvious product shape.",
            },
            {
                date: "Build note 02",
                title: "The API had to be visible",
                body: "Every example URL doubled as documentation. If the endpoint URL was hard to read, the product felt harder than it actually was.",
            },
            {
                date: "Build note 03",
                title: "Themes changed the feel",
                body: "Theme support made the widgets feel personal instead of generic. That mattered because the output lived directly on someone's public profile.",
            },
        ],
    },
    "code-community-music": {
        slug: "code-community-music",
        vision:
            "Code Community Music was one of my first serious full-stack community projects. Despite the name, the core product was a developer community platform: people could sign in, share projects and ideas, discuss, collaborate, and explore community activity across a React/Next.js frontend and a Django/Postgres backend.",
        goals: [
            "Build a real community platform instead of a static showcase.",
            "Give developers a place to share projects, ideas, discussions, and collaboration requests.",
            "Use a React/Next.js and Tailwind client with a Python/Django backend and PostgreSQL database.",
            "Make the project contributor-friendly with Docker setup and separate client/server submodules.",
        ],
        challenges: [
            {
                title: "Full-stack architecture early on",
                problem:
                    "The app had a real frontend, backend, database, auth surface, and admin workflow. That is a lot to coordinate in an early project.",
                approach:
                    "Split the project into client and server submodules, then used Docker Compose to run the full local environment with frontend, backend, database, and supporting containers.",
                outcome:
                    "The project became easier for contributors to run and reason about locally.",
            },
            {
                title: "Community features need structure",
                problem:
                    "A community app quickly becomes messy if users can post anything anywhere without clear product objects.",
                approach:
                    "Shaped the platform around developer-friendly actions: signing in, sharing projects, posting ideas, and joining discussion surfaces.",
                outcome:
                    "The product moved from a vague community idea toward a platform with understandable workflows.",
            },
            {
                title: "Learning backend ownership",
                problem:
                    "Django, PostgreSQL, admin panels, auth flows, and deployment concerns all showed up together.",
                approach:
                    "Used Django's strengths for the server and admin side, while keeping the frontend experience in React/Next.js and Tailwind.",
                outcome:
                    "The project became a practical education in owning both product UI and backend systems.",
            },
        ],
        learnings: [
            "A community product needs clear objects: posts, projects, discussions, profiles, and moderation paths.",
            "Docker and clean local setup matter a lot when a project has multiple services.",
            "Early full-stack projects teach product judgment faster than small isolated demos.",
        ],
        vlog: [
            {
                date: "Chapter 01",
                title: "A real community app",
                body: "The project started from wanting developers to have a place to share what they were building and find people to collaborate with, not from building a music player.",
            },
            {
                date: "Chapter 02",
                title: "Client and server became separate worlds",
                body: "React/Next.js handled the public product surface, while Django handled data, admin, and backend structure. Docker made those worlds easier to run together.",
            },
            {
                date: "Chapter 03",
                title: "The useful lesson",
                body: "This project made the cost of full-stack product work visible: auth, state, data models, local setup, and user flows all have to line up before the UI feels real.",
            },
        ],
    },
    todoska: {
        slug: "todoska",
        vision:
            "Todoska was a Python CLI todo tracker built for quick terminal capture. It used Typer for commands, Rich for colored table output, SQLite for local storage, and a PyPI package so the tool could be installed and run directly from the command line.",
        goals: [
            "Let users add, show, update, complete, and delete todos without leaving the terminal.",
            "Support categories, completion status, date added, and date completed.",
            "Use Rich tables so terminal output feels readable instead of plain dumps.",
            "Package the CLI for installation through pip.",
        ],
        challenges: [
            {
                title: "Simple commands that felt complete",
                problem:
                    "A todo CLI has to be quick, but it still needs enough commands to manage the list after capture.",
                approach:
                    "Built a Typer command surface around add, show, update, complete, delete, and about commands.",
                outcome:
                    "The CLI covered the core lifecycle of a todo item without adding unnecessary product surface.",
            },
            {
                title: "Readable terminal output",
                problem:
                    "Plain CLI output can become hard to scan once tasks have category, dates, status, and positions.",
                approach:
                    "Rendered tasks through Rich tables with columns for index, todo, category, date added, date completed, and status.",
                outcome:
                    "The tool felt closer to a small terminal app than a raw command dump.",
            },
            {
                title: "Local persistence",
                problem:
                    "A todo tracker needs state that survives between commands without asking users to run a service.",
                approach:
                    "Stored todos in a local SQLite database with task, category, position, status, and timestamps.",
                outcome:
                    "The CLI stayed self-contained while still supporting edits and completion tracking.",
            },
        ],
        learnings: [
            "The best CLI tools are small, predictable, and easy to remember.",
            "Rich terminal output can make a simple utility feel more polished without adding UI complexity.",
            "Packaging and command naming are part of the product experience, not chores after the code is done.",
        ],
        vlog: [
            {
                date: "$ pip install",
                title: "A package, not just a script",
                body: "Todoska became more real when it was installable. Packaging it forced the command entry point, dependencies, and project identity to be explicit.",
            },
            {
                date: "$ todoska show",
                title: "Tables made it usable",
                body: "The moment Rich tables entered the project, the CLI stopped feeling like logs and started feeling like a tiny productivity surface.",
            },
            {
                date: "$ todoska complete",
                title: "State is the product",
                body: "The useful part was not only adding todos. It was changing them over time: update, complete, delete, and see the status clearly.",
            },
        ],
    },
}

export function getProjectDetail(slug: string): ProjectDetail | undefined {
    return projectDetails[slug]
}
