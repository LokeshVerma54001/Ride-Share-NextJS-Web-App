import Booking from "@/components/Booking/Booking";
import MapComponent from "@/components/Map/Map";

export default function Home() {
  return (
    <div className="">
      <div className="grid md:grid-cols-3 grid-cols-1">
        <div className="">
          <Booking/>
        </div>
        <div className="col-span-2 bg-red-100 order-first md:order-last">
          <MapComponent/>
        </div>
      </div>
    </div>
  );
}
