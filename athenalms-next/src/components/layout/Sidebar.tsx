import { SidebarNav } from "./SidebarNav";

interface SidebarProps {
  role: string;
}

/** Desktop navigation rail. Mobile gets its own drawer (MobileNav). */
export function Sidebar({ role }: SidebarProps) {
  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 flex-col gap-3 overflow-y-auto border-r-2 border-border bg-muted/40 p-3 md:flex">
      <p className="px-1 pt-1 text-xs label-mono font-bold text-muted-foreground">
        Navigation
      </p>
      <SidebarNav role={role} />
    </aside>
  );
}
