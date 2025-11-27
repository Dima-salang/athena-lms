"use client"

import type React from "react"
import { useNavigate } from "react-router-dom"

const AdminPage: React.FC = () => {
  const navigate = useNavigate()

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
        </div>
      </main>
    </div>
  )
}

export default AdminPage
