"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

import type { BulkAction } from "@/components/admin/users/BulkActionsBar";
import {
  buildUserQuery,
  fullName,
  type AdminUserItem,
  type UserFilters,
} from "@/components/admin/users/types";
import { useConfirm } from "@/hooks/use-confirm";

const ACTION_PAST: Record<BulkAction, string> = {
  activate: "activated",
  deactivate: "deactivated",
  delete: "deleted",
};

interface BulkResponse {
  action: BulkAction;
  affected: number;
  blocked: { id: string; reason: string }[];
}

interface UseUserActionsOptions {
  filters: UserFilters;
  selectedIds: string[];
  /** Reload the list after a successful change. */
  onChanged: () => void;
  /** Drop the current selection after a bulk action. */
  onSelectionCleared: () => void;
}

/**
 * Everything a row or a selection can do to an account: activate, deactivate,
 * delete, bulk actions and the CSV download. Each one confirms first and
 * reports back with a toast.
 */
export function useUserActions({
  filters,
  selectedIds,
  onChanged,
  onSelectionCleared,
}: UseUserActionsOptions) {
  const { confirm, dialog } = useConfirm();
  const [bulkBusy, setBulkBusy] = useState<BulkAction | null>(null);

  const toggleActive = useCallback(
    async (user: AdminUserItem) => {
      const next = !user.isActive;
      const ok = await confirm({
        title: next ? "Activate this account?" : "Deactivate this account?",
        description: next
          ? `${fullName(user)} will be able to sign in again.`
          : `${fullName(user)} will not be able to sign in until you activate them again.`,
        confirmLabel: next ? "Activate" : "Deactivate",
        destructive: !next,
      });
      if (!ok) return;

      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: next }),
      });
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(body?.error ?? "Could not update the account.");
        return;
      }

      toast.success(next ? "Account activated" : "Account deactivated");
      onChanged();
    },
    [confirm, onChanged]
  );

  const deleteUser = useCallback(
    async (user: AdminUserItem) => {
      const ok = await confirm({
        title: "Delete this account?",
        description: `${fullName(user)} (@${user.username}) is removed for good. Accounts with tests or submissions cannot be deleted — deactivate those instead.`,
        confirmLabel: "Delete account",
        destructive: true,
      });
      if (!ok) return;

      const res = await fetch(`/api/admin/users?id=${user.id}`, { method: "DELETE" });
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(body?.error ?? "Could not delete the account.");
        return;
      }

      toast.success("Account deleted");
      onChanged();
    },
    [confirm, onChanged]
  );

  const runBulk = useCallback(
    async (action: BulkAction) => {
      const count = selectedIds.length;
      if (count === 0) return;
      const plural = count === 1 ? "" : "s";

      const ok = await confirm({
        title:
          action === "delete"
            ? `Delete ${count} account${plural}?`
            : `${action === "activate" ? "Activate" : "Deactivate"} ${count} account${plural}?`,
        description:
          action === "delete"
            ? "Accounts with tests or submissions are skipped and reported back. This cannot be undone."
            : "You can change this back at any time.",
        confirmLabel: action === "delete" ? "Delete accounts" : "Confirm",
        destructive: action === "delete",
      });
      if (!ok) return;

      setBulkBusy(action);
      try {
        const res = await fetch("/api/admin/users/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedIds, action }),
        });
        const body = (await res.json().catch(() => null)) as BulkResponse | null;

        if (!res.ok || !body) {
          toast.error("Could not run that action.");
          return;
        }

        const summary = `${body.affected} account${
          body.affected === 1 ? "" : "s"
        } ${ACTION_PAST[action]}.`;
        if (body.blocked.length > 0) {
          toast.warning(summary, {
            description: `${body.blocked.length} skipped — for example: ${body.blocked[0].reason}`,
          });
        } else {
          toast.success(summary);
        }

        onSelectionCleared();
        onChanged();
      } finally {
        setBulkBusy(null);
      }
    },
    [confirm, selectedIds, onChanged, onSelectionCleared]
  );

  /** Download every account matching the filters (not just this page). */
  const exportCsv = useCallback(() => {
    const params = new URLSearchParams(buildUserQuery({ ...filters, page: 1 }));
    params.delete("page");
    params.delete("pageSize");
    window.location.href = `/api/admin/users/export?${params.toString()}`;
    toast.success("Preparing your CSV download");
  }, [filters]);

  return { toggleActive, deleteUser, runBulk, exportCsv, bulkBusy, dialog };
}
