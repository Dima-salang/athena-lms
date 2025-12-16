"use client"

import { Outlet, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import Navbar from "./components/navbar/navbar"
import { getCurrentUser, logout } from "./services/authApi"

export default function AppWithNavbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("User")
  const navigate = useNavigate()

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          setIsLoggedIn(true)
          setUserName(user.firstName || user.username)
        }
      } catch {
        // Not logged in or session expired
        setIsLoggedIn(false)
      }
    }

    checkLoginStatus()
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout failed", error)
    } finally {
      localStorage.removeItem("role")
      setIsLoggedIn(false)
      setUserName("User")
      navigate("/login")
    }
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
