"use client";

import React, { useEffect, useState } from "react";
import { formatDuration } from "@/lib/utils";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StickyTimerProps {
  initialSeconds: number | null; // null = untimed / infinite time
  onExpire: () => void;
  className?: string;
}

export const StickyTimer: React.FC<StickyTimerProps> = ({
  initialSeconds,
  onExpire,
  className,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(initialSeconds);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, onExpire]);

  if (secondsLeft === null) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground",
          className
        )}
      >
        <Clock className="h-3.5 w-3.5" />
        <span>No time limit</span>
      </div>
    );
  }

  const isLowTime = secondsLeft <= 300; // <= 5 minutes
  const isCriticalTime = secondsLeft <= 60; // <= 1 minute

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors duration-300 shadow-sm",
        isCriticalTime
          ? "bg-destructive text-destructive-foreground animate-pulse"
          : isLowTime
          ? "bg-warning text-warning-foreground"
          : "bg-primary text-primary-foreground",
        className
      )}
    >
      {isLowTime ? (
        <AlertTriangle className="h-4 w-4 shrink-0" />
      ) : (
        <Clock className="h-4 w-4 shrink-0" />
      )}
      <span className="tabular-nums font-mono">
        {formatDuration(secondsLeft)}
      </span>
    </div>
  );
};
