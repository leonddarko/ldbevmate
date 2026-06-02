"use client";

import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
    BadgeCheck,
    BadgeX,
    Building2,
    DoorOpen,
    Dot,
    EllipsisVerticalIcon,
    EvCharger,
    House,
    HousePlug,
    IdCardLanyard,
    LayoutDashboardIcon,
    Map,
    MoveRight,
    Shield,
} from "lucide-react";

import { useState, useEffect } from "react";

export default function SideNav() {

    const { data: session, update } = useSession({
        required: true,
    });

    const pathname = usePathname();

    const role = session?.user?.role;

    // Dynamic navigation config
    const dashboardNav = {
        admin: [
            {
                id: 0,
                path: "/",
                linkname: "Go To Map",
                icon: Map,
            },
            {
                id: 1,
                path: "/cpo/dashboard",
                linkname: "Dashboard",
                icon: LayoutDashboardIcon,
            },
            {
                id: 2,
                path: "/cpo/stations",
                linkname: "Stations",
                icon: EvCharger,
            },
        ],
        cpo: [
            {
                id: 0,
                path: "/",
                linkname: "Go To Map",
                icon: Map,
            },
            {
                id: 1,
                path: "/cpo/dashboard",
                linkname: "Dashboard",
                icon: LayoutDashboardIcon,
            },
            {
                id: 2,
                path: "/cpo/stations",
                linkname: "Stations",
                icon: EvCharger,
            },
        ],

        realtor: [
            {
                id: 0,
                path: "/",
                linkname: "Explore Properties",
                icon: Map,
            },
            {
                id: 1,
                path: "/realtor/dashboard",
                linkname: "Dashboard",
                icon: LayoutDashboardIcon,
            },
            {
                id: 2,
                path: "/realtor/properties",
                linkname: "Properties",
                icon: House,
            },
            {
                id: 3,
                path: "/realtor/profile",
                linkname: "Profile",
                icon: Building2,
            },
        ],
    };

    const navlinks = dashboardNav[role] || [];

    // Dynamic panel settings


    const HeaderIcon = role === "cpo" || role === "admin"
        ? HousePlug
        : Building2;

    const panelName = role === "cpo" || role === "admin"
        ? "CPO Panel"
        : "Realtor Panel";

    const dashboardPath = role === "cpo" || role === "admin"
        ? "/cpo/dashboard"
        : "/realtor/dashboard";

    const apiEndpoint = role === "cpo" || role === "admin"
        ? "/api/cpo/me"
        : "/api/realtor/me";

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        update();
    }, [update]);

    useEffect(() => {

        async function fetchProfile() {

            try {

                const res = await fetch(apiEndpoint);

                const data = await res.json();

                if (res.ok) {

                    setProfile(
                        role === "cpo" || role === "admin"
                            ? data.cpo
                            : data.realtor
                    );
                }

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        if (role) {
            fetchProfile();
        }

    }, [apiEndpoint, role]);

    const displayName = role === "cpo" || role === "admin"
        ? profile?.companyName
        : profile?.agencyName;

    return (
        <>
            <div className="h-full flex flex-col justify-start md:py-2 md:ps-1">

                {/* Container */}
                <div
                    className="
                        bg-blue-50/80
                        backdrop-blur-sm
                        border border-white/20
                        rounded-3xl
                        shadow
                        md:overflow-hidden
                    "
                >

                    {/* Header */}
                    <div
                        className="
                            flex justify-between md:justify-start
                            items-center gap-4
                            px-2 py-4 md:py-6
                            border-b border-zinc-200
                        "
                    >

                        <Link href={dashboardPath}>
                            <div className="flex justify-start items-center gap-2">

                                <HeaderIcon
                                    size={50}
                                    className="text-blue-950"
                                />

                                <div className="w-full md:w-32">

                                    {loading && (
                                        <span className="
                                            loading
                                            loading-spinner
                                            loading-xs
                                            text-blue-950
                                        "></span>
                                    )}

                                    <h1
                                        className="
                                            font-notosans
                                            font-black
                                            text-blue-950
                                            text-xl
                                            leading-none
                                        "
                                    >
                                        {displayName}
                                    </h1>

                                    <p
                                        className="
                                            font-notosans
                                            font-normal
                                            text-blue-950
                                            text-xs
                                            leading-none
                                            pl-0.5 py-1
                                        "
                                    >
                                        {panelName}
                                    </p>

                                    {profile?.verified ? (
                                        <BadgeCheck
                                            size={15}
                                            className="text-green-900"
                                        />
                                    ) : (
                                        <BadgeX
                                            size={15}
                                            className="text-amber-800"
                                        />
                                    )}

                                </div>
                            </div>
                        </Link>

                        {/* Mobile Menu */}
                        <div className="dropdown dropdown-end md:hidden">

                            <button
                                tabIndex={0}
                                role="button"
                                className="
                                    btn py-0 p-2
                                    border-0
                                    text-blue-950
                                    bg-transparent
                                    hover:bg-zinc-100
                                    shadow-none
                                "
                            >
                                <EllipsisVerticalIcon size={20} />
                            </button>

                            <ul
                                tabIndex={0}
                                className="
                                    dropdown-content
                                    menu
                                    rounded-3xl
                                    w-80
                                    p-2
                                    shadow-md
                                    bg-blue-50/90
                                    backdrop-blur-3xl
                                    border border-white/90
                                "
                            >

                                {/* Admin */}
                                {session?.user?.role === "admin" && (
                                    <li>
                                        <Link
                                            href="/admin"
                                            className="
                                                flex justify-between
                                                items-center gap-2
                                            "
                                        >
                                            <div className="
                                                flex items-center gap-2
                                                text-blue-950/50
                                            ">
                                                <Shield size={20} />
                                                <span
                                                    className="
                                                        font-semibold
                                                        font-notosans
                                                        text-sm
                                                    "
                                                >
                                                    Admin Dashboard
                                                </span>
                                            </div>

                                            <Dot size={15} />
                                        </Link>
                                    </li>
                                )}

                                {/* Navlinks */}
                                {navlinks.map((item) => (

                                    <li key={item.id}>

                                        <Link
                                            href={item.path}
                                            className="
                                                flex justify-between
                                                items-center gap-2
                                            "
                                        >

                                            <div
                                                className="
                                                    flex items-center
                                                    gap-2
                                                "
                                            >

                                                <item.icon
                                                    size={18}
                                                    className={
                                                        item.path === pathname
                                                            ? "text-blue-950"
                                                            : "text-zinc-400"
                                                    }
                                                />

                                                <span
                                                    className={`
                                                        font-semibold
                                                        font-notosans
                                                        text-sm
                                                        transition-all
                                                        ${item.path === pathname
                                                            ? "text-blue-950"
                                                            : "text-zinc-400"
                                                        }
                                                    `}
                                                >
                                                    {item.linkname}
                                                </span>

                                            </div>

                                            <Dot
                                                size={15}
                                                className={
                                                    item.path === pathname
                                                        ? "text-blue-950"
                                                        : "text-zinc-300"
                                                }
                                            />

                                        </Link>

                                    </li>
                                ))}

                                {/* Signout */}
                                <li>
                                    <button
                                        onClick={() => signOut()}
                                        className="
                                            justify-between
                                            items-center gap-2
                                            hover:bg-red-100
                                            transition-all
                                        "
                                    >

                                        <div
                                            className="
                                                flex items-center gap-2
                                            "
                                        >
                                            <Dot
                                                size={15}
                                                className="text-red-700"
                                            />

                                            <span
                                                className="
                                                    font-semibold
                                                    font-notosans
                                                    text-sm
                                                    text-red-700
                                                "
                                            >
                                                Signout
                                            </span>
                                        </div>

                                        <DoorOpen
                                            size={15}
                                            className="text-red-700"
                                        />

                                    </button>
                                </li>

                            </ul>
                        </div>
                    </div>

                    {/* User Card */}
                    {session && (
                        <div
                            className="
                                flex justify-between
                                items-center gap-1.5
                                bg-blue-100/50
                                p-4
                                border border-zinc-100
                                rounded-b-3xl md:rounded-none
                            "
                        >

                            <div
                                className="
                                    flex justify-start
                                    items-center gap-1.5
                                "
                            >

                                <IdCardLanyard
                                    className="text-cyan-950"
                                    size={25}
                                />

                                <div>

                                    <div
                                        className="
                                            font-bold
                                            text-md
                                            text-cyan-950
                                            leading-none
                                        "
                                    >
                                        {session.user.name}
                                    </div>

                                    <div
                                        className="
                                            font-semibold
                                            text-xs
                                            text-cyan-900
                                            mb-0.5
                                        "
                                    >
                                        {session.user.email.split("@")[0]}
                                    </div>

                                </div>

                            </div>

                        </div>
                    )}

                    {/* Desktop Nav */}
                    <ul
                        className="
                            hidden md:block
                            ps-4 py-2 pe-2
                            border border-zinc-100
                        "
                    >

                        {/* Admin */}
                        {session?.user?.role === "admin" && (
                            <Link
                                href="/admin"
                                className="
                                    flex justify-between
                                    items-center gap-2
                                    mb-2
                                "
                            >

                                <div
                                    className="
                                        flex items-center gap-2
                                        text-blue-950
                                    "
                                >

                                    <Shield size={20} />

                                    <span
                                        className="
                                            font-semibold
                                            font-notosans
                                            text-sm
                                        "
                                    >
                                        Admin Dashboard
                                    </span>

                                </div>

                                <MoveRight
                                    size={15}
                                    className="text-blue-100"
                                />

                            </Link>
                        )}

                        {/* Navlinks */}
                        {navlinks.map((item) => (

                            <Link
                                key={item.id}
                                href={item.path}
                                className="
                                    flex justify-between
                                    items-center gap-2
                                    mb-2 last:mb-0
                                "
                            >

                                <div
                                    className="
                                        flex items-center gap-2
                                    "
                                >

                                    <item.icon
                                        size={20}
                                        className={
                                            item.path === pathname
                                                ? "text-blue-950"
                                                : "text-blue-950/50"
                                        }
                                    />

                                    <span
                                        className={`
                                            font-semibold
                                            font-notosans
                                            text-sm
                                            transition-all
                                            ${item.path === pathname
                                                ? "text-blue-950"
                                                : "text-blue-950/50"
                                            }
                                        `}
                                    >
                                        {item.linkname}
                                    </span>

                                </div>

                                <MoveRight
                                    size={15}
                                    className={
                                        item.path === pathname
                                            ? "text-blue-950"
                                            : "text-blue-100"
                                    }
                                />

                            </Link>
                        ))}

                    </ul>

                    {/* Desktop Signout */}
                    <button
                        onClick={() =>
                            signOut({
                                callbackUrl: "/sign-in",
                            })
                        }
                        className="
                            hidden md:flex
                            btn-ghost
                            justify-between
                            items-center gap-2
                            ps-4 py-4 pe-2
                            w-full
                            border-t border-zinc-200
                            hover:bg-red-50
                            transition-all
                            cursor-pointer
                        "
                    >

                        <div
                            className="
                                flex items-center gap-2
                            "
                        >

                            <DoorOpen
                                size={20}
                                className="text-red-700"
                            />

                            <span
                                className="
                                    font-semibold
                                    font-notosans
                                    text-red-700
                                    text-sm
                                "
                            >
                                Signout
                            </span>

                        </div>

                        <MoveRight
                            size={15}
                            className="text-red-700"
                        />

                    </button>

                </div>
            </div>
        </>
    );
}