"use client";

import type { ReactNode } from "react";
import { RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ListToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  /** Optional filter controls, laid out in a responsive grid. */
  filters?: ReactNode;
  shown: number;
  total: number;
  noun: string;
  hasActiveFilters: boolean;
  onReset: () => void;
}

/**
 * The shared admin list toolbar: search, optional filters, result count and a
 * reset. Every admin list uses it so they all read the same way.
 */
export function ListToolbar({
  search,
  onSearchChange,
  searchPlaceholder,
  filters,
  shown,
  total,
  noun,
  hasActiveFilters,
  onReset,
}: ListToolbarProps) {
  return (
    <div className="space-y-4 border-2 bg-card p-4">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          aria-label={searchPlaceholder}
        />
      </div>

      {filters ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{filters}</div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
        <span>
          Showing <span className="font-medium text-foreground">{shown}</span> of {total} {noun}
        </span>
        {hasActiveFilters ? (
          <Button variant="ghost" size="sm" onClick={onReset} className="h-7 gap-1.5 text-xs">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Reset filters
          </Button>
        ) : null}
      </div>
    </div>
  );
}
