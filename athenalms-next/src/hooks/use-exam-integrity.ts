"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Counts how many times the student leaves the exam window (tab switch or
 * window blur) and exposes a warning to show them.
 */
export function useExamIntegrity() {
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => prev + 1);
        setShowWarning(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const dismissWarning = useCallback(() => setShowWarning(false), []);

  return { tabSwitches, showWarning, dismissWarning };
}
