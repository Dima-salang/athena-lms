"use client"

import React from "react"
import type { Question, MultipleChoiceQuestion, TrueFalseQuestion } from "../../services/api"

interface QuestionCardProps {
  question: Question
  questionIndex: number
}

/**
 * QuestionCard Component
 * Displays a single question with proper type-specific rendering
 * Memoized for performance when rendering large question lists
 */
const QuestionCard = React.memo(({ question, questionIndex }: QuestionCardProps) => {
  const isMultipleChoice = question.questionType === "MULTIPLE_CHOICE"
  const isTrueFalse = question.questionType === "TRUE_FALSE"

  return (
    <article
      className="space-y-4 rounded-lg border border-border bg-card p-4 md:p-6"
      role="region"
      aria-label={`Question ${questionIndex}: ${question.questionText.substring(0, 50)}...`}
    >
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
        <h3 className="text-lg font-semibold text-foreground">Question {questionIndex}</h3>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          {question.questionType.replace(/_/g, " ")}
        </span>
      </div>

      <p className="text-base leading-relaxed text-foreground">{question.questionText}</p>

      {isMultipleChoice && (
        <div className="space-y-3 border-l-4 border-primary bg-muted/30 p-4">
          <p className="text-sm font-semibold text-foreground">Options:</p>
          <ul className="space-y-2">
            {(question as MultipleChoiceQuestion).options?.map((option, idx) => {
              const isCorrect = (question as MultipleChoiceQuestion).correctAnswer === option.optionText
              return (
                <li
                  key={option.id || idx}
                  className={`flex items-start gap-2 text-sm ${
                    isCorrect ? "font-semibold text-green-600" : "text-foreground"
                  }`}
                >
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-current text-xs">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{option.optionText}</span>
                  {isCorrect && (
                    <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                      ✓ Correct
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {isTrueFalse && (
        <div className="border-l-4 border-primary bg-muted/30 p-4">
          <p className="text-sm font-semibold text-foreground">Correct Answer:</p>
          <p className="mt-2 text-sm font-bold text-green-600">
            {(question as TrueFalseQuestion).trueFalseAnswer === "true" ? "True" : "False"}
          </p>
        </div>
      )}

      <div className="flex justify-end border-t border-border pt-3">
        <span className="text-xs font-medium text-muted-foreground">
          Points: <span className="font-bold text-foreground">{question.fullPoints}</span>
        </span>
      </div>
    </article>
  )
})

QuestionCard.displayName = "QuestionCard"

export default QuestionCard
