const educations = [
    {
        degree: 'Bachelor Degree in Computer Science & Engineering',
        school: 'JIS University, West Bengal',
        year: '(2021 - 2025)',
    },
]

function Educations() {
    return (
        <div className="w-full min-h-screen h-full p-8 flex flex-col items-center relative">
            <section className="flex flex-col w-full justify-between mt-16 lg:mt-0 md:mt-0  gap-6 mb-12">
                <div>
                    <h1 className="dark:text-zinc-200 text-zinc-900 leading-none mb-3 text-6xl font-adlam">Degree</h1>
                    <p className="dark:text-zinc-400 text-zinc-800 m-0 leading-tight">
                        Here are some of my degree.
                    </p>
                </div>
                <div className="after:absolute after:inset-y-0 after:w-px after:bg-gray-500/20 relative pl-6 after:left-0 grid gap-10 dark:after:bg-gray-400/20">

                    {educations.map((education, index) => (
                        <div className="grid gap-1 text-sm relative" key={index}>
                            <div className="aspect-square w-3 bg-gray-900 rounded-full absolute left-0 translate-x-[-29.5px] z-10 top-1 dark:bg-gray-50" />
                            <div className="font-medium">{education.year} - {education.degree}</div>
                            <div className="text-gray-500 dark:text-gray-400 font-clash">{education.school}</div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

export default Educations