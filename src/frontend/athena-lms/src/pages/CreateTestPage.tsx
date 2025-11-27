"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createTest, getSections, getSubjects, type Test, type Section, type Subject } from "../services/api"
import { useNavigate } from "react-router-dom"

const CreateTestPage: React.FC = () => {
    const [testName, setTestName] = useState("")
    const [testDescription, setTestDescription] = useState("")
    const [testIssueDate, setTestIssueDate] = useState("")
    const [testDueDate, setTestDueDate] = useState("")
    const [testDurationMinutes, setTestDurationMinutes] = useState(60)
    const [hasInfiniteTime, setHasInfiniteTime] = useState(false)
    const [subjectId, setSubjectId] = useState<number | null>(null)
    const [sectionId, setSectionId] = useState<number | null>(null)
    const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([])
    const [availableSections, setAvailableSections] = useState<Section[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [sections, subjects] = await Promise.all([getSections(), getSubjects()])
                setAvailableSections(sections)
                setAvailableSubjects(subjects)
                if (sections.length > 0) setSectionId(sections[0].id)
                if (subjects.length > 0) setSubjectId(subjects[0].id)
            } catch (err) {
                console.error("Failed to fetch sections or subjects", err)
            }
        }
        fetchOptions()
    }, [])

    const handleCreateTest = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            const newTest: Omit<Test, "id" | "teacher"> = {
                testName,
                testDescription,
                testIssueDate: new Date(testIssueDate).toISOString(),
                testDueDate: new Date(testDueDate).toISOString(),
                testDuration: hasInfiniteTime ? 0 : testDurationMinutes * 60, // Convert minutes to seconds
                hasInfiniteTime: hasInfiniteTime,
                section: availableSections.find((s) => s.id === sectionId) || { id: 0, name: "" },
                subject: availableSubjects.find((s) => s.id === subjectId) || { id: 0, name: "", description: "" },
                questions: [],
            }
            const createdTest = await createTest(newTest)
            navigate(`/test/${createdTest.id}/edit`)
        } catch (error) {
            console.error("Failed to create test", error)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Create New Test</h1>
                    <p className="text-slate-600 text-base mt-2">Set up a new test and add questions</p>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
                    <form onSubmit={handleCreateTest} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Test Name</label>
                            <input
                                type="text"
                                value={testName}
                                onChange={(e) => setTestName(e.target.value)}
                                required
                                placeholder="e.g. Final Exam - Mathematics"
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                            <textarea
                                value={testDescription}
                                onChange={(e) => setTestDescription(e.target.value)}
                                required
                                placeholder="Describe what this test covers..."
                                rows={4}
                                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                                <select
                                    value={subjectId || ""}
                                    onChange={(e) => setSubjectId(Number(e.target.value))}
                                    required
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                >
                                    <option value="" disabled>
                                        Select Subject
                                    </option>
                                    {availableSubjects.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Section</label>
                                <select
                                    value={sectionId || ""}
                                    onChange={(e) => setSectionId(Number(e.target.value))}
                                    required
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                >
                                    <option value="" disabled>
                                        Select Section
                                    </option>
                                    {availableSections.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Issue Date</label>
                                <input
                                    type="datetime-local"
                                    value={testIssueDate}
                                    onChange={(e) => setTestIssueDate(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Due Date</label>
                                <input
                                    type="datetime-local"
                                    value={testDueDate}
                                    onChange={(e) => setTestDueDate(e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Duration (minutes)</label>
                                <input
                                    type="number"
                                    value={testDurationMinutes}
                                    onChange={(e) => setTestDurationMinutes(Number(e.target.value))}
                                    required={!hasInfiniteTime}
                                    disabled={hasInfiniteTime}
                                    min="1"
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-slate-100 disabled:text-slate-400"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="hasInfiniteTime"
                                checked={hasInfiniteTime}
                                onChange={(e) => setHasInfiniteTime(e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="hasInfiniteTime" className="text-sm font-medium text-slate-700">
                                Infinite Time (No Duration Limit)
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold rounded-lg transition duration-200 mt-8"
                        >
                            {isSaving ? "Creating Test..." : "Create & Add Questions"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreateTestPage
