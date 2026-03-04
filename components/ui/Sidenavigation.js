
"use client"

import Link from "next/link"
import Image from "next/image"
import { signOut, useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { Building, Dot, EllipsisVertical, Factory, FileUp, IdCardLanyardIcon, LayoutDashboard, LayoutTemplate, LocateFixed, LogOut, Moon, MoonStar, MoveRight, Pin, RadioTower, ShieldCheck, ShieldOff, ShieldUser, SunDim, SunMedium, UploadCloudIcon, Users } from "lucide-react"
import { useEffect } from "react"

export default function SideNavigation({ UserAccess, UserCountry }) {
    const { data: session, status, update } = useSession({ required: "true" });

    useEffect(() => {
        update(); // force refetch from /api/auth/session
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const pathname = usePathname()

    const navlinks = [
        {
            id: 0,
            path: "/administration",
            linkname: "Administration",
            icon: ShieldUser,
        },
        {
            id: 1,
            path: "/dashboard",
            linkname: "Dashboard",
            icon: LayoutTemplate,
        },
        {
            id: 2,
            path: "/users",
            linkname: "Users",
            icon: Users,
        },
        {
            id: 3,
            path: "/mediahouse-programs",
            linkname: "Media H. & Programs",
            icon: RadioTower,
        },
        {
            id: 4,
            path: "/variants-generics-companies",
            linkname: "Variants, Generics & Comp.",
            icon: Building,
        },
        {
            id: 5,
            path: "/industries-categories",
            linkname: "Industries & Categories",
            icon: Factory,
        },
        {
            id: 6,
            path: "/upload-entries",
            linkname: "Upload Excel Entries",
            icon: FileUp,
        },
    ]

    const houroftheday = new Date().getHours();

    return (
        <>
            <div className="flex h-full flex-col justify-between py-2 md:ps-1">
                <div>
                    {/* SideNav Logo & Title  */}
                    <div className="flex justify-between items-center gap-4 px-2 py-2 md:py-6 rounded-lg shadow-sm mb-2 border border-zinc-200 bg-white">
                        <Link href="/dashboard">
                            <div className="flex justify-start items-center gap-2">
                                <Image
                                    src="/tnmmlogotransparent.PNG"
                                    width={70}
                                    height={70}
                                    alt="True North Logo"
                                    className="rounded-full"
                                />
                                <div className="w-full md:w-32">
                                    <p className="font-notosans font-normal text-cyan-900 text-xs leading-none pl-0.5">True North Media Monitoring Ltd</p>
                                    <h1 className="font-notosans font-black text-cyan-950 text-2xl leading-none">Manual Entry & Progress Tracker</h1>
                                    <div className="flex flex-row justify-start items-center gap-2 pl-0.5 mt-2">
                                        {status === "loading" && (<span className="loading loading-spinner loading-xs text-cyan-950"></span>)}
                                        {status === "authenticated" && (
                                            <>
                                                <Image
                                                    className={`${session.user.country !== "Ghana" && "hidden"} rounded-sm`}
                                                    src="https://flagcdn.com/w40/gh.png"
                                                    width={20}
                                                    height={20}
                                                    alt="Ghana"
                                                />
                                                <Image
                                                    className={`${session.user.country !== "Nigeria" && "hidden"} rounded-sm`}
                                                    src="https://flagcdn.com/w40/ng.png"
                                                    width={20}
                                                    height={20}
                                                    alt="Nigeria"
                                                />
                                                <Image
                                                    className={`${session.user.country !== "Côte d'Ivoire" && "hidden"} rounded-sm`}
                                                    src="https://flagcdn.com/w40/ci.png"
                                                    width={20}
                                                    height={20}
                                                    alt="Côte d'Ivoire"
                                                />
                                            </>
                                        )}
                                        {status === "authenticated" && (<span className="text-cyan-950 text-xs">{session.user.country}</span>)}

                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Small Screen Navigation */}
                        <div className="dropdown dropdown-end md:hidden">
                            <button tabIndex={0} role="button"
                                className="btn py-0 px-2 border-0 text-black bg-zinc-50 shadow-sm hover:bg-zinc-100 md:hidden">
                                <EllipsisVertical size={15} />
                            </button>
                            <ul tabIndex={0} className="dropdown-content menu rounded-lg z-[100] w-80 p-2 shadow-md mt-3 bg-white border border-zinc-200">
                                <li>
                                    {navlinks.slice(0, 2).map((item) => (
                                        <a key={item.id} href={item.path} className="flex justify-between items-center gap-2 text-black/40 transition-all">
                                            <div className="flex items-center gap-2 text-zinc-400">
                                                <item.icon size={20} className={` ${item.path === pathname && "text-red-700"}`} />
                                                <span className={` ${item.path === pathname && "text-black"} font-semibold font-notosans text-sm transition-all`}>
                                                    {item.linkname}
                                                </span>
                                            </div>
                                            <Dot size={15} className={`${item.path === pathname ? "text-black" : "text-zinc-300"}`} />
                                        </a>
                                    ))}
                                </li>
                                <li>
                                    <ul>
                                        <li>
                                            {navlinks.slice(2).map((item) => (
                                                <a key={item.id} href={item.path} className="flex justify-between items-center gap-2 text-black/40 transition-all">
                                                    <div className="flex items-center gap-2 text-zinc-400">
                                                        <item.icon size={15} className={` ${item.path === pathname && "text-red-700"}`} />
                                                        <span className={` ${item.path === pathname && "text-black"} font-semibold font-notosans text-sm transition-all`}>
                                                            {item.linkname}
                                                        </span>
                                                    </div>
                                                    <Dot size={15} className={`${item.path === pathname ? "text-black" : "text-zinc-300"}`} />
                                                </a>
                                            ))}
                                        </li>
                                    </ul>
                                </li>
                                <div className="flex items-center gap-1 text-xs font-normal ps-3 mt-2 mb-1">
                                    <span className=" font-medium"></span>
                                </div>
                                <li>
                                    <button
                                        onClick={() => signOut()}
                                        className="justify-between items-center gap-2 text-black/40 hover:bg-red-100 transition-all">
                                        <div className="flex items-center gap-2 text-black">
                                            <Dot size={15} className="text-red-700" />
                                            <span className={` font-semibold font-notosans text-sm`}>Signout</span>
                                        </div>
                                        <LogOut size={15} className="text-red-700" />
                                    </button>
                                </li>
                            </ul>
                        </div>
                        {/* Small Screen Navigation */}

                    </div>
                    {/* SideNav Logo & Title  */}

                    {/* User Id */}
                    {session && (
                        <div className="flex justify-between items-center gap-1.5 bg-cyan-50 text-black/40 px-2 py-4 rounded-2xl shadow-sm transition-all mb-2 border border-zinc-100">
                            <div className="flex justify-start items-center gap-1.5">
                                <div className="flex flex-col">
                                    <IdCardLanyardIcon className=" text-cyan-950" size={25} />
                                </div>
                                <div className="text-black/40">
                                    {houroftheday >= 6 && houroftheday <= 11 && (
                                        <div style={{ fontSize: "10px" }} className="flex items-center gap-1 font-medium text-cyan-900 mb-0.5 ">
                                            <SunDim size={12} />
                                            <span>Morning</span>
                                        </div>
                                    )}
                                    {houroftheday >= 12 && houroftheday <= 16 && (
                                        <div style={{ fontSize: "10px" }} className="flex items-center gap-1 font-medium text-orange-600 mb-0.5 ">
                                            <SunMedium size={12} />
                                            <span>Afternoon</span>
                                        </div>
                                    )}
                                    {houroftheday >= 17 && houroftheday <= 23 && (
                                        <div style={{ fontSize: "10px" }} className="flex items-center gap-1 font-medium text-slate-900 mb-0.5 ">
                                            <Moon size={12} />
                                            <span>Evening</span>
                                        </div>
                                    )}
                                    {houroftheday >= 0 && houroftheday <= 5 && (
                                        <div style={{ fontSize: "10px" }} className="flex items-center gap-1 font-medium text-blue-900 mb-0.5 ">
                                            <MoonStar size={12} />
                                            <span>Early Morn</span>
                                        </div>
                                    )}
                                    <div className="font-bold text-md text-cyan-950 leading-none">{session.user.name}</div>
                                    <div className="font-semibold text-xs text-cyan-900 mb-0.5">{session.user.email.split("@")[0]}</div>
                                    <div style={{ fontSize: "10px" }} className="flex items-center gap-1 text-cyan-900">
                                        {/* <LocateFixed size={15} /> */}
                                        <Image
                                            className={`${UserCountry !== "Ghana" && "hidden"} rounded-sm`}
                                            src="https://flagcdn.com/w40/gh.png"
                                            width={15}
                                            height={15}
                                            alt="Ghana"
                                        />
                                        <Image
                                            className={`${UserCountry !== "Nigeria" && "hidden"} rounded-sm`}
                                            src="https://flagcdn.com/w40/ng.png"
                                            width={15}
                                            height={15}
                                            alt="Nigeria"
                                        />
                                        <Image
                                            className={`${UserCountry !== "Côte d'Ivoire" && "hidden"} rounded-sm`}
                                            src="https://flagcdn.com/w40/ci.png"
                                            width={15}
                                            height={15}
                                            alt="Côte d'Ivoire"
                                        />
                                        {UserCountry === "Ghana" && (
                                            <span className="font-semibold" >Ghanaian Account</span>
                                        )}
                                        {UserCountry === "Nigeria" && (
                                            <span className="font-semibold" >Nigerian Account</span>
                                        )}
                                        {UserCountry === "Côte d'Ivoire" && (
                                            <span className="font-semibold" >Ivorian Account</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {UserAccess === "Admin" || UserAccess === "AdminReadOnly" ?
                                <ShieldUser size={18} className="text-green-900" />
                                : <ShieldOff size={18} className=" text-amber-800" />}
                        </div>
                    )}
                    {/* User Id */}


                    {/* Large Screen Navigation */}
                    <ul tabIndex={0} className="dropdown-content menu rounded-lg z-4 w-auto p-2 shadow-sm bg-white hidden md:block border border-zinc-100">
                        <li>
                            {navlinks.slice(0, 2).map((item) => (
                                <a key={item.id} href={item.path} className="flex justify-between items-center gap-2 text-black/40 transition-all">
                                    <div className="flex items-center gap-2 text-zinc-500">
                                        <item.icon size={20} className={` ${item.path === pathname && "text-cyan-900"}`} />
                                        <span className={` ${item.path === pathname && "text-black"} font-semibold font-notosans text-sm transition-all`}>
                                            {item.linkname}
                                        </span>
                                    </div>
                                    <MoveRight size={15} className={`${item.path === pathname ? "text-black" : "text-zinc-300"}`} />
                                </a>
                            ))}
                        </li>
                        <li>
                            <ul>
                                <li>
                                    {navlinks.slice(2,).map((item) => (
                                        <a key={item.id} href={item.path} className="flex justify-between items-center gap-2 text-black/40 transition-all" >
                                            <div className="flex items-center gap-2 text-zinc-500">
                                                {/* <ShieldCheck size={15} className="text-green-900/50" /> */}
                                                <item.icon size={15} className={` ${item.path === pathname && "text-cyan-900"}`} />
                                                <span className={` ${item.path === pathname && "text-black"} font-semibold font-notosans text-sm transition-all`}>
                                                    {item.linkname}
                                                </span>
                                            </div>
                                            <MoveRight size={15} className={`${item.path === pathname ? "text-black" : "text-zinc-300"}`} />
                                        </a>
                                    ))}
                                </li>
                            </ul>
                        </li>
                        <div className="flex items-center gap-1 text-xs font-normal ps-3 mt-2 mb-1">
                            <span className=" font-medium"></span>
                        </div>
                        {/* <li>
                        <ul>
                            <li>
                                {navlinks.slice(2).map((item) => (
                                    <a key={item.id} href={item.path} className="flex justify-between items-center gap-2 text-black/40 transition-all">
                                        <div className="flex justify-between items-center gap-1.5 text-zinc-500">
                                            <ShieldCheck size={15} className="text-green-900/50" />
                                            <item.icon size={15} className={` ${item.path === pathname && "text-cyan-900"}`} />
                                            <span className={` ${item.path === pathname && "text-black"} font-semibold font-notosans text-sm transition-all`}>
                                                {item.linkname}
                                            </span>
                                        </div>
                                        <MoveRight size={15} className={`${item.path === pathname ? "text-black" : "text-zinc-300"}`} />
                                    </a>
                                ))}
                            </li>
                        </ul>
                    </li> */}
                    </ul>
                    {/* Large Screen Navigation */}
                </div>


                <button
                    onClick={() => signOut({ callbackUrl: "/sign-in" })}
                    className="hidden md:flex btn-ghost  justify-between items-center gap-2 bg-zinc-50 text-black/40 px-6 py-1 rounded-full shadow-sm mb-1 hover:bg-red-50 transition-all mt-2 cursor-pointer">
                    <div className="flex items-center gap-2 text-black">
                        <Dot size={15} className="text-red-700" />
                        <span className={` font-semibold font-notosans text-red-700 text-sm`}>Signout</span>
                    </div>
                    <LogOut size={15} className="text-red-700" />
                </button>
            </div>
        </>
    )
}
