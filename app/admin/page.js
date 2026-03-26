"use client"

import { Building, ChevronRight, DoorOpen, Dot, EvCharger, Map, ShieldUser, Users } from "lucide-react";
import {signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";



export default function AdminDashboard() {

    const { data: session, status, update } = useSession({ required: "true" });
    useEffect(() => {
        update(); 
    }, []);


    return (
        <>
            <div className="h-screen flex flex-col justify-center items-center py-12 px-6 md:py-24 md:px-12 bg-[url(/backgroundimages/ev-charging-station_tp.JPG)] bg-cover bg-center bg-no-repeat bg-fixed overflow-y-auto">
                <ShieldUser size={30} className=" text-blue-950" />
                <h1 className="text-3xl font-bold text-blue-950">Admin Dashboard</h1>
                <Dot size={30} className=" text-blue-950" />


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <Link href="/admin/users">
                        <div className="card bg-blue-100/20 backdrop-blur-md p-4 rounded-3xl shadow-sm hover:shadow-[0_0_20px_rgba(0,200,255,0.4)] cursor-pointer transition-all duration-200">
                            <div className="flex justify-between items-center gap-2">
                                <div>
                                    <div className="flex justify-start gap-2">
                                        <Users size={15} className=" text-blue-950" />
                                        <h2 className="text-sm">Users</h2>
                                    </div>
                                    <p className="font-semibold" >Manage platform users</p>
                                </div>
                                <ChevronRight size={20} className=" text-blue-950" />
                            </div>
                        </div>
                    </Link>

                    <Link href="/admin/cpos">
                        <div className="card bg-blue-100/20 backdrop-blur-md p-4 rounded-3xl shadow-sm hover:shadow-[0_0_20px_rgba(0,200,255,0.4)] cursor-pointer transition-all duration-200">
                            <div className="flex justify-between items-center gap-2">
                                <div>
                                    <div className="flex justify-start gap-2">
                                        <Building size={15} className=" text-blue-950" />
                                        <h2 className="text-sm">CPOs</h2>
                                    </div>
                                    <p className="font-semibold" >Manage platform CPOs</p>
                                </div>
                                <ChevronRight size={20} className=" text-blue-950" />
                            </div>

                        </div>
                    </Link>
                    <Link href="/admin/stations">
                        <div className="card bg-blue-100/20 backdrop-blur-md p-4 rounded-3xl shadow-sm hover:shadow-[0_0_20px_rgba(0,200,255,0.4)] cursor-pointer transition-all duration-200">
                            <div className="flex justify-between items-center gap-2">
                                <div>
                                    <div className="flex justify-start gap-2">
                                        <EvCharger size={15} className=" text-blue-950" />
                                        <h2 className="text-xs ">Stations</h2>
                                    </div>
                                    <p className="font-semibold" >Manage all charging stations</p>
                                </div>
                                <ChevronRight size={20} className=" text-blue-950" />
                            </div>
                        </div>
                    </Link>

                    <Link href="/">
                        <div className="card bg-blue-100/20 backdrop-blur-md p-4 rounded-3xl shadow-sm hover:shadow-[0_0_20px_rgba(0,200,255,0.4)] cursor-pointer transition-all duration-200">
                            <div className="flex justify-between items-center gap-2">
                                <div>
                                    <div className="flex justify-start gap-2">
                                        <Map size={15} className=" text-blue-950" />
                                        <h2 className="text-xs ">Map</h2>
                                    </div>
                                    <p className="font-semibold" >Go to the Map</p>
                                </div>
                                <ChevronRight size={20} className=" text-blue-950" />
                            </div>
                        </div>
                    </Link>
                </div>

                <button
                    className="btn btn-sm bg-red-800 text-white border-none rounded-full shadow flex justify-between mt-4"
                    onClick={() => signOut({ callbackUrl: "/sign-in" })}
                >

                    <span
                        type="submit"
                        className="flex justify-center items-center gap-2 font-semibold">
                        <DoorOpen size={20} />
                        Sign out
                    </span>

                </button>
            </div>
        </>
    )
}