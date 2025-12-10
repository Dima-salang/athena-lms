"use client"

import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getSubmission, getStudentAnswers, type Submission, type StudentAnswer } from "../services/api"
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
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
                    >
                        Back
                    </button>
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

                {/* Answers List */}
                <div className="space-y-6">
                    {answers.map((answer, index) => (
                        <div key={answer.id || index} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-medium text-slate-900">
                                    Question {index + 1}
                                </h3>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${(answer.points || 0) > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                    }`}>
                                    {answer.points || 0} / {answer.question.fullPoints} Points
                                </span>
                            </div>

                            <div className="mb-4 text-slate-700 text-lg">
                                {answer.question.questionText}
                            </div>

                            <div className="space-y-2">
                                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                                    <span className="block text-xs font-semibold text-slate-500 uppercase mb-1">Student Answer</span>
                                    <div className="text-slate-900 font-medium">
                                        {answer.textAnswer || (answer.optionId ? "Option Selected (ID: " + answer.optionId + ")" : "No Answer")}
                                        {/* Ideally we map optionId to option text if we have the full question options */}
                                    </div>
                                </div>

                                {/* 
                                   To show correct answer, we'd need to know it. 
                                   The Question object from studentAnswer might not have the correct answer exposed to students,
                                   but for teachers we prefer to see it. 
                                   Assuming we can access it or infer it.
                                   If questionType is MCQ, we need to know which option is correct.
                                */}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}

export default SubmissionDetailPage
