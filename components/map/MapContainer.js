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

const redEvIcon = new L.Icon({
    iconUrl: "/icons/ev-charger-red.svg", // place in /public/icons
    iconSize: [40, 40],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
});

const greenEvIcon = new L.Icon({
    iconUrl: "/icons/ev-charger-green.svg", // place in /public/icons
    iconSize: [40, 40],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
});


export function MapController({ centerTrigger, position }) {
    const map = useMap();

    useEffect(() => {
        if (!position) return;

        map.flyTo(position, map.getZoom(), {
            duration: 1.2,
        });

    }, [centerTrigger]);

    return null;
}

export default function MapView() {
    const [selectedStation, setSelectedStation] = useState(null);
    const [userPosition, setUserPosition] = useState(null);
    const [stations, setStations] = useState([]);

    const [centerTrigger, setCenterTrigger] = useState(0);

    // Loader UI
    const [isLoadingLocation, setIsLoadingLocation] = useState(true);
    const [isLoadingStations, setIsLoadingStations] = useState(true);
    const [hasCentered, setHasCentered] = useState(false);

    const { data: session } = useSession();

    // Request User Location Access
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
    // Request User Location Access


    // Get user's location/position 
    const lastPositionRef = useRef(null);

    function getDistanceMeters(lat1, lon1, lat2, lon2) {
        const R = 6371000;
        const toRad = (deg) => (deg * Math.PI) / 180;

        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    useEffect(() => {
        if (!navigator.geolocation) return;

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                const newCoords = [lat, lng];

                // if (!lastPositionRef.current) {
                //     lastPositionRef.current = newCoords;
                //     setUserPosition(newCoords);
                //     return;
                // }

                
                if (!lastPositionRef.current) {
                    lastPositionRef.current = newCoords;
                    setUserPosition(newCoords);
                    setIsLoadingLocation(false);
                    return;
                }

                const [prevLat, prevLng] = lastPositionRef.current;

                const distance = getDistanceMeters(
                    prevLat,
                    prevLng,
                    lat,
                    lng
                );

                // Only update if user moved more than 30 meters
                if (distance > 30) {
                    lastPositionRef.current = newCoords;
                    setUserPosition(newCoords);
                }

            },
            (error) => {
                console.log("Location access denied or unavailable.");
            },
            {
                enableHighAccuracy: true,
                maximumAge: 15000,
                timeout: 7000,
            }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // Get user's location/position 


    // Fetch Nearby Stations When Location Updates
    useEffect(() => {
        if (!userPosition) return;

        async function fetchStations() {
            try {
                const res = await fetch(
                    `/api/stations/nearby?lat=${userPosition[0]}&lng=${userPosition[1]}&radius=30000`
                );
                const data = await res.json();
                setStations(data);
            } catch (err) {
                console.error("Failed to fetch stations", err);
            } finally {
                setIsLoadingStations(false);
            }
        }

        fetchStations();
    }, [userPosition]);
    // Fetch Nearby Stations When Location Updates



    // Auto - Center When Everything Is Ready
    useEffect(() => {
        if (
            userPosition &&
            !isLoadingStations &&
            !hasCentered
        ) {
            setCenterTrigger((prev) => prev + 1);
            setHasCentered(true);
        }
    }, [userPosition, isLoadingStations]);
    // Auto - Center When Everything Is Ready


    return (
        <div className="h-screen w-full relative overflow-hidden">
            {/* Loader UI  */}
            {(isLoadingLocation || isLoadingStations) && (
                <div className="absolute inset-0 z-9999 flex flex-col items-center justify-center bg-white/70 backdrop-blur-lg">
{/* 
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div> */}
                    <span className="loading loading-spinner loading-lg text-blue-500"></span>

                    <p className="text-blue-950 font-medium text-center px-6">
                        Loading your location and nearby stations...
                    </p>

                </div>
            )}

            <MapContainer
                center={userPosition || [5.547671, -0.192268]} // lat, lng
                zoom={13}
                scrollWheelZoom={true}
                className="h-full w-full"
            >

                <UserLocationMarker position={userPosition} />

                <MapController
                    position={userPosition}
                    centerTrigger={centerTrigger}
                />

                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {stations.map((station) => (
                    <Marker
                        key={station._id}
                        position={[
                            station.location.coordinates[1],
                            station.location.coordinates[0],
                        ]}
                        // icon={evIcon}
                        icon={station.availabilityStatus === "available" ? greenEvIcon : redEvIcon}
                        eventHandlers={{
                            click: () => setSelectedStation(station),
                        }}
                    />
                ))}

                {/* {dummyStations.map((station) => (
                    <Marker
                        key={station.id}
                        position={[station.coordinates[1], station.coordinates[0]]}
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
                    if (!userPosition) return;
                    setCenterTrigger((prev) => prev + 1);
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
                z-9999
                cursor-pointer
    "
            >
                <LocateFixedIcon className="text-blue-950" size={20} />
            </button>

            {/* Liquid Glass Card */}
            {selectedStation && (
                <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-[95%] max-w-md backdrop-blur-2xl bg-white/20 border border-white/30 rounded-3xl shadow-2xl p-6 text-blue-950 transition-all duration-300">
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