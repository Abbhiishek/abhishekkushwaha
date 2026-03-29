export type ReadingStatus = "reading" | "completed" | "want-to-read"

export interface BookItem {
    title: string
    author: string
    status: ReadingStatus
    type: "book" | "blog" | "paper"
    url?: string
    cover?: string
    note?: string
}

export const bookshelf: BookItem[] = [
    {
        title: "The Hard Thing About Hard Things",
        author: "Ben Horowitz",
        status: "reading",
        type: "book",
        note: "Every chapter hits differently when you are living the startup grind.",
    },
    {
        title: "Designing Data-Intensive Applications",
        author: "Martin Kleppmann",
        status: "completed",
        type: "book",
        note: "The bible for system design. Re-read chapters on replication and partitioning regularly.",
    },
    {
        title: "The Pragmatic Programmer",
        author: "David Thomas & Andrew Hunt",
        status: "completed",
        type: "book",
        note: "Shaped how I think about software craftsmanship early in my career.",
    },
    {
        title: "Zero to One",
        author: "Peter Thiel",
        status: "completed",
        type: "book",
        note: "Reframed how I think about building something truly new vs. iterating.",
    },
    {
        title: "System Design Interview",
        author: "Alex Xu",
        status: "completed",
        type: "book",
        note: "Practical reference for distributed systems patterns.",
    },
    {
        title: "The Manager's Path",
        author: "Camille Fournier",
        status: "want-to-read",
        type: "book",
        note: "Next on the list — transitioning from IC to engineering leadership.",
    },
    {
        title: "How to Build a Startup Engineering Team",
        author: "Increment Magazine",
        status: "completed",
        type: "blog",
        url: "https://increment.com/teams/",
        note: "Great perspective on hiring and team culture at early stage.",
    },
    {
        title: "The Architecture of Open Source Applications",
        author: "Various Authors",
        status: "reading",
        type: "blog",
        url: "https://aosabook.org/en/",
        note: "Deep dives into real-world open source architectures.",
    },
]

export function getBooksByStatus(status: ReadingStatus): BookItem[] {
    return bookshelf.filter((b) => b.status === status)
}
