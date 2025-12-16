"use client"

import React, { useState } from "react"
import { type User } from "../services/api"
import { login } from "../services/authApi"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, ArrowRight } from "lucide-react"

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.")
      setIsLoading(false)
      return
    }

    try {
      const user = await login({ username, password })
      if (user) {
        // Store user in session/local storage if needed (usually handled by cookie/session)
        if (user.role) {
          localStorage.setItem("role", user.role)
        }
        if (user.role === "ADMIN") {
          navigate("/admin")
        } else if (user.role === "TEACHER") {
          navigate("/dashboard")
        } else {
          navigate("/student-dashboard")
        }
      } else {
        setError("Invalid credentials. Please try again.")
      }
    } catch {
      setError("Failed to login. Please check your network or credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Decorative Side Panel */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2073&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/80 to-purple-600/80 mix-blend-multiply"></div>
        <div className="relative z-10 p-12 text-white max-w-xl">
          <div className="mb-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-xl border border-white/30">
              <span className="text-3xl font-bold text-white">A</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-4 text-white drop-shadow-md">Athena LMS</h1>
            <p className="text-xl text-slate-100 font-medium leading-relaxed drop-shadow-sm">
              Empowering the next generation of learners with advanced tools, intuitive testing, and seamless management.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium">✨ Modern Interface</div>
            <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium">🚀 Fast Performance</div>
          </div>
        </div>

        {/* Animated Shapes */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      {/* Login Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-100 via-background to-background dark:from-purple-900/20 dark:via-background dark:to-background"></div>

        <Card className="w-full max-w-md border-0 shadow-none bg-transparent">
          <CardHeader className="space-y-1 pb-8 text-center lg:text-left">
            <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                  className="h-11 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="h-11 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm"
                  required
                />
              </div>

              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg flex items-center animate-in fade-in slide-in-from-top-1">
                  <span className="mr-2">⚠️</span> {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium shadow-primary/25 shadow-lg hover:shadow-primary/40 transition-all duration-300 transform hover:-translate-y-0.5"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground mt-6">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="font-semibold text-primary hover:underline underline-offset-4">
                  Create an account
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="absolute bottom-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Athena LMS. All rights reserved.
        </div>
      </div>
    </div>
  )
}

export default LoginPage
