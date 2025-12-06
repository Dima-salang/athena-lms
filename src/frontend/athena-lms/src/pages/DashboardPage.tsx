"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getTeacherTests, type Test } from "../services/api"
import { useNavigate } from "react-router-dom"
import { logout, getCurrentUser } from "../services/authApi"

const DashboardPage: React.FC = () => {
    const [tests, setTests] = useState<Test[]>([])
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [loading, setLoading] = useState(true)

    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchTests = async () => {
            setLoading(true)
            try {
                const user = await getCurrentUser()
                if (user && user.id) {
                    const response = await getTeacherTests(user.id, page, 5)
                    if (response && response.content) {
                        setTests(response.content)
                        setTotalPages(response.page.totalPages)
                    } else {
                        setTests([])
                    }
                    setError(null)
                }
            } catch (err) {
                setError("Failed to fetch tests. Please check your login status.")
                setTests([])
            } finally {
                setLoading(false)
            }
        }
        fetchTests()
    }, [page])

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-900">Teacher Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm font-medium">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-24 h-fit">
                            <h2 className="text-lg font-bold text-slate-900 mb-3">Create New Test</h2>
                            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                                Create a new test, add questions, and assign it to your students.
                            </p>
                            <button
                                onClick={() => navigate("/create-test")}
                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
                            >
                                Create New Test
                            </button>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="mb-6 flex justify-between items-end">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Available Tests</h2>
                                <p className="text-slate-600 text-sm mt-1">Manage and view your created tests</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-12">
                                <p className="text-slate-500">Loading tests...</p>
                            </div>
                        ) : tests.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-md p-12 text-center">
                                <p className="text-slate-600">No tests found. Create one to get started.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {tests.map((test) => (
                                    <div
                                        key={test.id}
                                        className="bg-white rounded-lg shadow-md p-5 border border-slate-200 hover:border-blue-300 transition group"
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/test/${test.id}`)}>
                                                <h3 className="text-lg font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                                    {test.testName}
                                                </h3>
                                                <p className="text-slate-600 text-sm mt-1 line-clamp-2">{test.testDescription}</p>
                                                <div className="flex gap-4 mt-3 text-xs text-slate-600">
                                                    <span className="inline-flex items-center">
                                                        <span className="font-medium">Subject:</span>&nbsp;{test.subject?.name || 'N/A'}
                                                    </span>
                                                    <span className="inline-flex items-center">
                                                        <span className="font-medium">Section:</span>&nbsp;{test.section?.name || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full whitespace-nowrap">
                                                    {test.subject?.name || 'General'}
                                                </span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        navigate(`/test/${test.id}/edit`)
                                                    }}
                                                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center gap-1 border border-slate-200 hover:border-blue-200"
                                                >
                                                    <span>✎ Edit</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="mt-6 flex justify-center items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="px-3 py-1 rounded border border-slate-300 text-slate-600 disabled:opacity-50 hover:bg-slate-50"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-slate-600">
                                    Page {page + 1} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page === totalPages - 1}
                                    className="px-3 py-1 rounded border border-slate-300 text-slate-600 disabled:opacity-50 hover:bg-slate-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default DashboardPage
