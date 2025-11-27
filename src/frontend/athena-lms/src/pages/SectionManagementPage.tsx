"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getSections, createSection, type Section } from "../services/api"
import { useNavigate } from "react-router-dom"

const SectionManagementPage: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([])
  const [newSectionName, setNewSectionName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const fetchedSections = await getSections()
      setSections(fetchedSections)
    } catch (err) {
      setError("Failed to fetch sections")
    }
  }

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createSection({ name: newSectionName })
      setNewSectionName("")
      setSuccess("Section created successfully")
      fetchData()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError("Failed to create section")
      setTimeout(() => setError(null), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manage Sections</h1>
            <p className="text-slate-600 text-sm mt-1">Add and manage class sections</p>
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            Back to Admin
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm font-medium">{success}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Add New Section</h2>
          <form onSubmit={handleCreateSection} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                required
                placeholder="e.g. Grade 10 - Newton"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 whitespace-nowrap"
            >
              Add Section
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Name
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sections.map((section) => (
                  <tr key={section.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-sm text-slate-700">{section.id}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{section.name}</td>
                  </tr>
                ))}
                {sections.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-6 py-8 text-center text-slate-600">
                      No sections found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

export default SectionManagementPage
