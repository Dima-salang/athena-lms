"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import {
    getTestById,
    type Test,
    type Question,
    createOrUpdateQuestions,
    deleteQuestion as deleteQuestionApi,
    autosaveTest,
} from "../services/api"
import QuestionEditor from "../components/QuestionEditor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Save, Check, Plus } from "lucide-react"

const TestEditorPage: React.FC = () => {
    const { testId } = useParams<{ testId: string }>()
    const [test, setTest] = useState<Test | null>(null)
    const [questions, setQuestions] = useState<Question[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [isDirty, setIsDirty] = useState(false)
    const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null)

    // Test details state
    const [testName, setTestName] = useState("")
    const [testDescription, setTestDescription] = useState("")
    const [testDuration, setTestDuration] = useState<number>(0)
    const [isTestDetailsDirty, setIsTestDetailsDirty] = useState(false)

    useEffect(() => {
        if (testId) {
            fetchTest(Number(testId))
        }
    }, [testId])

    const fetchTest = async (id: number) => {
        try {
            const fetchedTest = await getTestById(id)
            setTest(fetchedTest)
            setTestName(fetchedTest.testName)
            setTestDescription(fetchedTest.testDescription)
            setTestDuration(fetchedTest.testDuration / 60) // Convert seconds to minutes for display
            if (fetchedTest.questions) {
                setQuestions(fetchedTest.questions.map((q) => ({ ...q, isDirty: false })))
            }
        } catch (error) {
            console.error("Failed to fetch test", error)
        }
    }

    // Autosave for questions
    useEffect(() => {
        if (testId && isDirty) {
            const timer = setTimeout(() => {
                handleAutosaveQuestions()
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [questions, testId, isDirty])

    // Autosave for test details
    useEffect(() => {
        if (testId && isTestDetailsDirty) {
            const timer = setTimeout(() => {
                handleAutosaveTestDetails()
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [testName, testDescription, testDuration, testId, isTestDetailsDirty])

    const handleAutosaveQuestions = async () => {
        if (!testId || !isDirty) return
        setIsSaving(true)
        try {
            const questionsToSave = questions
                .filter((q) => q.isDirty)
                .map((q) => {
                    const tempId = q.tempId || (q.id < 0 ? q.id : undefined);
                    let cleanedQuestion = { ...q, tempId };

                    // Clean up incompatible fields based on question type
                    if (q.questionType === "IDENTIFICATION" || q.questionType === "TRUE_FALSE" || q.questionType === "ESSAY") {
                        // Remove MCQ-specific fields
                        delete (cleanedQuestion as any).options;
                        delete (cleanedQuestion as any).correctOptionId;
                    }

                    console.log("Question to save:", cleanedQuestion);
                    return cleanedQuestion;
                });

            if (questionsToSave.length === 0) {
                setIsDirty(false)
                setIsSaving(false)
                return
            }

            const response = await createOrUpdateQuestions(questionsToSave, Number(testId))
            const savedQuestions = response as Question[]

            setQuestions((prevQuestions) => {
                const newQuestions = [...prevQuestions]
                const savedQuestionsMap = new Map<number, Question>()
                savedQuestions.forEach((q) => {
                    if (q.tempId) savedQuestionsMap.set(q.tempId, q)
                    else savedQuestionsMap.set(q.id, q)
                })

                return newQuestions.map((localQ) => {
                    if (localQ.isDirty) {
                        let savedQ: Question | undefined
                        if (localQ.tempId && savedQuestionsMap.has(localQ.tempId)) {
                            savedQ = savedQuestionsMap.get(localQ.tempId)
                        } else if (localQ.id > 0 && savedQuestionsMap.has(localQ.id)) {
                            savedQ = savedQuestionsMap.get(localQ.id)
                        }

                        if (savedQ) {
                            const newQ = { ...localQ, id: savedQ.id, isDirty: false }

                            // Preserve correctAnswer for IDENTIFICATION and TRUE_FALSE since backend might not return it correctly
                            if (localQ.questionType === "IDENTIFICATION" || localQ.questionType === "TRUE_FALSE") {
                                console.log("Preserving correctAnswer for", localQ.questionType);
                                console.log("Local correctAnswer:", (localQ as any).correctAnswer);
                                console.log("Saved correctAnswer from backend:", (savedQ as any).correctAnswer);
                                (newQ as any).correctAnswer = (localQ as any).correctAnswer;
                                console.log("Final newQ correctAnswer:", (newQ as any).correctAnswer);
                            }

                            if (localQ.questionType === "MULTIPLE_CHOICE") {
                                let updatedOptions: any[] | undefined = undefined

                                if (localQ.options && savedQ.options) {
                                    const savedOptionsMap = new Map<number, any>()
                                    savedQ.options.forEach((o: any) => {
                                        if (o.tempId) savedOptionsMap.set(o.tempId, o)
                                        // Also map by ID if available (for updates)
                                        if (o.id) savedOptionsMap.set(o.id, o)
                                    })

                                    updatedOptions = localQ.options.map((localO) => {
                                        // Try to find by tempId
                                        if (localO.tempId && savedOptionsMap.has(localO.tempId)) {
                                            return { ...localO, id: savedOptionsMap.get(localO.tempId).id }
                                        }
                                        // Try to find by ID (if updating existing option)
                                        if (localO.id && savedOptionsMap.has(localO.id)) {
                                            // Ensure ID is preserved/confirmed
                                            return { ...localO, id: savedOptionsMap.get(localO.id).id }
                                        }
                                        return localO
                                    })

                                    if (newQ.correctOptionId && newQ.correctOptionId < 0) {
                                        if (savedOptionsMap.has(newQ.correctOptionId)) {
                                            newQ.correctOptionId = savedOptionsMap.get(newQ.correctOptionId).id
                                        }
                                    }
                                }

                                if (updatedOptions) {
                                    newQ.options = updatedOptions
                                }
                            }
                            return newQ
                        }
                    }
                    return localQ
                })
            })

            setLastSavedTime(new Date())
            setIsDirty(false)
        } catch (error) {
            console.error("Autosave questions failed", error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleAutosaveTestDetails = async () => {
        if (!testId || !isTestDetailsDirty) return
        setIsSaving(true)
        try {
            await autosaveTest(Number(testId), {
                testName,
                testDescription,
                testDuration: testDuration * 60 // Convert minutes back to seconds
            })
            console.log("Autosave test details success")
            console.log("Duration: ", testDuration)
            setLastSavedTime(new Date())
            setIsTestDetailsDirty(false)
        } catch (error) {
            console.error("Autosave test details failed", error)
        } finally {
            setIsSaving(false)
        }
    }

    const addQuestion = () => {
        const tempId = -Date.now()
        const newQuestion: Question = {
            id: tempId,
            tempId: tempId,
            test: { id: Number(testId) } as Test,
            questionNumber: (questions.length + 1).toString(),
            questionText: "",
            questionType: "MULTIPLE_CHOICE",
            fullPoints: 1,
            correctPoints: 1,
            options: [
                { optionText: "", tempId: tempId - 1 },
                { optionText: "", tempId: tempId - 2 },
                { optionText: "", tempId: tempId - 3 },
                { optionText: "", tempId: tempId - 4 },
            ],
            correctAnswer: "",
            isDirty: true,
        }
        setQuestions([...questions, newQuestion])
        setIsDirty(true)
    }

    const updateQuestion = (updatedQuestion: Question) => {
        setQuestions(questions.map((q) => (q.id === updatedQuestion.id ? { ...updatedQuestion, isDirty: true } : q)))
        setIsDirty(true)
    }

    const handleDeleteQuestion = async (id: number) => {
        if (id > 0) {
            await deleteQuestionApi(id)
        }
        setQuestions(questions.filter((q) => q.id !== id))
    }

    const saveAll = async () => {
        await Promise.all([handleAutosaveQuestions(), handleAutosaveTestDetails()])
    }

    if (!test) return (
        <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Test</h1>
                        <p className="text-muted-foreground mt-1">Manage test details and questions.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-white px-3 py-1.5 rounded-full border shadow-sm">
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                <span className="text-blue-600 font-medium">Saving...</span>
                            </>
                        ) : lastSavedTime ? (
                            <>
                                <Check className="h-4 w-4 text-green-600" />
                                <span>Saved {lastSavedTime.toLocaleTimeString()}</span>
                            </>
                        ) : (
                            <span>All changes saved locally</span>
                        )}
                    </div>
                </div>

                {/* Test Details Editor */}
                <Card>
                    <CardHeader>
                        <CardTitle>Test Details</CardTitle>
                        <CardDescription>Update the basic information for your test. Changes are autosaved.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="testName">Test Name</Label>
                            <Input
                                id="testName"
                                type="text"
                                value={testName}
                                onChange={(e) => {
                                    setTestName(e.target.value)
                                    setIsTestDetailsDirty(true)
                                }}
                                placeholder="Enter test name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={testDescription}
                                onChange={(e) => {
                                    setTestDescription(e.target.value)
                                    setIsTestDetailsDirty(true)
                                }}
                                rows={3}
                                className="resize-none"
                                placeholder="Enter test description"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration (minutes)</Label>
                            <Input
                                id="duration"
                                type="number"
                                value={testDuration}
                                onChange={(e) => {
                                    setTestDuration(Number(e.target.value))
                                    setIsTestDetailsDirty(true)
                                }}
                                min="0"
                            />
                            <p className="text-xs text-muted-foreground">Set to 0 for no time limit</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold tracking-tight">Questions</h2>
                        <Button onClick={addQuestion} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Question
                        </Button>
                    </div>

                    {questions.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-slate-50">
                            <p className="text-muted-foreground">No questions added yet.</p>
                            <Button variant="link" onClick={addQuestion} className="mt-2">
                                Add your first question
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {questions.map((q, index) => (
                                <QuestionEditor
                                    key={q.id || q.tempId}
                                    question={{ ...q, questionNumber: (index + 1).toString() }}
                                    onUpdate={updateQuestion}
                                    onDelete={handleDeleteQuestion}
                                    onSave={() => saveAll()}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="sticky bottom-6 z-10 bg-white/80 backdrop-blur-sm p-4 rounded-lg border shadow-lg flex gap-4">
                    <Link to="/header" className="hidden" /> {/* Dummy link for router ensuring */}
                    <Button
                        variant="secondary"
                        className="w-full"
                        onClick={addQuestion}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Question
                    </Button>
                    <Link to="/dashboard" onClick={() => saveAll()} className="w-full">
                        <Button className="w-full">
                            <Save className="h-4 w-4 mr-2" />
                            Done & Return to Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default TestEditorPage
