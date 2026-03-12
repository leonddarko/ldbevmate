"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import { dummyStations } from "@/lib/dummyStations";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";


import { useMap } from "react-leaflet";

import BottomSheet from "../ui/BottomSheet";
import UserLocationMarker from "./UserLocationMarker";

import LocationRequiredModal from "./LocationRequiredModal";
import { LocateFixedIcon, Route, X, } from "lucide-react";
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

    const [locationError, setLocationError] = useState(null);

    const [isRouting, setIsRouting] = useState(false);

    const { data: session } = useSession();

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
        if (!("geolocation" in navigator)) {
            setLocationError({
                type: "UNSUPPORTED",
                message: "Geolocation is not supported by your browser.",
            });
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                const newCoords = [lat, lng];

                // First location fix
                if (!lastPositionRef.current) {
                    lastPositionRef.current = newCoords;
                    setUserPosition(newCoords);
                    setIsLoadingLocation(false);
                    setLocationError(null);
                    return;
                }

                const [prevLat, prevLng] = lastPositionRef.current;

                const distance = getDistanceMeters(
                    prevLat,
                    prevLng,
                    lat,
                    lng
                );

                // Update only if user moved > 30m
                if (distance > 30) {
                    lastPositionRef.current = newCoords;
                    setUserPosition(newCoords);
                }
            },

            (error) => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setLocationError({
                            type: "DENIED",
                            message:
                                "Location permission denied. Please enable it.",
                        });
                        break;

                    case error.POSITION_UNAVAILABLE:
                        setLocationError({
                            type: "UNAVAILABLE",
                            message: "Location services are turned off.",
                        });
                        break;

                    case error.TIMEOUT:
                        setLocationError({
                            type: "TIMEOUT",
                            message: "Location request timed out.",
                        });
                        break;

                    default:
                        setLocationError({
                            type: "UNKNOWN",
                            message: "An unknown location error occurred.",
                        });
                }

                setIsLoadingLocation(false);
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


    const routingRef = useRef(null);
    const mapRef = useRef(null);

    // Routing Function
    function createRoute(userLocation, stationLocation) {

        const map = mapRef.current;
        if (!map) return;

        if (routingRef.current) {
            map.removeControl(routingRef.current);
        }

        routingRef.current = L.Routing.control({
            router: L.Routing.osrmv1({
                serviceUrl: "https://router.project-osrm.org/route/v1"
            }),

            waypoints: [
                L.latLng(userLocation.lat, userLocation.lng),
                L.latLng(stationLocation.lat, stationLocation.lng)
            ],

            createMarker: () => null,
            routeWhileDragging: false,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,

            lineOptions: {
                styles: [{ color: "#2563eb", weight: 4 }]
            }

        }).addTo(map);

        setIsRouting(true);

        // 📍 Capture route details
        routingRef.current.on("routesfound", function (e) {

            const route = e.routes[0];

            const distance = route.summary.totalDistance / 1000;
            const time = route.summary.totalTime / 60;

            console.log(`Distance: ${distance.toFixed(2)} km`);
            console.log(`ETA: ${time.toFixed(0)} minutes`);

            // zoom map to show entire route
            map.fitBounds(L.latLngBounds(route.coordinates));
        });
    }
    // Routing Function

    // Cancel Routing Function
    function cancelRoute() {
        const map = mapRef.current;

        if (!map) return;

        if (routingRef.current) {
            map.removeControl(routingRef.current);
            routingRef.current = null;
        }

        setIsRouting(false);
    }
    // Cancel Routing Function


    return (
        <div className="h-screen w-full relative overflow-hidden">
            {/* Loader UI  */}
            {(isLoadingLocation || isLoadingStations) && (
                <div className="absolute inset-0 z-10000 flex flex-col items-center justify-center bg-white/70 backdrop-blur-xs">
                    {/* 
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div> */}
                    <span className="loading loading-spinner loading-lg text-blue-900"></span>

                    <p className="text-blue-950 font-medium text-center px-6">
                        Loading your location and nearby stations...
                    </p>

                </div>
            )}

            <MapContainer
                center={userPosition || [5.547671, -0.192268]}
                zoom={13}
                scrollWheelZoom={true}
                className="h-full w-full"
                whenReady={(e) => {
                    mapRef.current = e.target;
                }}
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
                            click: () => {
                                // isRouting && cancelRoute()
                                setSelectedStation(station)
                            }
                        }}
                    >
                        {/* <Popup>

                            <h3>{station.name}</h3>
                        </Popup> */}
                    </Marker>
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
                w-11 h-11
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

                    <div className=" flex justify-center items-center gap-2">
                        <button
                            onClick={async () => {

                                if (!userPosition) return;

                                const userLocation = {
                                    lat: userPosition[0],
                                    lng: userPosition[1],
                                };

                                const stationLocation = {
                                    lat: selectedStation.location.coordinates[1],
                                    lng: selectedStation.location.coordinates[0],
                                };

                                createRoute(userLocation, stationLocation);
                                setSelectedStation(null);
                                console.log("Creating route:", userLocation, stationLocation);
                                console.log("Routing:", L.Routing);
                            }}
                            className="flex justify-center items-center gap-4 mt-4 w-full bg-blue-600 text-white hover:bg-blue-600/90 transition rounded-full py-2 cursor-pointer"
                        >
                            <Route size={20} />
                            <span>Directions</span>
                        </button>
                        {/* {isRouting && (
                            <button
                                onClick={cancelRoute}
                                className="
                            flex justify-center items-center gap-4 mt-4 w-full bg-red-600 text-white hover:bg-blue-red/90 transition rounded-full py-2 cursor-pointer
                            "
                            >
                                End Route
                            </button>
                        )} */}
                        <button
                            onClick={() => setSelectedStation(null)}
                            className="mt-4 w-full bg-blue-950 text-white hover:bg-blue-950/90 transition rounded-full py-2 cursor-pointer"
                        >
                            Close
                        </button>
                    </div>

                </div>
            )}



            {isRouting && (
                <button
                    onClick={cancelRoute}
                    className="
                    fixed bottom-1/6 left-1/2 -translate-x-1/2
                    backdrop-blur-2xl
                    bg-red-500 text-white font-medium
                    px-5 py-2
                    rounded-full
                    shadow-lg
                    hover:bg-red-600
                    hover:scale-110
                    transition-all duration-200
                    z-9999
                    cursor-pointer
                    flex justify-center items-center gap-4
                    "
                >
                    <X size={20} />
                    <span>End Route</span>
                </button>
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
                onRetry={() => window.location.reload()}
            />

        </div>

    );
}