import { Outlet } from "react-router"
import Navbar from "~/components/Navbar"

export default function DefaultLayout() {
  return (
    <div className="min-h-screen bg-[#F1F4F9]">
      <Navbar />
      <main className="p-6 max-w-[95vw] mx-auto">
        <Outlet />
      </main>
    </div>
  )
}
