import { ArrowLeft, ArrowRight, Send } from "lucide-react";

import { Button } from "@/components/ui/button";

interface QuestionNavigationProps {
  currentIndex: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

/** Previous / next controls below the active question. */
export function QuestionNavigation({
  currentIndex,
  totalQuestions,
  onPrevious,
  onNext,
  onSubmit,
}: QuestionNavigationProps) {
  const isLast = currentIndex >= totalQuestions - 1;

  return (
    <div className="flex items-center justify-between gap-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevious}
        disabled={currentIndex === 0}
        className="gap-1.5"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Previous
      </Button>

      <span className="text-xs text-muted-foreground">
        {currentIndex + 1} / {totalQuestions}
      </span>

      {isLast ? (
        <Button size="sm" onClick={onSubmit} className="gap-1.5">
          Review &amp; submit
          <Send className="h-3.5 w-3.5" aria-hidden />
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={onNext} className="gap-1.5">
          Next
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      )}
    </div>
  );
}
