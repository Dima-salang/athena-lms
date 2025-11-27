"use client"
import type { Question } from "../../services/api"
import QuestionCard from "./question-card"

interface QuestionsListProps {
  questions: Question[]
}

/**
 * QuestionsList Component
 * Renders a list of questions with proper accessibility and structure
 */
export default function QuestionsList({ questions }: QuestionsListProps) {
  if (!questions || questions.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center md:p-12">
        <p className="text-muted-foreground">No questions added yet.</p>
      </section>
    )
  }

  return (
    <section aria-labelledby="questions-heading">
      <h2 id="questions-heading" className="mb-6 text-xl font-bold tracking-tight md:text-2xl">
        Questions <span className="text-sm font-normal text-muted-foreground">({questions.length})</span>
      </h2>

      <div className="space-y-4 md:space-y-5">
        {questions.map((question, index) => (
          <QuestionCard key={question.id} question={question} questionIndex={index + 1} />
        ))}
      </div>
    </section>
  )
}
