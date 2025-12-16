"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, User, Settings, LogOut, Bell } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface NavbarProps {
  isLoggedIn?: boolean
  userName?: string
  onLogout?: () => void
}

export default function Navbar({ isLoggedIn = false, userName = "User", onLogout }: NavbarProps) {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/login", label: "Login" },
    { path: "/register", label: "Register" },
  ]

  const isActive = (path: string) => {
    return location.pathname === path
      ? "text-indigo-600 font-semibold"
      : "text-slate-700 hover:text-indigo-600 transition-colors duration-200"
  }

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
                <Button variant="ghost" size="icon" className="text-slate-700">
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notifications</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/avatars/01.png" alt={userName} />
                        <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          user@example.com
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer w-full flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer w-full flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === link.path ? "text-primary" : "text-muted-foreground"
                        }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {isLoggedIn ? (
                    <>
                      <div className="border-t pt-4 mt-2">
                        <div className="flex items-center gap-2 mb-4">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{userName}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
                            <User className="h-4 w-4" /> Profile
                          </Link>
                          <Link to="/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary">
                            <Settings className="h-4 w-4" /> Settings
                          </Link>
                          <button onClick={() => { onLogout?.(); setIsOpen(false); }} className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 text-left">
                            <LogOut className="h-4 w-4" /> Logout
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2 mt-4">
                      <Button variant="outline" asChild onClick={() => setIsOpen(false)}>
                        <Link to="/login">Sign In</Link>
                      </Button>
                      <Button asChild onClick={() => setIsOpen(false)}>
                        <Link to="/register">Sign Up</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
