"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, LogOut, User as UserIcon } from "lucide-react";

import { signOut } from "@/lib/auth-client";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRole } from "@/lib/utils";

import { BrandMark } from "./BrandMark";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "./ThemeToggle";

interface NavbarProps {
  user: {
    firstName: string;
    lastName: string;
    username: string;
    role: string;
  };
}

const ROLE_VARIANT: Record<string, NonNullable<BadgeProps["variant"]>> = {
  ADMIN: "default",
  TEACHER: "athena",
  STUDENT: "secondary",
};

function dashboardHref(role: string) {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "TEACHER":
      return "/teacher";
    case "STUDENT":
      return "/student";
    default:
      return "/login";
  }
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-border bg-card">
      <div className="flex h-14 items-center gap-2 px-3 sm:gap-3 sm:px-6 lg:px-8">
        <MobileNav role={user.role} />

        <Link
          href={dashboardHref(user.role)}
          className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <BrandMark className="h-8 w-8" iconClassName="h-4 w-4" />
          <span className="font-display text-lg tracking-tight">
            Athena LMS
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Badge
            variant={ROLE_VARIANT[user.role] ?? "secondary"}
            className="hidden sm:inline-flex"
          >
            {formatRole(user.role)}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 px-2"
                aria-label="Account menu"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-none border-2 border-border bg-muted">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                </span>
                <span className="hidden font-semibold sm:inline-block">
                  {user.firstName} {user.lastName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    @{user.username}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/change-password" className="cursor-pointer">
                  <KeyRound className="mr-2 h-4 w-4" />
                  Change password
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
