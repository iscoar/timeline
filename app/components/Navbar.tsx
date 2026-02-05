import React from "react"
import { NavLink } from "react-router";

export default function Navbar() {
  return (
    <nav className="bg-[#142D63] border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <NavLink to="/" className="text-xl font-bold text-white">Timeline</NavLink>

          <div className="hidden md:flex items-center space-x-6">
            <NavLink to="/" className="text-gray-100 hover:text-gray-900">Home</NavLink>
            <NavLink to="/login" className="text-gray-100 hover:text-gray-900">Login</NavLink>
            <NavLink to="/register" className="text-gray-100 hover:text-gray-900">Registro</NavLink>
            <button className="bg-white text-[#142D63] px-3 py-1 rounded-md text-sm">New</button>
          </div>

          <div className="md:hidden">
            <button className="p-2 rounded-md text-gray-500 hover:text-gray-700">Menu</button>
          </div>
        </div>
      </div>
    </nav>
  )
}
