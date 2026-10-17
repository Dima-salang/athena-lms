"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, CheckCircle2, Check, XCircle, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EditorOption {
  id?: string;
  optionText: string;
  matchText?: string | null;
  orderIndex: number;
}

export interface EditorQuestion {
  id?: string;
  questionNumber: number;
  questionText: string;
  questionType: string;
  fullPoints: number;
  correctAnswer?: string | null;
  alternativeAnswers?: string | null;
  correctOptionId?: string | null;
  rubric?: string | null;
  orderIndex: number;
  options: EditorOption[];
}

interface QuestionEditorProps {
  question: EditorQuestion;
  onChange: (updated: EditorQuestion) => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  className?: string;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  onChange,
  onDelete,
  onDuplicate,
  className,
}) => {
  const handleFieldChange = <K extends keyof EditorQuestion>(
    field: K,
    value: EditorQuestion[K]
  ) => {
    onChange({ ...question, [field]: value });
  };

  const addOption = () => {
    const nextOrder = question.options.length;
    const newOption: EditorOption = {
      optionText: "",
      matchText: question.questionType === "MATCHING" ? "" : null,
      orderIndex: nextOrder,
    };
    onChange({ ...question, options: [...question.options, newOption] });
  };

  const updateOption = <K extends keyof EditorOption>(
    index: number,
    field: K,
    value: EditorOption[K]
  ) => {
    const updated = [...question.options];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...question, options: updated });
  };

  const removeOption = (index: number) => {
    const updated = question.options.filter((_, i) => i !== index);
    onChange({ ...question, options: updated });
  };

  return (
    <Card className={cn("border-l-4 border-l-primary shadow-sm", className)}>
      <CardContent className="space-y-6 p-6">
        {/* Header row: Number, Type, Points, Duplicate/Delete */}
        <div className="flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
          <div className="flex w-full items-center gap-3 sm:w-auto">
            <span className="whitespace-nowrap font-display text-base font-semibold">
              Q{question.questionNumber}.
            </span>
            <div className="w-48">
              <Select
                value={question.questionType}
                onValueChange={(val) => {
                  handleFieldChange("questionType", val);
                  if (val === "MULTIPLE_CHOICE" && question.options.length === 0) {
                    onChange({
                      ...question,
                      questionType: val,
                      options: [
                        { optionText: "", orderIndex: 0 },
                        { optionText: "", orderIndex: 1 },
                      ],
                    });
                  }
                }}
              >
                <SelectTrigger className="h-9 text-xs" aria-label="Question type">
                  <SelectValue placeholder="Question Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                  <SelectItem value="TRUE_FALSE">True / False</SelectItem>
                  <SelectItem value="IDENTIFICATION">Identification</SelectItem>
                  <SelectItem value="ACRONYM">Acronym</SelectItem>
                  <SelectItem value="MATCHING">Matching Type</SelectItem>
                  <SelectItem value="ESSAY">Essay</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            <div className="flex items-center gap-1.5">
              <Label className="whitespace-nowrap text-xs text-muted-foreground">
                Points:
              </Label>
              <Input
                type="number"
                min="0.5"
                step="0.5"
                value={question.fullPoints}
                onChange={(e) =>
                  handleFieldChange("fullPoints", parseFloat(e.target.value) || 1)
                }
                className="h-9 w-20 text-center text-xs"
                aria-label="Points for this question"
              />
            </div>

            {onDuplicate ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onDuplicate}
                title="Duplicate question"
                aria-label="Duplicate question"
                className="h-9 w-9 text-muted-foreground"
              >
                <Copy className="h-4 w-4" />
              </Button>
            ) : null}

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onDelete}
              title="Delete question"
              aria-label="Delete question"
              className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Question Prompt */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">
            Question prompt
          </Label>
          <Textarea
            placeholder="Type your question prompt here…"
            value={question.questionText}
            onChange={(e) => handleFieldChange("questionText", e.target.value)}
            className="min-h-[80px] text-sm"
          />
        </div>

        {/* 1. Multiple Choice Options */}
        {question.questionType === "MULTIPLE_CHOICE" && (
          <div className="space-y-3 border-t pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Choices
                <span className="ml-1.5 font-normal">
                  — click a letter to mark the correct answer
                </span>
              </Label>
              <span className="font-mono text-[11px] text-muted-foreground">
                {question.options.length}{" "}
                {question.options.length === 1 ? "choice" : "choices"}
              </span>
            </div>

            <div className="space-y-2.5">
              {question.options.map((opt, idx) => {
                const optionLetter = String.fromCharCode(65 + idx);
                const hasMatchingId = Boolean(
                  question.correctOptionId &&
                    question.options.some((o) => o.id && o.id === question.correctOptionId)
                );
                const isCorrect = hasMatchingId
                  ? Boolean(opt.id && question.correctOptionId === opt.id)
                  : question.correctAnswer === String(idx);

                const handleSelectThis = () => {
                  onChange({
                    ...question,
                    correctOptionId: opt.id || null,
                    correctAnswer: String(idx),
                  });
                };

                return (
                  <div
                    key={opt.id || idx}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl border p-2.5 transition-all duration-200",
                      isCorrect
                        ? "border-success/60 bg-success/10 shadow-xs ring-1 ring-success/30"
                        : "border-border/70 bg-card/50 hover:border-muted-foreground/40 hover:bg-muted/30"
                    )}
                  >
                    {/* Correct-answer selector */}
                    <button
                      type="button"
                      role="radio"
                      aria-checked={isCorrect}
                      aria-label={`Mark option ${optionLetter} as correct answer`}
                      onClick={handleSelectThis}
                      className={cn(
                        "flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2",
                        isCorrect
                          ? "scale-105 border-success bg-success text-success-foreground shadow-xs"
                          : "border-muted-foreground/30 hover:border-success hover:bg-success/10"
                      )}
                    >
                      {isCorrect ? (
                        <Check className="h-4 w-4 stroke-[3]" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-transparent transition-colors group-hover:bg-success/30" />
                      )}
                    </button>

                    {/* Option letter (also selects) */}
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={handleSelectThis}
                      className={cn(
                        "flex h-7 w-7 shrink-0 cursor-pointer select-none items-center justify-center rounded-md text-xs font-bold transition-all duration-200",
                        isCorrect
                          ? "bg-success text-success-foreground shadow-xs"
                          : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                      )}
                      title={`Select ${optionLetter} as correct`}
                    >
                      {optionLetter}
                    </button>

                    <Input
                      placeholder={`Choice ${optionLetter} text…`}
                      value={opt.optionText}
                      onChange={(e) => updateOption(idx, "optionText", e.target.value)}
                      className={cn(
                        "h-9 flex-1 bg-background text-sm transition-colors",
                        isCorrect && "border-success/60 focus-visible:ring-success"
                      )}
                    />

                    {isCorrect ? (
                      <Badge
                        variant="success"
                        className="hidden shrink-0 select-none sm:inline-flex"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Correct answer
                      </Badge>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSelectThis}
                        className="hidden shrink-0 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground opacity-0 transition-opacity hover:bg-success/10 hover:text-success group-hover:opacity-100 sm:inline-flex"
                      >
                        Mark as correct
                      </button>
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(idx)}
                      disabled={question.options.length <= 2}
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title={
                        question.options.length <= 2
                          ? "At least 2 choices are required"
                          : "Delete choice"
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              className="mt-1 gap-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Option
            </Button>
          </div>
        )}

        {/* 2. True / False Key */}
        {question.questionType === "TRUE_FALSE" && (
          <div className="space-y-3 border-t pt-4">
            <Label className="text-xs font-medium text-muted-foreground">
              Correct Answer
            </Label>
            <div className="grid max-w-sm grid-cols-2 gap-3">
              {[
                { val: "True", icon: CheckCircle2 },
                { val: "False", icon: XCircle },
              ].map(({ val, icon: Icon }) => {
                const isSelected = question.correctAnswer === val;
                const isTrue = val === "True";
                return (
                  <Button
                    key={val}
                    type="button"
                    variant="outline"
                    onClick={() => handleFieldChange("correctAnswer", val)}
                    className={cn(
                      "h-12 justify-between border-2 px-4 text-sm font-semibold transition-all duration-200",
                      isSelected
                        ? isTrue
                          ? "border-success/60 bg-success/10 text-success ring-2 ring-success/20"
                          : "border-destructive/60 bg-destructive/10 text-destructive ring-2 ring-destructive/20"
                        : "border-border/70 text-muted-foreground hover:border-muted-foreground/40 hover:bg-muted/40"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-full border-2 transition-colors",
                          isSelected
                            ? isTrue
                              ? "border-success bg-success"
                              : "border-destructive bg-destructive"
                            : "border-muted-foreground/40"
                        )}
                      >
                        {isSelected ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-background" />
                        ) : null}
                      </div>
                      <span>{val}</span>
                    </div>
                    {isSelected ? <Icon className="h-4 w-4 shrink-0" /> : null}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Identification & Acronym Key */}
        {["IDENTIFICATION", "ACRONYM"].includes(question.questionType) && (
          <div className="grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Correct answer
              </Label>
              <Input
                placeholder="e.g. Jose Rizal or HTML"
                value={question.correctAnswer || ""}
                onChange={(e) => handleFieldChange("correctAnswer", e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                Also accept (comma-separated)
              </Label>
              <Input
                placeholder="e.g. Dr. Jose Rizal, Pepe"
                value={
                  question.alternativeAnswers
                    ? (() => {
                        try {
                          return JSON.parse(question.alternativeAnswers).join(", ");
                        } catch {
                          return question.alternativeAnswers;
                        }
                      })()
                    : ""
                }
                onChange={(e) => {
                  const arr = e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  handleFieldChange("alternativeAnswers", JSON.stringify(arr));
                }}
                className="h-9 text-sm"
              />
            </div>
          </div>
        )}

        {/* 4. Matching Type Pairs */}
        {question.questionType === "MATCHING" && (
          <div className="space-y-3 border-t pt-4">
            <div className="hidden gap-2 border-b pb-1 text-xs font-medium text-muted-foreground md:grid md:grid-cols-2">
              <span>Column A</span>
              <span>Column B (correct match)</span>
            </div>

            <div className="space-y-2">
              {question.options.map((opt, idx) => (
                <div
                  key={opt.id || idx}
                  className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center"
                >
                  <Input
                    placeholder="Column A item"
                    value={opt.optionText}
                    onChange={(e) => updateOption(idx, "optionText", e.target.value)}
                    className="h-9 flex-1 text-sm"
                  />
                  <Input
                    placeholder="Column B match"
                    value={opt.matchText || ""}
                    onChange={(e) => updateOption(idx, "matchText", e.target.value)}
                    className="h-9 flex-1 text-sm"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(idx)}
                    title="Delete pair"
                    aria-label="Delete pair"
                    className="shrink-0 self-end text-muted-foreground hover:text-destructive sm:self-auto"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              className="mt-1 gap-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Matching Pair
            </Button>
          </div>
        )}

        {/* 5. Essay Rubric */}
        {question.questionType === "ESSAY" && (
          <div className="space-y-2 border-t pt-4">
            <Label className="text-xs font-medium text-muted-foreground">
              Grading rubric (teacher-only reference)
            </Label>
            <Textarea
              placeholder="Guidelines for scoring full vs. partial points…"
              value={question.rubric || ""}
              onChange={(e) => handleFieldChange("rubric", e.target.value)}
              className="min-h-[70px] text-sm"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
