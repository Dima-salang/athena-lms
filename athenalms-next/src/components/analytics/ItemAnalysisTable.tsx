"use client";

import React, { useState } from "react";
import { CheckCircle2, Download, Loader2, XCircle } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckboxField } from "@/components/ui/form-field";
import { cn, formatQuestionType } from "@/lib/utils";

export interface ItemAnalysisRow {
  questionId: string;
  questionNumber: number;
  questionText: string;
  questionType: string;
  fullPoints: number;
  correctCount: number;
  wrongCount: number;
  totalResponses: number;
  percentCorrect: number;
  difficultyIndex: number;
  difficultyCategory: "EASY" | "MODERATE" | "DIFFICULT";
  discriminationIndex: number;
  discriminationCategory: "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
}

interface ItemAnalysisTableProps {
  items: ItemAnalysisRow[];
  className?: string;
  onExport?: () => void;
  exporting?: boolean;
}

const DIFFICULTY_VARIANT: Record<
  ItemAnalysisRow["difficultyCategory"],
  "success" | "warning" | "destructive"
> = {
  EASY: "success",
  MODERATE: "warning",
  DIFFICULT: "destructive",
};

const DIFFICULTY_LABEL: Record<ItemAnalysisRow["difficultyCategory"], string> = {
  EASY: "Easy",
  MODERATE: "Moderate",
  DIFFICULT: "Hard",
};

const DISCRIMINATION_VARIANT: Record<
  ItemAnalysisRow["discriminationCategory"],
  "success" | "warning" | "destructive"
> = {
  EXCELLENT: "success",
  GOOD: "success",
  FAIR: "warning",
  POOR: "destructive",
};

const DISCRIMINATION_LABEL: Record<
  ItemAnalysisRow["discriminationCategory"],
  string
> = {
  EXCELLENT: "Excellent",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
};

function PercentBar({ value }: { value: number }) {
  const tone =
    value >= 70 ? "bg-success" : value >= 40 ? "bg-warning" : "bg-destructive";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-500", tone)}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <span className="font-mono text-xs tabular-nums">{value}%</span>
    </div>
  );
}

/**
 * Simple per-item breakdown: how many students got the item right vs wrong.
 * Advanced item metrics (difficulty / discrimination) are available behind a
 * toggle so they don't dominate the view.
 */
export const ItemAnalysisTable: React.FC<ItemAnalysisTableProps> = ({
  items,
  className,
  onExport,
  exporting,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">Item analysis</CardTitle>
          <CardDescription>
            How many students answered each item correctly and incorrectly.
          </CardDescription>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <CheckboxField
            id="show-advanced-metrics"
            label="Show advanced metrics"
            description="Difficulty and discrimination indices"
            checked={showAdvanced}
            onChange={setShowAdvanced}
          />
          {onExport ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              disabled={exporting}
              className="gap-1.5"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Download className="h-4 w-4" aria-hidden />
              )}
              Export to Excel
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 text-center">#</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-center">Points</TableHead>
                <TableHead className="text-center">
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden />
                    Correct
                  </span>
                </TableHead>
                <TableHead className="text-center">
                  <span className="inline-flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5 text-destructive" aria-hidden />
                    Wrong
                  </span>
                </TableHead>
                <TableHead>% correct</TableHead>
                {showAdvanced ? (
                  <>
                    <TableHead className="text-center">Difficulty</TableHead>
                    <TableHead className="text-center">Discrimination</TableHead>
                  </>
                ) : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={showAdvanced ? 9 : 7}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No responses to analyse yet.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.questionId}>
                    <TableCell className="text-center font-mono text-xs">
                      {item.questionNumber}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="line-clamp-2 text-sm">{item.questionText}</p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatQuestionType(item.questionType)}
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs">
                      {item.fullPoints}
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm text-success">
                      {item.correctCount}
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm text-destructive">
                      {item.wrongCount}
                    </TableCell>
                    <TableCell>
                      <PercentBar value={item.percentCorrect} />
                    </TableCell>
                    {showAdvanced ? (
                      <>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-mono text-xs tabular-nums">
                              {item.difficultyIndex.toFixed(2)}
                            </span>
                            <Badge
                              variant={DIFFICULTY_VARIANT[item.difficultyCategory]}
                              className="text-[10px]"
                            >
                              {DIFFICULTY_LABEL[item.difficultyCategory]}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="font-mono text-xs tabular-nums">
                              {item.discriminationIndex.toFixed(2)}
                            </span>
                            <Badge
                              variant={
                                DISCRIMINATION_VARIANT[item.discriminationCategory]
                              }
                              className="text-[10px]"
                            >
                              {DISCRIMINATION_LABEL[item.discriminationCategory]}
                            </Badge>
                          </div>
                        </TableCell>
                      </>
                    ) : null}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
