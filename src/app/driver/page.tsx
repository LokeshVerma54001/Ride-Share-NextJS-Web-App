"use client"

import DriverMap from "@/components/Driver/Map/DriverMap"
import { MapProvider } from "@/context/MapContext"
import { useUser } from "@/context/UserContext";
import { useEffect } from "react";

const Page = () => {

  const {setUserType} = useUser();

  useEffect(()=>{
    setUserType("driver");
  },[]);

  return (
    <div>
      <MapProvider>
        <DriverMap/>
      </MapProvider>
    </div>
  )
}

export default Page