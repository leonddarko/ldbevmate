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

  if (!session) return null;

  return <MapView />;
}