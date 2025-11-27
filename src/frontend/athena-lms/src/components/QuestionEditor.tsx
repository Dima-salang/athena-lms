"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Question, MultipleChoiceQuestion, TrueFalseQuestion } from "../services/api"

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

    const handleChange = (field: string, value: any) => {
        const updated = { ...localQuestion, [field]: value } as Question
        setLocalQuestion(updated)
        onUpdate(updated)
    }

    const handleOptionChange = (index: number, value: string) => {
        if (localQuestion.questionType === "MULTIPLE_CHOICE") {
            const mcQuestion = localQuestion as MultipleChoiceQuestion
            const newOptions = [...mcQuestion.options]
            newOptions[index] = { ...newOptions[index], optionText: value }
            const updated = { ...mcQuestion, options: newOptions }
            setLocalQuestion(updated)
            onUpdate(updated)
        }
    }

    const addOption = () => {
        if (localQuestion.questionType === "MULTIPLE_CHOICE") {
            const mcQuestion = localQuestion as MultipleChoiceQuestion
            const updated = { ...mcQuestion, options: [...mcQuestion.options, { optionText: "", tempId: -Date.now() }] }
            setLocalQuestion(updated)
            onUpdate(updated)
        }
    }

    const removeOption = (index: number) => {
        if (localQuestion.questionType === "MULTIPLE_CHOICE") {
            const mcQuestion = localQuestion as MultipleChoiceQuestion
            const newOptions = mcQuestion.options.filter((_, i) => i !== index)
            const updated = { ...mcQuestion, options: newOptions }
            setLocalQuestion(updated)
            onUpdate(updated)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex gap-3 items-center">
                    <h3 className="text-lg font-bold text-slate-900">Question {localQuestion.questionNumber}</h3>
                    <select
                        value={localQuestion.questionType}
                        onChange={(e) => handleChange("questionType", e.target.value)}
                        className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    >
                        <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                        <option value="TRUE_FALSE">True / False</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onSave()}
                        className="px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition font-semibold"
                        title="Save Question"
                    >
                        ✓ Save
                    </button>
                    <button
                        onClick={() => onDelete(localQuestion.id)}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-semibold"
                        title="Delete Question"
                    >
                        🗑 Delete
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Question Text</label>
                    <textarea
                        value={localQuestion.questionText}
                        onChange={(e) => handleChange("questionText", e.target.value)}
                        rows={3}
                        placeholder="Enter your question here..."
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Points</label>
                    <input
                        type="number"
                        value={localQuestion.fullPoints}
                        onChange={(e) => handleChange("fullPoints", Number(e.target.value))}
                        min="1"
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                </div>

                {localQuestion.questionType === "MULTIPLE_CHOICE" && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-3">Options</label>
                        <div className="space-y-3">
                            {(localQuestion as MultipleChoiceQuestion).options?.map((option, index) => (
                                <div key={option.id || option.tempId || index} className="flex gap-3 items-start">
                                    <input
                                        type="radio"
                                        name={`correct-${localQuestion.id}`}
                                        checked={(localQuestion as MultipleChoiceQuestion).correctOptionId === (option.id || option.tempId)}
                                        onChange={() => {
                                            const updated = {
                                                ...localQuestion,
                                                correctOptionId: option.id || option.tempId,
                                                correctAnswer: option.optionText,
                                            } as Question
                                            setLocalQuestion(updated)
                                            onUpdate(updated)
                                        }}
                                        className="mt-3 w-4 h-4 cursor-pointer"
                                    />
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={option.optionText || ""}
                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeOption(index)}
                                        className="mt-2.5 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded transition font-semibold"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={addOption}
                            className="mt-4 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 font-medium transition"
                        >
                            + Add Option
                        </button>
                    </div>
                )}

                {localQuestion.questionType === "TRUE_FALSE" && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Correct Answer</label>
                        <select
                            value={(localQuestion as TrueFalseQuestion).trueFalseAnswer}
                            onChange={(e) => handleChange("trueFalseAnswer", e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        >
                            <option value="">Select Answer</option>
                            <option value="true">True</option>
                            <option value="false">False</option>
                        </select>
                    </div>
                )}
            </div>
        </div>
    )
}

export default QuestionEditor
