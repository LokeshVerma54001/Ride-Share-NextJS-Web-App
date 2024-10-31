"use client"

import { createContext, useContext, useState } from "react";

interface Location {
    lng: number;
    lat: number;
  }

interface UserContextType {
    userType:string;
    setUserType: (type:string) => void;
    userLocation: Location | null;
    setUserLocation: (location:Location) => void;
  }

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvicer:React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const [userType, setUserType] = useState("");
    const [userLocation, setUserLocation] = useState<Location | null>(null)

    return (
      <UserContext.Provider value={{userType, setUserType, userLocation, setUserLocation}}>
        {children}
      </UserContext.Provider>
    );
  };
  
  export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
      throw new Error('useUser must be used within a MapProvider');
    }
    return context;
  };