import { Outlet, Navigate } from "react-router"
import Navbar from "~/components/Navbar"
import useAuthStore from "~/store/authStore"

export default function DefaultLayout() {
  const user = useAuthStore((s) => s.user)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-[#F1F4F9]">
      <Navbar />
      <main className="p-6 max-w-[95vw] mx-auto">
        <Outlet />
      </main>
    </div>
  )
}
