"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getTestsBySection, getMySubmissions, type Test, type Student, type Submission } from "../services/api"
import { getCurrentUser, logout } from "../services/authApi"
import { useNavigate } from "react-router-dom"

const StudentDashboardPage: React.FC = () => {
    const [tests, setTests] = useState<Test[]>([])
    const [student, setStudent] = useState<Student | null>(null)
    const [submittedTestIds, setSubmittedTestIds] = useState<Set<number>>(new Set())
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const fetchStudentAndTests = async () => {
            setLoading(true)
            try {
                const user = await getCurrentUser()
                const studentUser = user as Student;
                setStudent(studentUser)
                // console.log(studentUser)

                if (studentUser.section) {
                    const [testsResponse, submissions] = await Promise.all([
                        getTestsBySection(studentUser.section.id, page, 6, searchTerm), // Use 6 for grid layout
                        getMySubmissions()
                    ])

                    const submittedIds = new Set(
                        submissions
                            .filter(s => s.submittedAt !== null && s.submittedAt !== undefined) // Only count completed submissions
                            .map(s => s.test.id)
                    )
                    setSubmittedTestIds(submittedIds)

                    const response = testsResponse
                    // console.log(response)
                    if (response && response.content) {
                        setTests(response.content)
                        setTotalPages(response.page.totalPages)
                    } else {
                        setTests([])
                    }
                } else {
                    setError("You are not assigned to any section.")
                }
            } catch (err) {
                console.error(err)
                setError("Failed to load dashboard data.")
            } finally {
                setLoading(false)
            }
        }

        const timeoutId = setTimeout(() => {
            fetchStudentAndTests()
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [page, searchTerm])

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-900">Student Dashboard</h1>
                    <div className="flex items-center gap-4">
                        {student && (
                            <span className="text-sm text-slate-600">
                                Welcome, {student.firstName} ({student.section?.name})
                            </span>
                        )}
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm font-medium">{error}</p>
                    </div>
                )}

                <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">My Tests</h2>
                        <p className="text-slate-600 text-sm mt-1">View and take your assigned tests</p>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Search tests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                        />
                        <svg
                            className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500">Loading tests...</p>
                    </div>
                ) : tests.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <p className="text-slate-600">No tests available for your section.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tests.map((test) => (
                                <div
                                    key={test.id}
                                    className="bg-white rounded-lg shadow-md overflow-hidden border border-slate-200 hover:shadow-lg transition duration-200 flex flex-col"
                                >
                                    <div className="p-6 flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                                {test.subject.name}
                                            </span>
                                            {/* Add status badge here if available (e.g. Pending, Completed) */}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                                            {test.testName}
                                        </h3>
                                        <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                                            {test.testDescription}
                                        </p>

                                        <div className="space-y-2 text-sm text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>{test.testDuration / 60} mins</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span>Due: {new Date(test.testDueDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex flex-col gap-1 mt-2 text-xs text-slate-400">
                                                <span>Created: {test.createdAt ? new Date(test.createdAt).toLocaleDateString() : 'N/A'}</span>
                                                <span>Updated: {test.updatedAt ? new Date(test.updatedAt).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                                        {new Date(test.testDueDate) < new Date() ? (
                                            <button
                                                disabled
                                                className="w-full py-2 bg-slate-300 text-slate-500 font-medium rounded-lg cursor-not-allowed"
                                            >
                                                Past Due
                                            </button>
                                        ) : submittedTestIds.has(test.id) ? (
                                            <button
                                                disabled
                                                className="w-full py-2 bg-green-100 text-green-700 font-medium rounded-lg cursor-not-allowed border border-green-200"
                                            >
                                                Completed
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => navigate(`/student/test/${test.id}`)}
                                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
                                            >
                                                Take Test
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-slate-600 px-2">
                                    Page {page + 1} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page === totalPages - 1}
                                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}

export default StudentDashboardPage
