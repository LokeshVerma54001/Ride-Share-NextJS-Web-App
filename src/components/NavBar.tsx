import { UserButton } from "@clerk/nextjs"
import Image from "next/image"

const NavBar = () => {
  return (
    <div className="flex justify-between p-3 px-10 border-b-[1px] shadow-lg">
        <div className="flex gap-10 items-center">
            <Image src = '/icon.png' alt="icon" width={60} height={60} className="rounded-full"/>
            <div className=" hidden sm:flex gap-6">
                <h2 className="hover:bg-gray-100 p-2 rounded-md cursor-pointer">Home</h2>
                <h2 className="hover:bg-gray-100 p-2 rounded-md cursor-pointer">History</h2>
                <h2 className="hover:bg-gray-100 p-2 rounded-md cursor-pointer">Help</h2>
            </div>
        </div>
        <UserButton />
    </div>
  )
}

export default NavBar