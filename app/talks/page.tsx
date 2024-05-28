
function Talks() {
    return (
        <div className="w-full min-h-screen h-full p-8 flex flex-col items-center relative">
            <section className="flex flex-col w-full justify-between mt-16 lg:mt-0 md:mt-0  gap-6 mb-12">
                <div>
                    <h1 className="dark:text-zinc-200 text-zinc-900 leading-none mb-3 text-6xl font-adlam">Talks</h1>
                    <p className="dark:text-zinc-400 text-zinc-800 m-0 leading-tight">
                        I&rsquo;ve been giving talks at various events and conferences. Here is a list of all the talks I&rsquo;ve given so far.
                    </p>
                </div>
                <div className="grid grid-cols-3 gap-4 max-w-7xl mx-auto w-full">
                </div>
            </section>
        </div>
    )
}

export default Talks