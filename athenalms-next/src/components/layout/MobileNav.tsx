"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { BrandMark } from "./BrandMark";
import { SidebarNav } from "./SidebarNav";

interface MobileNavProps {
  role: string;
}

/** Hamburger → slide-in drawer. Gives phones real navigation. */
export function MobileNav({ role }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b-2 border-border bg-muted/50 p-4 text-left">
          <SheetTitle asChild>
            <div className="flex items-center gap-2">
              <BrandMark className="h-8 w-8" iconClassName="h-4 w-4" />
              <span className="font-display text-base tracking-tight">
                Athena LMS
              </span>
            </div>
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-3 p-3">
          <p className="px-1 text-xs label-mono font-bold text-muted-foreground">
            Navigation
          </p>
          <SidebarNav role={role} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
