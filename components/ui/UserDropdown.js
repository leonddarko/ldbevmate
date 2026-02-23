"use client"

import { useSession, signOut } from "next-auth/react"
import { User } from "lucide-react"
import { useRouter } from "next/navigation";

export default function UserDropdown() {
    const router = useRouter();
    const { data: session } = useSession();

    return (
        <>
            <div className="absolute top-3 right-3 z-[1000]">
                {session ? (
                    <div className="dropdown dropdown-end">
                        {/* Round Glass Button */}
                        <label
                            tabIndex={0}
                            className="
                            w-12 h-12
                            rounded-full
                            bg-gradient-to-br from-cyan-400/10 to-blue-600/20
                            backdrop-blur-2xl
                            border border-white/20
                            shadow-[0_0_20px_rgba(0,200,255,0.25)]
                            flex items-center justify-center
                            text-white
                            hover:scale-110
                            transition-all duration-200
                            cursor-pointer
                            "
                        >
                            <User size={20} className=" text-blue-950" />
                        </label>

                        {/* Dropdown Menu */}
                        <ul
                            tabIndex={0}
                            className="
                            dropdown-content mt-2 p-4
                            w-72
                            bg-white/10
                            backdrop-blur-xl
                            border border-white/20
                            rounded-3xl
                            shadow-[0_0_20px_rgba(0,200,255,0.25)]
                            text-blue-950
                            space-y-3
                            "
                        >

                            <li>
                                <div className="font-bold text-xl">{session.user.name}</div>
                                <div className="text-sm opacity-70 break-all">{session.user.email}</div>
                            </li>

                            {/* <li className="text-sm opacity-70 break-all">
                                {session.user.email}
                            </li> */}

                            {/* <div className="divider my-1"></div> */}

                            <li>
                                <button
                                    onClick={() => signOut({ callbackUrl: "/sign-in" })}
                                    className="
                                    btn btn-md w-full
                                    bg-blue-950
                                    rounded-full
                                    text-white
                                    hover:scale-105
                                    transition-all
                                    shadow-none
                                    "
                                >
                                    Sign Out
                                </button>
                            </li>
                        </ul>
                    </div>
                ) : (
                    <button
                        onClick={() => router.push("/sign-in")}
                        className="
                        btn btn-md 
                        rounded-full 
                        backdrop-blur-2xl bg-white/10 border border-white/30
                        shadow-[0_0_20px_rgba(0,200,255,0.4)]
                        text-blue-950"
                    >
                        Sign in
                    </button>
                )}
            </div>
        </>
    )
}