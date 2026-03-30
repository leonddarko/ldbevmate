"use client"

import { useSession, signOut } from "next-auth/react"
import { User, LayoutDashboard, LogOut, DoorOpen, ShieldUser } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect } from "react"

export default function UserDropdown() {

    const router = useRouter()

    const { data: session, update } = useSession({ required: true })

    useEffect(() => {
        update()
    }, [update])

    return (
        // <div className="absolute bottom-20 right-3 z-1000">
        <div className="absolute top-3 right-3 z-1000">

            {session ? (

                <div className="dropdown dropdown-bottom dropdown-left">

                    {/* Avatar Button */}
                    <label
                        tabIndex={0}
                        className="
                        w-11 h-11
                        rounded-full
                        flex items-center justify-center
                        bg-white/10
                        backdrop-blur-md
                        border border-white/20
                        shadow-[0_0_25px_rgba(0,200,255,0.25)]
                        hover:scale-105
                        transition-all duration-200
                        cursor-pointer
                        
                        "
                    >
                        {/* <User size={20} className="text-blue-950" /> */}
                        <div className="text-blue-500
                        font-bold text-lg">
                            {session.user.name?.charAt(0)}
                            {session.user.name?.charAt(1).toUpperCase()}
                        </div>
                    </label>

                    {/* Dropdown */}
                    <div
                        tabIndex={0}
                        className="
                        dropdown-content mt-2
                        right-0
                        w-80
                        bg-white/10
                        backdrop-blur-md
                        border border-white/20
                        rounded-3xl
                        shadow-[0_0_25px_rgba(0,200,255,0.2)]
                        overflow-hidden
                        "
                    >

                        {/* User Header */}
                        <div className="px-5 py-2 border-b border-white/10">

                            <div className="font-bold text-xl text-blue-500">
                                {session.user.name}
                            </div>

                            <div className="text-xs text-blue-400/60 break-all">
                                {session.user.email}
                            </div>

                        </div>

                        {/* Menu */}
                        <div className="p-2 space-y-1">
                            {session.user.role === "admin" && (

                                <Link
                                    href="/admin"
                                    className="
                                    flex items-center gap-3
                                    px-4 py-2
                                    rounded-xl
                                    text-blue-500
                                    hover:bg-blue-500/10
                                    transition
                                    "
                                >
                                    <ShieldUser size={18} />
                                    <span className="font-medium">
                                        Admin Dashboard
                                    </span>
                                </Link>

                            )}

                            {session.user.role === "cpo" && (
                                <Link
                                    href="/cpo/dashboard"
                                    className="
                                    flex items-center gap-3
                                    px-4 py-2
                                    rounded-xl
                                    text-blue-500
                                    hover:bg-blue-500/10
                                    transition
                                    "
                                >
                                    <LayoutDashboard size={18} />
                                    <span className="font-medium">
                                        CPO Dashboard
                                    </span>
                                </Link>
                            )}

                            {session.user.role === "admin" && (
                                <Link
                                    href="/cpo/dashboard"
                                    className="
                                    flex items-center gap-3
                                    px-4 py-2
                                    rounded-xl
                                    text-blue-500
                                    hover:bg-blue-500/10
                                    transition
                                    "
                                >
                                    <LayoutDashboard size={18} />
                                    <span className="font-medium">
                                        CPO Dashboard
                                    </span>
                                </Link>
                            )}

                        </div>

                        {/* Footer */}
                        <div className="border-t border-white/10 p-2">

                            <button
                                onClick={() => signOut({ callbackUrl: "/sign-in" })}
                                className="
                                w-full
                                flex items-center gap-3
                                px-4 py-2
                                rounded-xl
                                text-red-500
                                hover:bg-red-500/10
                                transition
                                cursor-pointer
                                "
                            >
                                <DoorOpen size={18} />
                                <span className="font-medium">
                                    Sign Out
                                </span>
                            </button>

                        </div>

                    </div>
                </div>

            ) : (

                <button
                    onClick={() => router.push("/sign-in")}
                    className="
                    px-5 py-2
                    rounded-full
                    backdrop-blur-xl
                    bg-white/10
                    border border-white/30
                    shadow-[0_0_20px_rgba(0,200,255,0.4)]
                    text-blue-950
                    hover:scale-105
                    transition
                    "
                >
                    Sign In
                </button>

            )}

        </div>
    )
}