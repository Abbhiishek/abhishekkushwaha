export type ReadingStatus = "reading" | "completed" | "want-to-read"

export interface BookItem {
    title: string
    author: string
    status: ReadingStatus
    type: "book" | "blog" | "paper"
    url?: string
    cover?: string
    note?: string
    topic?: string
}

export const bookshelf: BookItem[] = [
    {
        title: "The Architecture of Open Source Applications",
        author: "Various Authors",
        status: "reading",
        type: "blog",
        url: "https://aosabook.org/en/",
        topic: "Systems",
        cover: "https://aosabook.org/images/v1-cover-front.jpg",
        note: "Deep dives into real-world open source architectures — the closest thing to reading other engineers' design docs.",
    },
    {
        title: "How to Build a Startup Engineering Team",
        author: "Increment Magazine",
        status: "reading",
        type: "blog",
        url: "https://increment.com/teams/",
        topic: "Leadership",
        note: "Perspective on hiring and team culture at early stage. Useful while scaling out HyrecruitAI's engineering org.",
    },
]

export function getBooksByStatus(status: ReadingStatus): BookItem[] {
    return bookshelf.filter((b) => b.status === status)
}
