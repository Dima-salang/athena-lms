"use client";

import { Clock, Trash2, Unlock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { SpecialAccessRecord } from "@/components/teacher/special-access/types";

export function OverridesTable({
  overrides,
  onRemove,
}: {
  overrides: SpecialAccessRecord[];
  onRemove: (record: SpecialAccessRecord) => void;
}) {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-base font-semibold">
          Current exceptions ({overrides.length})
        </CardTitle>
        <CardDescription>
          These students have their own deadline, extra time, or are unlocked after
          the test closes.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>LRN</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Extra time</TableHead>
                <TableHead>Access</TableHead>
                <TableHead className="w-16 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overrides.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No exceptions yet. Add one for a student who needs it.
                  </TableCell>
                </TableRow>
              ) : (
                overrides.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.studentName}</TableCell>
                    <TableCell className="font-mono text-xs">{row.lrn || "—"}</TableCell>
                    <TableCell className="text-sm">{row.sectionName || "—"}</TableCell>
                    <TableCell className="text-sm">
                      {row.customDueDate ? (
                        formatDate(row.customDueDate)
                      ) : (
                        <span className="text-xs text-muted-foreground">Standard</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.extendedSeconds ? (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Clock className="h-3 w-3" aria-hidden />+
                          {Math.round(row.extendedSeconds / 60)} min
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.isUnlocked ? (
                        <Badge variant="success" className="gap-1 text-xs">
                          <Unlock className="h-3 w-3" aria-hidden />
                          Unlocked
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Standard
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(row)}
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        title="Remove exception"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                        <span className="sr-only">Remove exception</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
