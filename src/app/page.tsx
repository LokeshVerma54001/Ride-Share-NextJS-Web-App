import Booking from "@/components/Booking/Booking";
import MapComponent from "@/components/Map/Map";
import { MapProvider } from "@/context/MapContext";

export default function Home() {
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
}
