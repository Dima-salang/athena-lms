"use client";

import { useEffect, useState } from "react";
import { Check, Copy, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { fullName, type AdminUserItem } from "@/components/admin/users/types";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFormSubmit } from "@/hooks/use-form-submit";

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUserItem | null;
  onDone: () => void;
}

interface ResetResult {
  username: string;
  temporaryPassword: string;
  source: string;
}

/**
 * Reset an account to its known starting password.
 *
 * The password is shown once, right here, so the admin can pass it on. Closing
 * the dialog clears it — there is no second chance to read it.
 */
export function ResetPasswordDialog({
  open,
  onOpenChange,
  user,
  onDone,
}: ResetPasswordDialogProps) {
  const [result, setResult] = useState<ResetResult | null>(null);
  const [copied, setCopied] = useState(false);

  const { saving, error, submit, reset } = useFormSubmit<Record<string, never>>(
    user ? `/api/admin/users/${user.id}/reset-password` : "/api/admin/users",
    {
      errorMessage: "Could not reset the password.",
      onSuccess: (data) => {
        setResult(data as ResetResult);
        toast.success("Password reset", {
          description: "The account must change it at next sign-in.",
        });
        onDone();
      },
    }
  );

  useEffect(() => {
    if (open) {
      reset();
      setResult(null);
      setCopied(false);
    }
  }, [open, reset]);

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.temporaryPassword);
      setCopied(true);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy — please select the password and copy it manually.");
    }
  };

  const isStudent = user?.role === "STUDENT";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            {user ? `Give ${fullName(user)} a known starting password.` : ""}
          </DialogDescription>
        </DialogHeader>

        {error ? <Alert variant="error">{error}</Alert> : null}

        {result ? (
          <div className="space-y-3">
            <Alert variant="success">
              Password reset for <span className="font-mono">@{result.username}</span>. It is
              shown only once — copy it now.
            </Alert>
            <div className="flex items-center gap-2 border-2 border-border bg-muted p-3">
              <code className="flex-1 break-all font-mono text-sm font-bold">
                {result.temporaryPassword}
              </code>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCopy}
                aria-label="Copy the temporary password"
              >
                {copied ? (
                  <Check className="h-4 w-4" aria-hidden />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        ) : (
          <Alert variant="warning" icon={KeyRound}>
            {isStudent
              ? "This student's password goes back to their LRN, and they must change it when they sign in."
              : "This account's password goes back to username@123, and they must change it when they sign in."}
          </Alert>
        )}

        <DialogFooter>
          {result ? (
            <Button type="button" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => submit({})}
                disabled={saving || !user}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                Reset password
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
