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
    AlertTriangle,
    Clock,
    Award
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
            <div className="flex justify-center items-center min-h-screen bg-slate-50/50 dark:bg-slate-950">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error || !submission) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50/50 dark:bg-slate-950 p-4">
                <div className="bg-destructive/10 text-destructive p-6 rounded-lg flex flex-col items-center gap-3 max-w-md text-center border border-destructive/20">
                    <AlertTriangle className="h-8 w-8" />
                    <p className="font-semibold text-lg">{error || "Submission not found"}</p>
                    <Button variant="outline" onClick={() => navigate("/dashboard")} className="mt-2 border-destructive/30 hover:bg-destructive/20 text-destructive">
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 md:p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Button
                            variant="ghost"
                            onClick={() => navigate(-1)}
                            className="text-muted-foreground hover:text-foreground mb-2 pl-0 hover:bg-transparent"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Submission Details</h1>
                        <p className="text-muted-foreground">Review and grade student answers.</p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handleRecalculate}
                            disabled={actionLoading}
                            className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-blue-300"
                        >
                            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RotateCw className="h-4 w-4 mr-2" />}
                            Recalculate
                        </Button>
                        <Button
                            onClick={handleAutoGrade}
                            disabled={actionLoading}
                            className="bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20"
                        >
                            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PlayCircle className="h-4 w-4 mr-2" />}
                            Auto-Grade
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Student Card */}
                    <Card className="md:col-span-1 border-none shadow-md bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-800">
                        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                Student
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</p>
                                <p className="font-semibold text-lg">{submission.student.firstName} {submission.student.lastName}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Username</p>
                                <p className="text-base font-medium font-mono text-slate-600 dark:text-slate-300">@{submission.student.username}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Test Info Card */}
                    <Card className="md:col-span-2 border-none shadow-md bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-800">
                        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Test Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Test Name</p>
                                    <p className="font-semibold text-lg line-clamp-1">{submission.test.testName}</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Submitted</p>
                                        <p className="text-sm font-medium">
                                            {(submission as any).submittedAt ? format(new Date((submission as any).submittedAt), "MMM d, yyyy h:mm a") : "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center items-center sm:items-end">
                                <div className="text-center sm:text-right">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Score</p>
                                    <div className="flex items-center gap-2">
                                        <Award className="h-6 w-6 text-yellow-500" />
                                        <span className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                                            {submission.totalScore !== undefined ? submission.totalScore : "--"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-1 bg-primary rounded-full"></div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Question Analysis</h2>
                    </div>

                    {submission.test.questions && submission.test.questions.map((question, index) => {
                        const studentAnswer = answers.find(a => a.question.id === question.id)
                        const score = studentAnswer?.points || 0;
                        const fullPoints = question.fullPoints;
                        const isFullCredit = score === fullPoints;
                        const isPartialCredit = score > 0 && score < fullPoints;
                        const isZeroCredit = score === 0;

                        return (
                            <Card key={question.id} className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                                <div className={`h-1 w-full ${isFullCredit ? "bg-green-500" : isPartialCredit ? "bg-yellow-500" : "bg-slate-300 dark:bg-slate-700"}`} />
                                <CardContent className="p-6 space-y-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="flex-none h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                {index + 1}
                                            </div>
                                            <div className="space-y-2">
                                                <div className="text-base font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                                                    {question.questionText}
                                                </div>
                                                <Badge variant="secondary" className="text-xs font-normal">
                                                    {question.questionType.replace("_", " ")}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="flex-none flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm relative group">
                                                <span className="text-xs font-semibold text-muted-foreground uppercase px-2">Score</span>
                                                <div className="flex items-center">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max={question.fullPoints}
                                                        defaultValue={score}
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
                                                        className="w-16 h-8 text-right font-medium text-slate-900 border-none bg-white focus-visible:ring-1 focus-visible:ring-primary shadow-inner"
                                                    />
                                                    <span className="text-sm text-muted-foreground ml-2 px-2 border-l border-slate-200 dark:border-slate-700">
                                                        / {question.fullPoints}
                                                    </span>
                                                </div>
                                            </div>
                                            {isFullCredit && (
                                                <div className="flex items-center text-xs font-medium text-green-600 dark:text-green-400">
                                                    <CheckCircle2 className="h-3 w-3 mr-1" /> Full Credit
                                                </div>
                                            )}
                                            {isZeroCredit && (
                                                <div className="flex items-center text-xs font-medium text-muted-foreground">
                                                    <XCircle className="h-3 w-3 mr-1" /> No Credit
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pl-12">
                                        {/* Multiple Choice */}
                                        {question.questionType === "MULTIPLE_CHOICE" && (
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {question.options?.map((option) => {
                                                    const isSelected = studentAnswer?.optionId === option.id
                                                    const isAnswerCorrect = option.id === question.correctOptionId

                                                    // Determine visual state
                                                    let cardClasses = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                                                    let icon = null;

                                                    if (isSelected && isAnswerCorrect) {
                                                        cardClasses = "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-900 dark:text-green-100 ring-1 ring-green-500"
                                                        icon = <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                    } else if (isSelected && !isAnswerCorrect) {
                                                        cardClasses = "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-900 dark:text-red-100 ring-1 ring-red-500"
                                                        icon = <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                                    } else if (isAnswerCorrect) {
                                                        cardClasses = "bg-blue-50 dark:bg-blue-900/20 border-blue-400 text-blue-900 dark:text-blue-100 ring-1 ring-blue-400"
                                                        icon = <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 opacity-50" />
                                                    }

                                                    return (
                                                        <div key={option.id || option.tempId} className={`flex items-center justify-between p-4 rounded-xl border ${cardClasses} transition-all`}>
                                                            <div className="flex items-center gap-3">
                                                                {icon || <div className="h-5 w-5 rounded-full border-2 border-slate-200 dark:border-slate-700" />}
                                                                <span className="font-medium">{option.optionText}</span>
                                                            </div>
                                                            {isSelected && (
                                                                <Badge variant={isAnswerCorrect ? "default" : "destructive"} className="text-[10px] uppercase">
                                                                    Selected
                                                                </Badge>
                                                            )}
                                                            {!isSelected && isAnswerCorrect && (
                                                                <Badge variant="outline" className="text-[10px] uppercase border-blue-300 text-blue-600 bg-blue-50">
                                                                    Correct Answer
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}

                                        {/* True/False */}
                                        {question.questionType === "TRUE_FALSE" && (
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {["true", "false"].map((val) => {
                                                    const isSelected = studentAnswer?.textAnswer?.toLowerCase() === val
                                                    const isAnswerCorrect = question.correctAnswer?.toLowerCase() === val

                                                    let cardClasses = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                                                    let icon = null;

                                                    if (isSelected && isAnswerCorrect) {
                                                        cardClasses = "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-900 dark:text-green-100 ring-1 ring-green-500"
                                                        icon = <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                    } else if (isSelected && !isAnswerCorrect) {
                                                        cardClasses = "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-900 dark:text-red-100 ring-1 ring-red-500"
                                                        icon = <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                                    } else if (isAnswerCorrect) {
                                                        cardClasses = "bg-blue-50 dark:bg-blue-900/20 border-blue-400 text-blue-900 dark:text-blue-100 ring-1 ring-blue-400"
                                                        icon = <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 opacity-50" />
                                                    }

                                                    return (
                                                        <div key={val} className={`flex items-center justify-between p-4 rounded-xl border ${cardClasses} transition-all`}>
                                                            <div className="flex items-center gap-3">
                                                                {icon || <div className="h-5 w-5 rounded-full border-2 border-slate-200 dark:border-slate-700" />}
                                                                <span className="font-medium capitalize">{val}</span>
                                                            </div>
                                                            {isSelected && (
                                                                <Badge variant={isAnswerCorrect ? "default" : "destructive"} className="text-[10px] uppercase">
                                                                    Selected
                                                                </Badge>
                                                            )}
                                                            {!isSelected && isAnswerCorrect && (
                                                                <Badge variant="outline" className="text-[10px] uppercase border-blue-300 text-blue-600 bg-blue-50">
                                                                    Correct Answer
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}

                                        {/* Essay / Identification */}
                                        {(question.questionType === "ESSAY" || question.questionType === "IDENTIFICATION") && (
                                            <div className="grid md:grid-cols-2 gap-6 mt-4">
                                                <div className="space-y-2">
                                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                        <User className="h-3 w-3" /> Student's Answer
                                                    </span>
                                                    <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl min-h-[100px] text-sm whitespace-pre-wrap shadow-sm">
                                                        {studentAnswer?.textAnswer || <span className="text-muted-foreground italic opacity-50">No answer provided</span>}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
                                                        <CheckCircle2 className="h-3 w-3" /> Answer Key
                                                    </span>
                                                    <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-xl min-h-[100px] text-sm whitespace-pre-wrap text-slate-800 dark:text-slate-200 shadow-sm relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full pointer-events-none"></div>
                                                        {question.correctAnswer || <span className="text-muted-foreground italic opacity-50">Not available</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
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
