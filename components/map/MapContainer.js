"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import { dummyStations } from "@/lib/dummyStations";
import L from "leaflet";
import { useMap } from "react-leaflet";

import BottomSheet from "../ui/BottomSheet";
import UserLocationMarker from "./UserLocationMarker";

import { checkUserLocation } from "@/utils/locationService";


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

    const retryLocation = () => {
        requestLocation();
    };


    // Get users real or current location/position 

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

            {/* Liquid Glass Card */}
            {selectedStation && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-md backdrop-blur-2xl bg-white/20 border border-white/30 rounded-3xl shadow-2xl p-6 text-black transition-all duration-300">
                    <h2 className="text-xl font-semibold">
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
                        className="mt-4 w-full bg-black/80 text-white hover:bg-black transition rounded-full py-2"
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

            {locationError && (
                <div className="location-alert">
                    <div className="glass-card">
                        <h3>Location Required</h3>
                        <p>{locationError.message}</p>
                        <button onClick={retryLocation}>Retry</button>
                    </div>
                </div>
            )}
        </div>

    );
}