"use client";

import { Download, Loader2, Power, PowerOff, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";

export type BulkAction = "activate" | "deactivate" | "delete";

interface BulkActionsBarProps {
  count: number;
  busy: BulkAction | null;
  onRun: (action: BulkAction) => void;
  onExport: () => void;
  onClear: () => void;
}

/**
 * Appears only while rows are selected. Selection is page-scoped, so the count
 * always refers to rows the admin can currently see.
 */
export function BulkActionsBar({
  count,
  busy,
  onRun,
  onExport,
  onClear,
}: BulkActionsBarProps) {
  if (count === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border-2 border-border bg-secondary p-3 text-secondary-foreground">
      <span className="text-xs label-mono font-bold">
        {count} selected
      </span>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onRun("activate")}
          disabled={busy !== null}
        >
          {busy === "activate" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Power className="h-4 w-4" aria-hidden />
          )}
          Activate
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onRun("deactivate")}
          disabled={busy !== null}
        >
          {busy === "deactivate" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <PowerOff className="h-4 w-4" aria-hidden />
          )}
          Deactivate
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onRun("delete")}
          disabled={busy !== null}
        >
          {busy === "delete" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Trash2 className="h-4 w-4" aria-hidden />
          )}
          Delete
        </Button>
        <Button size="sm" variant="outline" onClick={onExport} disabled={busy !== null}>
          <Download className="h-4 w-4" aria-hidden />
          Export CSV
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClear}
          disabled={busy !== null}
          aria-label="Clear selection"
        >
          <X className="h-4 w-4" aria-hidden />
          Clear
        </Button>
      </div>
    </div>
  );
}
