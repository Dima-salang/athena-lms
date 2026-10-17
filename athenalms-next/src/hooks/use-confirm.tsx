"use client";

import { useCallback, useRef, useState } from "react";

import {
  ConfirmDialog,
  type ConfirmDialogOptions,
} from "@/components/ui/confirm-dialog";

/**
 * Promise-based confirmation, replacing native `window.confirm`.
 *
 *   const { confirm, dialog } = useConfirm();
 *   ...
 *   if (!(await confirm({ title: "Archive test?", destructive: true }))) return;
 *   ...
 *   return <>{dialog}...</>;
 */
export function useConfirm() {
  const [options, setOptions] = useState<ConfirmDialogOptions | null>(null);
  const [open, setOpen] = useState(false);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((next: ConfirmDialogOptions) => {
    setOptions(next);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const settle = useCallback((value: boolean) => {
    setOpen(false);
    resolveRef.current?.(value);
    resolveRef.current = null;
  }, []);

  const dialog = options ? (
    <ConfirmDialog
      open={open}
      {...options}
      onConfirm={() => settle(true)}
      onCancel={() => settle(false)}
    />
  ) : null;

  return { confirm, dialog };
}
