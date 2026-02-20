"use client"

import { useSession, signOut } from "next-auth/react"
import { User } from "lucide-react"

export default function UserDropdown() {
    const { data: session } = useSession();

    return (
        <>
            {session && (
                <div className="absolute top-6 right-6 z-[1000]">
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
                            <User size={20} className=" text-white" />
                        </label>

                        {/* Dropdown Menu */}
                        <ul
                            tabIndex={0}
                            className="
                            dropdown-content mt-2 p-4
                            w-64
                            bg-white/20
                            backdrop-blur-2xl
                            border border-white/30
                            rounded-2xl
                            shadow-2xl
                            text-black
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
                                    onClick={() => signOut({ callbackUrl: "/signin" })}
                                    className="
                                    btn btn-sm w-full
                                    bg-gradient-to-r
                                    from-red-300
                                    to-red-700
                                    border-none
                                    rounded-full
                                    text-white
                                    hover:scale-105
                                    transition-all
                                    "
                                >
                                    Sign Out
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </>
    )
}