"use client"

import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getSubmissionsByTest, type Submission } from "../services/api"
import { format } from "date-fns"

const TestSubmissionsPage: React.FC = () => {
    const { testId } = useParams<{ testId: string }>()
    const navigate = useNavigate()
    const [submissions, setSubmissions] = useState<Submission[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        if (testId) {
            fetchSubmissions()
        }
    }, [testId]) // Initial fetch

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (testId) fetchSubmissions()
        }, 500)
        return () => clearTimeout(timer)
    }, [searchQuery, testId])

    const fetchSubmissions = async () => {
        if (!testId) return
        setLoading(true)
        try {
            const data = await getSubmissionsByTest(Number(testId), searchQuery)
            setSubmissions(data)
            setError(null)
        } catch (err) {
            console.error("Failed to fetch submissions", err)
            setError("Failed to load submissions.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-900">Test Submissions</h1>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
                    <div className="mb-6">
                        <label htmlFor="search" className="block text-sm font-medium text-slate-700 mb-1">
                            Search Student
                        </label>
                        <input
                            type="text"
                            id="search"
                            placeholder="Search by name or username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>

                    {error && (
                        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-12 text-slate-500">Loading submissions...</div>
                    ) : submissions.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                            No submissions found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date Submitted</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Score</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {submissions.map((submission) => (
                                        <tr key={submission.id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-medium text-slate-900">
                                                            {submission.student.firstName} {submission.student.lastName}
                                                        </div>
                                                        <div className="text-sm text-slate-500">
                                                            {submission.student.username}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                {/* Use submittedAt, fallback to createdAt or "N/A" */}
                                                {(submission as any).submittedAt
                                                    ? format(new Date((submission as any).submittedAt), "MMM d, yyyy h:mm a")
                                                    : (submission as any).createdAt ? format(new Date((submission as any).createdAt), "MMM d, yyyy h:mm a") : "N/A"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                                                {submission.totalScore !== undefined ? submission.totalScore : "Not Graded"}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => navigate(`/teacher/submission/${submission.id}`)}
                                                    className="text-blue-600 hover:text-blue-900 font-semibold"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default TestSubmissionsPage
