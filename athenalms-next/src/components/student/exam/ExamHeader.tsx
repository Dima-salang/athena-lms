import type { ReactNode } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExamHeaderProps {
  title?: string | null;
  currentIndex: number;
  totalQuestions: number;
  totalAnswered: number;
  saveStatus: "saved" | "saving";
  /** Timer element, rendered on the right. */
  timer: ReactNode;
  /** Mobile question-palette trigger. */
  paletteTrigger: ReactNode;
  onSubmit: () => void;
}

/** Sticky control bar shown while a test is in progress. */
export function ExamHeader({
  title,
  currentIndex,
  totalQuestions,
  totalAnswered,
  saveStatus,
  timer,
  paletteTrigger,
  onSubmit,
}: ExamHeaderProps) {
  const saving = saveStatus === "saving";

  return (
    <div className="sticky top-0 z-30 -mx-4 flex items-center justify-between gap-3 border-b bg-background/95 px-4 py-3 shadow-sm backdrop-blur sm:-mx-6 sm:gap-4 sm:px-6">
      <div className="min-w-0">
        <h1 className="truncate text-sm font-semibold tracking-tight sm:text-base">
          {title || "Test"}
        </h1>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <span>
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span aria-hidden>•</span>
          <span className="font-medium text-foreground">
            {totalAnswered}/{totalQuestions} answered
          </span>
          <span aria-hidden className="hidden sm:inline">
            •
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1",
              saving ? "text-warning" : "text-success"
            )}
            aria-live="polite"
          >
            {saving ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                Autosaving…
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3 w-3" aria-hidden />
                Saved
              </>
            )}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {timer}
        {paletteTrigger}
        <Button size="sm" onClick={onSubmit} className="gap-1.5">
          <Send className="h-3.5 w-3.5" aria-hidden />
          Submit
        </Button>
      </div>
    </div>
  );
}
