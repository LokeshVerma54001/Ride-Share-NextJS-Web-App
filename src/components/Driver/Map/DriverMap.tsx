"use client";

interface Location {
  lng: number;
  lat: number;
  place_name?: string;
}


import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useUser } from '@/context/UserContext';
// import socket from '@/socket/socket';


const MapComponent = ({onLocationSelect}: { onLocationSelect: (location: Location) => void;}) => {
  const {userLocation, setUserLocation} = useUser();

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const pickupMarker = useRef<maplibregl.Marker | null>(null);
  const dropoffMarker = useRef<maplibregl.Marker | null>(null);
  
  // const [pickup, setPickup] = useState<Location | null>(null);
  // const [dropoff, setDropoff] = useState<Location | null>(null);

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
                setUserLocation({lng, lat});
            }
          });
        }
        setUserLocation({lng, lat});//user location set
        onLocationSelect({lng:lng, lat:lat});
    };

    map.current.on('click', clickHandler);

    return () => {
      map.current?.off('click', clickHandler);
    };
  }, []);

  //handle text search
  useEffect(() =>{
    const setMarker = (location: Location | null)=>{
      if(location){
        if (pickupMarker.current) {
          pickupMarker.current.setLngLat([location.lng, location.lat]);
        } else {
          pickupMarker.current = new maplibregl.Marker({ 
            color: "#ef4444",
            draggable: true 
          })
            .setLngLat([location.lng, location.lat])
            .addTo(map.current!);
        }
        //now go the set marker location
        map.current?.flyTo({
          center:[location.lng, location.lat],
          zoom: 14,
          essential:true
        })
      };
    }
    setMarker(userLocation);
  },[userLocation]);

  return (
    <div className="flex flex-col space-y-4 items-center">

      {/* Map container */}
      <div className="relative w-full h-[650px] rounded-lg overflow-hidden">
        <div ref={mapContainer} className="w-full h-full" />
        {(!mapLoaded) && (
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