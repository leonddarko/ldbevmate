"use client";

import { Marker } from "react-leaflet";
import L from "leaflet";

const userIcon = new L.DivIcon({
  className: "",
  html: `
    <div class="relative">
      <span class="absolute inline-flex h-6 w-6 rounded-full bg-blue-400 opacity-75 animate-ping"></span>
      <span class="relative inline-flex rounded-full h-6 w-6 bg-blue-600 border-2 border-white"></span>
    </div>
  `,
  iconSize: [20, 20],
});

export default function UserLocationMarker({ position }) {
  if (!position) return null;

  return <Marker position={position} icon={userIcon} />;
}