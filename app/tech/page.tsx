
function TechIUse() {
    return (
        <div className="w-full min-h-screen h-full p-8 flex flex-col items-center relative">
            <section className="flex flex-col w-full justify-between mt-16 lg:mt-0 md:mt-0  gap-6 mb-12">
                <div>
                    <h1
                        className="dark:text-zinc-200 text-zinc-900 leading-none mb-3 text-6xl font-adlam">
                        A curated list of the tech
                    </h1>
                    <p
                        className="dark:text-zinc-400 text-zinc-800 m-0 leading-tight">
                        As an indie developer, I&rsquo;ve been spending hours and hours at my desk every day.
                        So, I&rsquo;ve been continuously improving my workspace in order to boost my productivity.
                        Whenever I upload new content, people ask me what tools I use.
                        So, here is a living snapshot and a place to point curious developers to when I get asked.
                        <br />
                        (I&rsquo;ll keep this list updated as I change my setup.)
                    </p>
                </div>
                <div className="grid grid-cols-3 gap-4 max-w-7xl mx-auto w-full">
                </div>
            </section>
        </div>
    )
}

export default TechIUse
