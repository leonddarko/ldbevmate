"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import { dummyStations } from "@/lib/dummyStations";
import L from "leaflet";
// import "leaflet-rotate";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";


import { useMap, Tooltip } from "react-leaflet";

import BottomSheet from "../ui/BottomSheet";
import UserLocationMarker from "./UserLocationMarker";

import LocationRequiredModal from "./LocationRequiredModal";
import { LocateFixedIcon, Plug, Route, Send, SquareArrowOutUpRight, Trash2, X, } from "lucide-react";
import UserDropdown from "../ui/UserDropdown";
import { useSession } from "next-auth/react";
import BecomeOperatorModal from "../ui/BecomeOperatorModal";
import { useRouter } from "next/navigation";


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
    iconSize: [30, 30],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
});

const greenEvIcon = new L.Icon({
    iconUrl: "/icons/ev-charger-green.svg", // place in /public/icons
    iconSize: [30, 30],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
});

const whiteEvIcon = new L.Icon({
    iconUrl: "/icons/ev-charger-white.svg", // place in /public/icons
    iconSize: [30, 30],
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

    const [isRoutingLoading, setIsRoutingLoading] = useState(false);
    const [isRouting, setIsRouting] = useState(false);
    const [routeInfo, setRouteInfo] = useState(null);

    const [zoomLevel, setZoomLevel] = useState(13);


    const [showReviews, setShowReviews] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");


    const { data: session } = useSession();
    const router = useRouter();

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


    // Routing Function
    const routingRef = useRef(null);
    const mapRef = useRef(null);

    const destinationRef = useRef(null);
    const isRoutingRef = useRef(false);

    // function createRoute(userLocation, stationLocation) {

    //     const map = mapRef.current;
    //     if (!map) return;

    //     if (routingRef.current) {
    //         map.removeControl(routingRef.current);
    //     }

    //     routingRef.current = L.Routing.control({
    //         router: L.Routing.osrmv1({
    //             serviceUrl: "https://router.project-osrm.org/route/v1"
    //         }),

    //         waypoints: [
    //             L.latLng(userLocation.lat, userLocation.lng),
    //             L.latLng(stationLocation.lat, stationLocation.lng)
    //         ],

    //         createMarker: () => null,
    //         routeWhileDragging: false,
    //         addWaypoints: false,
    //         draggableWaypoints: false,
    //         fitSelectedRoutes: true,
    //         show: false,
    //         lineOptions: {
    //             styles: [{ color: "#2563eb", weight: 5 }]
    //         }

    //     }).addTo(map);

    //     setIsRouting(true);

    //     // 📍 Capture route details
    //     routingRef.current.on("routesfound", function (e) {

    //         setIsRoutingLoading(false);

    //         const route = e.routes[0];

    //         const distance = route.summary.totalDistance / 1000;
    //         const time = route.summary.totalTime / 60;

    //         setRouteInfo({
    //             name: selectedStation.name,
    //             distance: distance.toFixed(2),
    //             eta: time.toFixed(0)
    //         });

    //         // zoom map to show entire route
    //         map.fitBounds(L.latLngBounds(route.coordinates));
    //     });
    // }

    function createRoute(userLocation, stationLocation) {
        const map = mapRef.current;
        if (!map) return;

        destinationRef.current = stationLocation;
        isRoutingRef.current = true;

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
            show: false,

            lineOptions: {
                styles: [{ color: "#2563eb", weight: 5 }]
            }

        }).addTo(map);

        setIsRouting(true);

        routingRef.current.on("routesfound", (e) => {
            setIsRoutingLoading(false);

            const route = e.routes[0];

            const distance = route.summary.totalDistance / 1000;
            const time = route.summary.totalTime / 60;

            setRouteInfo({
                name: selectedStation?.name,
                distance: distance.toFixed(2),
                eta: time.toFixed(0)
            });

            map.fitBounds(L.latLngBounds(route.coordinates));
        });
    }

    const lastRouteUpdateRef = useRef(null);

    useEffect(() => {
        if (!isRoutingRef.current) return;
        if (!destinationRef.current) return;
        if (!userPosition) return;

        const [lat, lng] = userPosition;

        if (lastRouteUpdateRef.current) {
            const d = getDistanceMeters(
                lastRouteUpdateRef.current.lat,
                lastRouteUpdateRef.current.lng,
                lat,
                lng
            );

            if (d < 30) return; // only update if moved > 30m
        }

        lastRouteUpdateRef.current = { lat, lng };

        createRoute({ lat, lng }, destinationRef.current);

    }, [userPosition]);

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
        setRouteInfo(null);
    }
    // Cancel Routing Function


    // Track map zoom changes for Tooltips
    function ZoomWatcher({ setZoomLevel }) {
        useMapEvents({
            zoomend(e) {
                setZoomLevel(e.target.getZoom());
            },
        });

        return null;
    }

    // Fetch Reviews Function
    async function fetchReviews(stationId) {
        setReviewLoading(true);
        console.log(stationId);

        try {
            const res = await fetch(`/api/reviews/${stationId}`);
            const data = await res.json();
            setReviews(data);
            console.log(reviews);

        } catch (error) {
            console.error("Failed to load reviews", error);
        } finally {
            setReviewLoading(false);
        }
    }
    // Fetch Reviews Function


    // Submit Review Function
    async function submitReview() {
        try {
            await fetch("/api/reviews", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    station: selectedStation._id,
                    rating,
                    comment,
                }),
            });

            setComment("");
            setRating(0);
            fetchReviews(selectedStation._id);

        } catch (error) {
            console.error("Failed to submit review", error);
        }
    }
    // Submit Review Function


    // Delete Review Function
    async function deleteReview(reviewId) {
        if (!confirm("Delete your review ?")) return;

        try {
            await fetch(`/api/review/${reviewId}`, {
                method: "DELETE",
            });

            // Refresh reviews
            fetchReviews(selectedStation._id);

        } catch (error) {
            console.error("Failed to delete review", error);
        }
    }
    // Delete Review Function


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
                // rotate={true}
                // touchRotate={true}
                // rotateControl={true}
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

                <ZoomWatcher setZoomLevel={setZoomLevel} />

                {/* <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                /> */}

                <TileLayer
                    attribution='&copy; OpenStreetMap &copy; CARTO'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />


                {stations.map((station) => (
                    <Marker
                        key={station._id}
                        position={[
                            station.location.coordinates[1],
                            station.location.coordinates[0],
                        ]}
                        // icon={evIcon}
                        icon={station.availabilityStatus === "available"
                            ? whiteEvIcon
                            : redEvIcon}
                        eventHandlers={{
                            click: () => {
                                setSelectedStation(station)
                            }
                        }}
                    >
                        {zoomLevel >= 15 && (
                            <Tooltip permanent direction="left" offset={[-25, -20]} opacity={0.8}>
                                <div className="bg-white/10 backdrop-blur-2xl px-2 py-1 rounded-xl shadow text-[11px]">
                                    <div className="font-bold text-sm text-blue-900">{station.name}</div>
                                    <div className=" text-xs">Status • <span className=" font-bold text-green-800">
                                        {station.availabilityStatus}
                                    </span></div>
                                    <div className="xs">Connectors • <span className=" font-bold">
                                        {station.connectors.join(", ")}
                                    </span></div>

                                    <div className="xs">{station.powerKW}kW
                                        {station.pricePerKWh > 0 && (
                                            <>
                                                • <span className=" font-bold">₵{station.pricePerKWh} / kWh</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Tooltip>
                        )}
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
                <>
                    <BecomeOperatorModal />
                    {/* <BecomeRealtorModal /> */}
                </>
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
                backdrop-blur-md bg-white
                shadow-[0_0_20px_rgba(0,200,255,0.4)]
                border border-white/20
                flex items-center justify-center
                hover:scale-110
                transition-all duration-200
                z-9999
                cursor-pointer
    "
            >
                <LocateFixedIcon className="text-blue-800" size={20} />
            </button>

            {/* Liquid Glass Card */}
            {selectedStation && (
                <div className="absolute bottom-1/6 left-1/2 -translate-x-1/2 w-[95%] max-w-md backdrop-blur-xl bg-white/85 border border-white/40 rounded-[2rem] shadow-[0_20px_50px_rgba(0,150,255,0.25)] overflow-hidden text-blue-950 transition-all duration-300 transform animate-fade-in">

                    {/* Top Image Banner Section */}
                    <div className="relative w-full h-44 bg-gradient-to-b from-blue-950/20 to-blue-950/5 overflow-hidden border-b border-white/20">
                        {selectedStation.images && selectedStation.images.length > 0 ? (
                            <img
                                src={selectedStation.images[0]}
                                alt={selectedStation.name}
                                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-blue-950/20 gap-1 bg-blue-50/50">
                                <Plug size={36} strokeWidth={1.2} />
                                <span className="text-[10px] uppercase font-black tracking-widest">No Station Preview</span>
                            </div>
                        )}

                        {/* Premium Absolute Status Tag */}
                        <div className="absolute top-4 left-4">
                            {selectedStation.availabilityStatus === "available" && (
                                <span className="backdrop-blur-md bg-green-500/90 border border-green-400/30 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 tracking-wide">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    Available
                                </span>
                            )}
                            {selectedStation.availabilityStatus === "busy" && (
                                <span className="backdrop-blur-md bg-amber-500/90 border border-amber-400/30 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 tracking-wide">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                    Busy
                                </span>
                            )}
                            {selectedStation.availabilityStatus === "offline" && (
                                <span className="backdrop-blur-md bg-red-600/90 border border-red-500/30 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 tracking-wide">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                    Offline
                                </span>
                            )}
                        </div>

                        {/* Total Images Count Badge */}
                        {selectedStation.images && selectedStation.images.length > 1 && (
                            <div className="absolute bottom-3 right-4 backdrop-blur-md bg-black/60 border border-white/10 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                                +{selectedStation.images.length - 1} More Views
                            </div>
                        )}

                        {/* Floating Close Button */}
                        <button
                            onClick={() => setSelectedStation(null)}
                            className="absolute top-4 right-4 backdrop-blur-md bg-white/70 hover:bg-white text-blue-950 p-2 rounded-full cursor-pointer border border-white/40 shadow-md transition-all duration-200 group"
                        >
                            <X size={16} className="text-gray-800 transition-colors group-hover:text-red-600" />
                        </button>
                    </div>

                    {/* Card Details Body */}
                    <div className="p-5">
                        {/* Title & Ratings Line */}
                        <div className="flex justify-between items-start gap-3">
                            <div className="flex-grow">
                                <h2 className="text-xl font-black tracking-tight leading-tight text-blue-950">
                                    {selectedStation.name}
                                </h2>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 backdrop-blur-md bg-blue-50 border border-blue-100/60 px-2 py-0.5 rounded-lg text-xs font-bold text-blue-950 shadow-sm">
                                <span className="text-amber-500">★</span>
                                <span>
                                    {selectedStation.reviewCount > 0
                                        ? selectedStation.averageRating.toFixed(1)
                                        : "0.0"}
                                </span>
                                <span className="text-gray-400 font-medium">({selectedStation.reviewCount})</span>
                            </div>
                        </div>

                        {/* Premium Mini Spec Boxes */}
                        <div className="grid grid-cols-3 gap-2 mt-4 border-t border-b border-blue-950/5 py-3">
                            <div className="bg-blue-50/30 border border-blue-100/50 rounded-xl p-2 text-center">
                                <p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Power Output</p>
                                <p className="text-sm font-black text-blue-950 mt-0.5">{selectedStation.powerKW} kW</p>
                            </div>
                            <div className="bg-blue-50/30 border border-blue-100/50 rounded-xl p-2 text-center">
                                <p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Outlets</p>
                                <p className="text-sm font-black text-blue-950 mt-0.5">{selectedStation.outlets || 0} Plugs</p>
                            </div>
                            <div className="bg-blue-50/30 border border-blue-100/50 rounded-xl p-2 text-center">
                                <p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Pricing</p>
                                <p className="text-sm font-black text-blue-950 mt-0.5">
                                    {selectedStation.pricePerKWh > 0 ? `₵${selectedStation.pricePerKWh}` : "Free"}
                                </p>
                            </div>
                        </div>

                        {/* Connectors Row */}
                        <div className="mt-3.5 flex items-start gap-2 text-xs">
                            <span className="font-extrabold text-blue-950/50 shrink-0 uppercase tracking-wide">Connectors:</span>
                            <span className="font-semibold text-blue-950/80 line-clamp-2">
                                {selectedStation.connectors && selectedStation.connectors.length > 0
                                    ? selectedStation.connectors.join(", ")
                                    : "Unknown"}
                            </span>
                        </div>

                        {/* Action Buttons Section */}
                        <div className="mt-5 space-y-2.5">
                            {/* Directions Button (Primary Call to Action) */}
                            <button
                                onClick={async () => {
                                    if (!userPosition) return;
                                    setIsRoutingLoading(true);

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
                                }}
                                className="flex justify-center items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.99] transition-all font-bold tracking-wide rounded-2xl py-3 cursor-pointer w-full shadow-md shadow-blue-500/20 text-sm"
                            >
                                <Route size={18} />
                                <span>Get Directions</span>
                            </button>

                            {/* Secondary Button Row: Details & Reviews */}
                            <div className="flex gap-2.5">
                                <button
                                    onClick={() => {
                                        router.push(`/station/${selectedStation._id}/details`);
                                    }}
                                    className="flex justify-center items-center gap-2 w-1/2 bg-white hover:bg-gray-50 text-blue-900 border border-gray-200 font-bold text-xs rounded-xl py-2.5 transition active:scale-[0.98] cursor-pointer shadow-sm"
                                >
                                    <span>View Details</span>
                                </button>

                                <button
                                    onClick={() => {
                                        setShowReviews(true);
                                        fetchReviews(selectedStation._id);
                                    }}
                                    className="flex justify-center items-center gap-2 w-1/2 bg-white hover:bg-gray-50 text-blue-900 border border-gray-200 font-bold text-xs rounded-xl py-2.5 transition active:scale-[0.98] cursor-pointer shadow-sm"
                                >
                                    <span>Read Reviews</span>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Reviews Bottom Sheet Component */}
            {showReviews && (
                <div className="
                    fixed inset-0 z-99999
                    flex items-end justify-center
                    bg-black/50
                    backdrop-blur-sm
                ">
                    <div className="
                            w-full max-w-md h-[70vh]
                            bg-white/70 rounded-t-3xl
                            shadow-sm
                            flex flex-col
                            overflow-hidden
                    ">

                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 text-lg flex justify-between items-center">
                            <div className="flex flex-col gap-3">
                                <div className="text-blue-800 font-bold">{selectedStation.name}</div>
                                <div className="text-sm leading-2 text-gray-500">Ratings & Comments</div>
                                <div className="text-xs text-gray-500 leading-2">
                                    ★ <span className="font-medium text-black">
                                        {selectedStation.reviewCount > 0
                                            ? selectedStation.averageRating.toFixed(1)
                                            : "No ratings"}
                                    </span> ({selectedStation.reviewCount})
                                </div>
                            </div>

                            <button
                                onClick={() => setShowReviews(false)}
                                className="btn btn-ghost text-lg transition px-2.5 py-2.5 rounded-full cursor-pointer shadow-none border-white hover:bg-white hover:shadow-sm"
                            >
                                <X size={20} className="text-red-700" />
                            </button>
                        </div>

                        {/* Scrollable Reviews */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">

                            {reviewLoading ? (
                                <p className="text-center text-sm">Loading reviews...</p>
                            ) : reviews.length === 0 ? (
                                <p className="text-center text-sm text-gray-700">
                                    No reviews yet.
                                </p>
                            ) : (
                                reviews.map((review) => (
                                    <div
                                        key={review._id}
                                        className=" bg-gray-200 rounded-2xl p-3 flex justify-between items-center gap-3"
                                    >
                                        <div className="flex-1">
                                            <div className="font-bold text-xs text-black">
                                                {review.user?.name || "Anonymous"}
                                            </div>

                                            <div className="text-yellow-500 text-md">
                                                {"★".repeat(review.rating)}
                                            </div>

                                            <div className="text-sm text-black/80">
                                                {review.comment}
                                            </div>
                                        </div>

                                        {/* Show only if owner */}
                                        {session?.user?.id === review.user?._id && (
                                            <button
                                                onClick={() => deleteReview(review._id)}
                                                className="
                                                    text-xs
                                                    text-red-500
                                                    hover:text-red-700
                                                    transition
                                                    cursor-pointer
                                                    p-2
                                                    hover:bg-gray-300
                                                    rounded-full
                                                    "
                                            >
                                                <Trash2 size={15} className=" text-red-800" />
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer Input */}
                        <div className="border-t border-gray-300 p-4 space-y-3 bg-white">

                            {/* Rating Stars */}
                            <div className="flex gap-2 justify-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`text-3xl ${star <= rating
                                            ? "text-yellow-500"
                                            : "text-gray-300"
                                            }`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>

                            {/* Comment Input */}

                            <div className="mt-2 flex justify-center items-center gap-2">
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Describe your experience..."
                                    className="
                                w-full bg-gray-200 rounded-2xl p-3
                                resize-none outline-none
                                "
                                    rows={1}
                                />

                                <button
                                    onClick={submitReview}
                                    className="btn btn-sm rounded-full bg-blue-600 cursor-pointer border-none"
                                >
                                    <Send size={20} className="text-white " />
                                </button>
                            </div>

                        </div>

                    </div>
                </div>
            )}
            {/* Reviews Bottom Sheet Component */}

            {isRoutingLoading && (
                <button
                    className="
                    fixed bottom-1/6 left-1/2 -translate-x-1/2
                    backdrop-blur-2xl
                    bg-blue-600/80 text-white font-medium
                    px-5 py-2
                    rounded-full
                    shadow-lg
                    transition-all duration-200
                    z-9999
                    flex justify-center items-center gap-3 btn-disabled
                    "
                >
                    <span className="loading loading-spinner loading-sm"></span>
                    <span className="md:hidden">Calculating...</span>
                    <span className="hidden md:inline-block">Calculating Route...</span>
                </button>
            )}

            {!isRoutingLoading && isRouting && (
                <button
                    onClick={cancelRoute}
                    className="
                    fixed bottom-1/12 left-1/2 -translate-x-1/2
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

            {routeInfo && (
                <div
                    className="
                    fixed bottom-1/6 left-1/2 -translate-x-1/2
                    backdrop-blur-md
                    bg-white
                    border border-white/30
                    shadow-[0_8px_40px_rgba(0,0,0,0.25)]
                    rounded-2xl
                    px-5 py-3
                    flex justify-between items-start gap-6
                    z-9999
                    transition-all duration-300 
                    w-92
                    "
                >

                    <div className="flex flex-col items-start">
                        <span className="text-xs text-gray-400 opacity-80">
                            Destination Charger
                        </span>
                        <span className="text-xs font-bold text-blue-800">
                            {routeInfo.name}
                        </span>
                    </div>

                    {/* <div className="w-px h-8 bg-white/40"></div> */}

                    <div className="flex flex-col items-start text-center">
                        <span className="text-xs text-gray-400 opacity-80">Distance</span>
                        <span className="text-xs font-bold text-blue-800">
                            {routeInfo.distance} km
                        </span>
                    </div>

                    {/* <div className="w-px h-8 bg-white/40"></div> */}

                    <div className="flex flex-col items-start text-center">
                        <span className="text-xs text-gray-400 opacity-80">ETA</span>
                        <span className="text-xs font-bold text-blue-800">
                            {routeInfo.eta} min
                        </span>
                    </div>

                </div>
            )}

            {/* Request Location Modal */}
            <LocationRequiredModal
                open={!!locationError}
                message={locationError?.message}
                onRetry={() => window.location.reload()}
            />
        </div>

    );
}