"use client";

export default function Home() {
    return (
        <>
            <div className="container relative mx-auto p-6">
                <section id="hero">
                    <div className="mx-auto w-full max-w-screen-xl pt-0 pb-10 sm:pt-20">
                        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
                            <div className="flex flex-col items-center justify-center md:col-span-7">
                                <h2 className="max-w-6xl text-6xl font-bold tracking-tight text-white md:tracking-wider lg:text-center lg:text-7xl">
                                    <span className="bg-gradient-to-r from-indigo-500 to-green-600 bg-clip-text text-transparent">
                                        Welcome to Ground Work Finding Leads for Contractors
                                    </span>
                                </h2>

                                <div className="mt-10 flex md:hidden">
                                    <div className="">
                                        <img
                                            src="/tools.jpg"
                                            alt="Social markplace for lending"
                                            className="aspect-square relative max-h-96 max-w-xs rounded-lg object-cover object-center shadow-lg"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="hidden md:col-span-5 md:col-start-8 md:flex">
                                <div className="">
                                    <img
                                        src="/tools.jpg"
                                        alt="Social markplace for lending"
                                        className="aspect-square relative rounded-lg object-cover object-center shadow-lg md:h-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
