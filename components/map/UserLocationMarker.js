"use client";

import { Marker } from "react-leaflet";
import L from "leaflet";

const userIcon = new L.DivIcon({
  className: "",
  html: `
    <div class="relative">
      <span class="absolute inline-flex h-4 w-4 rounded-full bg-blue-600 opacity-75 animate-ping"></span>
      <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-950 border-2 border-white"></span>
    </div>
  `,
  iconSize: [20, 20],
});

export default function UserLocationMarker({ position }) {
  if (!position) return null;

  return <Marker position={position} icon={userIcon} />;
}