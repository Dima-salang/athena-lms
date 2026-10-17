"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CheckboxField, FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CandidateStudent,
  OverrideInput,
} from "@/components/teacher/special-access/types";

interface SpecialAccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: CandidateStudent[];
  saving: boolean;
  onCreate: (input: OverrideInput) => Promise<boolean>;
}

export function SpecialAccessDialog({
  open,
  onOpenChange,
  candidates,
  saving,
  onCreate,
}: SpecialAccessDialogProps) {
  const [studentId, setStudentId] = useState("");
  const [customDueDate, setCustomDueDate] = useState("");
  const [extensionMinutes, setExtensionMinutes] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setStudentId("");
      setCustomDueDate("");
      setExtensionMinutes(0);
      setIsUnlocked(true);
      setValidationError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) {
      setValidationError("Choose a student first.");
      return;
    }
    const ok = await onCreate({
      studentId,
      customDueDate,
      extensionMinutes,
      isUnlocked,
    });
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader>
            <DialogTitle>Give a student extra access</DialogTitle>
            <DialogDescription>
              Add extra time, a later deadline, or let one student take the test after
              it closes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <FormField
              label="Student"
              error={validationError}
              hint={validationError ? undefined : "Only students without an override yet."}
            >
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a student…" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {candidates.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No eligible students left
                    </SelectItem>
                  ) : (
                    candidates.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} — {student.sectionName} (LRN {student.lrn})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label="Later deadline"
              hint="Optional. Replaces the test deadline for this student only."
            >
              <Input
                type="datetime-local"
                value={customDueDate}
                onChange={(e) => setCustomDueDate(e.target.value)}
              />
            </FormField>

            <FormField
              label="Extra time (minutes)"
              hint="Added on top of the standard duration."
            >
              <Input
                type="number"
                min="0"
                step="5"
                value={extensionMinutes}
                onChange={(e) => setExtensionMinutes(parseInt(e.target.value) || 0)}
              />
            </FormField>

            <CheckboxField
              id="isUnlocked"
              label="Allow access after the deadline"
              description="The student can still take the test once it has closed."
              checked={isUnlocked}
              onChange={setIsUnlocked}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="gap-1.5">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : null}
              Save access
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
