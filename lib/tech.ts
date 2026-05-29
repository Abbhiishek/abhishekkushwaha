import {
    Camera,
    Cloud,
    Database,
    Globe,
    Keyboard,
    Laptop,
    Layers,
    Mic,
    Monitor,
    Mouse,
    Package,
    Sparkles,
    Terminal,
    Video,
    Workflow,
    type LucideIcon,
} from "lucide-react"
import type { IconType } from "react-icons"
import {
    SiAnthropic,
    SiCloudflare,
    SiDocker,
    SiDrizzle,
    SiGithubactions,
    SiKubernetes,
    SiLinear,
    SiNextdotjs,
    SiNodedotjs,
    SiOpenai,
    SiPostgresql,
    SiPython,
    SiRaycast,
    SiReact,
    SiRedis,
    SiRust,
    SiTailwindcss,
    SiTauri,
    SiTypescript,
} from "react-icons/si"
import { VscAzure, VscVscode } from "react-icons/vsc"

type AnyIcon = LucideIcon | IconType

export interface TechItem {
    name: string
    detail?: string
    note?: string
    purpose?: string
    url?: string
    icon?: AnyIcon
}

export interface TechSection {
    id: string
    title: string
    blurb: string
    items: TechItem[]
}

export const gadgets: TechSection[] = [
    {
        id: "compute",
        title: "Compute",
        blurb: "What I write all my code on.",
        items: [
            {
                name: "Lenovo Legion 7 Slim",
                detail: "Daily driver · 2022",
                purpose: "Primary work machine — full-stack dev, voice pipelines, evals",
                note: "Held up well since 2022. Single-machine setup keeps the dev environment honest.",
                icon: Laptop,
            },
        ],
    },
    {
        id: "display",
        title: "Display",
        blurb: "What I look at all day.",
        items: [
            {
                name: "BenQ 27\" 2K",
                detail: "2560×1440 · IPS",
                purpose: "External monitor for the laptop",
                note: "2K at 27\" is the sweet spot — editor density without scaling pain.",
                icon: Monitor,
            },
        ],
    },
    {
        id: "input",
        title: "Input",
        blurb: "Keyboards and mouse on rotation.",
        items: [
            {
                name: "Keychron K2 v2",
                detail: "75% · hot-swap",
                purpose: "Daily-driver keyboard",
                icon: Keyboard,
            },
            {
                name: "Aula F75",
                detail: "75% · gasket-mounted",
                purpose: "Second board on rotation",
                icon: Keyboard,
            },
            {
                name: "Quantronix mouse",
                detail: "Wired",
                purpose: "Plain, predictable, replaceable",
                icon: Mouse,
            },
        ],
    },
    {
        id: "capture",
        title: "Capture",
        blurb: "Camera and audio for calls, recordings, and the occasional talk.",
        items: [
            {
                name: "Lenovo webcam",
                detail: "USB",
                purpose: "Default for everyday calls",
                icon: Video,
            },
            {
                name: "Sony ZV-E10 II",
                detail: "APS-C mirrorless · 4K",
                purpose: "Conference talks, recorded demos, the occasional vlog",
                icon: Camera,
            },
            {
                name: "DJI Mic Mini",
                detail: "Wireless lav",
                purpose: "On-camera audio when the laptop mic won't do",
                icon: Mic,
            },
            {
                name: "Krio mic",
                detail: "USB / desk",
                purpose: "Voiceovers and longer recordings",
                icon: Mic,
            },
        ],
    },
]

