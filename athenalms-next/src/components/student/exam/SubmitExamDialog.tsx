import { Loader2 } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SubmitExamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalQuestions: number;
  totalAnswered: number;
  unansweredCount: number;
  submitting: boolean;
  onConfirm: () => void;
}

/** Final confirmation before ending the test. */
export function SubmitExamDialog({
  open,
  onOpenChange,
  totalQuestions,
  totalAnswered,
  unansweredCount,
  submitting,
  onConfirm,
}: SubmitExamDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Submit your test?</DialogTitle>
          <DialogDescription>
            You will not be able to change your answers after submitting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-sm">
          <div className="space-y-1 rounded-lg bg-muted/40 p-3">
            <div className="flex justify-between">
              <span>Questions</span>
              <span className="font-semibold">{totalQuestions}</span>
            </div>
            <div className="flex justify-between text-success">
              <span>Answered</span>
              <span className="font-semibold">{totalAnswered}</span>
            </div>
            {unansweredCount > 0 ? (
              <div className="flex justify-between text-destructive">
                <span>Unanswered</span>
                <span className="font-semibold">{unansweredCount}</span>
              </div>
            ) : null}
          </div>

          {unansweredCount > 0 ? (
            <Alert variant="warning">
              You still have {unansweredCount} unanswered question
              {unansweredCount > 1 ? "s" : ""}. They will be scored as zero.
            </Alert>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Keep working
          </Button>
          <Button type="button" onClick={onConfirm} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden />
                Submitting…
              </>
            ) : (
              "Submit test"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
