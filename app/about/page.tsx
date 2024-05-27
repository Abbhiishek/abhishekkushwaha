import { LayoutGrid } from "@/components/ui/layout-grid";
import fs from 'fs';
import showdown from "showdown";

const pics = [
    {
        id: 1,
        className: "md:col-span-2",
        thumbnail:
            "/about1/png",
    },
    {
        id: 2,
        className: "col-span-1",
        thumbnail:
            "/about2/png",
    },
    {
        id: 3,
        className: "col-span-1",
        thumbnail:
            "/about3/png",
    },
    {
        id: 4,
        className: "md:col-span-2",
        thumbnail:
            "/about4/png",
    },
];


export default async function About() {

    const about = await getData();

    return (
        <div className="w-full h-full flex flex-col items-center relative mt-10">
            <section className="flex flex-col w-full justify-between mt-16 prose lg:mt-0 md:mt-0 mb-12">
                <div
                    className="prose w-full prose-zinc dark:prose-invert leading-1 prose-h1:mb-0 prose-h2:mt-0 prose-h3:mt-0 dark:prose-h1:text-zinc-200 prose-h1:text-zinc-900 prose-h4:font-normal prose-p:text-base dark:prose-h2:text-zinc-300 prose-h2:text-zinc-800 dark:prose-h3:text-zinc-400 prose-h3:text-zinc-800 prose-h4:mt-0 dark:prose-h4:text-zinc-400 prose-h4:text-zinc-700 prose-h4:mb-4 prose-p:text-zinc-700 dark:prose-p:text-zinc-200 prose-a:decoration-wavy prose-a:underline-offset-2 prose-code:px-1 prose-code:rounded-sm prose-code:bg-zinc-400/60 dark:prose-code:bg-zinc-400/20 prose-code:font-normal "
                    dangerouslySetInnerHTML={{ __html: about.html }}
                />
            </section>
            <div className="h-[700px] w-full">
                <LayoutGrid cards={pics} />
            </div>
        </div>
    );
}




export async function getData() {
    const markdown = fs.readFileSync('./content/about.md', 'utf8');
    const converter = new showdown.Converter({ metadata: true });
    const html = converter.makeHtml(markdown);

    return {
        html
    };
}