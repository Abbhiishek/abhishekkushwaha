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
    vaaniflow: {
        slug: "vaaniflow",
        vision:
            "VaaniFlow is the open-source project behind Vaani, a Windows tray app for speaking directly into the field already under the cursor. Hold a global shortcut, speak naturally, and release to insert the transcript, with optional cleanup, writing styles, dictionary terms, snippets, and searchable local history.",
        goals: [
            "Make voice input available across Windows apps without forcing users into a separate editor or transcription workspace.",
            "Keep the core interaction short: hold a shortcut, speak, release, and receive usable text at the cursor.",
            "Let users bring their own Azure OpenAI Whisper deployment while keeping settings, credentials, history, and personal data local.",
            "Support optional AI cleanup, app-aware writing styles, personal dictionary terms, reusable snippets, and voice commands.",
        ],
        challenges: [
            {
                title: "Writing into the app already open",
                problem:
                    "A dictation tool loses its advantage if users have to switch windows, copy a transcript, and return to the original task.",
                approach:
                    "Built Vaani as a system-tray Electron app around a global shortcut and cursor-first insertion flow, including behavior suited to messages, documents, browsers, forms, and terminals.",
                outcome:
                    "Voice input stays inside the user's existing workflow instead of becoming another destination app.",
            },
            {
                title: "Longer recordings without a stalled workflow",
                problem:
                    "Long dictation sessions can become slow and fragile when the entire recording is treated as one transcription request.",
                approach:
                    "Added background chunking for longer recordings while keeping push-to-talk and hands-free modes centered on the same simple interaction.",
                outcome:
                    "Vaani can support quick phrases and longer thoughts without changing how the user starts dictating.",
            },
            {
                title: "A clear privacy boundary",
                problem:
                    "Voice tools handle audio, transcripts, credentials, writing history, and personal vocabulary, so vague data ownership quickly damages trust.",
                approach:
                    "Removed the need for a VaaniFlow account or sync service, stored app data locally, and routed speech and optional cleanup directly through the Azure OpenAI deployments configured by the user.",
                outcome:
                    "The product has an understandable boundary: local app data, user-controlled provider requests, and no hosted VaaniFlow subscription.",
            },
        ],
        learnings: [
            "The best desktop utilities disappear into the workflow instead of asking users to reorganize around them.",
            "Voice-to-text becomes much more useful when correction, vocabulary, snippets, and output style are treated as one system.",
            "Local-first architecture is strongest when the interface explains exactly what stays local and what reaches a configured provider.",
        ],
        vlog: [
            {
                date: "Build note 01",
                title: "The cursor became the destination",
                body: "The defining product decision was to return text to the field already open. That kept dictation attached to the user's task instead of creating a separate transcription workflow.",
            },
            {
                date: "Build note 02",
                title: "The transcript needed context",
                body: "Cleanup, writing styles, dictionary terms, snippets, and voice commands turned raw speech recognition into text that was closer to ready for use.",
            },
            {
                date: "Build note 03",
                title: "Privacy needed a visible model",
                body: "Keeping settings and history local was only part of the job. The product also had to show when audio or text was sent to the user's configured Azure deployment.",
            },
        ],
    },
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
    "pdf-kabootr": {
        slug: "pdf-kabootr",
        vision:
            "PDF Tools was built as a browser-native document workspace: the kind of utility people can open, use once, and trust because the document never has to leave their machine. The product combines common PDF actions - merge, split, organize, compress, protect, sign, and convert - into a fast local-first interface instead of sending private files to a server.",
        goals: [
            "Keep PDF work private by doing processing on-device wherever the browser can support it.",
            "Cover the high-frequency PDF jobs in one place: merge, split, reorder, rotate, delete pages, compress, protect, unlock, sign, and convert.",
            "Make the first screen useful immediately with grouped tool cards instead of a marketing-heavy landing page.",
            "Ship as a lightweight web app that can feel instant, keyboard-friendly, and installable.",
        ],
        challenges: [
            {
                title: "Trust is the product surface",
                problem:
                    "PDF tools often ask users to upload contracts, IDs, invoices, resumes, and other sensitive files. That creates friction before the user even starts.",
                approach:
                    "Positioned privacy as a product constraint and designed the tool around local browser processing, with copy and UI that make the no-upload model visible.",
                outcome:
                    "The app can be used for everyday document work without asking users to trade privacy for convenience.",
            },
            {
                title: "Many tools without a messy dashboard",
                problem:
                    "A PDF toolkit quickly becomes a wall of unrelated buttons if merge, split, organize, sign, watermark, page numbers, metadata, and conversion are all treated equally.",
                approach:
                    "Grouped actions by job type - organize pages, edit and sign, convert, optimize, and protect - so users can scan by intent instead of reading every card.",
                outcome:
                    "The first screen works as the product navigation and as the product explanation.",
            },
            {
                title: "Client-side processing constraints",
                problem:
                    "Browser-based PDF work has to balance file size, memory, page rendering, and export quality without a backend worker doing the heavy lifting.",
                approach:
                    "Kept the product focused on practical operations that map well to in-browser PDF libraries and progressive enhancement.",
                outcome:
                    "The app stays fast for normal document workflows while keeping the architecture simple and privacy-preserving.",
            },
        ],
        learnings: [
            "Privacy is easier to believe when the interaction model proves it.",
            "Utility apps need direct information architecture more than decorative storytelling.",
            "Local-first tools still need careful UX around file size, export state, and unsupported edge cases.",
        ],
        vlog: [
            {
                date: "Build note 01",
                title: "The homepage became the tool picker",
                body: "The useful path was not a long landing page. It was a grouped set of actions that let someone arrive with a PDF problem and choose the right operation immediately.",
            },
            {
                date: "Build note 02",
                title: "No upload had to be obvious",
                body: "The privacy promise needed to show up in the hero, tool states, and product language because the whole category has trained users to expect server uploads.",
            },
            {
                date: "Build note 03",
                title: "PDF workflows are families",
                body: "Merge and split are page organization problems. Watermarks, signing, and page numbers are editing problems. Grouping them this way made the app easier to scan.",
            },
        ],
    },
    "pixel-kabootr": {
        slug: "pixel-kabootr",
        vision:
            "PixelMorph was designed as a private browser workspace for everyday image conversion and cleanup. Users can drop images, convert between PNG, JPG, WebP, GIF, SVG, ICO, and TIFF, then resize, compress, crop, adjust, and export in batches without accounts, quotas, or upload waiting.",
        goals: [
            "Make conversion feel instant for common image formats while keeping files inside the browser.",
            "Support practical adjacent jobs: resize, compress, crop, color adjustments, favicon output, and batch ZIP download.",
            "Handle large images based on device capacity instead of enforcing artificial server-side limits.",
            "Build SEO-friendly format pages without making the converter itself feel bloated.",
        ],
        challenges: [
            {
                title: "Conversion without a server upload",
                problem:
                    "Most online converters send files to a backend. That makes privacy weaker and turns every conversion into a network-dependent job.",
                approach:
                    "Used browser-native image APIs and targeted JS/WASM support for less common formats so conversion can happen locally.",
                outcome:
                    "The product can promise no upload, no signup, and no quota as real architecture choices, not only marketing copy.",
            },
            {
                title: "One workspace, many image jobs",
                problem:
                    "Users rarely need only format conversion. They often need to resize, compress, crop, or tweak the image before exporting.",
                approach:
                    "Kept conversion as the primary action while adding supporting tools around dimensions, quality, crop presets, and visual adjustments.",
                outcome:
                    "PixelMorph acts more like a compact image utility bench than a single-purpose converter.",
            },
            {
                title: "Batch work and export ergonomics",
                problem:
                    "Converting one file is simple. Converting many files means progress, failures, file names, memory, and downloads become part of the experience.",
                approach:
                    "Designed the workflow around multiple input files, per-file results, individual downloads, and a single ZIP export for batches.",
                outcome:
                    "The tool works for real cleanup tasks, not only a one-off demo conversion.",
            },
        ],
        learnings: [
            "For utility products, speed and trust matter more than account systems.",
            "Client-side processing makes privacy stronger but pushes responsibility into browser capability checks and memory handling.",
            "Format coverage is useful only when paired with export controls people actually need.",
        ],
        vlog: [
            {
                date: "Build note 01",
                title: "The file stayed local",
                body: "The core decision was to treat image data as something the app reads and transforms in the browser, not something it owns on a server.",
            },
            {
                date: "Build note 02",
                title: "Converter became editor-lite",
                body: "Resize, compress, crop, and adjustment controls turned out to be part of the same user job: prepare this image for the place it needs to go.",
            },
            {
                date: "Build note 03",
                title: "SEO and product had to coexist",
                body: "The site can explain many format pairs for search while keeping the actual converter screen direct and low-friction.",
            },
        ],
    },
    "linky-kabootr": {
        slug: "linky-kabootr",
        vision:
            "Linky is a modern link management platform for turning long URLs into branded short links with QR codes and real-time, privacy-first analytics. The product pairs edge redirects with campaign controls, device and geography targeting, UTM/referrer reporting, and link-level safeguards.",
        goals: [
            "Create short links with custom slugs, branded domains, and fast edge redirects.",
            "Generate QR codes for every link with formats that work for digital and print sharing.",
            "Show analytics that are useful without becoming invasive: clicks, country, device, browser, OS, referrer, and UTM attribution.",
            "Build on Cloudflare Workers and D1 so redirects and analytics stay close to the edge.",
        ],
        challenges: [
            {
                title: "Redirect speed versus analytics depth",
                problem:
                    "A short-link product has to redirect quickly, but it also needs to record useful click data without slowing down the visitor.",
                approach:
                    "Framed the architecture around edge redirects and lightweight analytics capture, with the product promise centered on sub-10ms redirects.",
                outcome:
                    "The app can compete on speed while still giving users a meaningful reporting surface.",
            },
            {
                title: "QR and link management belong together",
                problem:
                    "Teams often create a short link in one tool, a QR code in another, and then lose analytics once the code is printed.",
                approach:
                    "Made QR generation a first-class part of each link so the short URL, QR asset, and analytics all point to the same campaign object.",
                outcome:
                    "A link can move between web, slides, packaging, and print without losing measurement.",
            },
            {
                title: "Privacy-first analytics",
                problem:
                    "Analytics products can drift into invasive tracking. A small link platform needs useful insight while respecting visitor data.",
                approach:
                    "Kept the product language and architecture focused on hashed IPs, campaign attribution, aggregate breakdowns, and ownership on Cloudflare's edge.",
                outcome:
                    "The reporting model stays useful for creators and marketers without leaning on third-party tracker behavior.",
            },
        ],
        learnings: [
            "A redirect product is infrastructure and UX at the same time.",
            "QR codes are more valuable when they inherit analytics, targeting, and controls from the link object.",
            "Edge-native storage and compute fit link management because latency is part of the product.",
        ],
        vlog: [
            {
                date: "Build note 01",
                title: "The redirect path had to be small",
                body: "Every extra decision in the redirect path shows up as latency, so the analytics and controls have to be designed around a fast hot path.",
            },
            {
                date: "Build note 02",
                title: "Analytics made the link feel alive",
                body: "Country, device, referrer, and UTM breakdowns turn a short URL from a convenience feature into a campaign object.",
            },
            {
                date: "Build note 03",
                title: "QR was not an add-on",
                body: "Once every link has a QR code, physical sharing and digital sharing become two views of the same object instead of separate workflows.",
            },
        ],
    },
}

export function getProjectDetail(slug: string): ProjectDetail | undefined {
    return projectDetails[slug]
}
