import fs from 'fs';
import { Metadata } from "next";
import showdown from "showdown";


export const metadata: Metadata = {
    title: "Work",
    description: "A summary of my work and contributions.",
    keywords: "about, abhishek kushwaha, abbhiishek, abbhiishek.dev, abbhiishek.github.io, abbhiishek.com, abbhiishek.dev/about, abbhiishek.github.io/about, abbhiishek.com/about",
}



async function Work() {

    const work = await getData();
    return (
        <div className="w-full min-h-screen h-full p-8 flex flex-col items-center relative">
            <section className="flex flex-col w-full justify-between mt-16 lg:mt-0 md:mt-0  gap-6 mb-12">
                <div>
                    <h1 className="dark:text-zinc-200 text-zinc-900 leading-none mb-3 text-6xl font-adlam">Work</h1>
                    <p className="dark:text-zinc-400 text-zinc-800 m-0 leading-tight">
                        Here are some of my work.
                    </p>
                </div>
                <div
                    className="prose w-full prose-zinc dark:prose-invert leading-1 prose-h1:mb-0 prose-h2:mt-0 prose-h3:mt-0 dark:prose-h1:text-zinc-200 prose-h1:text-zinc-900 prose-h4:font-normal prose-p:text-base dark:prose-h2:text-zinc-300 prose-h2:text-zinc-800 dark:prose-h3:text-zinc-400 prose-h3:text-zinc-800 prose-h4:mt-0 dark:prose-h4:text-zinc-400 prose-h4:text-zinc-700 prose-h4:mb-4 prose-p:text-zinc-700 dark:prose-p:text-zinc-200 prose-a:decoration-wavy prose-a:underline-offset-2 prose-code:px-1 prose-code:rounded-sm prose-code:bg-zinc-400/60 dark:prose-code:bg-zinc-400/20 prose-code:font-normal "
                    dangerouslySetInnerHTML={{ __html: work.html }}
                />
            </section>
        </div>
    )
}

export default Work


async function getData() {
    const markdown = fs.readFileSync('./content/work.md', 'utf8');
    const converter = new showdown.Converter({ metadata: true });
    const html = converter.makeHtml(markdown);

    return {
        html
    };
}