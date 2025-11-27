"use client"

import { useState, useRef, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X, ChevronDown, User, Settings, LogOut, Bell } from "lucide-react"

interface NavbarProps {
  isLoggedIn?: boolean
  userName?: string
  onLogout?: () => void
}

export default function Navbar({ isLoggedIn = false, userName = "User", onLogout }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const location = useLocation()
  const profileMenuRef = useRef<HTMLDivElement>(null)

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const isActive = (path: string) => {
    return location.pathname === path
      ? "text-indigo-600 font-semibold"
      : "text-slate-700 hover:text-indigo-600 transition-colors duration-200"
  }

  const navLinks = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/login", label: "Login" },
    { path: "/register", label: "Register" },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors duration-200"
            aria-label="Athena LMS Home"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="hidden sm:inline">Athena</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <ul className="flex gap-8">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className={`${isActive(link.path)} text-sm font-medium`}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <>
                {/* Notifications */}
                <button
                  className="relative p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors duration-200"
                    aria-haspopup="true"
                    aria-expanded={profileMenuOpen}
                  >
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User size={18} className="text-indigo-600" />
                    </div>
                    <span className="text-sm font-medium">{userName}</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${profileMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-2">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <User size={18} />
                        <span className="text-sm">Profile</span>
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <Settings size={18} />
                        <span className="text-sm">Settings</span>
                      </Link>
                      <hr className="my-2 border-slate-200" />
                      <button
                        onClick={() => {
                          onLogout?.()
                          setProfileMenuOpen(false)
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-sm"
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors duration-200"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-slate-200">
            <nav className="pt-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-2 rounded-lg transition-colors duration-200 ${
                    location.pathname === link.path
                      ? "bg-indigo-50 text-indigo-600 font-semibold"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Auth Buttons */}
            {!isLoggedIn && (
              <div className="flex gap-2 px-4 pt-4 border-t border-slate-200 mt-4">
                <Link
                  to="/login"
                  className="flex-1 px-4 py-2 text-center text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium text-sm transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex-1 px-4 py-2 text-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Profile Menu */}
            {isLoggedIn && (
              <div className="px-4 pt-4 border-t border-slate-200 mt-4 space-y-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={18} />
                  <span className="text-sm">Profile</span>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings size={18} />
                  <span className="text-sm">Settings</span>
                </Link>
                <button
                  onClick={() => {
                    onLogout?.()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
