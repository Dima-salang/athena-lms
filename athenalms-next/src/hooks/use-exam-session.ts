"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import type { QuestionStatus } from "@/components/exam/QuestionPalette";
import type { AnswerState, QuestionData } from "@/components/exam/QuestionRenderer";
import type { StudentActiveTestDTO, SubmissionDTO } from "@/types";

/** Shape the autosave/submit endpoints expect. */
function toPayload(answers: Record<string, AnswerState>) {
  return Object.entries(answers).map(([questionId, answer]) => ({
    questionId,
    optionId: answer.optionId || null,
    textAnswer: answer.textAnswer || null,
    matchingPairs: answer.matchingPairs || null,
  }));
}

function isAnswered(answer?: AnswerState): boolean {
  if (!answer) return false;
  if (answer.optionId) return true;
  if (answer.textAnswer && answer.textAnswer.trim().length > 0) return true;
  if (answer.matchingPairs && answer.matchingPairs.length > 2) return true;
  return false;
}

/**
 * Owns the whole exam-taking session: starting/resuming the submission,
 * loading the questions, autosaving answers (with a localStorage fail-safe),
 * and finalizing the submission.
 */
export function useExamSession(testId: string) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [test, setTest] = useState<StudentActiveTestDTO | null>(null);
  const [submission, setSubmission] = useState<SubmissionDTO | null>(null);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [securityBlockError, setSecurityBlockError] = useState<string | null>(
    null
  );

  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Start or resume the submission and load the questions.
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        setLoading(true);

        const startRes = await fetch("/api/student/submissions/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ testId }),
        });

        if (!startRes.ok) {
          const errData = await startRes.json().catch(() => ({}));
          if (startRes.status === 403) {
            if (isMounted) {
              setSecurityBlockError(
                errData.error || "Access denied for this network."
              );
            }
            return;
          }
          throw new Error(errData.error || "Failed to start the test");
        }

        const submissionData = (await startRes.json()) as SubmissionDTO;
        if (!isMounted) return;
        setSubmission(submissionData);

        const testRes = await fetch(`/api/student/tests/${testId}`);
        if (!testRes.ok) throw new Error("Failed to load the test questions");
        const testData = (await testRes.json()) as StudentActiveTestDTO;
        if (!isMounted) return;

        setTest(testData);
        setQuestions((testData.questions || []) as QuestionData[]);

        // Restore saved answers, then overlay anything cached locally.
        const initialAnswers: Record<string, AnswerState> = {};
        for (const ans of submissionData.studentAnswers || []) {
          initialAnswers[ans.questionId] = {
            optionId: ans.optionId,
            textAnswer: ans.textAnswer,
            matchingPairs: ans.matchingPairs,
            isFlagged: false,
          };
        }

        const localKey = `athena_exam_${submissionData.id}`;
        try {
          const cached = localStorage.getItem(localKey);
          if (cached) {
            Object.assign(initialAnswers, JSON.parse(cached));
          }
        } catch (err) {
          console.error("Local storage read error", err);
        }

        setAnswers(initialAnswers);
      } catch (err: unknown) {
        if (isMounted) {
          setErrorMsg(
            err instanceof Error ? err.message : "Could not load the test"
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, [testId]);

  // Clear a pending autosave when the component unmounts.
  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
    };
  }, []);

  const triggerAutosave = useCallback(
    (updatedAnswers: Record<string, AnswerState>) => {
      if (!submission?.id) return;

      try {
        localStorage.setItem(
          `athena_exam_${submission.id}`,
          JSON.stringify(updatedAnswers)
        );
      } catch (err) {
        console.error("Local storage write error", err);
      }

      setSaveStatus("saving");

      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);

      autosaveTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await fetch(
            `/api/student/submissions/${submission.id}/autosave`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ answers: toPayload(updatedAnswers) }),
            }
          );

          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            if (res.status === 403) {
              setSecurityBlockError(
                data.error || "Network change detected. Session locked."
              );
            }
          } else {
            setSaveStatus("saved");
          }
        } catch (err) {
          console.error("Autosave network error", err);
        }
      }, 1500);
    },
    [submission?.id]
  );

  const onAnswerChange = useCallback(
    (questionId: string, newAnswer: AnswerState) => {
      setAnswers((prev) => {
        const updated = { ...prev, [questionId]: newAnswer };
        triggerAutosave(updated);
        return updated;
      });
    },
    [triggerAutosave]
  );

  const submitExam = useCallback(async () => {
    if (!submission?.id) return;

    try {
      setSubmitting(true);
      setErrorMsg(null);

      await fetch(`/api/student/submissions/${submission.id}/autosave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: toPayload(answers) }),
      });

      const submitRes = await fetch(
        `/api/student/submissions/${submission.id}/submit`,
        { method: "POST" }
      );

      if (!submitRes.ok) {
        const data = await submitRes.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit the test");
      }

      localStorage.removeItem(`athena_exam_${submission.id}`);
      router.push(`/student/submissions/${submission.id}`);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to submit the test"
      );
      setSubmitting(false);
    }
  }, [answers, router, submission]);

  const questionStatuses = useMemo<QuestionStatus[]>(
    () =>
      questions.map((question, idx) => {
        const answer = answers[question.id];
        return {
          questionId: question.id,
          questionNumber: idx + 1,
          isAnswered: isAnswered(answer),
          isFlagged: !!answer?.isFlagged,
        };
      }),
    [answers, questions]
  );

  const totalQuestions = questions.length;
  const totalAnswered = questionStatuses.filter((s) => s.isAnswered).length;
  const unansweredCount = totalQuestions - totalAnswered;
  const currentQuestion = questions[currentIndex];
  const currentAnswer: AnswerState = currentQuestion
    ? answers[currentQuestion.id] || { isFlagged: false }
    : { isFlagged: false };

  return {
    loading,
    submitting,
    test,
    submission,
    questions,
    answers,
    currentIndex,
    setCurrentIndex,
    saveStatus,
    errorMsg,
    securityBlockError,
    questionStatuses,
    totalQuestions,
    totalAnswered,
    unansweredCount,
    currentQuestion,
    currentAnswer,
    onAnswerChange,
    submitExam,
  };
}
