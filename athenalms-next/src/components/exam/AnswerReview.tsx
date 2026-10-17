"use client";

import React from "react";
import { ArrowRight, Check, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { OptionDTO, QuestionDTO, StudentAnswerDTO } from "@/types";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function normalize(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

/** Parse the JSON string stored on a matching answer. */
export function parseMatchingPairs(
  raw?: string | null
): Array<{ optionId: string; matchedText: string }> {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p) => p && typeof p.optionId === "string" && typeof p.matchedText === "string"
    );
  } catch {
    return [];
  }
}

/** Accepted answers may be a JSON array or a comma-separated string. */
function parseAlternatives(raw?: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((x): x is string => typeof x === "string");
    }
  } catch {
    /* fall through to comma parsing */
  }
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function isCorrectOption(question: QuestionDTO, option: OptionDTO): boolean {
  if (question.correctOptionId && question.correctOptionId === option.id) {
    return true;
  }
  return (
    question.correctAnswer != null &&
    question.correctAnswer === String(option.orderIndex)
  );
}

function isCorrectText(question: QuestionDTO, answer?: string | null): boolean {
  const student = normalize(answer);
  if (!student) return false;
  if (normalize(question.correctAnswer) === student) return true;
  return parseAlternatives(question.alternativeAnswers).some(
    (alt) => normalize(alt) === student
  );
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// ─────────────────────────────────────────────────────────────────────────────
// Per-type sections
// ─────────────────────────────────────────────────────────────────────────────

function MultipleChoiceReview({
  question,
  answer,
}: {
  question: QuestionDTO;
  answer?: StudentAnswerDTO;
}) {
  return (
    <div className="space-y-2">
      {question.options?.map((opt, idx) => {
        const chosen = answer?.optionId === opt.id;
        const correct = isCorrectOption(question, opt);

        return (
          <div
            key={opt.id}
            className={cn(
              "flex items-start justify-between gap-3 rounded-lg border p-3 text-sm",
              correct && chosen && "border-success/50 bg-success/10",
              correct && !chosen && "border-success/40 bg-success/5",
              !correct && chosen && "border-destructive/50 bg-destructive/10",
              !correct && !chosen && "border-border bg-card text-muted-foreground"
            )}
          >
            <div className="flex min-w-0 items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold",
                  correct
                    ? "bg-success text-success-foreground"
                    : chosen
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {LETTERS[idx] ?? idx + 1}
              </span>
              <span
                className={cn(
                  "min-w-0",
                  (correct || chosen) && "font-medium text-foreground"
                )}
              >
                {opt.optionText}
              </span>
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
              {chosen ? <Badge variant="secondary">Your answer</Badge> : null}
              {correct ? <Badge variant="success">Correct answer</Badge> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TextAnswerReview({
  question,
  answer,
}: {
  question: QuestionDTO;
  answer?: StudentAnswerDTO;
}) {
  const student = (answer?.textAnswer ?? "").trim();
  const correct = isCorrectText(question, student);
  const alternatives = parseAlternatives(question.alternativeAnswers);

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <div
        className={cn(
          "rounded-lg border p-3",
          !student
            ? "border-border bg-muted/30"
            : correct
              ? "border-success/40 bg-success/10"
              : "border-destructive/40 bg-destructive/10"
        )}
      >
        <p className="text-xs font-medium text-muted-foreground">Your answer</p>
        <p
          className={cn(
            "mt-1 text-sm font-medium",
            !student && "italic font-normal text-muted-foreground"
          )}
        >
          {student || "No answer"}
        </p>
      </div>
      <div className="rounded-lg border border-success/40 bg-success/10 p-3">
        <p className="text-xs font-medium text-muted-foreground">
          Correct answer
        </p>
        <p className="mt-1 text-sm font-medium">
          {question.correctAnswer || "—"}
        </p>
        {alternatives.length > 0 ? (
          <p className="mt-1 text-xs text-muted-foreground">
            Also accepted: {alternatives.join(", ")}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function MatchingReview({
  question,
  answer,
}: {
  question: QuestionDTO;
  answer?: StudentAnswerDTO;
}) {
  const pairs = parseMatchingPairs(answer?.matchingPairs);
  const rows = (question.options ?? []).map((opt) => {
    const yourMatch =
      pairs.find((p) => p.optionId === opt.id)?.matchedText ?? "";
    return {
      id: opt.id,
      premise: opt.optionText,
      yourMatch,
      correctMatch: opt.matchText ?? "",
      ok: !!yourMatch && normalize(yourMatch) === normalize(opt.matchText),
    };
  });

  if (rows.length === 0) {
    return (
      <p className="text-sm italic text-muted-foreground">
        No matching items recorded for this question.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="hidden gap-3 px-3 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-[1fr_1fr_1fr]">
        <span>Column A</span>
        <span>Your match</span>
        <span>Correct answer</span>
      </div>
      {rows.map((row) => (
        <div
          key={row.id}
          className={cn(
            "grid grid-cols-1 gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_1fr_1fr] sm:items-center sm:gap-3",
            row.ok
              ? "border-success/40 bg-success/10"
              : row.yourMatch
                ? "border-destructive/40 bg-destructive/10"
                : "border-border bg-muted/20"
          )}
        >
          <span className="text-sm font-medium">{row.premise}</span>
          <span className="flex items-center gap-1.5 text-sm">
            {row.ok ? (
              <Check className="h-4 w-4 shrink-0 text-success" aria-hidden />
            ) : row.yourMatch ? (
              <X
                className="h-4 w-4 shrink-0 text-destructive"
                aria-hidden
              />
            ) : (
              <ArrowRight
                className="h-4 w-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
            )}
            <span className={cn(!row.yourMatch && "italic text-muted-foreground")}>
              {row.yourMatch || "Not matched"}
            </span>
          </span>
          <span className="text-sm">
            <span className="text-xs text-muted-foreground sm:hidden">
              Correct:{" "}
            </span>
            <span className="font-medium text-success">
              {row.correctMatch || "—"}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

function EssayReview({
  question,
  answer,
}: {
  question: QuestionDTO;
  answer?: StudentAnswerDTO;
}) {
  return (
    <div className="space-y-2">
      <div className="rounded-lg border bg-muted/20 p-3">
        <p className="text-xs font-medium text-muted-foreground">
          Your response
        </p>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
          {answer?.textAnswer || (
            <span className="italic text-muted-foreground">Empty response</span>
          )}
        </p>
      </div>
      {question.rubric ? (
        <div className="rounded-lg border border-gold/30 bg-gold/10 p-3 text-xs">
          <span className="font-medium">Grading rubric: </span>
          {question.rubric}
        </div>
      ) : null}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Public component
// ─────────────────────────────────────────────────────────────────────────────

interface AnswerReviewProps {
  question: QuestionDTO;
  answer?: StudentAnswerDTO;
  className?: string;
}

/**
 * Read-only answer review for a single question. Always states the correct
 * answer in words (not just colour), for every question type.
 */
export function AnswerReview({ question, answer, className }: AnswerReviewProps) {
  return (
    <div className={className}>
      {question.questionType === "MULTIPLE_CHOICE" && (
        <MultipleChoiceReview question={question} answer={answer} />
      )}
      {["TRUE_FALSE", "IDENTIFICATION", "ACRONYM"].includes(
        question.questionType
      ) && <TextAnswerReview question={question} answer={answer} />}
      {question.questionType === "MATCHING" && (
        <MatchingReview question={question} answer={answer} />
      )}
      {question.questionType === "ESSAY" && (
        <EssayReview question={question} answer={answer} />
      )}
    </div>
  );
}
