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
import type {
  SubmissionSortKey,
  SubmissionStatusFilter,
} from "@/components/teacher/submissions/types";

interface SubmissionFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: SubmissionStatusFilter;
  onStatusChange: (value: SubmissionStatusFilter) => void;
  section: string;
  onSectionChange: (value: string) => void;
  sort: SubmissionSortKey;
  onSortChange: (value: SubmissionSortKey) => void;
  sections: string[];
  resultCount: number;
  totalCount: number;
  onReset: () => void;
}

export function SubmissionFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  section,
  onSectionChange,
  sort,
  onSortChange,
  sections,
  resultCount,
  totalCount,
  onReset,
}: SubmissionFiltersProps) {
  const hasActiveFilters =
    search.trim() !== "" ||
    status !== "ALL" ||
    section !== "ALL" ||
    sort !== "recent";

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          placeholder="Search by student name or LRN…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          aria-label="Search submissions"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select
            value={status}
            onValueChange={(v) => onStatusChange(v as SubmissionStatusFilter)}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="GRADED">Graded</SelectItem>
              <SelectItem value="IN_PROGRESS">In progress</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Section</Label>
          <Select value={section} onValueChange={onSectionChange}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All sections</SelectItem>
              {sections.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Sort by</Label>
          <Select
            value={sort}
            onValueChange={(v) => onSortChange(v as SubmissionSortKey)}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently submitted</SelectItem>
              <SelectItem value="score">Highest score</SelectItem>
              <SelectItem value="name">Name (A–Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
        <span>
          Showing <span className="font-medium text-foreground">{resultCount}</span> of{" "}
          {totalCount} submissions
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
