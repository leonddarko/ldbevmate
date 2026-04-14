"use client";

import {
    GoogleMap,
    Marker,
    DirectionsRenderer,
    useJsApiLoader,
    OverlayView,
} from "@react-google-maps/api";

import { useEffect, useRef, useState } from "react";
import { LocateFixedIcon, Route, X } from "lucide-react";
import { useSession } from "next-auth/react";

import UserDropdown from "../ui/UserDropdown";
import BecomeOperatorModal from "../ui/BecomeOperatorModal";
import LocationRequiredModal from "./LocationRequiredModal";

const containerStyle = {
    width: "100%",
    height: "100vh",
};

const defaultCenter = {
    lat: 5.547671,
    lng: -0.192268,
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  styles: [
    {
      elementType: "geometry",
      stylers: [{ color: "#0f172a" }]
    },
    {
      elementType: "labels.text.stroke",
      stylers: [{ color: "#0f172a" }]
    },
    {
      elementType: "labels.text.fill",
      stylers: [{ color: "#94a3b8" }]
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#1e293b" }]
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#2563eb" }]
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#ffffff" }]
    },
    {
      featureType: "poi",
      elementType: "geometry",
      stylers: [{ color: "#111827" }]
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#064e3b" }]
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#0c4a6e" }]
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#1f2937" }]
    },
    {
      featureType: "administrative",
      elementType: "geometry.stroke",
      stylers: [{ color: "#334155" }]
    }
  ]
};

export default function MapViewGoogle() {
    const { data: session } = useSession();

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries: ["places"],
    });

    const mapRef = useRef(null);

    const [userPosition, setUserPosition] = useState(null);
    const [stations, setStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState(null);
    const [locationError, setLocationError] = useState(null);

    const [directions, setDirections] = useState(null);
    const [routeInfo, setRouteInfo] = useState(null);
    const [isRoutingLoading, setIsRoutingLoading] = useState(false);

    // -------------------------
    // Get User Location
    // -------------------------
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError({
                message: "Geolocation not supported.",
            });
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                setUserPosition({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                });
                setLocationError(null);
            },
            (err) => {
                setLocationError({
                    message: "Location permission denied or unavailable.",
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 7000,
                maximumAge: 15000,
            }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // -------------------------
    // Fetch Nearby Stations
    // -------------------------
    useEffect(() => {
        if (!userPosition) return;

        async function fetchStations() {
            try {
                const res = await fetch(
                    `/api/stations/nearby?lat=${userPosition.lat}&lng=${userPosition.lng}&radius=30000`
                );
                const data = await res.json();
                setStations(data);
            } catch (err) {
                console.error(err);
            }
        }

        fetchStations();
    }, [userPosition]);

    // -------------------------
    // Route Creation
    // -------------------------
    function createRoute(station) {
        if (!userPosition) return;

        setIsRoutingLoading(true);

        const directionsService =
            new google.maps.DirectionsService();

        directionsService.route(
            {
                origin: userPosition,
                destination: {
                    lat: station.location.coordinates[1],
                    lng: station.location.coordinates[0],
                },
                travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                setIsRoutingLoading(false);

                if (status === "OK") {
                    setDirections(result);

                    const leg = result.routes[0].legs[0];

                    setRouteInfo({
                        name: station.name,
                        distance: leg.distance.text,
                        eta: leg.duration.text,
                    });

                    setSelectedStation(null);
                }
            }
        );
    }

    // -------------------------
    // Cancel Route
    // -------------------------
    function cancelRoute() {
        setDirections(null);
        setRouteInfo(null);
    }

    // -------------------------
    // Center Map
    // -------------------------
    function centerOnUser() {
        if (!mapRef.current || !userPosition) return;
        mapRef.current.panTo(userPosition);
        mapRef.current.setZoom(15);
    }

    if (!isLoaded) return null;

    return (
        <div className="h-screen w-full relative">

            <GoogleMap
                mapContainerStyle={containerStyle}
                center={userPosition || defaultCenter}
                zoom={13}
                options={mapOptions}
                onLoad={(map) => (mapRef.current = map)}
            >

                {/* User Marker */}
                {userPosition && (
                    <OverlayView
                        position={userPosition}
                        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    >
                        <div className="relative">
                            <span className="absolute inline-flex h-4 w-4 rounded-full bg-blue-500 opacity-75 animate-ping"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-700 border-2 border-white"></span>
                        </div>
                    </OverlayView>
                )}

                {/* Stations */}
                {stations.map((station) => (
                    <Marker
                        key={station._id}
                        position={{
                            lat: station.location.coordinates[1],
                            lng: station.location.coordinates[0],
                        }}
                        icon={{
                            url:
                                station.availabilityStatus === "available"
                                    ? "/icons/ev-charger-white.svg"
                                    : "/icons/ev-charger-red.svg",
                            scaledSize: new google.maps.Size(35, 35),
                        }}
                        onClick={() => setSelectedStation(station)}
                    />
                ))}

                {/* Route */}
                {directions && (
                    <DirectionsRenderer 
                    directions={directions} 
                    options={{
                        polylineOptions: {
                            strokeColor: "#3b82f6",
                            strokeWeight: 5,
                        },
                        suppressMarkers: false,
                    }}
                    />
                )}
            </GoogleMap>

            {/* Center Button */}
            <button
                onClick={centerOnUser}
                className="fixed bottom-6 right-3 z-50 w-11 h-11 rounded-full bg-white shadow-lg flex items-center justify-center"
            >
                <LocateFixedIcon className="text-blue-500" size={20} />
            </button>

            {/* Station Card */}
            {selectedStation && (
                <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-[95%] max-w-md bg-white rounded-3xl shadow-xl p-5">
                    <h2 className="text-xl font-bold">{selectedStation.name}</h2>

                    <p>Status • {selectedStation.availabilityStatus}</p>
                    <p>Connectors • {selectedStation.connectors.join(", ")}</p>
                    <p>{selectedStation.powerKW} kW</p>

                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={() => createRoute(selectedStation)}
                            className="w-full bg-blue-600 text-white py-2 rounded-full"
                        >
                            Directions
                        </button>

                        <button
                            onClick={() => setSelectedStation(null)}
                            className="w-full bg-gray-800 text-white py-2 rounded-full"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Route Info */}
            {routeInfo && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-lg px-5 py-3 z-50">
                    <p>{routeInfo.name}</p>
                    <p>{routeInfo.distance}</p>
                    <p>{routeInfo.eta}</p>
                </div>
            )}

            {/* Cancel Route */}
            {directions && (
                <button
                    onClick={cancelRoute}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-500 text-white px-5 py-2 rounded-full z-50"
                >
                    <X size={18} />
                </button>
            )}

            {session?.user?.role === "user" && (
                <BecomeOperatorModal />
            )}

            <UserDropdown />

            <LocationRequiredModal
                open={!!locationError}
                message={locationError?.message}
                onRetry={() => window.location.reload()}
            />
        </div>
    );
}