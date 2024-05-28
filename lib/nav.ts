
import { Bookmark, BriefcaseBusiness, Code, Flame, GraduationCap, Home, MicVocal, Paperclip, User } from "lucide-react";


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
        name: "Education",
        slug: "/education",
        icon: GraduationCap,
    },
    {
        name: "Work",
        slug: "/work",
        icon: BriefcaseBusiness,
    },
    {
        name: "Links",
        slug: "/links",
        icon: Paperclip,
    },
    {
        name: "Blogs",
        slug: "/blog",
        icon: Bookmark,
    },
    {
        name: "Projects",
        slug: "/project",
        icon: Code,
    },
    {
        name: "Tech",
        slug: "/tech",
        icon: Flame,
    },
    {
        name: "Talks",
        slug: "/talks",
        icon: MicVocal,
    }
];
