"use client";

import { useEffect, useState } from "react";
import { Loader2, Search, UserPlus } from "lucide-react";

import {
  fullName,
  type AdminUserItem,
  type AdminUserListResponse,
} from "@/components/admin/users/types";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckboxField } from "@/components/ui/form-field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const DEBOUNCE_MS = 300;

interface AddStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionName: string;
  busy: boolean;
  onAdd: (students: AdminUserItem[]) => void;
}

/** Pick students who are not in any section and place them here. */
export function AddStudentsDialog({
  open,
  onOpenChange,
  sectionName,
  busy,
  onAdd,
}: AddStudentsDialogProps) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chosen, setChosen] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      setSearch("");
      setChosen(new Set());
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          section: "unassigned",
          role: "STUDENT",
          pageSize: "50",
        });
        if (search.trim()) params.set("search", search.trim());

        const res = await fetch(`/api/admin/users?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Could not load students.");
        const json = (await res.json()) as AdminUserListResponse;
        setResults(json.data);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Could not load students.");
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [open, search]);

  const toggle = (id: string) => {
    setChosen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = () => {
    onAdd(results.filter((student) => chosen.has(student.id)));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add students</DialogTitle>
          <DialogDescription>
            Students who are not in a section yet. Adding them puts them in{" "}
            <span className="font-semibold">{sectionName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            placeholder="Search by name, username or LRN…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search students without a section"
          />
        </div>

        {error ? <Alert variant="error">{error}</Alert> : null}

        <div className="max-h-72 space-y-2 overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center">
              <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
              <span className="sr-only">Loading students</span>
            </div>
          ) : results.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No students without a section match that search.
            </p>
          ) : (
            results.map((student) => (
              <CheckboxField
                key={student.id}
                id={`add-student-${student.id}`}
                label={fullName(student)}
                description={`@${student.username}${student.lrn ? ` • LRN ${student.lrn}` : ""}`}
                checked={chosen.has(student.id)}
                onChange={() => toggle(student.id)}
              />
            ))
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleAdd} disabled={busy || chosen.size === 0}>
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <UserPlus className="h-4 w-4" aria-hidden />
            )}
            Add {chosen.size > 0 ? `${chosen.size} ` : ""}
            student{chosen.size === 1 ? "" : "s"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
