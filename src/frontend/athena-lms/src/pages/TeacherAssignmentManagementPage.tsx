"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
    getAllTeacherAssignments,
    createTeacherAssignment,
    deleteTeacherAssignment,
    getAllTeachers,
    getSections,
    getSubjects,
    type TeacherAssignment,
    type Teacher,
    type Section,
    type Subject
} from "../services/api"

const TeacherAssignmentManagementPage: React.FC = () => {
    const navigate = useNavigate()
    const [assignments, setAssignments] = useState<TeacherAssignment[]>([])
    const [teachers, setTeachers] = useState<Teacher[]>([])
    const [sections, setSections] = useState<Section[]>([])
    const [subjects, setSubjects] = useState<Subject[]>([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    // Pagination State
    const [currentPage, setCurrentPage] = useState(0)
    const [pageSize] = useState(10)
    const [totalPages, setTotalPages] = useState(0)

    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newAssignment, setNewAssignment] = useState<{
        teacherId: number | "";
        sectionId: number | "";
        subjectId: number | "";
    }>({
        teacherId: "",
        sectionId: "",
        subjectId: "",
    })

    useEffect(() => {
        fetchData()
    }, [currentPage]) // Refetch when page changes

    const fetchData = async () => {
        setLoading(true)
        try {
            const [assignmentsRes, teachersRes, sectionsData, subjectsData] = await Promise.all([
                getAllTeacherAssignments(currentPage, pageSize),
                getAllTeachers(0, 100), // Get first 100 teachers for dropdown
                getSections(),
                getSubjects(),
            ])
            setAssignments(assignmentsRes.content)
            setTotalPages(assignmentsRes.page.totalPages)

            setTeachers(teachersRes.content) // Extract content from PaginatedResponse
            setSections(sectionsData)
            setSubjects(subjectsData)
            setError(null)
        } catch (err) {
            console.error("Failed to fetch data", err)
            setError("Failed to load data. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleCreateAssignment = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        if (!newAssignment.teacherId || !newAssignment.sectionId || !newAssignment.subjectId) {
            setError("Please select teacher, section, and subject.")
            return
        }

        try {
            const teacher = teachers.find(t => t.id === Number(newAssignment.teacherId))
            const section = sections.find(s => s.id === Number(newAssignment.sectionId))
            const subject = subjects.find(s => s.id === Number(newAssignment.subjectId))

            if (!teacher || !section || !subject) {
                setError("Invalid selection.")
                return
            }

            await createTeacherAssignment({
                teacher,
                section,
                subject
            })

            setSuccess("Teacher assignment created successfully!")
            setNewAssignment({ teacherId: "", sectionId: "", subjectId: "" })
            setShowCreateModal(false)
            fetchData()

            setTimeout(() => setSuccess(null), 3000)
        } catch (err: any) {
            console.error("Failed to create assignment", err)
            // Check if the error response has a message from the backend (e.g. "Teacher assignment already exists")
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message)
            } else if (err.response && err.response.status === 409) { // Conflict
                setError("Teacher assignment already exists.")
            } else {
                setError("Failed to create assignment. It might already exist.")
            }
        }
    }

    const handleDeleteAssignment = async (id: number) => {
        if (!window.confirm("Are you sure you want to remove this assignment?")) return

        try {
            await deleteTeacherAssignment(id)
            setSuccess("Assignment removed successfully")
            // Refresh data to keep pagination correct
            fetchData()
            setTimeout(() => setSuccess(null), 3000)
        } catch (err) {
            console.error("Failed to delete assignment", err)
            setError("Failed to remove assignment.")
        }
    }

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-900">Teacher Assignments</h1>
                    <button
                        onClick={() => navigate("/admin")}
                        className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                        {success}
                    </div>
                )}

                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Current Assignments</h2>
                        <p className="text-sm text-slate-600">Manage which teachers handle specific subjects and sections.</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
                    >
                        + Assign Teacher
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-slate-500">Loading assignments...</div>
                ) : assignments.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center text-slate-600">
                        No teacher assignments found. Click "Assign Teacher" to create one.
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-lg shadow overflow-hidden border border-slate-200">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Teacher</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Subject</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Section</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {assignments.map((assignment) => (
                                        <tr key={assignment.id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                                {assignment.teacher?.firstName} {assignment.teacher?.lastName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {assignment.subject?.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                {assignment.section?.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleDeleteAssignment(assignment.id)}
                                                    className="text-red-600 hover:text-red-900 transition"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex items-center justify-between mt-4 bg-white px-4 py-3 sm:px-6 rounded-lg shadow-sm border border-slate-200">
                            <div className="flex flex-1 justify-between sm:hidden">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 0}
                                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage >= totalPages - 1}
                                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Page <span className="font-medium">{currentPage + 1}</span> of <span className="font-medium">{totalPages}</span>
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 0}
                                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                        >
                                            <span className="sr-only">Previous</span>
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage >= totalPages - 1}
                                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                        >
                                            <span className="sr-only">Next</span>
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>

            {/* Create Assignment Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Assign Teacher</h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleCreateAssignment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Teacher</label>
                                <select
                                    value={newAssignment.teacherId}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, teacherId: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    required
                                >
                                    <option value="">Select a teacher...</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.firstName} {t.lastName} ({t.username})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                                <select
                                    value={newAssignment.subjectId}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, subjectId: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    required
                                >
                                    <option value="">Select a subject...</option>
                                    {subjects.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
                                <select
                                    value={newAssignment.sectionId}
                                    onChange={(e) => setNewAssignment({ ...newAssignment, sectionId: Number(e.target.value) })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    required
                                >
                                    <option value="">Select a section...</option>
                                    {sections.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false)
                                        setError(null)
                                    }}
                                    className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    Assign
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default TeacherAssignmentManagementPage
