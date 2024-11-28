"use client"

import Booking from "@/components/Booking/Booking";
import MapComponent from "@/components/Map/Map";
import { MapProvider } from "@/context/MapContext";
import socket from "@/socket/socket";
import { useUser } from "@clerk/nextjs";
// import { useUser } from "@/context/UserContext";
import { useEffect } from "react";

const Page = () => {

  // const {setUserType} = useUser();
  const {user} = useUser();

  useEffect(()=>{

    socket.emit('setUserType', user, 'passanger');

    // setUserType("rider");
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
