"use client"

import React from "react"
import { useNavigate } from "react-router-dom"

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
    } catch (err) {
      setError("Failed to create admin account. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Manage Sections Card */}
          <div
            onClick={() => navigate("/admin/sections")}
            className="group bg-white rounded-lg shadow-md p-8 cursor-pointer hover:shadow-lg transition border border-slate-200 hover:border-blue-300"
          >
            <div className="mb-4 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition">
              <span className="text-2xl">📚</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Manage Sections</h2>
            <p className="text-slate-600">Create, view, and manage class sections for your school.</p>
            <div className="mt-6 flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
              Go to Sections <span className="ml-2">→</span>
            </div>
          </div>

          {/* Manage Subjects Card */}
          <div
            onClick={() => navigate("/admin/subjects")}
            className="group bg-white rounded-lg shadow-md p-8 cursor-pointer hover:shadow-lg transition border border-slate-200 hover:border-blue-300"
          >
            <div className="mb-4 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition">
              <span className="text-2xl">📖</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Manage Subjects</h2>
            <p className="text-slate-600">Create, view, and manage subjects and their descriptions.</p>
            <div className="mt-6 flex items-center text-purple-600 font-semibold group-hover:gap-2 transition-all">
              Go to Subjects <span className="ml-2">→</span>
            </div>
          </div>

          {/* Manage Teacher Assignments Card */}
          <div
            onClick={() => navigate("/admin/teacher-assignments")}
            className="group bg-white rounded-lg shadow-md p-8 cursor-pointer hover:shadow-lg transition border border-slate-200 hover:border-orange-300"
          >
            <div className="mb-4 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition">
              <span className="text-2xl">👨‍🏫</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Teacher Assignments</h2>
            <p className="text-slate-600">Assign teachers to specific subjects and sections.</p>
            <div className="mt-6 flex items-center text-orange-600 font-semibold group-hover:gap-2 transition-all">
              Manage Assignments <span className="ml-2">→</span>
            </div>
          </div>

          {/* Manage Users Card */}
          <div
            onClick={() => navigate("/admin/users")}
            className="group bg-white rounded-lg shadow-md p-8 cursor-pointer hover:shadow-lg transition border border-slate-200 hover:border-indigo-300"
          >
            <div className="mb-4 w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition">
              <span className="text-2xl">👥</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Manage Users</h2>
            <p className="text-slate-600">View and manage all users (Teachers, Students, Admins).</p>
            <div className="mt-6 flex items-center text-indigo-600 font-semibold group-hover:gap-2 transition-all">
              Manage Users <span className="ml-2">→</span>
            </div>
          </div>

          {/* Create Admin Card */}
          <div
            onClick={() => setShowCreateAdminModal(true)}
            className="group bg-white rounded-lg shadow-md p-8 cursor-pointer hover:shadow-lg transition border border-slate-200 hover:border-green-300"
          >
            <div className="mb-4 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition">
              <span className="text-2xl">🛡️</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Create Admin</h2>
            <p className="text-slate-600">Create a new administrator account for the system.</p>
            <div className="mt-6 flex items-center text-green-600 font-semibold group-hover:gap-2 transition-all">
              Create Account <span className="ml-2">→</span>
            </div>
          </div>
        </div>
      </main>

      {/* Create Admin Modal */}
      {showCreateAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Create New Admin</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={newAdmin.firstName}
                  onChange={(e) => setNewAdmin({ ...newAdmin, firstName: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={newAdmin.lastName}
                  onChange={(e) => setNewAdmin({ ...newAdmin, lastName: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateAdminModal(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPage
