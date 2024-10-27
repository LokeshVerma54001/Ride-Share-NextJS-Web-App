"use client"

import React, { createContext, useContext, useState} from 'react';

interface Location {
  lng: number;
  lat: number;
}

interface MapContextType {
  pickup: Location | null;
  dropoff: Location | null;
  setPickup: (location: Location) => void;
  setDropoff: (location: Location) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pickup, setPickup] = useState<Location | null>(null);
  const [dropoff, setDropoff] = useState<Location | null>(null);

  return (
    <MapContext.Provider value={{ pickup, dropoff, setPickup, setDropoff }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
};
