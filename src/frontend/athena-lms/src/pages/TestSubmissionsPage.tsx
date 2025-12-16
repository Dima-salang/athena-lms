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
import { ArrowLeft, Search, GraduationCap, Loader2, PlayCircle, Eye } from "lucide-react"

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
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Test Submissions</h1>
                        <p className="text-muted-foreground mt-1">View and grade student submissions.</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => navigate("/dashboard")}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search student..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <Button
                        onClick={handleAutoGradeAll}
                        disabled={grading || loading}
                        className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white"
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

                {error && (
                    <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
                        {error}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Student Submissions</CardTitle>
                        <CardDescription>
                            List of all student attempts for this test.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading && !grading ? (
                            <div className="flex justify-center items-center py-12 text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                                Loading submissions...
                            </div>
                        ) : uniqueSubmissions.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                <p>No submissions found matching your criteria.</p>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Date Submitted</TableHead>
                                            <TableHead>Score</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {uniqueSubmissions.map((submission) => (
                                            <TableRow key={submission.id}>
                                                <TableCell>
                                                    <div className="font-medium text-slate-900">
                                                        {submission.student.firstName} {submission.student.lastName}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {submission.student.username}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {(submission as any).submittedAt
                                                        ? format(new Date((submission as any).submittedAt), "MMM d, yyyy h:mm a")
                                                        : (submission as any).createdAt ? format(new Date((submission as any).createdAt), "MMM d, yyyy h:mm a") : "N/A"}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {submission.totalScore !== undefined ? submission.totalScore : (
                                                        <span className="text-muted-foreground italic">Not Graded</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => navigate(`/teacher/submission/${submission.id}`)}
                                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
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
