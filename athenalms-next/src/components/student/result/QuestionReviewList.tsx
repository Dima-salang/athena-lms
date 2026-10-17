import { CheckCircle2, XCircle } from "lucide-react";

import { AnswerReview } from "@/components/exam/AnswerReview";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatQuestionType } from "@/lib/utils";
import type { QuestionDTO, StudentAnswerDTO } from "@/types";

interface QuestionReviewListProps {
  questions: QuestionDTO[];
  answers?: StudentAnswerDTO[];
}

/** Answer-by-answer review for a graded submission. */
export function QuestionReviewList({
  questions,
  answers,
}: QuestionReviewListProps) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-semibold tracking-tight">
        Question review
      </h2>

      {questions.map((q, idx) => {
        const ans = answers?.find((a) => a.questionId === q.id);
        const pointsAwarded = ans?.points ?? 0;
        const isCorrect = pointsAwarded >= q.fullPoints;
        const isPartial = pointsAwarded > 0 && pointsAwarded < q.fullPoints;

        return (
          <Card key={q.id ?? idx} className="overflow-hidden shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-3 border-b bg-muted/20 p-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  Question {q.questionNumber || idx + 1}
                </span>
                <Badge variant="outline">
                  {formatQuestionType(q.questionType)}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold">
                  {pointsAwarded} / {q.fullPoints} pts
                </span>
                {isCorrect ? (
                  <CheckCircle2
                    className="h-4 w-4 shrink-0 text-success"
                    aria-label="Correct"
                  />
                ) : isPartial ? (
                  <Badge variant="warning">Partial</Badge>
                ) : (
                  <XCircle
                    className="h-4 w-4 shrink-0 text-destructive"
                    aria-label="Incorrect"
                  />
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-3 p-4">
              <p className="text-sm font-medium text-foreground">
                {q.questionText}
              </p>

              <AnswerReview question={q} answer={ans} />

              {ans?.teacherComment ? (
                <div className="rounded-lg border border-gold/30 bg-gold/10 p-3 text-xs">
                  <span className="font-medium">Teacher feedback: </span>
                  {ans.teacherComment}
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
