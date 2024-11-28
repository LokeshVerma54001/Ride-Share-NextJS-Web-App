"use client"

import DriverMap from "@/components/Driver/Map/DriverMap"
import PassangerDetails from "@/components/Driver/PassangerDetails";
import { MapProvider } from "@/context/MapContext"
// import { useUser } from "@/context/UserContext";
import socket from "@/socket/socket";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

interface locationType{
  lng:number,
  lat:number
}

const Page = () => {

  // const {setUserLocation ,setUserType} = useUser();
  const {user} = useUser();
  const [localLocation, setLocalLocation] = useState<locationType>({lng:0.0, lat:0.0});

  const setLocation = (location: { lng: number; lat: number }) => {
    // setUserLocation(location);
    // console.log('Client-side user and location:', user);
    
    setLocalLocation({lng:location.lng, lat:location.lat});
  };

  useEffect(()=>{
    // setUserType("driver");
    if(user){
      console.log(user);
      socket.emit('setUserType', user, 'driver');
    }
  },[]);

  useEffect(()=>{
    socket.emit('setStartingLocation', user, localLocation.lng, localLocation.lat);
  }, [localLocation])

  return (
    <div className="grid md:grid-cols-3 grid-cols-1">
      <div className="flex justify-center">
        <PassangerDetails onLocationSelect={(location) => setLocation(location)}/>
      </div>
      <MapProvider >
        <div className="col-span-2 order-first md:order-last">
          <DriverMap onLocationSelect={(location) => setLocation(location)}/>
        </div>
      </MapProvider>
    </div>
  )
}

export default Page