import {
    FiBookmark,
    FiCode,
    FiHome,
    FiPaperclip,
    FiUser
} from "react-icons/fi";

export const actions = [
    {
        id: "home",
        name: "Home",
        shortcut: ["h"],
        keywords: "home",
        perform: () => (window.location.pathname = "/"),
        section: "Navigation",
        icon: FiHome({ size: "1rem" }),
    },
    {
        id: "about",
        name: "About",
        shortcut: ["a"],
        keywords: "about",
        perform: () => (window.location.pathname = "/about"),
        section: "Navigation",
        icon: FiUser({ size: "1rem" }),
    },
    {
        id: "links",
        name: "Links",
        shortcut: ["l"],
        keywords: "email link discord twitter github",
        perform: () => (window.location.pathname = "/links"),
        section: "Navigation",
        icon: FiPaperclip({ size: "1rem" }),
    },
    {
        id: "blog",
        name: "Blog",
        shortcut: ["b"],
        keywords: "writing words article",
        perform: () => (window.location.pathname = "/blog"),
        section: "Navigation",
        icon: FiBookmark({ size: "1rem" }),
    },
    {
        id: "projects",
        name: "Projects",
        shortcut: ["p"],
        keywords: "projects",
        perform: () => (window.location.pathname = "/project"),
        section: "Navigation",
        icon: FiCode({ size: "1rem" }),
    },
];
