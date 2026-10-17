"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { QuestionType } from "@/types";

const QUICK_ADD: { type: QuestionType; label: string }[] = [
  { type: "MULTIPLE_CHOICE", label: "Multiple choice" },
  { type: "TRUE_FALSE", label: "True / False" },
  { type: "IDENTIFICATION", label: "Identification" },
  { type: "ACRONYM", label: "Acronym" },
  { type: "MATCHING", label: "Matching" },
  { type: "ESSAY", label: "Essay" },
];

/** Placeholder row at the end of the question list used to append new items. */
export function AddQuestionBar({
  onAdd,
}: {
  onAdd: (type: QuestionType) => void;
}) {
  return (
    <div className="rounded-xl border border-dashed bg-muted/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Plus className="h-4 w-4" aria-hidden />
          Add a question
        </span>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_ADD.map((item) => (
            <Button
              key={item.type}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onAdd(item.type)}
              className="h-8 text-xs"
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
