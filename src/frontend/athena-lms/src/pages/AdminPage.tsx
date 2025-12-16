"use client"

import React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BookOpen, Users, GraduationCap, Shield, UserPlus, ArrowLeft } from "lucide-react"

const AdminPage: React.FC = () => {
  const navigate = useNavigate()
  const [showCreateAdminModal, setShowCreateAdminModal] = React.useState(false)
  const [newAdmin, setNewAdmin] = React.useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
  })
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    try {
      // Dynamic import to avoid circular dependency issues if any, or just standard import
      const { createAdmin } = await import("../services/api")
      await createAdmin({ ...newAdmin, id: 0 }) // id is 0 for new user
      setSuccess("Admin account created successfully!")
      setNewAdmin({ firstName: "", lastName: "", username: "", password: "" })
      setTimeout(() => {
        setShowCreateAdminModal(false)
        setSuccess(null)
      }, 2000)
    } catch (error) {
      setError("Failed to create admin account. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
          <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Manage Sections Card */}
          <Card
            className="cursor-pointer hover:shadow-md transition-all hover:border-blue-300 group"
            onClick={() => navigate("/admin/sections")}
          >
            <CardHeader>
              <div className="mb-2 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors text-blue-600">
                <BookOpen className="h-6 w-6" />
              </div>
              <CardTitle>Manage Sections</CardTitle>
              <CardDescription>Create, view, and manage class sections for your school.</CardDescription>
            </CardHeader>
          </Card>

          {/* Manage Subjects Card */}
          <Card
            className="cursor-pointer hover:shadow-md transition-all hover:border-purple-300 group"
            onClick={() => navigate("/admin/subjects")}
          >
            <CardHeader>
              <div className="mb-2 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors text-purple-600">
                <GraduationCap className="h-6 w-6" />
              </div>
              <CardTitle>Manage Subjects</CardTitle>
              <CardDescription>Create, view, and manage subjects and their descriptions.</CardDescription>
            </CardHeader>
          </Card>

          {/* Manage Teacher Assignments Card */}
          <Card
            className="cursor-pointer hover:shadow-md transition-all hover:border-orange-300 group"
            onClick={() => navigate("/admin/teacher-assignments")}
          >
            <CardHeader>
              <div className="mb-2 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors text-orange-600">
                <Users className="h-6 w-6" />
              </div>
              <CardTitle>Teacher Assignments</CardTitle>
              <CardDescription>Assign teachers to specific subjects and sections.</CardDescription>
            </CardHeader>
          </Card>

          {/* Manage Users Card */}
          <Card
            className="cursor-pointer hover:shadow-md transition-all hover:border-indigo-300 group"
            onClick={() => navigate("/admin/users")}
          >
            <CardHeader>
              <div className="mb-2 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors text-indigo-600">
                <UserPlus className="h-6 w-6" />
              </div>
              <CardTitle>Manage Users</CardTitle>
              <CardDescription>View and manage all users (Teachers, Students, Admins).</CardDescription>
            </CardHeader>
          </Card>

          {/* Create Admin Card */}
          <Dialog open={showCreateAdminModal} onOpenChange={setShowCreateAdminModal}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer hover:shadow-md transition-all hover:border-green-300 group">
                <CardHeader>
                  <div className="mb-2 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors text-green-600">
                    <Shield className="h-6 w-6" />
                  </div>
                  <CardTitle>Create Admin</CardTitle>
                  <CardDescription>Create a new administrator account for the system.</CardDescription>
                </CardHeader>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Admin</DialogTitle>
                <DialogDescription>
                  Enter the details below to create a new administrator account.
                </DialogDescription>
              </DialogHeader>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">
                  {success}
                </div>
              )}

              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={newAdmin.firstName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAdmin({ ...newAdmin, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={newAdmin.lastName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAdmin({ ...newAdmin, lastName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={newAdmin.username}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newAdmin.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                    required
                  />
                </div>
                <DialogFooter className="mt-4">
                  <Button type="button" variant="outline" onClick={() => setShowCreateAdminModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Admin</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  )
}

export default AdminPage
