"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMap } from "@/context/MapContext";

interface Location {
  lng: number;
  lat: number;
}

const DriverMap = () => {
  const { setPickup, pickup, dropoff } = useMap(); // Assuming dropoff is used for route functionality
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  
  const pickupMarker = useRef<maplibregl.Marker | null>(null);
  const dropoffMarker = useRef<maplibregl.Marker | null>(null);

  // Function to draw route (if you want to add dropoff manually)
  const drawRoute = async (start: Location, end: Location) => {
    if (!map.current) return;

    setIsLoadingRoute(true);
    setRouteError(null);

    // Remove existing route layer and source
    if (map.current.getLayer("route")) {
      map.current.removeLayer("route");
    }
    if (map.current.getSource("route")) {
      map.current.removeSource("route");
    }

    try {
      const coords = `${start.lng},${start.lat};${end.lng},${end.lat}`;
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch route");
      }

      const data = await response.json();
      const route = data.routes[0];

      map.current.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: route.geometry,
        },
      });

      map.current.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#3b82f6",
          "line-width": 4,
          "line-opacity": 0.75,
        },
      });

      // Adjust view to show the route
      const coordinates = route.geometry.coordinates;
      const bounds = coordinates.reduce(
        (bounds: maplibregl.LngLatBounds, coord: number[]) =>
          bounds.extend(coord as maplibregl.LngLatLike),
        new maplibregl.LngLatBounds(coordinates[0], coordinates[0])
      );

      map.current.fitBounds(bounds, { padding: 50, duration: 1000 });

      // Display route info
      const distance = (route.distance / 1000).toFixed(2); // km
      const duration = (route.duration / 60).toFixed(0); // minutes
      setRouteError(`Distance: ${distance} km | Duration: ${duration} min`);
    } catch (error) {
      console.error("Error fetching route:", error);
      setRouteError("Unable to find a route between these points");
    } finally {
      setIsLoadingRoute(false);
    }
  };

  // Initialize map and set user's current location as pickup
  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current as HTMLDivElement,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAP_TILER_API}`,
      center: [78.0322, 30.3165], // Default location if permission denied
      zoom: 12,
      maxZoom: 18,
      minZoom: 3,
    });

    map.current.on("load", () => {
      setMapLoaded(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPickup({ lat: latitude, lng: longitude });

          // Add a marker at the user's location
          pickupMarker.current = new maplibregl.Marker({ color: "#ef4444" })
            .setLngLat([longitude, latitude])
            .addTo(map.current!);

          // Center map to user's location
          map.current?.setCenter([longitude, latitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
          setRouteError("Unable to access current location. Check location permissions.");
        }
      );
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    return () => {
      pickupMarker.current?.remove();
      dropoffMarker.current?.remove();
      map.current?.remove();
    };
  }, [setPickup]);

  // Draw route when both pickup and dropoff are set
  useEffect(() => {
    if (pickup && dropoff) {
      drawRoute(pickup, dropoff);
    }
  }, [pickup, dropoff]);

  return (
    <div className="flex flex-col space-y-4">
      {/* Display Route Information */}
      {routeError && (
        <div
          className={`text-center p-2 rounded ${
            routeError.startsWith("Unable")
              ? "bg-red-50 text-red-600"
              : "bg-green-50 text-green-600"
          }`}
        >
          {routeError}
        </div>
      )}

      {/* Map container */}
      <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
        <div ref={mapContainer} className="w-full h-full" />
        {(!mapLoaded || isLoadingRoute) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
            <div className="text-gray-600">
              {!mapLoaded ? "Loading map..." : "Calculating route..."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverMap;
