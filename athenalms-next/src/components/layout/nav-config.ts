import {
  BookOpen,
  FileText,
  LayoutDashboard,
  Layers,
  Upload,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Role landing pages — these match only exactly, never as a prefix. */
const ROOTS = ["/admin", "/teacher", "/student"];

const NAV: Record<string, NavLink[]> = {
  ADMIN: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/sections", label: "Sections", icon: Layers },
    { href: "/admin/subjects", label: "Subjects", icon: BookOpen },
    { href: "/admin/teacher-assignments", label: "Teacher classes", icon: UserCheck },
    { href: "/admin/roster-upload", label: "Import students", icon: Upload },
    { href: "/admin/users", label: "Users", icon: Users },
  ],
  TEACHER: [
    { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
    { href: "/teacher/tests", label: "Tests", icon: FileText },
    { href: "/admin/sections", label: "Sections", icon: Layers },
    { href: "/admin/subjects", label: "Subjects", icon: BookOpen },
  ],
  STUDENT: [{ href: "/student", label: "Dashboard", icon: LayoutDashboard }],
};

export function getNavLinks(role: string): NavLink[] {
  return NAV[role] ?? NAV.STUDENT;
}

/** Whether a nav link should render as the current page. */
export function isNavActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (ROOTS.includes(href)) return false;
  return pathname.startsWith(`${href}/`);
}
