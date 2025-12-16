"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Question } from "../services/api"
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
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Trash2, Save, Plus, X } from "lucide-react"

interface QuestionEditorProps {
    question: Question
    onUpdate: (updatedQuestion: Question) => void
    onDelete: (id: number) => void
    onSave: () => void
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, onUpdate, onDelete, onSave }) => {
    const [localQuestion, setLocalQuestion] = useState<Question>(question)

    useEffect(() => {
        setLocalQuestion(question)
    }, [question])

    const handleChange = (field: string, value: string | number | boolean | React.ChangeEvent<HTMLInputElement>) => {
        const updated = { ...localQuestion, [field]: value } as Question;
        setLocalQuestion(updated);
        onUpdate(updated);
    }

    const handleOptionChange = (index: number, value: string) => {
        if (localQuestion.questionType === "MULTIPLE_CHOICE" && localQuestion.options) {
            const newOptions = [...localQuestion.options]
            newOptions[index] = { ...newOptions[index], optionText: value }
            const updated = { ...localQuestion, options: newOptions }
            setLocalQuestion(updated)
            onUpdate(updated)
        }
    }

    const addOption = () => {
        if (localQuestion.questionType === "MULTIPLE_CHOICE") {
            const currentOptions = localQuestion.options || [];
            const updated = { ...localQuestion, options: [...currentOptions, { optionText: "", tempId: -Date.now() }] }
            setLocalQuestion(updated)
            onUpdate(updated)
        }
    }

    const removeOption = (index: number) => {
        if (localQuestion.questionType === "MULTIPLE_CHOICE" && localQuestion.options) {
            const newOptions = localQuestion.options.filter((_, i) => i !== index)
            const updated = { ...localQuestion, options: newOptions }
            setLocalQuestion(updated)
            onUpdate(updated)
        }
    }

    return (
        <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex flex-1 gap-4 items-center w-full md:w-auto">
                        <h3 className="text-lg font-bold text-slate-900 whitespace-nowrap">
                            Question {localQuestion.questionNumber}
                        </h3>
                        <div className="w-full md:w-[200px]">
                            <Select
                                value={localQuestion.questionType}
                                onValueChange={(value) => handleChange("questionType", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Question Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                                    <SelectItem value="TRUE_FALSE">True / False</SelectItem>
                                    <SelectItem value="IDENTIFICATION">Identification</SelectItem>
                                    <SelectItem value="ESSAY">Essay</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSave()}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Save
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(localQuestion.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor={`q-text-${localQuestion.id}`}>Question Text</Label>
                        <Textarea
                            id={`q-text-${localQuestion.id}`}
                            value={localQuestion.questionText}
                            onChange={(e) => handleChange("questionText", e.target.value)}
                            rows={3}
                            placeholder="Enter your question here..."
                            className="resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`q-points-${localQuestion.id}`}>Points</Label>
                        <Input
                            id={`q-points-${localQuestion.id}`}
                            type="number"
                            value={localQuestion.fullPoints}
                            onChange={(e) => handleChange("fullPoints", Number(e.target.value))}
                            min="1"
                        />
                    </div>

                    {localQuestion.questionType === "MULTIPLE_CHOICE" && (
                        <div className="space-y-3">
                            <Label>Options</Label>
                            <RadioGroup
                                value={String(localQuestion.correctOptionId || "")}
                                onValueChange={(value) => {
                                    const selectedId = Number(value);
                                    const selectedOption = localQuestion.options?.find(o => (o.id || o.tempId) === selectedId);
                                    if (selectedOption) {
                                        const updated = {
                                            ...localQuestion,
                                            correctOptionId: selectedId,
                                            correctAnswer: selectedOption.optionText,
                                        } as Question;
                                        setLocalQuestion(updated);
                                        onUpdate(updated);
                                    }
                                }}
                            >
                                <div className="space-y-3">
                                    {localQuestion.options?.map((option, index) => {
                                        const optionId = option.id || option.tempId || index;
                                        return (
                                            <div key={optionId} className="flex gap-3 items-center">
                                                <RadioGroupItem value={String(optionId)} id={`opt-${optionId}`} />
                                                <div className="flex-1">
                                                    <Input
                                                        value={option.optionText || ""}
                                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                                    />
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    type="button"
                                                    onClick={() => removeOption(index)}
                                                    className="text-muted-foreground hover:text-destructive"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </RadioGroup>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addOption}
                                className="mt-2"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Option
                            </Button>
                        </div>
                    )}

                    {localQuestion.questionType === "TRUE_FALSE" && (
                        <div className="space-y-2">
                            <Label>Correct Answer</Label>
                            <Select
                                value={localQuestion.correctAnswer || ""}
                                onValueChange={(value) => handleChange("correctAnswer", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Answer" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">True</SelectItem>
                                    <SelectItem value="false">False</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {localQuestion.questionType === "IDENTIFICATION" && (
                        <div className="space-y-2">
                            <Label>Correct Answer</Label>
                            <Input
                                type="text"
                                value={localQuestion.correctAnswer || ""}
                                onChange={(e) => handleChange("correctAnswer", e.target.value)}
                                placeholder="Enter the correct answer"
                            />
                        </div>
                    )}

                    {localQuestion.questionType === "ESSAY" && (
                        <div className="space-y-2">
                            <Label>Model Answer / Key Points (Optional)</Label>
                            <Textarea
                                value={localQuestion.correctAnswer || ""}
                                onChange={(e) => handleChange("correctAnswer", e.target.value)}
                                rows={4}
                                placeholder="Enter a model answer or key points for grading reference..."
                                className="resize-none"
                            />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default QuestionEditor
