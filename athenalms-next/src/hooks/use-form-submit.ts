"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

interface UseFormSubmitOptions {
  /** Defaults to POST. */
  method?: "POST" | "PATCH";
  /** Toast shown on success. Omit to stay silent. */
  successMessage?: string;
  /** Fallback message when the request fails without a usable one. */
  errorMessage?: string;
  /** Called with the parsed response body after a success. */
  onSuccess?: (data: unknown) => void;
}

/**
 * POST/PATCH a JSON form and track saving, error and per-field errors.
 *
 * The API answers validation failures with `{ error, fields }`, so the same
 * response can drive both a dialog-level alert and messages under the inputs.
 */
export function useFormSubmit<TInput>(
  url: string,
  options: UseFormSubmitOptions = {}
) {
  const { method = "POST", errorMessage = "Something went wrong. Please try again." } =
    options;

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Refs keep `submit` stable while still seeing the latest callbacks.
  const successRef = useRef(options.successMessage);
  successRef.current = options.successMessage;
  const onSuccessRef = useRef(options.onSuccess);
  onSuccessRef.current = options.onSuccess;

  const submit = useCallback(
    async (payload: TInput): Promise<boolean> => {
      setSaving(true);
      setError(null);
      setFieldErrors({});

      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data: unknown = await res.json().catch(() => null);
        const body = (data ?? {}) as { error?: string; fields?: Record<string, string> };

        if (!res.ok) {
          setError(body.error || errorMessage);
          if (body.fields) setFieldErrors(body.fields);
          return false;
        }

        if (successRef.current) toast.success(successRef.current);
        onSuccessRef.current?.(data);
        return true;
      } catch {
        setError(errorMessage);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [url, method, errorMessage]
  );

  const reset = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  return { saving, error, fieldErrors, submit, reset, setError };
}
