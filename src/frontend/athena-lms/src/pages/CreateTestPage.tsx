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
import { Loader2, Save, ArrowLeft, PenTool, Layout, Calendar, Clock, Layers } from "lucide-react"

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
        } catch (err: unknown) {
            console.error("Failed to create test", err)
            // Axios error structure usually has response.data.message or error field
            const errorMessage = (err as any).response?.data?.message || (err as any).message || "Failed to create test"
            setError(errorMessage)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header with decorative background */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-900 dark:to-cyan-900 text-white p-8 shadow-xl">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-cyan-400/20 rounded-full blur-2xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <Button
                                variant="ghost"
                                onClick={() => navigate("/dashboard")}
                                className="text-blue-50 hover:text-white hover:bg-white/10 pl-0 -ml-3 mb-2"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                            </Button>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Create New Assessment</h1>
                            <p className="text-blue-100 text-lg max-w-xl">
                                Design your test, set time limits, and assign it to your class.
                            </p>
                        </div>
                        <div className="hidden md:block opacity-80">
                            <PenTool className="h-24 w-24 text-white/20" />
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-600" />
                        {error}
                    </div>
                )}

                <Card className="border-none shadow-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-800">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Layout className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle>Test Configuration</CardTitle>
                                <CardDescription>Enter the basic details and scheduling information.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <form onSubmit={handleCreateTest} className="space-y-8">

                            {/* General Info Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <PenTool className="h-4 w-4" /> General Information
                                </h3>
                                <div className="grid gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="testName" className="text-base">Test Name</Label>
                                        <Input
                                            id="testName"
                                            type="text"
                                            value={testName}
                                            onChange={(e) => setTestName(e.target.value)}
                                            required
                                            placeholder="e.g. Midterm Examination - Physics 101"
                                            className="h-12 text-lg bg-slate-50 dark:bg-slate-950 focus-visible:ring-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description (Instructions)</Label>
                                        <Textarea
                                            id="description"
                                            value={testDescription}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTestDescription(e.target.value)}
                                            required
                                            placeholder="Provide instructions or a summary of what this test covers..."
                                            rows={4}
                                            className="resize-none bg-slate-50 dark:bg-slate-950 focus-visible:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-slate-100 dark:bg-slate-800" />

                            {/* Assignment Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Layers className="h-4 w-4" /> Class Assignment
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Subject</Label>
                                        <Select
                                            value={subjectId}
                                            onValueChange={setSubjectId}
                                        >
                                            <SelectTrigger id="subject" className="bg-slate-50 dark:bg-slate-950 h-10">
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
                                        <Label htmlFor="section">Target Section</Label>
                                        <Select
                                            value={sectionId}
                                            onValueChange={setSectionId}
                                        >
                                            <SelectTrigger id="section" className="bg-slate-50 dark:bg-slate-950 h-10">
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
                            </div>

                            <div className="h-px bg-slate-100 dark:bg-slate-800" />

                            {/* Scheduling Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> Schedule & Timing
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="issueDate">Start Date & Time</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="issueDate"
                                                type="datetime-local"
                                                value={testIssueDate}
                                                onChange={(e) => setTestIssueDate(e.target.value)}
                                                required
                                                className="pl-9 bg-slate-50 dark:bg-slate-950"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="dueDate">End Date & Time</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="dueDate"
                                                type="datetime-local"
                                                value={testDueDate}
                                                onChange={(e) => setTestDueDate(e.target.value)}
                                                required
                                                className="pl-9 bg-slate-50 dark:bg-slate-950"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pt-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="duration">Time Limit (Minutes)</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="duration"
                                                type="number"
                                                value={testDurationMinutes}
                                                onChange={(e) => setTestDurationMinutes(Number(e.target.value))}
                                                required={!hasInfiniteTime}
                                                disabled={hasInfiniteTime}
                                                min="1"
                                                className="pl-9 bg-slate-50 dark:bg-slate-950"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 pt-9 px-1">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="hasInfiniteTime"
                                                aria-describedby="hasInfiniteTime-description"
                                                type="checkbox"
                                                checked={hasInfiniteTime}
                                                onChange={(e) => setHasInfiniteTime(e.target.checked)}
                                                className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
                                            />
                                        </div>
                                        <div className="text-sm leading-6">
                                            <label htmlFor="hasInfiniteTime" className="font-medium text-gray-900 dark:text-gray-300">
                                                No Time Limit
                                            </label>
                                            <p id="hasInfiniteTime-description" className="text-gray-500 dark:text-gray-400">
                                                Students can take as long as they need within the open dates.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-8">
                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    size="lg"
                                    className="w-full md:w-auto min-w-[240px] shadow-lg shadow-blue-500/20"
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Creating Assessment...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-5 w-5" />
                                            Create & Proceed to Questions
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
