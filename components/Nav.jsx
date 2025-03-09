"use client"

import { useRouter } from "next/navigation"

export default function Nav(){

    const router = useRouter();
    return(
        <>
        <nav className="w-full bg-transparent backdrop-blur-xl fixed top-0 left-0 z-50 shadow">
            <div className="md:flex-row flex-col flex md:max-w-[90vw] mx-auto h-[10vh]">
                <div className="md:w-1/2 w-full flex items-center font-medium poppins">
                    <h1 className="text-5xl text-yellow-400">PI.LOT</h1>
                </div>

                <ul className="md:w-1/2 w-full flex justify-evenly items-center">
                    <li>
                        <a className="hover:underline" href="/">Home</a>
                    </li>
                    <li>
                        <a className="hover:underline" href="/dashboard">Dashboard</a>
                    </li>
                    <li>
                        <button className="btn-primary" onClick={() => router.push("/register")} >Register</button>
                    </li>
                </ul>
            </div>
        </nav>
        </>
    )
}