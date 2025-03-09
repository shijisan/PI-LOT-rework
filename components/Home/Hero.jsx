"use client"


import { useRouter } from "next/navigation"

export default function HomeHero(){

    const router = useRouter();

    return(
        <>
        <header className="flex md:flex-row flex-col min-h-screen">
            <div className="md:w-1/2 w-full flex items-center justify-center">
                <div className="max-w-md">
                    <h1 className="text-7xl">All-in-one
                    <br />
                    Automation?
                    <br />
                        try <span className="poppins text-yellow-400">PI.LOT!</span>
                    </h1>
                    <p className="mt-8">
                        Are you a business or individual looking for an all-in-one solution to meet all your needs? PI.LOT has got you covered! Sign up now and enjoy a 7-week free trial.
                    </p>
                    <div className="mt-8">
                        <button className="btn-primary" onClick={() => router.push("/register")}>
                            Try our 7 day Free Trial
                        </button>
                    </div>
                </div>
            </div>
            <div className="md:w-1/2 w-full flex items-center justify-center">
                <img className="rounded-lg" src="https://placehold.co/500/webp?text=your-logo-here" alt="" />
            </div>
        </header>
        </>
    )
}