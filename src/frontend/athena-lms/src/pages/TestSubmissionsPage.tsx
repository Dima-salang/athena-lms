"use client"

import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getSubmissionsByTest, autoGradeTest, type Submission } from "../services/api"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Search, GraduationCap, Loader2, PlayCircle, Eye, SlidersHorizontal, UserCircle2 } from "lucide-react"

const TestSubmissionsPage: React.FC = () => {
    const { testId } = useParams<{ testId: string }>()
    const navigate = useNavigate()
    const [submissions, setSubmissions] = useState<Submission[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [grading, setGrading] = useState(false)

    useEffect(() => {
        if (testId) {
            fetchSubmissions()
        }
    }, [testId])

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

    const handleAutoGradeAll = async () => {
        if (!testId) return;
        if (!confirm("Are you sure you want to auto-grade ALL submissions for this test? This will overwrite manual scores.")) return;

        try {
            setGrading(true);
            await autoGradeTest(Number(testId));
            await fetchSubmissions();
        } catch (e) {
            console.error(e);
            setError("Failed to auto-grade all submissions");
        } finally {
            setGrading(false);
        }
    }

    // Deduplicate logic
    const uniqueSubmissions = Array.from(
        submissions.reduce((acc, curr) => {
            const key = curr.student.username;
            if (!acc.has(key) || (curr.endTime && !acc.get(key)?.endTime)) {
                acc.set(key, curr);
            } else if (curr.endTime && acc.get(key)?.endTime) {
                if ((curr as any).submittedAt && !(acc.get(key) as any)?.submittedAt) {
                    acc.set(key, curr);
                }
            }
            return acc;
        }, new Map<string, Submission>()).values()
    );

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header with decorative background */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-900 dark:to-indigo-900 text-white p-8 shadow-xl">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <Button
                                variant="ghost"
                                onClick={() => navigate("/dashboard")}
                                className="text-indigo-100 hover:text-white hover:bg-white/10 pl-0 -ml-3 mb-2"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                            </Button>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Test Submissions</h1>
                            <p className="text-indigo-100 text-lg max-w-xl">
                                View details, analyze performance, and grade assessments efficiently.
                            </p>
                        </div>
                        <div className="flex items-center">
                            <Button
                                onClick={handleAutoGradeAll}
                                disabled={grading || loading}
                                className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg border-none transition-all hover:scale-105 font-semibold"
                            >
                                {grading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Auto-Grading...
                                    </>
                                ) : (
                                    <>
                                        <PlayCircle className="mr-2 h-4 w-4" />
                                        Auto-Grade All
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by student name or username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-primary"
                        />
                    </div>
                    {/* Add filters here if needed later */}
                    <div className="ml-auto flex gap-2">
                        {/* <Button variant="outline" size="icon">
                            <SlidersHorizontal className="h-4 w-4" />
                        </Button> */}
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center animate-in fade-in slide-in-from-top-2">
                        <div className="mr-3 text-red-500">⚠️</div>
                        {error}
                    </div>
                )}

                <Card className="border-none shadow-md bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-primary" />
                            Student Submissions
                        </CardTitle>
                        <CardDescription>
                            Showing {uniqueSubmissions.length} unique submission{uniqueSubmissions.length !== 1 ? 's' : ''}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading && !grading ? (
                            <div className="flex flex-col justify-center items-center py-16 text-muted-foreground">
                                <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary/50" />
                                <p>Loading submissions...</p>
                            </div>
                        ) : uniqueSubmissions.length === 0 ? (
                            <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
                                <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <GraduationCap className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 pb-1">No submissions found</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto">
                                    We couldn't find any submissions matching your search criteria.
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                                        <TableRow>
                                            <TableHead className="w-[300px]">Student</TableHead>
                                            <TableHead>Date Submitted</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Score</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {uniqueSubmissions.map((submission) => (
                                            <TableRow key={submission.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer" onClick={() => navigate(`/teacher/submission/${submission.id}`)}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                                            <UserCircle2 className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                                                                {submission.student.firstName} {submission.student.lastName}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground font-mono">
                                                                @{submission.student.username}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-600 dark:text-slate-400">
                                                    {(submission as any).submittedAt
                                                        ? format(new Date((submission as any).submittedAt), "MMM d, yyyy h:mm a")
                                                        : (submission as any).createdAt ? format(new Date((submission as any).createdAt), "MMM d, yyyy h:mm a") : "N/A"}
                                                </TableCell>
                                                <TableCell>
                                                    {(submission.totalScore !== undefined) ? (
                                                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                            Graded
                                                        </div>
                                                    ) : (
                                                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                                            Pending
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-bold text-slate-900 dark:text-slate-100">
                                                    {submission.totalScore !== undefined ? submission.totalScore : "--"}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/teacher/submission/${submission.id}`)
                                                        }}
                                                        className="text-primary hover:text-primary hover:bg-primary/5 font-medium"
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View & Grade
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default TestSubmissionsPage
