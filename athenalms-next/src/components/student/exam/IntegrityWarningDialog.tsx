import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface IntegrityWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tabSwitches: number;
}

/** Shown when the student leaves the exam window. */
export function IntegrityWarningDialog({
  open,
  onOpenChange,
  tabSwitches,
}: IntegrityWarningDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-warning">
            <AlertTriangle className="h-5 w-5" aria-hidden />
            <DialogTitle>Stay on the test window</DialogTitle>
          </div>
          <DialogDescription>
            Leaving the test window was recorded ({tabSwitches} time
            {tabSwitches === 1 ? "" : "s"}).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2 text-sm text-muted-foreground">
          <p>
            This test is monitored. Leaving the window is logged and reported to
            your teacher.
          </p>
          <p className="font-medium text-foreground">
            Keep this window open until you submit your test.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Return to test
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
