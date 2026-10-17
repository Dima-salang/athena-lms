"use client";

import { use, useState } from "react";
import { Loader2, Menu } from "lucide-react";
import { toast } from "sonner";

import { QuestionPalette } from "@/components/exam/QuestionPalette";
import { QuestionRenderer } from "@/components/exam/QuestionRenderer";
import { StickyTimer } from "@/components/exam/StickyTimer";
import { ExamHeader } from "@/components/student/exam/ExamHeader";
import { IntegrityWarningDialog } from "@/components/student/exam/IntegrityWarningDialog";
import { QuestionNavigation } from "@/components/student/exam/QuestionNavigation";
import { SecurityLockout } from "@/components/student/exam/SecurityLockout";
import { SubmitExamDialog } from "@/components/student/exam/SubmitExamDialog";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useExamIntegrity } from "@/hooks/use-exam-integrity";
import { useExamSession } from "@/hooks/use-exam-session";

interface TestTakingPageProps {
  params: Promise<{ id: string }>;
}

export default function TestTakingPage({ params }: TestTakingPageProps) {
  const { id: testId } = use(params);
  const exam = useExamSession(testId);
  const integrity = useExamIntegrity();
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  if (exam.securityBlockError) {
    return <SecurityLockout message={exam.securityBlockError} />;
  }

  if (exam.loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
        <span className="text-sm font-medium text-muted-foreground">
          Loading your test…
        </span>
      </div>
    );
  }

  let initialSeconds: number | null = null;
  if (exam.submission?.endTime) {
    const end = new Date(exam.submission.endTime).getTime();
    initialSeconds = Math.max(0, Math.round((end - Date.now()) / 1000));
  }

  const handleTimeExpired = () => {
    toast.warning("Time is up. Your answers are being submitted.");
    exam.submitExam();
  };

  const palette = (
    <QuestionPalette
      questions={exam.questionStatuses}
      currentIndex={exam.currentIndex}
      onSelectQuestion={(idx) => {
        exam.setCurrentIndex(idx);
        setPaletteOpen(false);
      }}
    />
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20">
      <ExamHeader
        title={exam.test?.title}
        currentIndex={exam.currentIndex}
        totalQuestions={exam.totalQuestions}
        totalAnswered={exam.totalAnswered}
        saveStatus={exam.saveStatus}
        timer={
          <StickyTimer
            initialSeconds={initialSeconds}
            onExpire={handleTimeExpired}
          />
        }
        paletteTrigger={
          <div className="lg:hidden">
            <Sheet open={paletteOpen} onOpenChange={setPaletteOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-2.5"
                  aria-label="Open question list"
                >
                  <Menu className="h-4 w-4" aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-4 sm:w-[360px]">
                {palette}
              </SheetContent>
            </Sheet>
          </div>
        }
        onSubmit={() => setConfirmSubmitOpen(true)}
      />

      {exam.errorMsg ? <Alert variant="error">{exam.errorMsg}</Alert> : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="space-y-6 lg:col-span-3">
          {exam.currentQuestion ? (
            <QuestionRenderer
              question={exam.currentQuestion}
              answer={exam.currentAnswer}
              onAnswerChange={(next) =>
                exam.onAnswerChange(exam.currentQuestion!.id, next)
              }
            />
          ) : (
            <p className="py-12 text-center text-muted-foreground">
              No questions in this test.
            </p>
          )}

          <QuestionNavigation
            currentIndex={exam.currentIndex}
            totalQuestions={exam.totalQuestions}
            onPrevious={() =>
              exam.setCurrentIndex((prev) => Math.max(0, prev - 1))
            }
            onNext={() =>
              exam.setCurrentIndex((prev) =>
                Math.min(exam.totalQuestions - 1, prev + 1)
              )
            }
            onSubmit={() => setConfirmSubmitOpen(true)}
          />
        </div>

        <aside className="hidden lg:col-span-1 lg:block">
          <div className="sticky top-20">{palette}</div>
        </aside>
      </div>

      <SubmitExamDialog
        open={confirmSubmitOpen}
        onOpenChange={setConfirmSubmitOpen}
        totalQuestions={exam.totalQuestions}
        totalAnswered={exam.totalAnswered}
        unansweredCount={exam.unansweredCount}
        submitting={exam.submitting}
        onConfirm={exam.submitExam}
      />

      <IntegrityWarningDialog
        open={integrity.showWarning}
        onOpenChange={(open) => {
          if (!open) integrity.dismissWarning();
        }}
        tabSwitches={integrity.tabSwitches}
      />
    </div>
  );
}
