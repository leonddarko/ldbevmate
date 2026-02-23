"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const MapView = dynamic(() => import("@/components/map/MapContainer"), {
  ssr: false,
});

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/sign-in");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-cyan-500"></span>
      </div>
    );
  }

  if (!session) return null;

  return <MapView />;
}