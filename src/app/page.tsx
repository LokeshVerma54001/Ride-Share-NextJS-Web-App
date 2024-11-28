"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import socket from "@/socket/socket";

export default function Home() {
  const router = useRouter();
  const { isSignedIn} = useAuth(); // Clerk's hook to check authentication status
  const {user} = useUser();

  const handleRider = () =>{
    router.push("/rider");
  }

  const handleDriver = () =>{
    router.push("/driver");
  }

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/sign-in"); // Redirect if not logged in
    }
    else{
      socket.emit('userConnected', user);
    }
  }, [isSignedIn, router]);

  return (
    <div className="h-[87vh] w-full flex justify-center items-center">
      <div className="flex md:gap-16 gap-10 flex-col md:mt-20 mt-44 items-center h-[30rem] w-[25rem]">
        <h1 className="font-bold md:text-4xl text-3xl">Welcome to Ride Share</h1>
        {/* <h1>Welcome, {user?.firstName} {user?.lastName}</h1>
        <p>Email: {user?.primaryEmailAddress?.emailAddress}</p> */}
        <div className="flex flex-col gap-3">
          <button onClick={handleRider} className="border font-bold border-black text-lg rounded-l md:p-5 p-3 hover:bg-black hover:text-white">Wanna Ride Someone?</button>
          <button onClick={handleDriver} className="border border-black font-bold text-lg rounded-l md:p-5 p-3 hover:bg-black hover:text-white">Give Someone A Ride</button>
        </div>
      </div>
    </div>
  );
}
