
import { BookOpen, BriefcaseBusiness, Code, Flame, Home, Library, MicVocal, Paperclip, PenLine, User } from "lucide-react";

export const NavbarItems = [
    {
        name: "Home",
        slug: "/",
        icon: Home,
    },
    {
        name: "About",
        slug: "/about",
        icon: User,
    },
    {
        name: "Projects",
        slug: "/project",
        icon: Code,
    },
    {
        name: "Blogs",
        slug: "/blog",
        icon: PenLine,
    },
    {
        name: "Bookshelf",
        slug: "/bookshelf",
        icon: Library,
    },
    {
        name: "Tech",
        slug: "/tech",
        icon: Flame,
    },
    // {
    //     name: "Talks",
    //     slug: "/talks",
    //     icon: MicVocal,
    // },
    {
        name: "Links",
        slug: "/links",
        icon: Paperclip,
    },
    {
        name: "Work",
        slug: "/work",
        icon: BriefcaseBusiness,
    },
];
