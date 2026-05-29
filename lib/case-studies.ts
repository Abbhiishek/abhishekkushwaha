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
        id: "voice-agent",
        badge: "HyrecruitAI · Production",
        title: "Real-time voice agent for live interviews",
        summary:
            "Designed and shipped the voice pipeline that runs HyrecruitAI's AI interviewer — streaming audio, Whisper transcription, and turn-by-turn LLM orchestration under an 800ms ceiling.",
        systems: ["Voice pipeline", "Whisper", "WebSockets", "LLM turn-taking"],
        metrics: [
            { label: "Turn latency p95", value: "780ms" },
            { label: "Completion rate", value: "34% → 71%" },
        ],
        status: "shipped",
        readMore: {
            label: "Read the engineering deep-dive",
            href: "/blog/voice-agent-ai-interviews",
        },
    },
    {
        id: "llm-evaluation",
        badge: "HyrecruitAI · Production",
        title: "LLM evaluation engine for interview scoring",
        summary:
            "Replaced single-prompt scoring with a multi-pass rubric pipeline. Closes the consistency gap between human raters and the model on real interview transcripts.",
        systems: ["Rubric design", "Prompt engineering", "Bias mitigation", "Eval harness"],
        metrics: [
            { label: "Score variance vs. panel", value: "−47%" },
            { label: "Rubric coverage", value: "12 dimensions" },
        ],
        status: "ongoing",
        readMore: {
            label: "How we built the eval engine",
            href: "/blog/llm-evaluation-engine",
        },
    },
    {
        id: "semantic-cache",
        badge: "HyrecruitAI · Production",
        title: "Two-layer semantic cache for LLM inference",
        summary:
            "Built a pgvector + Redis cache that recognises near-duplicate prompts across 4,000+ active interviews. Cut LLM spend without measurable quality drift.",
        systems: ["pgvector", "Redis", "Embeddings", "Cache invalidation"],
        metrics: [
            { label: "LLM cost", value: "−58%" },
            { label: "Cache hit rate", value: "62%" },
        ],
        status: "shipped",
        readMore: {
            label: "Semantic caching deep-dive",
            href: "/blog/semantic-caching-llm-responses",
        },
    },
    {
        id: "guardrails",
        badge: "HyrecruitAI · Production",
        title: "Multi-layer guardrails for candidate-facing LLM output",
        summary:
            "After a bias incident in production, designed a content-policy layer that sits between every LLM call and the candidate UI. Catches PII, bias, off-script behavior, and unsafe completions before they ship.",
        systems: ["Content policy", "Eval suite", "Regression tests", "TypeScript"],
        metrics: [
            { label: "Unsafe completions", value: "−98%" },
            { label: "Policy checks", value: "9 layers" },
        ],
        status: "shipped",
        readMore: {
            label: "Building AI guardrails in production",
            href: "/blog/ai-guardrails-llm-responses",
        },
    },
    {
        id: "embeddings-match",
        badge: "HyrecruitAI · Production",
        title: "Embedding-based candidate-to-job matching",
        summary:
            "Replaced keyword filters with vector embeddings across resumes and job descriptions. Reframed the matching problem as semantic similarity with a hand-tuned reranker on top.",
        systems: ["Embeddings", "pgvector", "Reranker", "Search relevance"],
        metrics: [
            { label: "Top-10 precision", value: "34% → 81%" },
            { label: "Recruiter review time", value: "40m → 8m" },
        ],
        status: "shipped",
        readMore: {
            label: "Inside the matching system",
            href: "/blog/embedding-candidate-job-matching",
        },
    },
    {
        id: "webrtc-video",
        badge: "HyrecruitAI · Production",
        title: "Reliable WebRTC video for live interviews",
        summary:
            "Owned the video stack end-to-end — signaling, TURN/STUN, network resilience, and recording. Treated video as a first-class product surface because a dropped call means a failed interview.",
        systems: ["WebRTC", "TURN/STUN", "Recording", "Network resilience"],
        metrics: [
            { label: "Session drop rate", value: "< 0.4%" },
            { label: "Median join time", value: "1.9s" },
        ],
        status: "shipped",
        readMore: {
            label: "Building real-time video with WebRTC",
            href: "/blog/real-time-video-webrtc",
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
