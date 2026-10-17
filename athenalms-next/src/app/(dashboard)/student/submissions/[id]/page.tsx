"use client";

import { use } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

import { QuestionReviewList } from "@/components/student/result/QuestionReviewList";
import { ResultSummary } from "@/components/student/result/ResultSummary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { useApiResource } from "@/hooks/use-api-resource";
import { formatDate, formatExamType } from "@/lib/utils";
import type { QuestionDTO, SubmissionDTO } from "@/types";

interface StudentSubmissionReviewPageProps {
  params: Promise<{ id: string }>;
}

function gradeDescriptor(grade: number | null | undefined): string {
  if (grade === null || grade === undefined) return "Pending evaluation";
  if (grade >= 90) return "Outstanding";
  if (grade >= 85) return "Very satisfactory";
  if (grade >= 80) return "Satisfactory";
  if (grade >= 75) return "Fairly satisfactory";
  return "Did not meet expectations";
}

export default function StudentSubmissionReviewPage({
  params,
}: StudentSubmissionReviewPageProps) {
  const { id: submissionId } = use(params);
  const {
    data: submission,
    loading,
    error,
  } = useApiResource<SubmissionDTO>(
    `/api/student/submissions/${submissionId}`,
    "Failed to load submission details"
  );

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm font-medium text-muted-foreground">
          Loading your results…
        </span>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/student">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error || "Could not load submission"}</span>
        </div>
      </div>
    );
  }

  const { test, studentAnswers } = submission;
  const questions = test?.questions ?? [];

  const rawScore = submission.rawScore ?? 0;
  const totalPoints =
    test?.maxScore ||
    questions.reduce((sum: number, q: QuestionDTO) => sum + q.fullPoints, 0);
  const rawPercentage =
    totalPoints > 0 ? Math.round((rawScore / totalPoints) * 100) : 0;
  const transmutedGrade = submission.transmutedGrade;
  const isPassing = (transmutedGrade ?? 0) >= 75;

  const startTime = new Date(submission.startTime).getTime();
  const endTime = submission.endTime
    ? new Date(submission.endTime).getTime()
    : Date.now();
  const durationSeconds = Math.max(0, Math.round((endTime - startTime) / 1000));

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/student">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-semibold tracking-tight">
                {test?.title}
              </h1>
              <Badge variant="outline">
                {formatExamType(test?.examType || "QUIZ")}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {test?.subject?.name || "General"} • Submitted{" "}
              {submission.submittedAt
                ? formatDate(submission.submittedAt)
                : "in progress"}
            </p>
          </div>
        </div>

        <StatusBadge
          status={isPassing ? "passed" : "needs-improvement"}
          className="self-start sm:self-auto"
        />
      </div>

      <ResultSummary
        rawScore={rawScore}
        totalPoints={totalPoints}
        rawPercentage={rawPercentage}
        transmutedGrade={transmutedGrade}
        isPassing={isPassing}
        durationSeconds={durationSeconds}
        status={submission.status}
        descriptor={gradeDescriptor(transmutedGrade)}
        teacherNotes={submission.teacherNotes}
      />

      {questions.length > 0 ? (
        <QuestionReviewList questions={questions} answers={studentAnswers} />
      ) : (
        <EmptyState
          title="No questions to review"
          description="This test has no questions recorded."
        />
      )}
    </div>
  );
}
