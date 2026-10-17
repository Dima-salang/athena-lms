"use client";

import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OptionItem {
  id: string;
  optionText: string;
  matchText?: string | null;
}

export interface QuestionData {
  id: string;
  questionNumber: number;
  questionText: string;
  questionType: string;
  fullPoints: number;
  options: OptionItem[];
}

export interface AnswerState {
  optionId?: string | null;
  textAnswer?: string | null;
  matchingPairs?: string | null; // JSON string
  isFlagged?: boolean;
}

interface QuestionRendererProps {
  question: QuestionData;
  answer: AnswerState;
  onAnswerChange: (newAnswer: AnswerState) => void;
  className?: string;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  answer,
  onAnswerChange,
  className,
}) => {
  const toggleFlag = () => {
    onAnswerChange({
      ...answer,
      isFlagged: !answer.isFlagged,
    });
  };

  // 1. Multiple Choice
  const renderMultipleChoice = () => {
    return (
      <RadioGroup
        value={answer.optionId || ""}
        onValueChange={(val) => onAnswerChange({ ...answer, optionId: val })}
        className="space-y-3 pt-2"
      >
        {question.options.map((opt, idx) => {
          const isSelected = answer.optionId === opt.id;
          const letter = String.fromCharCode(65 + idx);

          return (
            <div
              key={opt.id}
              className={cn(
                "group flex items-center space-x-3 rounded-xl border p-3.5 transition-all duration-150 cursor-pointer select-none",
                isSelected
                  ? "border-primary bg-primary/10 dark:bg-primary/20 ring-2 ring-primary/30 shadow-xs"
                  : "hover:bg-muted/50 border-input hover:border-muted-foreground/40"
              )}
              onClick={() => onAnswerChange({ ...answer, optionId: opt.id })}
            >
              <RadioGroupItem value={opt.id} id={opt.id} />
              <div
                className={cn(
                  "h-7 w-7 rounded-md flex items-center justify-center text-xs font-bold transition-colors shrink-0",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                )}
              >
                {letter}
              </div>
              <Label
                htmlFor={opt.id}
                className={cn(
                  "cursor-pointer font-normal flex-1 text-sm leading-relaxed",
                  isSelected && "font-semibold text-foreground"
                )}
              >
                {opt.optionText}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    );
  };

  // 2. True / False
  const renderTrueFalse = () => {
    const current = (answer.textAnswer || "").toLowerCase();

    return (
      <div className="grid grid-cols-2 gap-4 pt-2">
        {["True", "False"].map((choice) => {
          const isSelected = current === choice.toLowerCase();
          return (
            <button
              key={choice}
              type="button"
              onClick={() => onAnswerChange({ ...answer, textAnswer: choice })}
              className={cn(
                "flex h-14 items-center justify-center rounded-xl border text-base font-semibold transition-all",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-input hover:bg-muted"
              )}
            >
              {choice}
            </button>
          );
        })}
      </div>
    );
  };

  // 3. Identification & Acronym
  const renderTextInput = (placeholder: string) => {
    return (
      <div className="space-y-2 pt-2">
        <Label className="text-xs text-muted-foreground">Your Answer</Label>
        <Input
          placeholder={placeholder}
          value={answer.textAnswer || ""}
          onChange={(e) => onAnswerChange({ ...answer, textAnswer: e.target.value })}
          className="text-base h-11"
        />
      </div>
    );
  };

  // 4. Matching Type
  const renderMatching = () => {
    // Parse student's current matching pairs
    let studentPairs: Array<{ optionId: string; matchedText: string }> = [];
    try {
      if (answer.matchingPairs) {
        studentPairs = JSON.parse(answer.matchingPairs);
      }
    } catch {
      studentPairs = [];
    }

    // Column B target choices (unique set of match texts from options)
    const choices = Array.from(
      new Set(question.options.map((o) => o.matchText).filter(Boolean) as string[])
    );

    const handleMatchSelect = (optionId: string, matchedText: string) => {
      const updatedPairs = studentPairs.filter((p) => p.optionId !== optionId);
      if (matchedText) {
        updatedPairs.push({ optionId, matchedText });
      }
      onAnswerChange({
        ...answer,
        matchingPairs: JSON.stringify(updatedPairs),
      });
    };

    return (
      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-semibold text-muted-foreground pb-1 border-b">
          <span>Premise (Column A)</span>
          <span>Match (Column B)</span>
        </div>

        {question.options.map((opt) => {
          const selectedMatch =
            studentPairs.find((p) => p.optionId === opt.id)?.matchedText || "";

          return (
            <div
              key={opt.id}
              className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center rounded-lg border p-3 bg-muted/20"
            >
              <span className="text-sm font-medium">{opt.optionText}</span>
              <Select
                value={selectedMatch}
                onValueChange={(val) => handleMatchSelect(opt.id, val)}
              >
                <SelectTrigger className="bg-card">
                  <SelectValue placeholder="Select matching item..." />
                </SelectTrigger>
                <SelectContent>
                  {choices.map((choice) => (
                    <SelectItem key={choice} value={choice}>
                      {choice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        })}
      </div>
    );
  };

  // 5. Essay
  const renderEssay = () => {
    const text = answer.textAnswer || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;

    return (
      <div className="space-y-2 pt-2">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <Label>Your response</Label>
          <span>{words} word(s)</span>
        </div>
        <Textarea
          placeholder="Compose your essay response here..."
          value={text}
          onChange={(e) => onAnswerChange({ ...answer, textAnswer: e.target.value })}
          className="min-h-[160px] text-base leading-relaxed"
        />
      </div>
    );
  };

  return (
    <div className={cn("border-2 bg-card p-6 shadow-md space-y-6", className)}>
      <div className="flex items-start justify-between gap-4 border-b pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Question {question.questionNumber}
            </span>
            <span className="text-xs font-medium text-primary">
              • {question.fullPoints} point{question.fullPoints > 1 ? "s" : ""}
            </span>
          </div>
          <h2 className="text-lg font-medium leading-snug">{question.questionText}</h2>
        </div>

        <Button
          type="button"
          variant={answer.isFlagged ? "secondary" : "ghost"}
          size="sm"
          onClick={toggleFlag}
          className={cn(
            "gap-1.5 text-xs font-medium shrink-0",
            answer.isFlagged && "bg-warning/10 text-warning hover:bg-warning/20"
          )}
        >
          {answer.isFlagged ? (
            <>
              <BookmarkCheck className="h-4 w-4" />
              <span>Flagged</span>
            </>
          ) : (
            <>
              <Bookmark className="h-4 w-4" />
              <span>Flag for review</span>
            </>
          )}
        </Button>
      </div>

      <div>
        {question.questionType === "MULTIPLE_CHOICE" && renderMultipleChoice()}
        {question.questionType === "TRUE_FALSE" && renderTrueFalse()}
        {question.questionType === "IDENTIFICATION" && renderTextInput("Enter identification answer...")}
        {question.questionType === "ACRONYM" && renderTextInput("Enter acronym or full expansion...")}
        {question.questionType === "MATCHING" && renderMatching()}
        {question.questionType === "ESSAY" && renderEssay()}
      </div>
    </div>
  );
};
