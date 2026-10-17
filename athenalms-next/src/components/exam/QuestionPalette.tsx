"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Bookmark } from "lucide-react";

export interface QuestionStatus {
  questionId: string;
  questionNumber: number;
  isAnswered: boolean;
  isFlagged: boolean;
}

interface QuestionPaletteProps {
  questions: QuestionStatus[];
  currentIndex: number;
  onSelectQuestion: (index: number) => void;
  className?: string;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  questions,
  currentIndex,
  onSelectQuestion,
  className,
}) => {
  const answeredCount = questions.filter((q) => q.isAnswered).length;
  const flaggedCount = questions.filter((q) => q.isFlagged).length;
  const totalCount = questions.length;

  return (
    <div className={cn("border-2 bg-card p-4 shadow-md space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Question Navigation</h3>
        <span className="text-xs text-muted-foreground font-medium">
          {answeredCount}/{totalCount} answered
        </span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground border-b pb-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-success" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-warning" />
          <span>Flagged</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-muted border" />
          <span>Unanswered</span>
        </div>
      </div>

      {/* Grid of question buttons */}
      <div className="grid grid-cols-5 gap-2 max-h-[300px] overflow-y-auto pr-1">
        {questions.map((q, idx) => {
          const isCurrent = idx === currentIndex;

          return (
            <button
              key={q.questionId}
              type="button"
              onClick={() => onSelectQuestion(idx)}
              className={cn(
                "relative flex h-10 w-full items-center justify-center rounded-lg text-sm font-semibold transition-all border",
                isCurrent && "ring-2 ring-primary ring-offset-2 border-primary",
                q.isFlagged
                  ? "bg-warning/15 text-warning border-warning/40"
                  : q.isAnswered
                  ? "bg-success/15 text-success border-success/40"
                  : "bg-muted/50 text-foreground hover:bg-muted"
              )}
            >
              <span>{q.questionNumber}</span>
              {q.isFlagged && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-warning border border-background" />
              )}
            </button>
          );
        })}
      </div>

      {flaggedCount > 0 && (
        <div className="pt-2 text-xs text-warning font-medium flex items-center gap-1.5">
          <Bookmark className="h-3.5 w-3.5" />
          <span>{flaggedCount} flagged</span>
        </div>
      )}
    </div>
  );
};
