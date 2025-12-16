"use client"

import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getSubmission, getStudentAnswers, manualSetStudentAnswerScore, recalculateSubmission, type Submission, type StudentAnswer } from "../services/api"
import { format } from "date-fns"

const SubmissionDetailPage: React.FC = () => {
    const { submissionId } = useParams<{ submissionId: string }>()
    const navigate = useNavigate()
    const [submission, setSubmission] = useState<Submission | null>(null)
    const [answers, setAnswers] = useState<StudentAnswer[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

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

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-slate-500">Loading...</div>
            </div>
        )
    }

    if (error || !submission) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-red-500">{error || "Submission not found"}</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-slate-900">
                        Submission Details
                    </h1>

                    <div className="flex gap-2">
                        <button
                            onClick={async () => {
                                if (!submissionId) return;
                                try {
                                    setLoading(true);
                                    await recalculateSubmission(Number(submissionId));
                                    // reload
                                    window.location.reload();
                                } catch (e) {
                                    console.error(e);
                                    setError("Failed to recalculate");
                                    setLoading(false);
                                }
                            }}
                            className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition"
                        >
                            Recalculate Total
                        </button>
                        <button
                            onClick={async () => {
                                if (!submissionId) return;
                                if (!confirm("Are you sure? This will overwrite manual scores with auto-graded values.")) return;
                                try {
                                    setLoading(true);
                                    await recalculateSubmission(Number(submissionId), true); // true for autoGrade
                                    window.location.reload();
                                } catch (e) {
                                    console.error(e);
                                    setError("Failed to auto-grade");
                                    setLoading(false);
                                }
                            }}
                            className="px-4 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg transition"
                        >
                            Auto-Grade
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
                        >
                            Back
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Submission Info Card */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 mb-2">Student Information</h2>
                            <p className="text-slate-600"><span className="font-medium">Name:</span> {submission.student.firstName} {submission.student.lastName}</p>
                            <p className="text-slate-600"><span className="font-medium">Username:</span> {submission.student.username}</p>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 mb-2">Test Information</h2>
                            <p className="text-slate-600"><span className="font-medium">Test:</span> {submission.test.testName}</p>
                            <p className="text-slate-600"><span className="font-medium">Score:</span> {submission.totalScore !== undefined ? submission.totalScore : "N/A"}</p>
                            <p className="text-slate-600"><span className="font-medium">Submitted:</span> {(submission as any).submittedAt ? format(new Date((submission as any).submittedAt), "MMM d, yyyy h:mm a") : "N/A"}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {submission.test.questions && submission.test.questions.map((question, index) => {
                        const studentAnswer = answers.find(a => a.question.id === question.id)

                        return (
                            <div key={question.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-medium text-slate-900">
                                        Question {index + 1}
                                    </h3>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${(studentAnswer?.points || 0) > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                        }`}>
                                        {studentAnswer?.points || 0} / {question.fullPoints} Points
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center bg-slate-100 rounded-lg border border-slate-200 overflow-hidden">
                                            <span className="px-2 text-xs font-semibold text-slate-500 uppercase">Score</span>
                                            <input
                                                type="number"
                                                min="0"
                                                max={question.fullPoints}
                                                defaultValue={studentAnswer?.points || 0}
                                                onBlur={async (e) => {
                                                    const newScore = Number(e.target.value);
                                                    if (studentAnswer && studentAnswer.id && !isNaN(newScore)) {
                                                        if (newScore < 0 || newScore > question.fullPoints) {
                                                            alert(`Score must be between 0 and ${question.fullPoints}`);
                                                            e.target.value = String(studentAnswer.points || 0);
                                                            return;
                                                        }
                                                        try {
                                                            await manualSetStudentAnswerScore(studentAnswer.id, newScore);
                                                            // update local state to reflect change? or reload?
                                                            // For now simple ui update implies success.
                                                        } catch (err) {
                                                            console.error("Failed to update score", err);
                                                            alert("Failed to update score");
                                                        }
                                                    }
                                                }}
                                                className="w-16 px-2 py-1 text-sm font-semibold text-right outline-none focus:bg-white transition"
                                            />
                                            <span className="px-2 text-sm text-slate-500 font-medium border-l border-slate-200">
                                                / {question.fullPoints}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4 text-slate-700 text-lg">
                                    {question.questionText}
                                </div>

                                <div className="mb-2 text-xs font-semibold text-slate-500 uppercase">
                                    Type: {question.questionType}
                                </div>

                                {/* Multiple Choice - Show Options */}
                                {question.questionType === "MULTIPLE_CHOICE" && (
                                    <div className="space-y-4 mt-4">
                                        {/* Student's Answer Display */}
                                        {studentAnswer?.optionId && (
                                            <div className="p-4 rounded-lg bg-slate-100 border-2 border-slate-300">
                                                <span className="block text-xs font-semibold text-slate-600 uppercase mb-2">
                                                    Student's Answer
                                                </span>
                                                <div className="text-slate-900 font-medium">
                                                    {question.options?.find((opt) => opt.id === studentAnswer.optionId)?.optionText || "Unknown"}
                                                </div>
                                            </div>
                                        )}

                                        {/* Correct Answer Display */}
                                        {(() => {
                                            const correctOptionId = question.correctOptionId;
                                            const correctOption = question.options?.find((opt) => opt.id === correctOptionId);
                                            return correctOption ? (
                                                <div className="p-4 rounded-lg bg-green-100 border-2 border-green-500">
                                                    <span className="block text-xs font-semibold text-green-700 uppercase mb-2">
                                                        Correct Answer
                                                    </span>
                                                    <div className="text-green-900 font-medium">
                                                        {correctOption.optionText}
                                                    </div>
                                                </div>
                                            ) : null;
                                        })()}

                                        {/* All Options List */}
                                        <div className="space-y-2">
                                            <span className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                                                All Options
                                            </span>
                                            {question.options && question.options.map((option) => {
                                                const isSelected = studentAnswer?.optionId === option.id
                                                // Verify correctness using correctOptionId
                                                const correctOptionId = question.correctOptionId
                                                const isCorrect = option.id === correctOptionId

                                                return (
                                                    <div
                                                        key={option.id || option.tempId}
                                                        className={`p-4 rounded-lg border-2 transition ${isSelected && isCorrect
                                                            ? "bg-green-50 border-green-500"
                                                            : isSelected && !isCorrect
                                                                ? "bg-red-50 border-red-500"
                                                                : isCorrect
                                                                    ? "bg-blue-50 border-blue-300"
                                                                    : "bg-slate-50 border-slate-200"
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-slate-900 font-medium">
                                                                {option.optionText}
                                                            </span>
                                                            <div className="flex gap-2">
                                                                {isSelected && (
                                                                    <span className="px-2 py-1 text-xs font-semibold rounded bg-slate-700 text-white">
                                                                        Selected
                                                                    </span>
                                                                )}
                                                                {isCorrect && (
                                                                    <span className="px-2 py-1 text-xs font-semibold rounded bg-green-600 text-white">
                                                                        ✓ Correct
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* True/False - Show Options */}
                                {question.questionType === "TRUE_FALSE" && (
                                    <div className="space-y-4 mt-4">
                                        {/* Student's Answer Display */}
                                        {studentAnswer?.textAnswer && (
                                            <div className="p-4 rounded-lg bg-slate-100 border-2 border-slate-300">
                                                <span className="block text-xs font-semibold text-slate-600 uppercase mb-2">
                                                    Student's Answer
                                                </span>
                                                <div className="text-slate-900 font-medium capitalize">
                                                    {studentAnswer.textAnswer}
                                                </div>
                                            </div>
                                        )}

                                        {/* Correct Answer Display */}
                                        <div className="p-4 rounded-lg bg-green-100 border-2 border-green-500">
                                            <span className="block text-xs font-semibold text-green-700 uppercase mb-2">
                                                Correct Answer
                                            </span>
                                            <div className="text-green-900 font-medium capitalize">
                                                {question.correctAnswer || "Not Available"}
                                            </div>
                                        </div>

                                        {/* Options List (Manually True/False) */}
                                        <div className="space-y-2">
                                            <span className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                                                Options
                                            </span>
                                            {["true", "false"].map((optionValue) => {
                                                const isSelected = studentAnswer?.textAnswer?.toLowerCase() === optionValue
                                                const isCorrect = question.correctAnswer?.toLowerCase() === optionValue

                                                return (
                                                    <div
                                                        key={optionValue}
                                                        className={`p-4 rounded-lg border-2 transition ${isSelected && isCorrect
                                                            ? "bg-green-50 border-green-500"
                                                            : isSelected && !isCorrect
                                                                ? "bg-red-50 border-red-500"
                                                                : isCorrect
                                                                    ? "bg-blue-50 border-blue-300"
                                                                    : "bg-slate-50 border-slate-200"
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-slate-900 font-medium capitalize">
                                                                {optionValue}
                                                            </span>
                                                            <div className="flex gap-2">
                                                                {isSelected && (
                                                                    <span className="px-2 py-1 text-xs font-semibold rounded bg-slate-700 text-white">
                                                                        Selected
                                                                    </span>
                                                                )}
                                                                {isCorrect && (
                                                                    <span className="px-2 py-1 text-xs font-semibold rounded bg-green-600 text-white">
                                                                        ✓ Correct
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Identification / Essay - Show Text Answer */}
                                {(question.questionType === "IDENTIFICATION" || question.questionType === "ESSAY") && (
                                    <div className="mt-4 space-y-3">
                                        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                                            <span className="block text-xs font-semibold text-slate-500 uppercase mb-2">
                                                Student's Answer
                                            </span>
                                            <div className="text-slate-900 font-medium whitespace-pre-wrap">
                                                {studentAnswer?.textAnswer || "No Answer Provided"}
                                            </div>
                                        </div>

                                        {question.questionType === "IDENTIFICATION" && (
                                            <div className="p-4 rounded-lg bg-green-100 border-2 border-green-500">
                                                <span className="block text-xs font-semibold text-green-700 uppercase mb-2">
                                                    Correct Answer
                                                </span>
                                                <div className="text-green-900 font-medium">
                                                    {question.correctAnswer || "Not Available"}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </main>
        </div>
    )
}

export default SubmissionDetailPage
