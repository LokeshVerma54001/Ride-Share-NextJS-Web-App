"use client";

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMap } from '@/context/MapContext';
import { useUser } from '@/context/UserContext';

interface Location {
  lng: number;
  lat: number;
}

const MapComponent = () => {
  const { pickup, dropoff, setPickup, setDropoff } = useMap();
  const {setUserLocation} = useUser();

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isSettingPickup, setIsSettingPickup] = useState(true);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  
  const pickupMarker = useRef<maplibregl.Marker | null>(null);
  const dropoffMarker = useRef<maplibregl.Marker | null>(null);
  
  // const [pickup, setPickup] = useState<Location | null>(null);
  // const [dropoff, setDropoff] = useState<Location | null>(null);

  const drawRoute = async (start: Location, end: Location) => {
    if (!map.current) return;

    setIsLoadingRoute(true);
    setRouteError(null);

    // Remove existing route layer and source
    if (map.current.getLayer('route')) {
      map.current.removeLayer('route');
    }
    if (map.current.getSource('route')) {
      map.current.removeSource('route');
    }

    try {
      // Format coordinates for OSRM API
      const coords = `${start.lng},${start.lat};${end.lng},${end.lat}`;
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`
    );

      if (!response.ok) {
        throw new Error('Failed to fetch route');
      }

      const data = await response.json();

      if (!data.routes || data.routes.length === 0) {
        throw new Error('No route found');
      }

      const route = data.routes[0];

      // Add the route to the map
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: route.geometry
        }
      });

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3b82f6',
          'line-width': 4,
          'line-opacity': 0.75
        }
      });

      // Calculate bounds to fit both points and the route
      const coordinates = route.geometry.coordinates;
      const bounds = coordinates.reduce((bounds: maplibregl.LngLatBounds, coord: number[]) => {
        return bounds.extend(coord as maplibregl.LngLatLike);
      }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));

      // Fit map to show the entire route
      map.current.fitBounds(bounds, {
        padding: 50,
        duration: 1000
      });

      // Display route information
      const distance = (route.distance / 1000).toFixed(2); // Convert to km
      const duration = (route.duration / 60).toFixed(0); // Convert to minutes
      setRouteError(`Distance: ${distance} km | Duration: ${duration} min`);

    } catch (error) {
      console.error('Error fetching route:', error);
      setRouteError('Unable to find a route between these points');
    } finally {
      setIsLoadingRoute(false);
    }
  };



  // Initialize map
  useEffect(() => {
    // if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current as HTMLDivElement,
      style: `https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAP_TILER_API}`,
      center: [78.0322, 30.3165],
      zoom: 12,
      maxZoom: 18,
      minZoom: 3
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => {
      pickupMarker.current?.remove();
      dropoffMarker.current?.remove();
      map.current?.remove();
    };
  }, []);

  // Handle map clicks
  useEffect(() => {
    if (!map.current) return;

    const clickHandler = (e: maplibregl.MapMouseEvent) => {
      const { lng, lat } = e.lngLat;

      if (isSettingPickup) {
        if (pickupMarker.current) {
          pickupMarker.current.setLngLat([lng, lat]);
        } else {
          pickupMarker.current = new maplibregl.Marker({ 
            color: "#ef4444",
            draggable: true 
          })
            .setLngLat([lng, lat])
            .addTo(map.current!);

          pickupMarker.current.on('dragend', () => {
            const newPos = pickupMarker.current?.getLngLat();
            if (newPos) {
              setPickup({ lng: newPos.lng, lat: newPos.lat });
            }
          });
        }
        setPickup({ lng, lat });
        setUserLocation({lng, lat});//user location set
      } else {
        if (dropoffMarker.current) {
          dropoffMarker.current.setLngLat([lng, lat]);
        } else {
          dropoffMarker.current = new maplibregl.Marker({ 
            color: "#3b82f6",
            draggable: true 
          })
            .setLngLat([lng, lat])
            .addTo(map.current!);

          dropoffMarker.current.on('dragend', () => {
            const newPos = dropoffMarker.current?.getLngLat();
            if (newPos) {
              setDropoff({ lng: newPos.lng, lat: newPos.lat });
            }
          });
        }
        setDropoff({ lng, lat });
      }
    };

    map.current.on('click', clickHandler);

    return () => {
      map.current?.off('click', clickHandler);
    };
  }, [isSettingPickup]);

  // Draw route when both markers are set
  useEffect(() => {
    if (pickup && dropoff) {
      drawRoute(pickup, dropoff);
    }
  }, [pickup, dropoff]);

  return (
    <div className="flex flex-col space-y-4">
      {/* Control buttons */}
      <div className="flex justify-center gap-4 mt-5">
        <button
          onClick={() => setIsSettingPickup(true)}
          className={`px-4 py-2 rounded-md transition-colors ${
            isSettingPickup 
              ? 'bg-black text-white' 
              : 'font-bold border-l bg-gray-100 hover:bg-gray-200 border border-black'
          }`}
        >
          Set Pickup
        </button>
        <button
          onClick={() => setIsSettingPickup(false)}
          className={`px-4 py-2 rounded-md transition-colors ${
            !isSettingPickup 
              ? 'bg-black text-white' 
              : 'font-bold border-l bg-gray-100 hover:bg-gray-200 border border-black'
          }`}
        >
          Set Drop-off
        </button>
      </div>

      {/* Location display */}
      {/* <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="p-2 rounded bg-red-50 border border-red-200">
          <span className="font-semibold">Pickup:</span>{' '}
          {pickup ? `${pickup.lng.toFixed(4)}, ${pickup.lat.toFixed(4)}` : 'Not set'}
        </div>
        <div className="p-2 rounded bg-blue-50 border border-blue-200">
          <span className="font-semibold">Drop-off:</span>{' '}
          {dropoff ? `${dropoff.lng.toFixed(4)}, ${dropoff.lat.toFixed(4)}` : 'Not set'}
        </div>
      </div> */}

      {/* Route information */}
      {routeError && (
        <div className={`text-center p-2 rounded ${
          routeError.startsWith('Unable') 
            ? 'bg-red-50 text-red-600' 
            : 'bg-green-50 text-green-600'
        }`}>
          {routeError}
        </div>
      )}

      {/* Map container */}
      <div className="relative w-full h-[570px] rounded-lg overflow-hidden">
        <div ref={mapContainer} className="w-full h-full" />
        {(!mapLoaded || isLoadingRoute) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
            <div className="text-gray-600">
              {!mapLoaded ? 'Loading map...' : 'Calculating route...'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapComponent;