"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { registerStudent, registerTeacher } from "../services/authApi"
import { getAllSections, type Section, type Student, type Teacher } from "../services/api"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const RegistrationPage: React.FC = () => {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState("student")
  const [lrn, setLrn] = useState(0)
  const [selectedSectionId, setSelectedSectionId] = useState<string>("")
  const [sections, setSections] = useState<Section[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const data = await getAllSections()
        setSections(data)
      } catch (err) {
        console.error("Failed to fetch sections", err)
      }
    }
    fetchSections()
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      if (userType === "student") {
        const section = sections.find((s) => s.id === Number(selectedSectionId))
        if (!section) {
          throw new Error("Invalid section selected")
        }

        const student: Omit<Student, "id"> = {
          firstName,
          lastName,
          username,
          password,
          lrn,
          section: section,
        }
        await registerStudent(student)
        setSuccess("Student registered successfully!")
      } else {
        const teacher: Omit<Teacher, "id"> = {
          firstName,
          lastName,
          username,
          password,
        }
        await registerTeacher(teacher)
        setSuccess("Teacher registered successfully!")
      }
    } catch {
      setError("Failed to register user. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
            <CardDescription>Join us to get started</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
                {error}
              </div>
            )}

            {success ? (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm font-medium mb-4">{success}</p>
                <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                  <Link to="/login">Proceed to Login</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-2">
                  <Label>I am a:</Label>
                  <Select value={userType} onValueChange={setUserType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                      required
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                      required
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                    required
                    placeholder="johndoe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                </div>

                {userType === "student" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="lrn">LRN (Learner Reference Number)</Label>
                      <Input
                        id="lrn"
                        type="number"
                        value={lrn || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLrn(Number(e.target.value))}
                        required
                        placeholder="123456789012"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Section</Label>
                      <Select value={selectedSectionId} onValueChange={setSelectedSectionId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a section" />
                        </SelectTrigger>
                        <SelectContent>
                          {sections.map((section) => (
                            <SelectItem key={section.id} value={String(section.id)}>
                              {section.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <Button type="submit" className="w-full mt-6" disabled={isLoading} size="lg">
                  {isLoading ? "Creating Account..." : "Register"}
                </Button>

                <div className="pt-6 border-t border-slate-200 text-center">
                  <p className="text-slate-600 text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold text-primary hover:underline transition">
                      Login here
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RegistrationPage
