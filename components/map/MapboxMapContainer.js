"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function MapView() {

    const mapContainer = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]);
    const routeSourceId = "route";

    const [userPosition, setUserPosition] = useState(null);
    const [stations, setStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState(null);

    const [zoomLevel, setZoomLevel] = useState(13);

    const [isLoadingLocation, setIsLoadingLocation] = useState(true);
    const [isLoadingStations, setIsLoadingStations] = useState(true);

    const [isRouting, setIsRouting] = useState(false);
    const [isRoutingLoading, setIsRoutingLoading] = useState(false);

    const [routeInfo, setRouteInfo] = useState(null);

    const lastPositionRef = useRef(null);



    /* -------------------------- */
    /* Distance helper */
    /* -------------------------- */

    function getDistanceMeters(lat1, lon1, lat2, lon2) {

        const R = 6371000;

        const toRad = (deg) => deg * Math.PI / 180;

        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }



    /* -------------------------- */
    /* Initialize Map */
    /* -------------------------- */

    useEffect(() => {

        if (mapRef.current) return;
        if (!mapContainer.current) return;

        mapRef.current = new mapboxgl.Map({

            container: mapContainer.current,

            style: "mapbox://styles/mapbox/navigation-day-v1",

            center: [-0.192268, 5.547671],

            zoom: 13

        });

        mapRef.current.addControl(new mapboxgl.NavigationControl());

        mapRef.current.on("zoomend", () => {

            setZoomLevel(mapRef.current.getZoom());

        });

    }, []);



    /* -------------------------- */
    /* Watch user location */
    /* -------------------------- */

    useEffect(() => {

        if (!("geolocation" in navigator)) return;

        const watchId = navigator.geolocation.watchPosition(

            (position) => {

                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                const newCoords = [lat, lng];

                if (!lastPositionRef.current) {

                    lastPositionRef.current = newCoords;
                    setUserPosition(newCoords);
                    setIsLoadingLocation(false);
                    return;

                }

                const [prevLat, prevLng] = lastPositionRef.current;

                const distance = getDistanceMeters(prevLat, prevLng, lat, lng);

                if (distance > 30) {

                    lastPositionRef.current = newCoords;
                    setUserPosition(newCoords);

                }

            },

            () => setIsLoadingLocation(false),

            {
                enableHighAccuracy: true,
                maximumAge: 15000,
                timeout: 7000
            }

        );

        return () => navigator.geolocation.clearWatch(watchId);

    }, []);



    /* -------------------------- */
    /* Fly to user */
    /* -------------------------- */

    useEffect(() => {

        if (!userPosition || !mapRef.current) return;

        mapRef.current.flyTo({

            center: [userPosition[1], userPosition[0]],

            zoom: 14,

            duration: 1200

        });

    }, [userPosition]);



    /* -------------------------- */
    /* Fetch stations */
    /* -------------------------- */

    useEffect(() => {

        if (!userPosition) return;

        async function fetchStations() {

            try {

                const res = await fetch(
                    `/api/stations/nearby?lat=${userPosition[0]}&lng=${userPosition[1]}&radius=30000`
                );

                const data = await res.json();

                setStations(data);

            }
            catch (err) {

                console.error("Failed to fetch stations", err);

            }
            finally {

                setIsLoadingStations(false);

            }

        }

        fetchStations();

    }, [userPosition]);



    /* -------------------------- */
    /* Render station markers */
    /* -------------------------- */

    useEffect(() => {

        if (!mapRef.current) return;

        markersRef.current.forEach(m => m.remove());

        markersRef.current = [];

        stations.forEach(station => {

            const el = document.createElement("div");

            el.className = "ev-marker";

            if (station.availabilityStatus === "available")

                el.style.backgroundImage = "url('/icons/ev-charger-green.svg')";
            else
                el.style.backgroundImage = "url('/icons/ev-charger-red.svg')";

            el.style.width = "30px";
            el.style.height = "30px";
            el.style.backgroundSize = "contain";
            el.style.backgroundRepeat = "no-repeat";

            el.addEventListener("click", () => {

                setSelectedStation(station);

            });

            const marker = new mapboxgl.Marker(el)

                .setLngLat([
                    station.location.coordinates[0],
                    station.location.coordinates[1]
                ])

                .addTo(mapRef.current);

            markersRef.current.push(marker);

        });

    }, [stations]);



    /* -------------------------- */
    /* Draw user marker */
    /* -------------------------- */

    useEffect(() => {

        if (!userPosition || !mapRef.current) return;

        new mapboxgl.Marker({ color: "blue" })

            .setLngLat([userPosition[1], userPosition[0]])

            .addTo(mapRef.current);

    }, [userPosition]);



    /* -------------------------- */
    /* Create Route */
    /* -------------------------- */

    async function createRoute(userLocation, stationLocation) {

        setIsRoutingLoading(true);

        const url =
            `https://api.mapbox.com/directions/v5/mapbox/driving/
${userLocation.lng},${userLocation.lat};
${stationLocation.lng},${stationLocation.lat}
?geometries=geojson
&access_token=${mapboxgl.accessToken}`;

        const res = await fetch(url);

        const data = await res.json();

        const route = data.routes[0];

        const geojson = {
            type: "Feature",
            geometry: route.geometry
        };



        if (mapRef.current.getSource(routeSourceId)) {

            mapRef.current.getSource(routeSourceId).setData(geojson);

        }
        else {

            mapRef.current.addSource(routeSourceId, {
                type: "geojson",
                data: geojson
            });

            mapRef.current.addLayer({

                id: routeSourceId,
                type: "line",
                source: routeSourceId,

                paint: {
                    "line-color": "#2563eb",
                    "line-width": 4
                }

            });

        }



        const bounds = new mapboxgl.LngLatBounds();

        route.geometry.coordinates.forEach(coord => bounds.extend(coord));

        mapRef.current.fitBounds(bounds, { padding: 80 });



        const distance = route.distance / 1000;
        const duration = route.duration / 60;

        setRouteInfo({

            name: selectedStation?.name,

            distance: distance.toFixed(2),

            eta: duration.toFixed(0)

        });

        setIsRouting(true);
        setIsRoutingLoading(false);

    }



    /* -------------------------- */
    /* Cancel Route */
    /* -------------------------- */

    function cancelRoute() {

        if (!mapRef.current) return;

        if (mapRef.current.getLayer(routeSourceId))

            mapRef.current.removeLayer(routeSourceId);

        if (mapRef.current.getSource(routeSourceId))

            mapRef.current.removeSource(routeSourceId);

        setIsRouting(false);
        setRouteInfo(null);

    }



    /* -------------------------- */
    /* UI */
    /* -------------------------- */

    return (

        <div className="h-screen w-full relative">

            <div ref={mapContainer} className="h-full w-full" />



            {(isLoadingLocation || isLoadingStations) && (

                <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur">

                    Loading map...

                </div>

            )}



            {selectedStation && (

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/90 p-5 rounded-xl shadow-xl w-[90%] max-w-md">

                    <h2 className="text-lg font-bold">{selectedStation.name}</h2>

                    <p>Status: {selectedStation.availabilityStatus}</p>

                    <p>{selectedStation.powerKW}kW</p>

                    <p>₵{selectedStation.pricePerKWh}/kWh</p>

                    <div className="flex gap-3 mt-3">

                        <button

                            onClick={() => {

                                if (!userPosition) return;

                                createRoute(

                                    { lat: userPosition[0], lng: userPosition[1] },

                                    {

                                        lat: selectedStation.location.coordinates[1],

                                        lng: selectedStation.location.coordinates[0]

                                    }

                                );

                                setSelectedStation(null);

                            }}

                            className="bg-blue-600 text-white px-4 py-2 rounded"

                        >

                            Directions

                        </button>

                        <button

                            onClick={() => setSelectedStation(null)}

                            className="bg-gray-200 px-4 py-2 rounded"

                        >

                            Close

                        </button>

                    </div>

                </div>

            )}



            {isRoutingLoading && (

                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full">

                    Calculating route...

                </div>

            )}



            {isRouting && (

                <button

                    onClick={cancelRoute}

                    className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-red-500 text-white px-5 py-2 rounded-full"

                >

                    End Route

                </button>

            )}



            {routeInfo && (

                <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-2 rounded shadow">

                    {routeInfo.distance} km • {routeInfo.eta} min

                </div>

            )}



        </div>

    );

}