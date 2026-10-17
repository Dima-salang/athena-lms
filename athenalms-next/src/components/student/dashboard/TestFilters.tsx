"use client";

import { RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type StudentSortKey = "recent" | "deadline";

interface TestFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  examType: string;
  onExamTypeChange: (value: string) => void;
  sort: StudentSortKey;
  onSortChange: (value: StudentSortKey) => void;
  examTypes: { value: string; label: string }[];
  resultCount: number;
  totalCount: number;
  onReset: () => void;
}

export function TestFilters({
  search,
  onSearchChange,
  examType,
  onExamTypeChange,
  sort,
  onSortChange,
  examTypes,
  resultCount,
  totalCount,
  onReset,
}: TestFiltersProps) {
  const hasActiveFilters =
    search.trim() !== "" || examType !== "ALL" || sort !== "recent";

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          placeholder="Search tests by title…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          aria-label="Search your tests"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Type</Label>
          <Select value={examType} onValueChange={onExamTypeChange}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All types</SelectItem>
              {examTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Sort by</Label>
          <Select
            value={sort}
            onValueChange={(v) => onSortChange(v as StudentSortKey)}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently published</SelectItem>
              <SelectItem value="deadline">Deadline soonest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
        <span>
          Showing <span className="font-medium text-foreground">{resultCount}</span> of{" "}
          {totalCount} tests
        </span>
        {hasActiveFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-7 gap-1.5 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Reset filters
          </Button>
        ) : null}
      </div>
    </div>
  );
}
