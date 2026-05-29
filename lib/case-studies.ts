export type CaseStudyStatus = "shipped" | "ongoing" | "experiment"

export interface CaseStudyMetric {
    label: string
    value: string
}

export interface CaseStudy {
    id: string
    badge: string
    title: string
    summary: string
    systems: string[]
    metrics: CaseStudyMetric[]
    status: CaseStudyStatus
    readMore?: {
        label: string
        href: string
    }
}

export const caseStudies: CaseStudy[] = [
    {
        id: "azure-hybrid-search",
        badge: "Search infrastructure",
        title: "Hybrid search without hand-waving",
        summary:
            "How I would structure Azure AI Search for real products: BM25, vector retrieval, semantic ranker, filters, scoring profiles, and evaluation loops that keep relevance honest.",
        systems: ["Azure AI Search", "BM25", "Vectors", "Semantic ranker"],
        metrics: [
            { label: "Retrieval modes", value: "3" },
            { label: "Eval loop", value: "Required" },
        ],
        status: "shipped",
        readMore: {
            label: "Read the search blueprint",
            href: "/blog/hybrid-search-azure-ai-search",
        },
    },
    {
        id: "home-arr-lab",
        badge: "Systems lab",
        title: "The home ARR stack",
        summary:
            "A practical map of a self-hosted media automation stack: Jellyfin, Jellyseerr, Sonarr, Radarr, indexers, download clients, naming rules, and failure boundaries.",
        systems: ["Jellyfin", "Jellyseerr", "Sonarr", "Radarr"],
        metrics: [
            { label: "Queues", value: "Automated" },
            { label: "Ops lesson", value: "High" },
        ],
        status: "experiment",
        readMore: {
            label: "Read the stack notes",
            href: "/blog/home-arr-stack-jellyfin-jellyseerr",
        },
    },
    {
        id: "flash-talent-search",
        badge: "Product architecture",
        title: "Flash: talent search at scale",
        summary:
            "A case-study style breakdown of Flash, a talent search and recommendation platform built around candidate signals, recruiter workflows, ranking, and scale.",
        systems: ["Recommendations", "Search", "Ranking", "Recruiter UX"],
        metrics: [
            { label: "Core surface", value: "Search" },
            { label: "Scale shape", value: "Multi-tenant" },
        ],
        status: "shipped",
        readMore: {
            label: "Open the case study",
            href: "/blog/flash-talent-search-scale",
        },
    },
    {
        id: "ranking-loops",
        badge: "AI product thinking",
        title: "Ranking loops that learn",
        summary:
            "Why search quality is not just a model choice. The product needs feedback capture, judgment labels, exploration, offline evals, and a way to improve without surprising users.",
        systems: ["Feedback loops", "Offline evals", "Reranking", "Trust"],
        metrics: [
            { label: "Best signal", value: "Human action" },
            { label: "Risk", value: "Silent drift" },
        ],
        status: "ongoing",
        readMore: {
            label: "Read the relevance essay",
            href: "/blog/ranking-loops-that-learn",
        },
    },
]

export const proofRails = {
    systems: [
        { label: "Voice pipeline", note: "Sub-second turn-taking" },
        { label: "LLM evaluation", note: "Rubric pipelines + eval harness" },
        { label: "Guardrails", note: "Production content policy" },
        { label: "Embeddings", note: "pgvector + reranker" },
        { label: "WebRTC", note: "Real-time video at scale" },
        { label: "Multi-tenant SaaS", note: "Isolated by design" },
        { label: "Product UI", note: "Next.js, design systems" },
        { label: "Developer tooling", note: "CLIs, SDKs, OSS" },
    ],
    authority: [
        { label: "Writing", value: "20+ posts", note: "Voice agents, LLM evals, semantic caching" },
        { label: "Community", value: "400+ devs", note: "GDSC Lead, GitHub Campus Expert" },
        { label: "Talks", value: "AI agents", note: "Practitioner talks for engineers" },
    ],
}
