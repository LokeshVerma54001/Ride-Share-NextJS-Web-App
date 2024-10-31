"use client"

import Booking from "@/components/Booking/Booking";
import MapComponent from "@/components/Map/Map";
import { MapProvider } from "@/context/MapContext";
import { useUser } from "@/context/UserContext";
import { useEffect } from "react";

const Page = () => {

  const {setUserType} = useUser();

  useEffect(()=>{
    setUserType("rider");
  },[]);

  return (
      <MapProvider>
        <div className="grid md:grid-cols-3 grid-cols-1">
          <div className="">
            <Booking />
          </div>
          <div className="col-span-2 order-first md:order-last">
            <MapComponent />
          </div>
        </div>
      </MapProvider>
  );
};

export default Page;
