import { SidebarNav } from "./SidebarNav";

interface SidebarProps {
  role: string;
}

/** Desktop navigation rail. Mobile gets its own drawer (MobileNav). */
export function Sidebar({ role }: SidebarProps) {
  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 flex-col gap-2 overflow-y-auto border-r bg-muted/30 p-3 md:flex">
      <SidebarNav role={role} />
    </aside>
  );
}
