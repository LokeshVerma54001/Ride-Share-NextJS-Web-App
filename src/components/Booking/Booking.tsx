"use client"

import { useMap } from "@/context/MapContext";
import AutocompleteInput from "./AutocompleteInput"

const Booking = () => {

  const { setPickup, setDropoff} = useMap();

  const setLocation = (location: { lng: number; lat: number }, isPickup: boolean) => {
    if(isPickup){
      setPickup(location);
    }else{
      setDropoff(location);
    }
  };

  return (
    <div className="p-2 md:pd-6 border-[2px] rounded-xl h-[88vh] flex flex-col justify-center">
      <p className="text-[20px] font-bold w-full text-center">Get a ride</p>
      <AutocompleteInput 
        onLocationSelect={(location) => setLocation(location, true)}
        from="source"
      />
      <AutocompleteInput 
        onLocationSelect={(location) => setLocation(location, false)}
        from="destination"
      />
      <button className="p-3 bg-black w-full mt-5 text-white rounded-lg">Search</button>
    </div>
  )
}

export default Booking