"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import { dummyStations } from "@/lib/dummyStations";
import L from "leaflet";
import { useMap } from "react-leaflet";

import BottomSheet from "../ui/BottomSheet";
import UserLocationMarker from "./UserLocationMarker";

import { checkUserLocation } from "@/utils/locationService";
import LocationRequiredModal from "./LocationRequiredModal";
import { LocateFixedIcon, } from "lucide-react";
import UserDropdown from "../ui/UserDropdown";
import { useSession } from "next-auth/react";
import BecomeOperatorModal from "../ui/BecomeOperatorModal";


// Fix default marker icon issue in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


function RecenterMap({ position }) {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo(position, 14, { duration: 1.5 });
        }
    }, [position]);

    return null;
}

export default function MapView() {
    const [selectedStation, setSelectedStation] = useState(null);
    const [userPosition, setUserPosition] = useState(null);
    const [stations, setStations] = useState([]);

    const { data: session } = useSession();

    // Request Location
    const [locationError, setLocationError] = useState(null);
    const requestLocation = () => {
        checkUserLocation(
            (position) => {
                console.log("User location:", position.coords);
                setLocationError(null);
            },
            (error) => {
                setLocationError(error);
            }
        );
    };

    useEffect(() => {
        requestLocation();
    }, []);
    // Request Location

    // Get users real current location/position 

    useEffect(() => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = [
                    position.coords.latitude,
                    position.coords.longitude,
                ];
                setUserPosition(coords);
            },
            (error) => {
                console.log("Location access denied or unavailable.");
            }
        );
    }, []);


    const [recenterTrigger, setRecenterTrigger] = useState(null);


    // Fetch Nearby Stations When Location Updates

    // useEffect(() => {
    //     if (!userPosition) return;

    //     async function fetchStations() {
    //         try {
    //             const res = await fetch(
    //                 `/api/stations/nearby?lat=${userPosition[0]}&lng=${userPosition[1]}&radius=10000`
    //             );
    //             const data = await res.json();
    //             setStations(data);
    //         } catch (err) {
    //             console.error("Failed to fetch stations", err);
    //         }
    //     }

    //     fetchStations();
    // }, [userPosition]);

    return (
        <div className="h-screen w-full relative overflow-hidden">
            <MapContainer
                center={userPosition || [5.547671, -0.192268]} // lat, lng
                zoom={13}
                scrollWheelZoom={true}
                className="h-full w-full"
            >

                <UserLocationMarker position={userPosition} />
                <RecenterMap position={userPosition} />
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {dummyStations.map((station) => (
                    <Marker
                        key={station.id}
                        position={[station.coordinates[1], station.coordinates[0]]}
                        eventHandlers={{
                            click: () => setSelectedStation(station),
                        }}
                    />
                ))}


                {/* {stations.map((station) => (
                    <Marker
                        key={station._id}
                        position={[
                            station.location.coordinates[1],
                            station.location.coordinates[0],
                        ]}
                        eventHandlers={{
                            click: () => setSelectedStation(station),
                        }}
                    />
                ))} */}

            </MapContainer>

            {session?.user?.role === "user" && (
                <BecomeOperatorModal />
            )}

            <UserDropdown />

            {/* Button to center around user's current location */}
            <button
                onClick={() => {
                    if (!navigator.geolocation) return;

                    navigator.geolocation.getCurrentPosition((position) => {
                        const coords = [
                            position.coords.latitude,
                            position.coords.longitude,
                        ];

                        setUserPosition(coords);
                    });
                }}
                className="
                    fixed bottom-6 right-3
                    w-12 h-12
                    rounded-full
                    backdrop-blur-2xl bg-white/10
                    shadow-[0_0_20px_rgba(0,200,255,0.4)]
                    border border-white/20
                    flex items-center justify-center
                    hover:scale-110
                    transition-all duration-200
                    z-[9999]
                    cursor-pointer
                    "
            >
                <LocateFixedIcon className="text-blue-950" size={20} />
            </button>

            {/* Liquid Glass Card */}
            {selectedStation && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[95%] max-w-md backdrop-blur-2xl bg-white/20 border border-white/30 rounded-3xl shadow-2xl p-6 text-blue-950 transition-all duration-300">
                    <h2 className="text-xl font-bold">
                        {selectedStation.name}
                    </h2>

                    <div className="mt-3 flex justify-between text-sm opacity-80">
                        <span>{selectedStation.powerKW} kW</span>
                        <span>₵{selectedStation.pricePerKWh}/kWh</span>
                    </div>

                    <div className="mt-2 text-sm">
                        Connectors: {selectedStation.connectors.join(", ")}
                    </div>

                    <div className="mt-3 text-sm">
                        ⭐ {selectedStation.rating}
                    </div>

                    <button
                        onClick={() => setSelectedStation(null)}
                        className="mt-4 w-full bg-blue-950 text-white hover:bg-blue-950/90 transition rounded-full py-2"
                    >
                        Close
                    </button>
                </div>
            )}

            {/* Bottom Sheet */}
            {/* <BottomSheet
                station={selectedStation}
                onClose={() => setSelectedStation(null)}
            /> */}


            {/* Request Location Modal */}
            <LocationRequiredModal
                open={!!locationError}
                message={locationError?.message}
                onRetry={requestLocation}
            />
        </div>

    );
}