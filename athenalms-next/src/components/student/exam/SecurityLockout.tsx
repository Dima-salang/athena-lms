import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Full-screen lock shown when the network/IP check blocks the student. */
export function SecurityLockout({ message }: { message: string }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center space-y-4 p-6 text-center">
      <div className="rounded-full bg-destructive/10 p-4 text-destructive">
        <ShieldAlert className="h-10 w-10" aria-hidden />
      </div>
      <h2 className="font-display text-xl font-semibold text-destructive">
        Test session locked
      </h2>
      <p className="text-sm leading-relaxed text-muted-foreground">{message}</p>
      <div className="space-y-1 rounded-lg bg-muted/40 p-3 text-left text-xs text-muted-foreground">
        <p>• This test can only be taken from your school&apos;s network.</p>
        <p>
          • Ask your teacher for special access if you need to take it
          elsewhere.
        </p>
      </div>
      <Button asChild variant="outline" className="w-full">
        <Link href="/student">Back to dashboard</Link>
      </Button>
    </div>
  );
}
