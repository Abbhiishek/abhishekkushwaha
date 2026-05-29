export interface WorkExperience {
    company: string
    logo: string
    role: string
    type: "Full-time" | "Internship" | "Contract" | "Freelance" | "Volunteer"
    duration: string
    location: string
    url?: string
    description: string[]
    owned?: string[]
    systems?: string[]
    constraints?: string[]
    impact?: string[]
}

export const workExperiences: WorkExperience[] = [
    {
        company: "HyrecruitAI",
        logo: "/logos/hyrecruitai_logo.jpg",
        role: "CTO & Co-founder",
        type: "Full-time",
        duration: "2024 - Present",
        location: "India · Remote",
        url: "https://hyrecruitai.com",
        description: [
            "Leading engineering for an AI-powered interview platform. The job covers the whole stack — voice pipelines, LLM evaluation, multi-tenant SaaS, billing, and the team that ships it all.",
        ],
        owned: [
            "Entire engineering org and the technical roadmap",
            "AI product surface — voice agent, evaluation, guardrails",
            "Infrastructure — multi-tenant SaaS, observability, on-call",
            "Hiring and engineering process — RFCs, code review, postmortems",
        ],
        systems: [
            "Real-time voice agent (Whisper + WebSocket + LLM turn-taking)",
            "LLM evaluation engine with rubric pipelines",
            "Multi-layer guardrails between LLM and candidate UI",
            "pgvector + Redis semantic cache for LLM inference",
            "Embedding-based candidate-to-job matching with reranker",
            "WebRTC video stack with TURN/STUN and recording",
            "Multi-tenant data isolation and per-tenant configuration",
        ],
        constraints: [
            "Sub-second voice turn latency or candidates drop the call",
            "Zero tolerance for bias or PII leaks in candidate-facing AI",
            "LLM costs that scale linearly with active interview load",
            "Tenant isolation strong enough for enterprise procurement",
        ],
        impact: [
            "Scaled the engineering team from 2 to 15 engineers",
            "Cut LLM inference cost 58% via two-layer semantic caching",
            "Lifted interview completion rate from 34% to 71% after shipping voice",
            "Brought top-10 candidate match precision from 34% to 81%",
        ],
    },
    {
        company: "Keploy",
        logo: "/logos/keploy_logo.jpg",
        role: "Developer Relations Intern",
        type: "Internship",
        duration: "Aug 2024 - Oct 2024 · 3 mos",
        location: "Bengaluru, Karnataka, India · Remote",
        url: "https://keploy.io",
        description: [
            "Drove developer advocacy and community engagement for Keploy's open-source API testing platform. Wrote technical content and built reference demos that helped developers adopt the product.",
        ],
    },
    {
        company: "Training Mug",
        logo: "/logos/trainingmug.jpg",
        role: "Frontend Developer Intern",
        type: "Internship",
        duration: "2023",
        location: "India · Remote",
        url: "https://www.linkedin.com/company/trainingmug/",
        description: [
            "Improved dashboard performance by 50% and reduced API calls by 90%. Built an AI chat support system on Azure AI that joined learner data and course content for personalized assistance.",
            "Shipped a progress-tracking system aligned with student profiles, and an online IDE with strict testcase evaluation for playground projects.",
        ],
    },
    {
        company: "J.P. Morgan (Forage)",
        logo: "/logos/theforage_logo.jpg",
        role: "Software Engineering Virtual Experience",
        type: "Internship",
        duration: "May 2024",
        location: "Virtual",
        description: [
            "Set up a local dev environment and fixed broken repository files. Used JPMorgan Chase's open-source Perspective library to render live trading data feeds as actionable charts.",
        ],
    },
    {
        company: "Kishalay Foundation",
        logo: "/logos/Kishalay Foundation.jpg",
        role: "Website Developer",
        type: "Freelance",
        duration: "Nov 2023 - Feb 2024",
        location: "India",
        description: [
            "Designed and built a full ecommerce site for Kishalay Organics — product management, payment processing, and customer support, end to end.",
        ],
    },
    {
        company: "Google DSC JIS University",
        logo: "/logos/gdsc_jisu.jpg",
        role: "Google Developer Student Club Lead",
        type: "Volunteer",
        duration: "Jul 2022 - Apr 2023",
        location: "Kolkata, India",
        description: [
            "Built and led a tech community of 400+ students. Ran workshops, hackathons, and study groups in collaboration with other GDSC Leads and Google Developer Experts.",
            "Mentored student developers and brought in industry practitioners so the community had real-world context, not just textbook material.",
        ],
    },
    {
        company: "Scaler Academy",
        logo: "/logos/scaler.jpg",
        role: "Technical Content Writer - Python",
        type: "Contract",
        duration: "May 2022 - Jan 2023",
        location: "India · Remote",
        description: [
            "Wrote tutorials, articles, and guides on Python that helped readers move from beginner to intermediate skill levels.",
        ],
    },
]
