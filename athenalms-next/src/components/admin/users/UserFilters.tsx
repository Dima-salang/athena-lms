"use client";

import { RotateCcw, Search } from "lucide-react";

import {
  PAGE_SIZES,
  ROLE_LABELS,
  SORT_LABELS,
  STATUS_LABELS,
  UNASSIGNED,
  type RoleFilter,
  type SectionOption,
  type StatusFilter,
  type UserSort,
} from "@/components/admin/users/types";
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

interface UserFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  role: RoleFilter;
  onRoleChange: (value: RoleFilter) => void;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  section: string;
  onSectionChange: (value: string) => void;
  sort: UserSort;
  onSortChange: (value: UserSort) => void;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  sections: SectionOption[];
  shown: number;
  total: number;
  hasActiveFilters: boolean;
  onReset: () => void;
}

/** Filter panel for the user list. Every control applies immediately. */
export function UserFilters({
  search,
  onSearchChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
  section,
  onSectionChange,
  sort,
  onSortChange,
  pageSize,
  onPageSizeChange,
  sections,
  shown,
  total,
  hasActiveFilters,
  onReset,
}: UserFiltersProps) {
  return (
    <div className="space-y-4 border-2 bg-card p-4">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          placeholder="Search by name, username, LRN or email…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          aria-label="Search user accounts"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Role</Label>
          <Select value={role} onValueChange={(v) => onRoleChange(v as RoleFilter)}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(ROLE_LABELS) as RoleFilter[]).map((value) => (
                <SelectItem key={value} value={value}>
                  {ROLE_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Password status</Label>
          <Select value={status} onValueChange={(v) => onStatusChange(v as StatusFilter)}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(STATUS_LABELS) as StatusFilter[]).map((value) => (
                <SelectItem key={value} value={value}>
                  {STATUS_LABELS[value]}
                </SelectItem>
              ))}
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
              <SelectItem value={UNASSIGNED}>No section</SelectItem>
              {sections.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Sort by</Label>
          <Select value={sort} onValueChange={(v) => onSortChange(v as UserSort)}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(SORT_LABELS) as UserSort[]).map((value) => (
                <SelectItem key={value} value={value}>
                  {SORT_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Rows per page</Label>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
        <span>
          Showing <span className="font-medium text-foreground">{shown}</span> of{" "}
          {total} accounts
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
