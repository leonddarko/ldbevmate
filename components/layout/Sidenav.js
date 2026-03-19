"usel client"

import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, CircleX, DoorOpen, Dot, EllipsisVerticalIcon, EvCharger, HousePlug, IdCardLanyard, LayoutDashboardIcon, Map, MapIcon, MoveRight, ShieldCheck, ShieldOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function SideNav() {

    const { data: session, status, update } = useSession({ required: "true" });

    const pathname = usePathname()

    const navlinks = [
        {
            id: 0,
            path: "/cpo/dashboard",
            linkname: "Dashboard",
            icon: LayoutDashboardIcon,
        },
        {
            id: 1,
            path: "/",
            linkname: "Go To Map",
            icon: Map,
        },
        {
            id: 2,
            path: "/cpo/stations",
            linkname: "Stations",
            icon: EvCharger,
        },
    ]

    const [cpo, setCpo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCPO() {
            const res = await fetch("/api/cpo/me");
            const data = await res.json();

            if (res.ok) {
                setCpo(data.cpo);
                console.log(data);
            }

            setLoading(false);
        }

        fetchCPO();
    }, []);

    return (
        <>
            <div className="h-full flex flex-col justify-start py-2 md:ps-1">

                <div className="flex justify-between md:justify-start items-center gap-4 px-2 py-4 md:py-6 rounded-lg shadow-sm mb-1 border border-zinc-200 bg-white">
                    <Link href="/cpo/dashboard">
                        <div className="flex justify-start items-center gap-2">
                            <HousePlug size={50} className=" text-blue-950" />
                            <div className="w-full md:w-32">
                                {loading && (<>
                                    <span className="loading loading-spinner loading-xs text-blue-950"></span>
                                </>)}
                                <h1 className="font-notosans font-black text-blue-950 text-xl leading-none">{cpo?.companyName}</h1>

                                <p className="font-notosans font-normal text-blue-950 text-xs leading-none pl-0.5 mb-1">CPO Panel</p>

                                {cpo?.verified === true ?
                                    <CheckCircle2 size={15} className="text-green-900 " />
                                    : <CircleX size={15} className=" text-amber-800 " />}
                            </div>
                        </div>
                    </Link>

                    {/* Small Screen Navigation */}
                    <div className="dropdown dropdown-end md:hidden">
                        <button tabIndex={0} role="button"
                            className="btn py-0 p-2 border-0 text-blue-950 bg-white hover:bg-zinc-100 shadow-none">
                            <EllipsisVerticalIcon size={20} />
                        </button>
                        <ul tabIndex={0} className="dropdown-content menu rounded-3xl z-1000 w-80 p-2 shadow-md mt-5 bg-white border border-zinc-200">
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
                                    <DoorOpen size={15} className="text-red-700" />
                                </button>
                            </li>
                        </ul>
                    </div>
                    {/* Small Screen Navigation */}
                </div>



                {/* User Id */}
                {session && (
                    <div className="flex justify-between items-center gap-1.5 bg-cyan-50 text-black/40 p-4 rounded-lg transition-all mb-1 border border-zinc-100">
                        <div className="flex justify-start items-center gap-1.5">
                            <div className="flex flex-col">
                                <IdCardLanyard className=" text-cyan-950" size={25} />
                            </div>
                            <div className="text-black/40">

                                <div className="font-bold text-md text-cyan-950 leading-none">{session.user.name}</div>
                                <div className="font-semibold text-xs text-cyan-900 mb-0.5">{session.user.email.split("@")[0]}</div>

                            </div>
                        </div>
                            {/* <EvCharger size={18} className="text-green-900" /> */}
                    </div>
                )}
                {/* User Id */}


                <ul tabIndex={0} className="dropdown-content menu rounded-2xl z-4 w-auto ps-4 py-2 bg-white hidden md:block border border-zinc-100">
                    {navlinks.slice(0, 3).map((item) => (
                        <a key={item.id} href={item.path} className="flex justify-between items-center gap-2 text-blue-950/50 transition-all mb-2 last:mb-0">
                            <div className="flex items-center gap-2 text-blue-950/50">
                                <item.icon size={20} className={` ${item.path === pathname && "text-blue-950"}`} />
                                <span className={` ${item.path === pathname && "text-blue-950"} font-semibold font-notosans text-sm transition-all`}>
                                    {item.linkname}
                                </span>
                            </div>
                            <MoveRight size={15} className={`${item.path === pathname ? "text-blue-950" : "text-blue-100"}`} />
                        </a>
                    ))}
                </ul>

                <button
                    onClick={() => signOut({ callbackUrl: "/sign-in" })}
                    className="hidden md:flex btn-ghost justify-between items-center gap-2 bg-zinc-50 text-black/40 ps-4 py-2 px-2 rounded-lg mb-1 hover:bg-red-50 transition-all mt-1 cursor-pointer">
                    <div className="flex items-center gap-2 text-black">
                        <DoorOpen size={20} className="text-red-700" />
                        <span className={` font-semibold font-notosans text-red-700 text-sm`}>Signout</span>
                    </div>
                    <MoveRight size={15} className="text-red-700" />
                </button>

            </div>
        </>
    )
}
