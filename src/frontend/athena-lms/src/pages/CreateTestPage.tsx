"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createTest, getMyTeacherAssignments, type Test, type Section, type Subject, type TeacherAssignment } from "../services/api"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {Loader2, Save } from "lucide-react"

const CreateTestPage: React.FC = () => {
    const [testName, setTestName] = useState("")
    const [testDescription, setTestDescription] = useState("")
    const [testIssueDate, setTestIssueDate] = useState("")
    const [testDueDate, setTestDueDate] = useState("")
    const [testDurationMinutes, setTestDurationMinutes] = useState(60)
    const [hasInfiniteTime, setHasInfiniteTime] = useState(false)
    const [subjectId, setSubjectId] = useState<string>("")
    const [sectionId, setSectionId] = useState<string>("")
    const [assignments, setAssignments] = useState<TeacherAssignment[]>([])
    const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([])
    const [availableSections, setAvailableSections] = useState<Section[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const assignmentsData = await getMyTeacherAssignments()
                setAssignments(assignmentsData)

                const subjectsMap = new Map<number, Subject>()
                assignmentsData.forEach((a) => {
                    if (a.subject) subjectsMap.set(a.subject.id, a.subject)
                })
                const subjects = Array.from(subjectsMap.values())
                setAvailableSubjects(subjects)

                if (subjects.length > 0) {
                    setSubjectId(subjects[0].id.toString())
                }
            } catch (err) {
                console.error("Failed to fetch teacher assignments", err)
            }
        }
        fetchOptions()
    }, [])

    useEffect(() => {
        if (subjectId && assignments.length > 0) {
            const currentSubjectId = Number(subjectId)
            const sections = assignments
                .filter((a) => a.subject?.id === currentSubjectId && a.section)
                .map((a) => a.section)

            // Remove duplicates just in case
            const uniqueSectionsMap = new Map<number, Section>()
            sections.forEach(s => uniqueSectionsMap.set(s.id, s))
            const uniqueSections = Array.from(uniqueSectionsMap.values())

            setAvailableSections(uniqueSections)
            if (uniqueSections.length > 0) {
                setSectionId(uniqueSections[0].id.toString())
            } else {
                setSectionId("")
            }
        } else {
            setAvailableSections([])
            setSectionId("")
        }
    }, [subjectId, assignments])

    const handleCreateTest = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setError(null)
        try {
            const newTest: Omit<Test, "id" | "teacher"> = {
                testName,
                testDescription,
                testIssueDate: new Date(testIssueDate).toISOString(),
                testDueDate: new Date(testDueDate).toISOString(),
                testDuration: hasInfiniteTime ? 0 : testDurationMinutes * 60, // Convert minutes to seconds
                hasInfiniteTime: hasInfiniteTime,
                section: availableSections.find((s) => s.id === Number(sectionId)) || { id: 0, name: "" },
                subject: availableSubjects.find((s) => s.id === Number(subjectId)) || { id: 0, name: "", description: "" },
                questions: [],
            }
            const createdTest = await createTest(newTest)
            navigate(`/test/${createdTest.id}/edit`)
        } catch (err: any) {
            console.error("Failed to create test", err)
            // Axios error structure usually has response.data.message or error field
            const errorMessage = err.response?.data?.message || err.message || "Failed to create test"
            setError(errorMessage)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create New Test</h1>
                        <p className="text-muted-foreground mt-1">Set up a new test and add questions.</p>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-md">
                        {error}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Test Details</CardTitle>
                        <CardDescription>Enter the basic information for your test.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateTest} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="testName">Test Name</Label>
                                <Input
                                    id="testName"
                                    type="text"
                                    value={testName}
                                    onChange={(e) => setTestName(e.target.value)}
                                    required
                                    placeholder="e.g. Final Exam - Mathematics"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={testDescription}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTestDescription(e.target.value)}
                                    required
                                    placeholder="Describe what this test covers..."
                                    rows={4}
                                    className="resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Select
                                        value={subjectId}
                                        onValueChange={setSubjectId}
                                    >
                                        <SelectTrigger id="subject">
                                            <SelectValue placeholder="Select Subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableSubjects.map((s) => (
                                                <SelectItem key={s.id} value={s.id.toString()}>
                                                    {s.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="section">Section</Label>
                                    <Select
                                        value={sectionId}
                                        onValueChange={setSectionId}
                                    >
                                        <SelectTrigger id="section">
                                            <SelectValue placeholder="Select Section" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableSections.map((s) => (
                                                <SelectItem key={s.id} value={s.id.toString()}>
                                                    {s.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="issueDate">Issue Date</Label>
                                    <Input
                                        id="issueDate"
                                        type="datetime-local"
                                        value={testIssueDate}
                                        onChange={(e) => setTestIssueDate(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dueDate">Due Date</Label>
                                    <Input
                                        id="dueDate"
                                        type="datetime-local"
                                        value={testDueDate}
                                        onChange={(e) => setTestDueDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                <div className="space-y-2">
                                    <Label htmlFor="duration">Duration (minutes)</Label>
                                    <Input
                                        id="duration"
                                        type="number"
                                        value={testDurationMinutes}
                                        onChange={(e) => setTestDurationMinutes(Number(e.target.value))}
                                        required={!hasInfiniteTime}
                                        disabled={hasInfiniteTime}
                                        min="1"
                                    />
                                </div>

                                <div className="flex items-center space-x-2 pt-9">
                                    <input
                                        type="checkbox"
                                        id="hasInfiniteTime"
                                        checked={hasInfiniteTime}
                                        onChange={(e) => setHasInfiniteTime(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor="hasInfiniteTime" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        Infinite Time (No Duration Limit)
                                    </Label>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full md:w-auto min-w-[200px]"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating Test...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Create & Add Questions
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default CreateTestPage
