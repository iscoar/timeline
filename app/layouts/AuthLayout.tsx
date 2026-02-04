import { Outlet } from "react-router"
import Clock from "~/components/Clock"

export default function AuthLayout() {
  return (
    <div className="bg-white font-family-karla h-screen">
      <div className="w-full min-h-screen flex flex-wrap">
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="flex justify-center md:justify-start pt-12 md:pl-12 md:-mb-24">
            <a href="#" className="bg-[#142D63] text-white font-bold text-xl p-4">Timeline</a>
          </div>

          <Outlet />
        </div>

        <div className="w-1/2 hidden md:block shadow-2xl">
          <Clock />
        </div>
      </div>
    </div>
  )
}