export const tools: TechSection[] = [
    {
        id: "ai-harness",
        title: "AI harness",
        blurb: "How I write code with AI in the loop.",
        items: [
            {
                name: "Claude Code",
                purpose: "Primary harness — long-context reasoning over real codebases",
                url: "https://claude.com/claude-code",
                icon: SiAnthropic,
            },
            {
                name: "Codex",
                purpose: "Secondary harness when I want a different planner in the loop",
                url: "https://openai.com/codex",
                icon: SiOpenai,
            },
        ],
    },
    {
        id: "llm-infra",
        title: "LLM infrastructure",
        blurb: "What ships into HyrecruitAI's voice and evaluation surfaces.",
        items: [
            {
                name: "Azure",
                purpose: "Production model hosting and managed services",
                url: "https://azure.microsoft.com",
                icon: VscAzure,
            },
            {
                name: "OpenAI",
                purpose: "Whisper for transcription, GPT-class fallback",
                url: "https://platform.openai.com",
                icon: SiOpenai,
            },
            {
                name: "Self-hosted inference",
                purpose: "Cost control for bulk workloads",
                icon: Sparkles,
            },
        ],
    },
    {
        id: "vector",
        title: "Vector databases",
        blurb: "Where embeddings live in production.",
        items: [
            {
                name: "Azure AI Search",
                purpose: "Primary — managed, integrates with the rest of the stack",
                url: "https://azure.microsoft.com/products/ai-services/ai-search",
                icon: VscAzure,
            },
            {
                name: "pgvector",
                purpose: "When embeddings should live next to the relational data",
                url: "https://github.com/pgvector/pgvector",
                icon: SiPostgresql,
            },
            {
                name: "Pinecone",
                purpose: "Fallback when managed-everything is the right call",
                url: "https://pinecone.io",
                icon: Database,
            },
        ],
    },
    {
        id: "daily",
        title: "Daily tooling",
        blurb: "What sits on the dock.",
        items: [
            {
                name: "VS Code",
                purpose: "Editor",
                url: "https://code.visualstudio.com",
                icon: VscVscode,
            },
            {
                name: "Raycast",
                purpose: "Launcher, clipboard history, window management",
                url: "https://raycast.com",
                icon: SiRaycast,
            },
            {
                name: "Linear",
                purpose: "Tickets, planning, a clean backlog",
                url: "https://linear.app",
                icon: SiLinear,
            },
        ],
    },
]

export const stack: TechSection[] = [
    {
        id: "languages",
        title: "Languages",
        blurb: "Where I spend keystrokes.",
        items: [
            { name: "TypeScript", purpose: "Default for product and API code", icon: SiTypescript },
            { name: "Python", purpose: "ML, eval scripts, data pipelines", icon: SiPython },
            { name: "Rust", purpose: "Learning — currently rebuilding a side tool to learn the patterns", icon: SiRust },
        ],
    },
    {
        id: "product",
        title: "Product",
        blurb: "Frameworks for the user-facing surface.",
        items: [
            { name: "Next.js", purpose: "App Router + server components by default", icon: SiNextdotjs },
            { name: "Tauri", purpose: "Desktop apps when web isn't the right surface", icon: SiTauri },
            { name: "React Native", purpose: "Mobile when web won't carry it", icon: SiReact },
            { name: "Tailwind CSS", purpose: "Styling — design tokens via config, no CSS-in-JS", icon: SiTailwindcss },
        ],
    },
    {
        id: "backend",
        title: "Backend & data",
        blurb: "Everything below the API line.",
        items: [
            { name: "Node.js", purpose: "Application runtime", icon: SiNodedotjs },
            { name: "Drizzle ORM", purpose: "Type-safe DB layer with predictable migrations", icon: SiDrizzle },
            { name: "Redis", purpose: "Cache + queues", icon: SiRedis },
            { name: "PostgreSQL", purpose: "Source of truth — relational + vector", icon: SiPostgresql },
            { name: "Trigger.dev", purpose: "Background jobs and long-running workflows", url: "https://trigger.dev", icon: Workflow },
        ],
    },
    {
        id: "infra",
        title: "Infra & ops",
        blurb: "How it all stays up.",
        items: [
            { name: "Azure", purpose: "Production workloads", icon: VscAzure },
            { name: "Docker + Compose", purpose: "Dev parity and local services", icon: SiDocker },
            { name: "GitHub Actions", purpose: "CI/CD", icon: SiGithubactions },
            { name: "Cloudflare", purpose: "DNS, edge, and blob storage", icon: SiCloudflare },
            { name: "Kubernetes", purpose: "Cluster orchestration where it earns its weight", icon: SiKubernetes },
        ],
    },
]

// re-exported for occasional use
export { Cloud, Globe, Layers, Package, Terminal }
