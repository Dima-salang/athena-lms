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
import { Loader2, Save, Check, Plus, ArrowLeft, Clock, FileText, Settings, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
                    let cleanedQuestion: Question = { ...q, tempId };

                    // Clean up incompatible fields based on question type
                    if (q.questionType === "IDENTIFICATION" || q.questionType === "TRUE_FALSE" || q.questionType === "ESSAY") {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { options, correctOptionId, ...rest } = cleanedQuestion
                        cleanedQuestion = rest as Question
                    }

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
                                (newQ as any).correctAnswer = (localQ as any).correctAnswer;
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
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-6 md:p-8">
            <div className="max-w-5xl mx-auto space-y-8 pb-20">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.history.back()}
                                className="h-8 w-8 p-0 rounded-full"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                                Editor Studio
                            </h1>
                        </div>
                        <p className="text-muted-foreground pl-10">Crafting: <span className="font-semibold text-foreground">{test.testName}</span></p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${isSaving
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : lastSavedTime
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Saving changes...</span>
                                </>
                            ) : lastSavedTime ? (
                                <>
                                    <Check className="h-4 w-4" />
                                    <span>Saved {lastSavedTime.toLocaleTimeString()}</span>
                                </>
                            ) : (
                                <span>Ready to edit</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left details panel (sticky on lg screens) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="lg:sticky lg:top-8 space-y-6">
                            <Card className="border-none shadow-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-800">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Settings className="h-4 w-4 text-primary" /> Test Configuration
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="testName">Title</Label>
                                        <Input
                                            id="testName"
                                            value={testName}
                                            onChange={(e) => {
                                                setTestName(e.target.value)
                                                setIsTestDetailsDirty(true)
                                            }}
                                            className="bg-white dark:bg-slate-950"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Instructions</Label>
                                        <Textarea
                                            id="description"
                                            value={testDescription}
                                            onChange={(e) => {
                                                setTestDescription(e.target.value)
                                                setIsTestDetailsDirty(true)
                                            }}
                                            rows={4}
                                            className="resize-none bg-white dark:bg-slate-950"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="duration">Time Limit (mins)</Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="duration"
                                                type="number"
                                                value={testDuration}
                                                onChange={(e) => {
                                                    setTestDuration(Number(e.target.value))
                                                    setIsTestDetailsDirty(true)
                                                }}
                                                min="0"
                                                className="pl-9 bg-white dark:bg-slate-950"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="hidden lg:block">
                                <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 border-blue-100 dark:border-blue-900">
                                    <CardContent className="p-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-semibold">
                                                <Sparkles className="h-4 w-4" /> Pro Tips
                                            </div>
                                            <ul className="text-sm space-y-2 text-muted-foreground list-disc list-inside">
                                                <li>Mix different question types for better assessment.</li>
                                                <li>Use clear and concise language.</li>
                                                <li>Double-check correct answers.</li>
                                                <li>Questions autosave as you type.</li>
                                            </ul>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* Right questions panel */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" /> Questions ({questions.length})
                            </h2>
                            <Button onClick={addQuestion} className="shadow-sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Question
                            </Button>
                        </div>

                        {questions.length === 0 ? (
                            <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-900/30">
                                <div className="h-12 w-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                                    <Plus className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-medium text-lg mb-1">Start building your test</h3>
                                <p className="text-muted-foreground mb-4">Add your first question to get started.</p>
                                <Button onClick={addQuestion} variant="outline">
                                    Add Question
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {questions.map((q, index) => (
                                    <div key={q.id || q.tempId} className="relative group">
                                        <div className="absolute -left-3 top-6 bottom-6 w-1 bg-slate-200 dark:bg-slate-800 rounded-full group-hover:bg-primary/50 transition-colors"></div>
                                        <QuestionEditor
                                            question={{ ...q, questionNumber: (index + 1).toString() }}
                                            onUpdate={updateQuestion}
                                            onDelete={handleDeleteQuestion}
                                            onSave={() => saveAll()}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {questions.length > 0 && (
                            <div className="pt-4 flex justify-center">
                                <Button onClick={addQuestion} variant="outline" className="w-full md:w-auto border-dashed">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Another Question
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-50">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <p className="text-sm text-muted-foreground hidden md:block">
                            {isDirty || isTestDetailsDirty ? "Unsaved changes..." : "All changes saved."}
                        </p>
                        <div className="flex gap-4 w-full md:w-auto">
                            <Link to="/header" className="hidden" /> {/* Dummy link for router ensuring */}
                            <Button
                                variant="outline"
                                onClick={addQuestion}
                                className="flex-1 md:flex-none"
                            >
                                <Plus className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">Add Question</span><span className="sm:hidden">Add</span>
                            </Button>
                            <Link to="/dashboard" onClick={() => saveAll()} className="flex-1 md:flex-none">
                                <Button className="w-full shadow-lg shadow-primary/20">
                                    <Save className="h-4 w-4 mr-2" />
                                    Done & Finish
                                </Button>
                            </Link>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TestEditorPage
