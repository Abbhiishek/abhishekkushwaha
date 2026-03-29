export interface WorkExperience {
    company: string
    logo: string
    role: string
    type: "Full-time" | "Internship" | "Contract" | "Freelance" | "Volunteer"
    duration: string
    location: string
    url?: string
    description: string[]
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
            "Leading engineering and product development for an AI-powered interview and assessment platform. Architecting the full technical stack including real-time video pipeline, LLM evaluation engine, and multi-tenant SaaS infrastructure.",
            "Scaled the engineering team from 2 to 15 engineers. Established engineering processes including CI/CD, RFC-driven development, and blameless postmortems.",
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
            "Worked on developer advocacy and community engagement for Keploy's open-source API testing platform. Created technical content, demos, and tutorials to help developers adopt the platform.",
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
            "Improved dashboard performance by 50% and reduced API calls by 90%. Built an AI chat support system using Azure AI, integrating learner data and course content for personalized assistance.",
            "Developed a progress tracking system for daily tasks aligned with student profiles, and an online IDE with strict testcase evaluation for playground projects.",
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
            "Set up a local dev environment and fixed broken repository files. Used JPMorgan Chase's open-source Perspective library to generate live graphs displaying data feeds for traders.",
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
            "Designed and developed a fully functional ecommerce website for Kishalay Organics, implementing product management, payment processing, and customer support features.",
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
            "Built and led a vibrant tech community of 400+ students. Organized regular events, workshops, and hackathons in collaboration with other GDSC Leads and Google Developer Experts.",
            "Mentored student developers and liaised with industry experts to bring real-world insights and best practices to the campus community.",
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
            "Created high-quality tutorials, articles, and guides on Python programming, helping readers learn new concepts and improve their skills.",
        ],
    },
]
