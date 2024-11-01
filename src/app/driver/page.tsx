"use client"

import DriverMap from "@/components/Driver/Map/DriverMap"
import PassangerDetails from "@/components/Driver/PassangerDetails";
import { MapProvider } from "@/context/MapContext"
import { useUser } from "@/context/UserContext";
import { useEffect } from "react";

const Page = () => {

  const {setUserLocation ,setUserType} = useUser();


  const setLocation = (location: { lng: number; lat: number }) => {
    setUserLocation(location);
  };

  useEffect(()=>{
    setUserType("driver");
    
  },[]);

  return (
    <div className="grid md:grid-cols-3 grid-cols-1">
      <div className="flex justify-center">
        <PassangerDetails onLocationSelect={(location) => setLocation(location)}/>
      </div>
      <MapProvider>
        <div className="col-span-2 order-first md:order-last">
          <DriverMap/>
        </div>
      </MapProvider>
    </div>
  )
}

export default Page