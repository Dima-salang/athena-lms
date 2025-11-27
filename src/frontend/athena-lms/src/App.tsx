"use client"

import { Outlet } from "react-router-dom"
import { useState } from "react"
import Navbar from "./components/navbar/navbar"

export default function AppWithNavbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("User")

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUserName("User")
    // Add your logout logic here
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar isLoggedIn={isLoggedIn} userName={userName} onLogout={handleLogout} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-64px)]">
        <Outlet />
      </main>
    </div>
  )
}
