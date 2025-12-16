"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getTeacherTests, type Test } from "../services/api"
import { useNavigate } from "react-router-dom"
import { logout, getCurrentUser } from "../services/authApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Plus, Search, BarChart2, Edit, LogOut, Clock, Calendar } from "lucide-react"

const DashboardPage: React.FC = () => {
    const [tests, setTests] = useState<Test[]>([])
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchTests = async () => {
            setLoading(true)
            try {
                const user = await getCurrentUser()
                if (user && user.id) {
                    const response = await getTeacherTests(user.id, page, 5, searchTerm)
                    if (response && response.content) {
                        setTests(response.content)
                        setTotalPages(response.page.totalPages)
                    } else {
                        setTests([])
                    }
                    setError(null)
                }
            } catch {
                setError("Failed to fetch tests. Please check your login status.")
                setTests([])
            } finally {
                setLoading(false)
            }
        }
        const timeoutId = setTimeout(() => {
            fetchTests()
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
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Teacher Dashboard</h1>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle>Create New Test</CardTitle>
                                <CardDescription>
                                    Create a new test, add questions, and assign it to your students.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button className="w-full" onClick={() => navigate("/create-test")}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create New Test
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight text-slate-900">Available Tests</h2>
                                <p className="text-slate-600 text-sm mt-1">Manage and view your created tests</p>
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
                                    <p className="text-slate-600 font-medium">No tests found. Create one to get started.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {tests.map((test) => (
                                    <Card key={test.id} className="hover:border-primary/50 transition-colors">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                                                <div className="flex-1 space-y-2 cursor-pointer" onClick={() => navigate(`/test/${test.id}`)}>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="outline">{test.subject?.name || 'General'}</Badge>
                                                        {test.section && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                {test.section.name}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-slate-900 hover:text-primary transition-colors">
                                                        {test.testName}
                                                    </h3>
                                                    <p className="text-slate-600 text-sm line-clamp-2">{test.testDescription}</p>

                                                    <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-2">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            Updated: {test.updatedAt ? new Date(test.updatedAt).toLocaleDateString() : 'N/A'}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            Created: {test.createdAt ? new Date(test.createdAt).toLocaleDateString() : 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                                                    <Button variant="outline" size="sm" className="justify-start" onClick={(e: React.MouseEvent) => {
                                                        e.stopPropagation()
                                                        navigate(`/teacher/test/${test.id}/submissions`)
                                                    }}>
                                                        <BarChart2 className="h-4 w-4 mr-2" />
                                                        Submissions
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="justify-start" onClick={(e: React.MouseEvent) => {
                                                        e.stopPropagation()
                                                        navigate(`/test/${test.id}/edit`)
                                                    }}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

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
                    </div>
                </div>
            </main>
        </div>
    )
}

export default DashboardPage
