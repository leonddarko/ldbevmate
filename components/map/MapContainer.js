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
import { LocateFixedIcon, Route, Send, SquareArrowOutUpRight, Trash2, X, } from "lucide-react";
import UserDropdown from "../ui/UserDropdown";
import { useSession } from "next-auth/react";
import BecomeOperatorModal from "../ui/BecomeOperatorModal";
import BecomeRealtorModal from "../ui/BecomeRealtorModal";

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
            show: false,
            lineOptions: {
                styles: [{ color: "#2563eb", weight: 5 }]
            }

        }).addTo(map);

        setIsRouting(true);

        // 📍 Capture route details
        routingRef.current.on("routesfound", function (e) {

            setIsRoutingLoading(false);

            const route = e.routes[0];

            const distance = route.summary.totalDistance / 1000;
            const time = route.summary.totalTime / 60;

            setRouteInfo({
                name: selectedStation.name,
                distance: distance.toFixed(2),
                eta: time.toFixed(0)
            });

            // console.log(`Distance: ${distance.toFixed(2)} km`);
            // console.log(`ETA: ${time.toFixed(0)} minutes`);

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
                <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-[95%] max-w-md backdrop-blur-md bg-white/80 border border-white/30 rounded-3xl shadow-[0_0_25px_rgba(0,200,255,0.2)] p-5 text-blue-900 transition-all duration-300">
                    <div className=" flex justify-between items-center gap-2">
                        <h2 className="text-xl font-bold">
                            {selectedStation.name}
                        </h2>

                        <button
                            onClick={() => setSelectedStation(null)}
                            className="btn btn-ghost text-lg transition px-2.5 py-2.5 rounded-full cursor-pointer border-none hover:bg-white hover:shadow-sm"
                        >
                            <X size={20} className=" text-red-700" />
                        </button>
                    </div>

                    <div className="text-sm text-gray-500 leading-5">
                        {/* <span className=" font-medium text-black" >
                            ★ {selectedStation.averageRating.toFixed(1)}
                        </span> ({selectedStation.reviewCount}) */}

                        ★ <span className="font-medium text-black">
                            {selectedStation.reviewCount > 0
                                ? selectedStation.averageRating.toFixed(1)
                                : "No ratings"}
                        </span> ({selectedStation.reviewCount})
                    </div>

                    {selectedStation.availabilityStatus === "available" && (
                        <div className="mt-2 flex justify-start gap-1 text-xs">
                            <span className=" font-medium text-black/50">Status</span>
                            <span>•</span>
                            <span className=" font-medium text-green-700">Available</span>
                        </div>
                    )}

                    {selectedStation.availabilityStatus === "busy" && (
                        <div className="mt-2 flex justify-start gap-1 text-xs">
                            <span className=" font-medium text-black/50">Status</span>
                            <span>•</span>
                            <span className=" font-medium text-gray-600">Busy</span>
                        </div>
                    )}

                    {selectedStation.availabilityStatus === "offline" && (
                        <div className="mt-2 flex justify-start gap-1 text-xs">
                            <span className=" font-medium text-black/50">Status</span>
                            <span>•</span>
                            <span className=" font-medium text-red-700">Offline</span>
                        </div>
                    )}

                    <div className="mt-2 flex justify-start gap-1 text-sm">
                        <span>Connectors</span>
                        <span>•</span>
                        <span className="font-medium">{selectedStation.connectors.join(", ") || "unknown"}</span>
                    </div>

                    <div className="mt-2 flex justify-start gap-1 text-sm">
                        {selectedStation.outlets > 0 && (
                            <div className="flex justify-start gap-1 text-sm">
                                <span>Outlets</span>
                                <span>•</span>
                                <span className=" font-medium">{selectedStation.outlets}</span>
                                <span>•</span>
                            </div>
                        )}
                        <span className=" font-medium">{selectedStation.powerKW} kW</span>
                        {selectedStation.pricePerKWh > 0 && (
                            <>
                                <span>•</span>
                                <span className=" font-medium">₵{selectedStation.pricePerKWh}/kWh</span>
                            </>
                        )}
                    </div>



                    <div className="mt-2 flex justify-center items-center gap-2">
                        {/* Directions Button */}
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
                                console.log("Creating route:", userLocation, stationLocation);
                                console.log("Routing:", L.Routing);
                            }}
                            className="flex justify-center items-center gap-2 mt-4 bg-blue-600 text-white hover:bg-blue-600/90 transition rounded-full p-2 cursor-pointer w-full"
                        >
                            <Route size={20} />
                            <span>Directions</span>
                        </button>
                        {/* Directions Button */}

                        {/* Details Button */}
                        <button
                            onClick={() => {
                                router.push(`/station/${selectedStation._id}/details`);
                            }}
                            className="
                            flex justify-center items-center gap-2
                            mt-3 w-1/2
                            bg-white
                            border border-white/20
                            text-blue-700
                            hover:bg-white/80
                            transition
                            rounded-full
                            py-2
                            cursor-pointer
                            hover:shadow-sm
                            "
                        >
                            {/* <SquareArrowOutUpRight size={20} /> */}
                            <span>Details</span>
                        </button>
                        {/* Details Button */}

                        {/* Reviews Button */}
                        <button
                            onClick={() => {
                                setShowReviews(true);
                                fetchReviews(selectedStation._id);
                            }}
                            className="
                            mt-3 w-1/2
                            bg-white
                            border border-white/20
                            text-blue-700
                            hover:bg-white/80
                            transition
                            rounded-full
                            py-2
                            cursor-pointer
                            hover:shadow-sm
                            "
                        >
                            Reviews
                        </button>
                        {/* Reviews Button */}

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
                        <div className="p-4 border-b border-gray-100 text-lg flex justify-center">
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
                                className="btn btn-ghost text-lg transition px-2.5 py-2.5 rounded-full cursor-pointer shadow-none border-none"
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