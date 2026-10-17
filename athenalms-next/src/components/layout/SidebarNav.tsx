"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { getNavLinks, isNavActive } from "./nav-config";

interface SidebarNavProps {
  role: string;
  onNavigate?: () => void;
  className?: string;
}

/** The actual link list — shared by the desktop rail and the mobile drawer. */
export function SidebarNav({ role, onNavigate, className }: SidebarNavProps) {
  const pathname = usePathname();
  const links = getNavLinks(role);

  return (
    <nav className={cn("flex flex-col gap-1.5", className)}>
      {links.map(({ href, label, icon: Icon }) => {
        const active = isNavActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-none border-2 px-3 py-2 text-sm font-semibold transition-colors",
              active
                ? "border-border bg-primary text-primary-foreground shadow-sm"
                : "border-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
