"use client"

import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getSubmission, getStudentAnswers, manualSetStudentAnswerScore, recalculateSubmission, type Submission, type StudentAnswer } from "../services/api"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    ArrowLeft,
    RotateCw,
    PlayCircle,
    User,
    FileText,
    CheckCircle2,
    XCircle,
    Loader2,
    AlertTriangle
} from "lucide-react"

const SubmissionDetailPage: React.FC = () => {
    const { submissionId } = useParams<{ submissionId: string }>()
    const navigate = useNavigate()
    const [submission, setSubmission] = useState<Submission | null>(null)
    const [answers, setAnswers] = useState<StudentAnswer[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            if (!submissionId) return
            setLoading(true)
            try {
                const [subData, answersData] = await Promise.all([
                    getSubmission(Number(submissionId)),
                    getStudentAnswers(Number(submissionId))
                ])
                setSubmission(subData)
                setAnswers(answersData)
                setError(null)
            } catch (err) {
                console.error("Failed to fetch submission details", err)
                setError("Failed to load submission details.")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [submissionId])

    const handleRecalculate = async () => {
        if (!submissionId) return;
        try {
            setActionLoading(true);
            await recalculateSubmission(Number(submissionId));
            window.location.reload();
        } catch (e) {
            console.error(e);
            alert("Failed to recalculate");
        } finally {
            setActionLoading(false);
        }
    }

    const handleAutoGrade = async () => {
        if (!submissionId) return;
        if (!confirm("Are you sure? This will overwrite manual scores with auto-graded values.")) return;
        try {
            setActionLoading(true);
            await recalculateSubmission(Number(submissionId), true);
            window.location.reload();
        } catch (e) {
            console.error(e);
            alert("Failed to auto-grade");
        } finally {
            setActionLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-50/50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error || !submission) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50/50 p-4">
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex flex-col items-center gap-2 max-w-md text-center">
                    <AlertTriangle className="h-6 w-6" />
                    <p className="font-medium">{error || "Submission not found"}</p>
                    <Button variant="outline" onClick={() => navigate("/dashboard")} className="mt-2">
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate(-1)}
                        className="gap-2 pl-0 hover:pl-2 transition-all w-fit"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back
                    </Button>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleRecalculate}
                            disabled={actionLoading}
                            className="text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100 hover:text-blue-700"
                        >
                            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RotateCw className="h-4 w-4 mr-2" />}
                            Recalculate
                        </Button>
                        <Button
                            onClick={handleAutoGrade}
                            disabled={actionLoading}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PlayCircle className="h-4 w-4 mr-2" />}
                            Auto-Grade
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5 text-muted-foreground" />
                                Student Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Name:</span>
                                <span className="font-medium">{submission.student.firstName} {submission.student.lastName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Username:</span>
                                <span className="font-medium">{submission.student.username}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                Test Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Test:</span>
                                <span className="font-medium">{submission.test.testName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Submitted:</span>
                                <span className="font-medium">{(submission as any).submittedAt ? format(new Date((submission as any).submittedAt), "MMM d, yyyy h:mm a") : "N/A"}</span>
                            </div>
                            <div className="flex justify-between text-sm items-center mt-2 pt-2 border-t">
                                <span className="text-muted-foreground">Total Score:</span>
                                <Badge variant="secondary" className="text-lg px-3 py-1">
                                    {submission.totalScore !== undefined ? submission.totalScore : "N/A"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-semibold tracking-tight">Question Details</h2>
                    {submission.test.questions && submission.test.questions.map((question, index) => {
                        const studentAnswer = answers.find(a => a.question.id === question.id)
                        const isCorrect = (studentAnswer?.points || 0) > 0; // Simple heuristic, might need deeper check for partials

                        return (
                            <Card key={question.id}>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className="h-7 min-w-[28px] flex items-center justify-center rounded-full font-bold">
                                                {index + 1}
                                            </Badge>
                                            <Badge variant={isCorrect ? "default" : "destructive"}>
                                                {studentAnswer?.points || 0} / {question.fullPoints} Pts
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase px-2">Score</span>
                                            <div className="flex items-center">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max={question.fullPoints}
                                                    defaultValue={studentAnswer?.points || 0}
                                                    onBlur={async (e) => {
                                                        const val = Number(e.target.value);
                                                        if (studentAnswer?.id && !isNaN(val)) {
                                                            try {
                                                                await manualSetStudentAnswerScore(studentAnswer.id, val);
                                                            } catch (err) {
                                                                console.error(err);
                                                                alert("Failed to update score");
                                                            }
                                                        }
                                                    }}
                                                    className="w-16 h-8 text-right font-medium"
                                                />
                                                <span className="text-sm text-muted-foreground ml-2 px-2 border-l">
                                                    / {question.fullPoints}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-md border border-slate-100">
                                        <p className="font-medium text-slate-800">{question.questionText}</p>
                                    </div>

                                    {/* Multiple Choice */}
                                    {question.questionType === "MULTIPLE_CHOICE" && (
                                        <div className="space-y-3">
                                            <div className="grid gap-2">
                                                {question.options?.map((option) => {
                                                    const isSelected = studentAnswer?.optionId === option.id
                                                    const isAnswerCorrect = option.id === question.correctOptionId

                                                    let variantClass = "bg-white border-slate-200 text-slate-700"
                                                    if (isSelected && isAnswerCorrect) variantClass = "bg-green-50 border-green-500 text-green-900"
                                                    else if (isSelected && !isAnswerCorrect) variantClass = "bg-red-50 border-red-500 text-red-900"
                                                    else if (isAnswerCorrect) variantClass = "bg-blue-50 border-blue-400 text-blue-900 ring-1 ring-blue-400"

                                                    return (
                                                        <div key={option.id || option.tempId} className={`flex items-center justify-between p-3 rounded-md border ${variantClass} transition-colors`}>
                                                            <div className="flex items-center gap-3">
                                                                {isSelected ? (
                                                                    isAnswerCorrect ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />
                                                                ) : (
                                                                    <div className="h-5 w-5" /> // spacer
                                                                )}
                                                                <span className="font-medium">{option.optionText}</span>
                                                            </div>
                                                            <div className="flex gap-2 text-xs font-bold uppercase tracking-wider">
                                                                {isSelected && <span>Selected</span>}
                                                                {isAnswerCorrect && <span className="text-blue-700">Correct Answer</span>}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* True/False */}
                                    {question.questionType === "TRUE_FALSE" && (
                                        <div className="space-y-3">
                                            <div className="grid gap-2">
                                                {["true", "false"].map((val) => {
                                                    const isSelected = studentAnswer?.textAnswer?.toLowerCase() === val
                                                    const isAnswerCorrect = question.correctAnswer?.toLowerCase() === val

                                                    let variantClass = "bg-white border-slate-200 text-slate-700"
                                                    if (isSelected && isAnswerCorrect) variantClass = "bg-green-50 border-green-500 text-green-900"
                                                    else if (isSelected && !isAnswerCorrect) variantClass = "bg-red-50 border-red-500 text-red-900"
                                                    else if (isAnswerCorrect) variantClass = "bg-blue-50 border-blue-400 text-blue-900 ring-1 ring-blue-400"

                                                    return (
                                                        <div key={val} className={`flex items-center justify-between p-3 rounded-md border ${variantClass} transition-colors`}>
                                                            <div className="flex items-center gap-3">
                                                                {isSelected ? (
                                                                    isAnswerCorrect ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />
                                                                ) : (
                                                                    <div className="h-5 w-5" /> // spacer
                                                                )}
                                                                <span className="font-medium capitalize">{val}</span>
                                                            </div>
                                                            <div className="flex gap-2 text-xs font-bold uppercase tracking-wider">
                                                                {isSelected && <span>Selected</span>}
                                                                {isAnswerCorrect && <span className="text-blue-700">Correct Answer</span>}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Essay / Identification */}
                                    {(question.questionType === "ESSAY" || question.questionType === "IDENTIFICATION") && (
                                        <div className="grid md:grid-cols-2 gap-4 mt-2">
                                            <div className="space-y-1">
                                                <span className="text-xs font-semibold text-muted-foreground uppercase">Student's Answer</span>
                                                <div className="p-3 bg-slate-50 border rounded-md min-h-[80px] text-sm whitespace-pre-wrap">
                                                    {studentAnswer?.textAnswer || <span className="text-muted-foreground italic">No answer provided</span>}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs font-semibold text-muted-foreground uppercase text-blue-700">Correct Answer / Key</span>
                                                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-md min-h-[80px] text-sm whitespace-pre-wrap text-slate-800">
                                                    {question.correctAnswer || <span className="text-muted-foreground italic">Not available</span>}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default SubmissionDetailPage
