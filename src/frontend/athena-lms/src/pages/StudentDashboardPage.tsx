"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getTestsBySection, getMySubmissions, type Test, type Student } from "../services/api"
import { getCurrentUser, logout } from "../services/authApi"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Clock, Calendar, FileText, Search, User, LogOut } from "lucide-react"

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

                if (studentUser.section) {
                    const [testsResponse, submissions] = await Promise.all([
                        getTestsBySection(studentUser.section.id, page, 6, searchTerm),
                        getMySubmissions()
                    ])

                    const submittedIds = new Set(
                        submissions
                            .filter(s => s.submittedAt !== null && s.submittedAt !== undefined)
                            .map(s => s.test.id)
                    )
                    setSubmittedTestIds(submittedIds)

                    const response = testsResponse
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
        <div className="min-h-screen bg-slate-50/50">
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Student Dashboard</h1>
                    <div className="flex items-center gap-4">
                        {student && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <User className="h-4 w-4" />
                                <span>
                                    {student.firstName} ({student.section?.name})
                                </span>
                            </div>
                        )}
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900">My Tests</h2>
                        <p className="text-slate-600 text-sm mt-1">View and take your assigned tests</p>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                type="text"
                                placeholder="Search tests..."
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500">Loading tests...</p>
                    </div>
                ) : tests.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <FileText className="h-12 w-12 text-slate-300 mb-4" />
                            <p className="text-slate-600 font-medium">No tests available</p>
                            <p className="text-slate-500 text-sm">There are no tests for your section yet.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tests.map((test) => (
                                <Card key={test.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant="secondary">
                                                {test.subject.name}
                                            </Badge>
                                        </div>
                                        <CardTitle className="line-clamp-2 text-lg">
                                            {test.testName}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-3">
                                            {test.testDescription}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 space-y-2 text-sm text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            <span>{test.testDuration / 60} mins</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>Due: {new Date(test.testDueDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-xs text-slate-400 pt-2 grid grid-cols-2 gap-x-2">
                                            <span>Created: {test.createdAt ? new Date(test.createdAt).toLocaleDateString() : 'N/A'}</span>
                                            <span>Updated: {test.updatedAt ? new Date(test.updatedAt).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-2 bg-slate-50/50 border-t">
                                        {new Date(test.testDueDate) < new Date() ? (
                                            <Button disabled variant="secondary" className="w-full">
                                                Past Due
                                            </Button>
                                        ) : submittedTestIds.has(test.id) ? (
                                            <Button disabled variant="outline" className="w-full text-green-600 border-green-200 bg-green-50">
                                                Completed
                                            </Button>
                                        ) : (
                                            <Button onClick={() => navigate(`/student/test/${test.id}`)} className="w-full">
                                                Take Test
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-slate-600 px-2">
                                    Page {page + 1} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page === totalPages - 1}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}

export default StudentDashboardPage
