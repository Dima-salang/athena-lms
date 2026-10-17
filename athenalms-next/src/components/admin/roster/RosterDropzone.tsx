"use client";

import { useRef, useState } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";

import { cn } from "@/lib/utils";

interface RosterDropzoneProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
}

/**
 * File picker for a class list. A real button, so it is reachable and operable
 * from the keyboard, with drag-and-drop layered on top.
 */
export function RosterDropzone({ file, onFileChange, disabled }: RosterDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const accept = (candidate: File | undefined) => {
    if (candidate) onFileChange(candidate);
  };

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (disabled) return;
        accept(event.dataTransfer.files?.[0]);
      }}
      className={cn(
        "border-2 border-dashed p-2 transition-colors",
        dragging ? "border-primary bg-primary/5" : "border-border"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(event) => accept(event.target.files?.[0])}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="flex w-full flex-col items-center gap-2 p-6 text-center transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="flex h-12 w-12 items-center justify-center border-2 border-border bg-primary/10 text-primary">
          {file ? (
            <FileSpreadsheet className="h-6 w-6" aria-hidden />
          ) : (
            <Upload className="h-6 w-6" aria-hidden />
          )}
        </span>
        <span className="text-sm font-semibold">
          {file ? file.name : "Choose a class list file"}
        </span>
        <span className="text-xs text-muted-foreground">
          {file
            ? "Ready to import. Choose another file to replace it."
            : "Click to browse, or drop an Excel / CSV file here (.xlsx, .xls, .csv)"}
        </span>
      </button>
    </div>
  );
}
